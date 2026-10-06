"""Step 2: clean the news CSV and load it into the articles table.

Run (from the sentiment-analyzer folder, venv active):
    python pipeline\\load_dataset.py
    python pipeline\\load_dataset.py "C:\\some path\\IndianFinancialNews.csv"

Safe to re-run: content_hash is UNIQUE and we use ON CONFLICT DO NOTHING.
"""
import hashlib
import os
import sys
from pathlib import Path

import pandas as pd
import psycopg
from dotenv import load_dotenv

HERE = Path(__file__).resolve().parent
load_dotenv(HERE.parent / ".env")

CSV_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "data" / "IndianFinancialNews.csv"
SOURCE = "kaggle:hkapoor/indian-financial-news-articles-20032020"
TICKER = "NIFTY50"
BATCH_SIZE = 5000

INSERT_SQL = """
    INSERT INTO articles (source, published_at, ticker, text, url, content_hash)
    VALUES (%s, %s, %s, %s, %s, %s)
    ON CONFLICT (content_hash) DO NOTHING
"""


def make_hash(text, ts):
    # same headline on the same day = same article
    key = f"{text.lower()}|{ts.date().isoformat()}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def read_and_clean(path):
    try:
        df = pd.read_csv(path)
    except UnicodeDecodeError:
        df = pd.read_csv(path, encoding="latin-1")

    stats = {"read": len(df)}

    # dates look like "May 26, 2020, Tuesday"
    d = pd.to_datetime(df["Date"], format="%B %d, %Y, %A", errors="coerce")
    bad = d.isna()
    if bad.any():
        d[bad] = pd.to_datetime(df.loc[bad, "Date"], errors="coerce")
    df["published_at"] = d
    stats["bad_dates"] = int(df["published_at"].isna().sum())
    df = df[df["published_at"].notna()]

    df["text"] = (
        df["Title"].fillna("").astype(str).str.strip().str.replace(r"\s+", " ", regex=True)
    )
    before = len(df)
    df = df[df["text"] != ""]
    stats["empty_text"] = before - len(df)

    df["content_hash"] = [make_hash(t, ts) for t, ts in zip(df["text"], df["published_at"])]
    before = len(df)
    df = df.drop_duplicates(subset="content_hash")
    stats["duplicates"] = before - len(df)

    stats["clean"] = len(df)
    return df, stats


def main():
    if not CSV_PATH.exists():
        sys.exit(f"CSV not found: {CSV_PATH}")

    df, stats = read_and_clean(CSV_PATH)
    rows = [
        (SOURCE, ts.to_pydatetime(), TICKER, t, None, h)
        for t, ts, h in zip(df["text"], df["published_at"], df["content_hash"])
    ]

    with psycopg.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "sentiment_analyzer"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD"),
    ) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM articles")
            count_before = cur.fetchone()[0]

            for i in range(0, len(rows), BATCH_SIZE):
                cur.executemany(INSERT_SQL, rows[i : i + BATCH_SIZE])

            cur.execute("SELECT COUNT(*) FROM articles")
            count_after = cur.fetchone()[0]

    inserted = count_after - count_before
    print(f"Rows read:            {stats['read']}")
    print(f"Unparsed dates:       {stats['bad_dates']}")
    print(f"Empty text dropped:   {stats['empty_text']}")
    print(f"Duplicates dropped:   {stats['duplicates']}")
    print(f"Clean rows:           {stats['clean']}")
    print(f"Inserted this run:    {inserted}")
    print(f"Skipped (already in): {len(rows) - inserted}")
    print(f"Total in articles:    {count_after}")


if __name__ == "__main__":
    main()
