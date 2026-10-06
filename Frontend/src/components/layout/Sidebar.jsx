import { NavLink } from 'react-router-dom'
import { formatTime } from '../../utils/formatters'

const LINKS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/chart', label: 'Sentiment vs Nifty' },
  { to: '/articles', label: 'Latest articles' },
  { to: '/pipeline', label: 'Pipeline' },
]

export default function Sidebar({ updated, onRefresh }) {
  return (
    <aside className="bg-ink p-5 text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
      <p className="font-head text-2xl font-bold leading-none">Headline<br />Barometer</p>
      <nav className="mt-5 flex gap-2 md:flex-col" aria-label="Pages">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `px-3 py-2 font-semibold ${isActive ? 'bg-lemon text-ink' : 'hover:bg-white/15'}`}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-5 text-sm md:absolute md:bottom-5">
        <p className="font-num">{updated ? `Updated ${formatTime(updated)}` : 'Not updated yet'}</p>
        <button onClick={onRefresh} className="mt-2 border-2 border-white px-3 py-1 font-semibold hover:bg-white hover:text-ink">Refresh now</button>
      </div>
    </aside>
  )
}
