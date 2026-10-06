// Proof: Node ka hash, Python wale DB hash se match karta hai ya nahi (row id 6301)
import { pool } from './db.js'
import { cleanText, makeHash } from './lib/hash.js'

const { rows } = await pool.query(
  `SELECT text, published_at::date::text AS d, content_hash FROM articles WHERE id = 6301`
)
if (rows.length === 0) {
  console.log('id 6301 nahi mili')
} else {
  const row = rows[0]
  const mine = makeHash(cleanText(row.text), row.d)
  console.log('text:', row.text, '| date:', row.d)
  console.log('DB  :', row.content_hash)
  console.log('Node:', mine)
  console.log(mine === row.content_hash ? 'MATCH' : 'MISMATCH')
}
await pool.end()