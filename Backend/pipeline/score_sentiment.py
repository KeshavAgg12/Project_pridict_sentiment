"""Unscored articles ko VADER se score karta hai. Bina arguments ke chalta hai."""
from collections import Counter

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from db import get_connection

BATCH_SIZE = 1000


def label_from_score(compound):
    if compound >= 0.05:
        return "positive"
    if compound <= -0.05:
        return "negative"
    return "neutral"


def main():
    analyzer = SentimentIntensityAnalyzer()  # ek baar, loop ke bahar
    counts = Counter()
    total = 0

    with get_connection() as conn:
        while True:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, text FROM articles "
                    "WHERE sentiment_label IS NULL ORDER BY id LIMIT %s",
                    (BATCH_SIZE,),
                )
                rows = cur.fetchall()
                if not rows:
                    break

                updates = []
                for article_id, text in rows:
                    score = round(analyzer.polarity_scores(text)["compound"], 4)
                    label = label_from_score(score)
                    updates.append((label, score, article_id))
                    counts[label] += 1

                cur.executemany(
                    "UPDATE articles SET sentiment_label = %s, sentiment_score = %s "
                    "WHERE id = %s",
                    updates,
                )
            conn.commit()  # har batch ke baad commit
            total += len(rows)
            print(f"  ...{total} scored")

    print(f"Scored: {total}")
    for label in ("positive", "neutral", "negative"):
        print(f"{label}: {counts[label]}")


if __name__ == "__main__":
    main()
