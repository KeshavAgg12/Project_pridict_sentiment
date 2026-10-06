import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

// GET /api/articles/latest -> newest 20 articles with sentiment
router.get('/latest', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, source, published_at::text AS published_at, text, url,
              sentiment_label, sentiment_score
       FROM articles
       ORDER BY published_at DESC, id DESC
       LIMIT 20`
    )
    res.json(
      rows.map((r) => ({
        ...r,
        sentiment_score: r.sentiment_score === null ? null : Number(r.sentiment_score),
      }))
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load latest articles' })
  }
})

export default router