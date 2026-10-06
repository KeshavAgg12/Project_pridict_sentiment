import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import LatestArticles from '../components/dashboard/LatestArticles'
import Chips from '../components/ui/Chips'

const FILTERS = [{ id: 'all', label: 'All' }, { id: 'positive', label: '▲ Positive' }, { id: 'neutral', label: '● Neutral' }, { id: 'negative', label: '▼ Negative' }]

export default function Articles() {
  const { latest } = useOutletContext()
  const [filter, setFilter] = useState('all')
  const shown = filter === 'all' ? latest : latest.filter((a) => a.sentiment_label === filter)
  return (
    <div>
      <h1 className="font-head text-4xl font-bold">Latest articles</h1>
      <p className="mb-5 mt-1 text-sm">Live from the database. The data refreshes every 60 seconds.</p>
      <Chips label="Sentiment filter" options={FILTERS} value={filter} onChange={setFilter} />
      <LatestArticles articles={shown} />
    </div>
  )
}
