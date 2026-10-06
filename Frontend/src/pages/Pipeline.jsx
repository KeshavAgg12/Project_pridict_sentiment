import { useOutletContext } from 'react-router-dom'
import StageList from '../components/pipeline/StageList'
import { BATCH_STAGES, LIVE_STAGES, LIMITS } from '../data/pipelineFacts'
import { formatCount } from '../utils/formatters'

export default function Pipeline() {
  const { daily, latest } = useOutletContext()
  const live = [
    ['Articles in database', formatCount(daily.totalScored)],
    ['Days compared with price', formatCount(daily.n)],
    ['Correlation (r)', Number(daily.correlation).toFixed(4)],
    ['Headlines in latest feed', formatCount(latest.length)],
  ]
  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-head text-4xl font-bold">How the numbers are made</h1>
        <p className="mt-1 max-w-xl text-sm">Every step from raw headline to dashboard, with what each step actually produced.</p>
      </header>

      <section>
        <h2 className="font-head text-2xl font-bold">Right now, from the API</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {live.map(([k, v]) => (
            <div key={k} className="bg-ink p-4 text-white">
              <dt className="text-sm">{k}</dt>
              <dd className="font-num text-2xl font-bold text-lemon">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <StageList title="History: built once with Python" tag="Run by hand"
        note="2003–2020 Indian financial headlines joined with Nifty 50 daily prices. Re-running these steps gives the same output." stages={BATCH_STAGES} />
      <StageList title="Live: n8n to dashboard" tag="Runs on a schedule"
        note="New headlines flow in automatically. They are scored but have no price data yet, so they appear in the lists and not in the chart." stages={LIVE_STAGES} />

      <section>
        <h2 className="font-head text-2xl font-bold">What to keep in mind</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
          {LIMITS.map((l) => <li key={l}>{l}</li>)}
        </ul>
      </section>
    </div>
  )
}
