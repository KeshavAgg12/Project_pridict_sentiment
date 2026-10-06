import express from 'express'
import articlesRouter from './routes/articles.js'
import dailyRouter from './routes/daily.js'
import ingestRouter from './routes/ingest.js'

const app = express()
app.use(express.json({ limit: '1mb' }))

app.use('/api/articles', articlesRouter)
app.use('/api/daily', dailyRouter)
app.use('/api/ingest', ingestRouter)

// unknown /api path -> JSON 404
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// error handler (galat JSON body, bahut bada body, etc.)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Body too large' })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

// db.js (routes ke through import hoke) .env pehle load kar chuki hoti hai
const PORT = Number(process.env.PORT) || 9000
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))