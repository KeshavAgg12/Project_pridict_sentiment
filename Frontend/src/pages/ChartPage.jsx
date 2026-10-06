import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import SentimentChart from '../components/dashboard/SentimentChart'
import Chips from '../components/ui/Chips'
import { toChartPoints } from '../utils/chartTheme'

const RANGES = [{ id: 'all', label: 'All years' }, { id: '5', label: 'Last 5 years' }, { id: '1', label: 'Last year' }]

export default function ChartPage() {
  const { daily } = useOutletContext()
  const [range, setRange] = useState('all')
  const points = useMemo(() => {
    const all = toChartPoints(daily.rows)
    if (range === 'all' || all.length === 0) return all
    const lastYear = Number(all[all.length - 1].date.slice(0, 4))
    return all.filter((p) => Number(p.date.slice(0, 4)) > lastYear - Number(range))
  }, [daily, range])

  return (
    <div>
      <h1 className="font-head text-4xl font-bold">Sentiment vs Nifty</h1>
      <p className="mb-5 mt-1 max-w-xl text-sm">Average daily headline sentiment (left axis) next to the Nifty 50 close (right axis). Dataset years only, 2003–2020. New articles have no price data yet.</p>
      <Chips label="Time range" options={RANGES} value={range} onChange={setRange} />
      <div className="border-2 border-ink bg-panel p-4">
        <SentimentChart points={points} />
        <p className="mt-2 flex gap-4 text-xs"><span><span className="text-orange">━</span> Avg sentiment</span><span>━ Nifty close</span></p>
      </div>
    </div>
  )
}
