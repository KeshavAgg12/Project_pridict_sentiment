import { Link, useOutletContext } from 'react-router-dom'
import MoodBar from '../components/dashboard/MoodBar'
import { formatCount, day } from '../utils/formatters'

export default function Home() {
  const { daily, latest } = useOutletContext()
  const r = Number(daily.correlation)
  const scored = latest.filter((a) => a.sentiment_score != null)
  const byScore = [...scored].sort((a, b) => Number(a.sentiment_score) - Number(b.sentiment_score))
  const picks = [['Most positive recent headline', byScore[byScore.length - 1]], ['Most negative recent headline', byScore[0]]]

  return (
    <div className="space-y-8">
      <section className="bg-ink p-6 text-white md:p-10">
        <p className="text-sm">Sentiment against the next day's Nifty return</p>
        <p className="font-head text-7xl font-bold leading-none text-lemon md:text-8xl">r = {r.toFixed(3)}</p>
        <p className="mt-3 max-w-lg">
          {Math.abs(r) < 0.1 ? 'Almost no linear link' : 'A modest linear link'} across {formatCount(daily.n)} trading days.
          This describes the past. It is not a prediction.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/chart" className="bg-lemon px-4 py-2 font-semibold text-ink">See the chart</Link>
          <Link to="/articles" className="border-2 border-white px-4 py-2 font-semibold">Read the headlines</Link>
        </div>
      </section>

      <section>
        <h2 className="font-head text-2xl font-bold">Mood of the latest {latest.length} headlines</h2>
        <p className="mb-3 text-sm">{formatCount(daily.totalScored)} articles scored in total, including the live feed.</p>
        <MoodBar articles={latest} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {picks.map(([title, a]) => (
          <div key={title} className="border-2 border-ink bg-panel p-4">
            <h3 className="font-head text-lg font-bold">{title}</h3>
            {a ? (
              <>
                <p className="mt-1 text-sm">{a.text}</p>
                <p className="font-num mt-1 text-xs">{day(a.published_at)} · score {Number(a.sentiment_score).toFixed(2)}</p>
              </>
            ) : <p className="mt-1 text-sm">No scored articles yet.</p>}
          </div>
        ))}
      </section>
    </div>
  )
}
