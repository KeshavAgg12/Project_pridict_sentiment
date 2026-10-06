// Batch numbers were recorded when the scripts ran. They are not recomputed in the browser.
export const BATCH_STAGES = [
  { name: 'Load', file: 'Backend/pipeline/load_dataset.py', does: 'Reads the Kaggle news CSV, parses dates, drops empty text and duplicates, hashes each headline and inserts it into PostgreSQL.', result: '50,000 rows read, 583 duplicates dropped, 49,417 inserted. A second run inserted 0.' },
  { name: 'Score', file: 'Backend/pipeline/score_sentiment.py', does: 'VADER gives every unscored row a label and a compound score.', result: '12,786 positive, 27,476 neutral, 9,155 negative. A second run scored 0.' },
  { name: 'Join with price', file: 'Backend/pipeline/build_daily.py', does: 'Averages sentiment per day, matches it to the next Nifty 50 trading day (weekend news moves to Monday, 10-day tolerance) and correlates it with next-day return.', result: '49,417 of 49,417 matched, 4,283 daily rows, r = -0.0113, p = 0.4616.' },
]

export const LIVE_STAGES = [
  { name: 'n8n schedule', file: 'n8n/ingest-workflow.json', does: 'A Schedule Trigger fetches the Economic Times markets RSS feed and shapes each item into source, published_at, ticker, text and url.', result: '50 items per fetch.' },
  { name: 'POST /api/ingest', file: 'Backend/api/routes/ingest.js', does: 'Checks the body (400 if it is not an array, 422 for a bad item), hashes text and date, and inserts only rows it has not seen.', result: 'Sending the same 50 again gave inserted 0, skipped 50.' },
  { name: 'Score new rows', file: 'Backend/pipeline/score_sentiment.py', does: 'When inserted is above 0, Node starts the same Python scorer through child_process.', result: '50 of 50 live rows received a label.' },
  { name: 'Dashboard', file: 'Frontend/src', does: 'Polls /api/daily and /api/articles/latest every 60 seconds.', result: 'Near real-time polling, not streaming.' },
]

export const LIMITS = [
  'VADER misses finance wording. "profit declines sharply" scored +0.4404 (positive), and "cuts" in a rate-cut headline pulled it negative.',
  'A manual spot-check of 20 random rows found 17 acceptable, counting neutral on factual headlines as acceptable. This is not an accuracy figure.',
  'About 55% of all labels are neutral.',
  'News dates carry no time of day, so after-hours news cannot move to the next trading day. Only weekend and holiday news does.',
  'daily_summary is a manual batch step. Live articles are not in the chart because the price file ends on 2025-05-26.',
  'The feed also carries US and global market news. The NIFTY50 ticker is a label for the whole feed, not a per-headline match.',
]
