"""Daily sentiment + Nifty close + next_day_return -> daily_summary, phir correlation print.

Rules:
- Article ko uska pehla trading day milta hai jo article date ke barabar ya baad ka ho
  (weekend/holiday news -> agla trading day). News mein time nahi hai, isliye
  "after-hours" rule apply nahi ho sakta (README limitation).
- next_day_return = close[t+1] / close[t] - 1, POORI price series pe nikalta hai.
- Correlation: din t ka sentiment vs return (t -> t+1). Look-ahead nahi.
"""
from pathlib import Path

import numpy as np
import pandas as pd

from db import get_connection

PRICE_CSV = Path(__file__).resolve().parent / "data" / "data.csv"
MAX_GAP_DAYS = 10  # isse zyada door ke trading day pe news map nahi karni


def load_prices():
    prices = pd.read_csv(PRICE_CSV, usecols=["Date", "Close"])
    prices["trading_date"] = pd.to_datetime(prices["Date"]).dt.normalize()
    prices = prices.drop(columns="Date").rename(columns={"Close": "close"})
    prices = prices.sort_values("trading_date").reset_index(drop=True)
    # poori series pe, sirf news wale dino pe nahi
    prices["next_day_return"] = prices["close"].shift(-1) / prices["close"] - 1
    return prices


def load_articles():
    with get_connection() as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT published_at, sentiment_score FROM articles "
            "WHERE sentiment_label IS NOT NULL"
        )
        rows = cur.fetchall()
    df = pd.DataFrame(rows, columns=["published_at", "score"])
    df["score"] = df["score"].astype(float)  # NUMERIC -> Decimal aata hai
    df["article_date"] = pd.to_datetime(df["published_at"]).dt.normalize()
    return df[["article_date", "score"]].sort_values("article_date")


def main():
    prices = load_prices()
    articles = load_articles()
    print(f"Articles read: {len(articles)}")

    # merge_asof ke liye dono side ka dtype same hona chahiye
    articles["article_date"] = articles["article_date"].astype("datetime64[ns]")
    prices["trading_date"] = prices["trading_date"].astype("datetime64[ns]")

    mapped = pd.merge_asof(
        articles,
        prices[["trading_date"]],
        left_on="article_date",
        right_on="trading_date",
        direction="forward",
        tolerance=pd.Timedelta(days=MAX_GAP_DAYS),
    )
    matched = mapped.dropna(subset=["trading_date"])
    print(f"Matched to a trading day: {len(matched)}")
    print(f"Dropped (no trading day): {len(mapped) - len(matched)}")

    daily = (
        matched.groupby("trading_date")
        .agg(avg_sentiment=("score", "mean"), article_count=("score", "size"))
        .reset_index()
    )
    daily = daily.merge(prices, on="trading_date", how="left")

    # DB mein likho (idempotent: pehle table khaali, phir insert, ek transaction mein)
    records = [
        (
            r.trading_date.date(),
            round(float(r.avg_sentiment), 6),
            int(r.article_count),
            None if pd.isna(r.close) else round(float(r.close), 2),
            None if pd.isna(r.next_day_return) else round(float(r.next_day_return), 6),
        )
        for r in daily.itertuples(index=False)
    ]
    with get_connection() as conn, conn.cursor() as cur:
        cur.execute("TRUNCATE daily_summary")
        cur.executemany(
            "INSERT INTO daily_summary "
            "(date, avg_sentiment, article_count, close, next_day_return) "
            "VALUES (%s, %s, %s, %s, %s)",
            records,
        )
        conn.commit()
    print(f"daily_summary rows: {len(records)}")

    both = daily.dropna(subset=["avg_sentiment", "next_day_return"])
    n = len(both)
    print(f"Days with next_day_return: {n}")

    x, y = both["avg_sentiment"], both["next_day_return"]
    try:
        from scipy.stats import pearsonr

        r, p = pearsonr(x, y)
        print(f"Pearson r = {r:.4f}, p = {p:.4f}, n = {n}")
    except ImportError:
        r = np.corrcoef(x, y)[0, 1]
        print(f"Pearson r = {r:.4f}, n = {n} (scipy nahi mila, p-value nahi)")


if __name__ == "__main__":
    main()
