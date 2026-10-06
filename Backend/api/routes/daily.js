import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

const num = (v) => (v === null || v === undefined ? null : Number(v))

// GET /api/daily -> daily rows + correlation + n + total scored articles
router.get('/', async (req, res) => {
  try {
    const daily = await pool.query(
      `SELECT date::text AS date, avg_sentiment, article_count, close, next_day_return
       FROM daily_summary
       ORDER BY date`
    )
    const stats = await pool.query(
      `SELECT corr(avg_sentiment, next_day_return) AS r,
              COUNT(*) FILTER (
                WHERE avg_sentiment IS NOT NULL AND next_day_return IS NOT NULL
              ) AS n
       FROM daily_summary`
    )
    const scored = await pool.query(
      `SELECT COUNT(*) AS total FROM articles WHERE sentiment_label IS NOT NULL`
    )

    res.json({
      rows: daily.rows.map((r) => ({
        date: r.date,
        avg_sentiment: num(r.avg_sentiment),
        article_count: num(r.article_count),
        close: num(r.close),
        next_day_return: num(r.next_day_return),
      })),
      correlation: num(stats.rows[0].r),
      n: Number(stats.rows[0].n),
      totalScored: Number(scored.rows[0].total),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load daily data' })
  }
})

export default router