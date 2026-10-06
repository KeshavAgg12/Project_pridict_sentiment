import { Router } from 'express'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../db.js'
import { cleanText, makeHash } from '../lib/hash.js'

const execFileAsync = promisify(execFile)
const here = path.dirname(fileURLToPath(import.meta.url))
const PIPELINE_DIR = path.resolve(here, '../../pipeline') // Backend\pipeline
const MAX_ITEMS = 500
const MAX_TEXT = 1000

const INSERT_SQL = `
  INSERT INTO articles (source, published_at, ticker, text, url, content_hash)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (content_hash) DO NOTHING
`

// "2026-10-05" -> date-only (midnight). Baaki formats (ISO, RSS pubDate) -> UTC mein.
function parsePublished(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  const v = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const d = new Date(`${v}T00:00:00Z`)
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) return null
    return { date: v, timestamp: `${v} 00:00:00` }
  }
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return null
  const iso = d.toISOString()
  return { date: iso.slice(0, 10), timestamp: iso.slice(0, 19).replace('T', ' ') }
}

const optionalString = (v, fallback) =>
  typeof v === 'string' && v.trim() ? v.trim() : fallback

const router = Router()

// POST /api/ingest -> body: array of {text, published_at, source?, url?, ticker?}
router.post('/', async (req, res) => {
  const body = req.body
  if (!Array.isArray(body) || body.length === 0) {
    return res.status(400).json({ error: 'Body must be a non-empty JSON array' })
  }
  if (body.length > MAX_ITEMS) {
    return res.status(400).json({ error: `Too many items (max ${MAX_ITEMS})` })
  }

  // 1) validate + hash (same request ke andar ke duplicates yahin hat jaate hain)
  const rows = new Map()
  for (let i = 0; i < body.length; i++) {
    const a = body[i]
    if (!a || typeof a !== 'object' || Array.isArray(a)) {
      return res.status(422).json({ error: `Item ${i}: must be an object` })
    }
    if (typeof a.text !== 'string' || !cleanText(a.text)) {
      return res.status(422).json({ error: `Item ${i}: text must be a non-empty string` })
    }
    const text = cleanText(a.text)
    if (text.length > MAX_TEXT) {
      return res.status(422).json({ error: `Item ${i}: text too long (max ${MAX_TEXT})` })
    }
    const published = parsePublished(a.published_at)
    if (!published) {
      return res.status(422).json({ error: `Item ${i}: published_at is missing or not a valid date` })
    }
    const hash = makeHash(text, published.date)
    if (!rows.has(hash)) {
      rows.set(hash, [
        optionalString(a.source, 'api'),
        published.timestamp,
        optionalString(a.ticker, 'NIFTY50'),
        text,
        optionalString(a.url, null),
        hash,
      ])
    }
  }

  // 2) insert (parameterized, ON CONFLICT DO NOTHING, ek transaction)
  let inserted = 0
  let client
  try {
    client = await pool.connect()
    await client.query('BEGIN')
    for (const row of rows.values()) {
      const r = await client.query(INSERT_SQL, row)
      inserted += r.rowCount
    }
    await client.query('COMMIT')
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {})
    console.error(err)
    return res.status(500).json({ error: 'Database error while inserting' })
  } finally {
    if (client) client.release()
  }

  // 3) naye rows ho to Python scoring chalao
  if (inserted > 0) {
    const pythonBin = process.env.PYTHON_BIN || 'python'
    console.log('Scoring with python:', pythonBin)
    try {
      await execFileAsync(pythonBin, ['score_sentiment.py'], {
        cwd: PIPELINE_DIR,
        timeout: 5 * 60 * 1000,
      })
    } catch (err) {
      console.error(err)
      return res
        .status(500)
        .json({ error: `Inserted ${inserted} rows but scoring failed: ${err.message}` })
    }
  }

  res.json({ received: body.length, inserted, skipped: body.length - inserted })
})

export default router