export const day = (v) => String(v ?? '').slice(0, 10)
export const toNum = (v) => (v == null ? null : Number(v))
export const formatCount = (v) => Number(v ?? 0).toLocaleString('en-IN')
export const formatTime = (d) => (d ? d.toLocaleTimeString() : null)
