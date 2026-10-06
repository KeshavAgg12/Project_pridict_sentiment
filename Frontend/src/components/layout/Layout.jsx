import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import ErrorBanner from '../ui/ErrorBanner'
import usePolling from '../../hooks/usePolling'
import { getDaily } from '../../services/analyticsService'
import { getLatestArticles } from '../../services/articleService'

async function fetchAll() {
  const [daily, latest] = await Promise.all([getDaily(), getLatestArticles()])
  return { daily, latest }
}

export default function Layout() {
  const { data, error, updated, refresh } = usePolling(fetchAll, 60000)
  return (
    <div className="min-h-screen md:flex">
      <Sidebar updated={updated} onRefresh={refresh} />
      <main className="min-w-0 flex-1 p-5 md:p-10">
        {error && <ErrorBanner message={error} hasData={!!data} />}
        {!data && !error && <p className="font-num">Loading data…</p>}
        {data && <Outlet context={data} />}
      </main>
    </div>
  )
}
