import Badge from '../ui/Badge'
import { day } from '../../utils/formatters'

export default function LatestArticles({ articles }) {
  if (articles.length === 0) return <p className="font-num py-6 text-center">No articles match. Run the n8n workflow to add some.</p>
  return (
    <ul className="divide-y divide-line border-2 border-ink bg-panel px-4">
      {articles.map((a, i) => (
        <li key={a.id ?? i} className="flex items-start gap-3 py-3">
          <Badge label={a.sentiment_label} />
          <div className="min-w-0">
            <p className="text-sm">
              {a.url ? <a href={a.url} target="_blank" rel="noreferrer" className="underline decoration-orange">{a.text}</a> : a.text}
            </p>
            <p className="font-num text-xs">
              {day(a.published_at)} · {a.source ?? 'unknown'} · score {a.sentiment_score == null ? 'n/a' : Number(a.sentiment_score).toFixed(2)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
