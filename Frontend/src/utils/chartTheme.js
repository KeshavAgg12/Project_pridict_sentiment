import { day, toNum } from './formatters'

export const CHART_COLORS = { sentiment: '#e4572e', close: '#12372a', grid: '#d3d9c8' }

// Keeps the chart light: at most ~700 points
export function toChartPoints(rows = []) {
  const pts = rows.map((r) => ({ date: day(r.date), sentiment: toNum(r.avg_sentiment), close: toNum(r.close) }))
  const step = Math.ceil(pts.length / 700) || 1
  return pts.filter((_, i) => i % step === 0)
}
