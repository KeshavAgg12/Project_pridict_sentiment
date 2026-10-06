-- Market Sentiment & Trend Analyzer: PostgreSQL schema
-- Database: sentiment_analyzer   (safe to re-run: IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS articles (
    id              SERIAL PRIMARY KEY,
    source          TEXT,
    published_at    TIMESTAMP NOT NULL,
    ticker          TEXT,
    text            TEXT NOT NULL,
    url             TEXT,
    content_hash    TEXT NOT NULL UNIQUE,   -- dedupe key (sha256 of lowercase text + date)
    sentiment_label TEXT,                   -- NULL until score_sentiment.py runs
    sentiment_score NUMERIC(6,4),
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_summary (
    date            DATE PRIMARY KEY,
    avg_sentiment   NUMERIC(8,6),
    article_count   INTEGER,
    close           NUMERIC(12,2),
    next_day_return NUMERIC(10,6)
);

-- for "latest 20 articles" and per-day aggregation
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles (published_at DESC);
