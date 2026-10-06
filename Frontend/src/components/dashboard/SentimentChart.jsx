import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CHART_COLORS as C } from '../../utils/chartTheme'

export default function SentimentChart({ points }) {
  if (points.length === 0) return <p className="font-num py-10 text-center">No daily data yet.</p>
  return (
    <div className="h-96" role="img" aria-label="Line chart of average daily sentiment and Nifty close">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={C.grid} strokeDasharray="2 4" />
          <XAxis dataKey="date" tickFormatter={(d) => d.slice(0, 4)} minTickGap={50} tick={{ fontSize: 12 }} />
          <YAxis yAxisId="s" tick={{ fontSize: 12 }} width={44} />
          <YAxis yAxisId="p" orientation="right" tick={{ fontSize: 12 }} width={56} />
          <Tooltip />
          <Line yAxisId="s" type="monotone" dataKey="sentiment" name="Avg sentiment" stroke={C.sentiment} strokeWidth={1.5} dot={false} />
          <Line yAxisId="p" type="monotone" dataKey="close" name="Nifty close" stroke={C.close} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
