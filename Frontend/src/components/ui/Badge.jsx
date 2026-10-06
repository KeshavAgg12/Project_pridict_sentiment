const STYLES = {
  positive: { sym: '▲', cls: 'bg-teal text-white' },
  negative: { sym: '▼', cls: 'bg-orange text-white' },
  neutral: { sym: '●', cls: 'bg-neu text-ink' },
}

export default function Badge({ label }) {
  const s = STYLES[label] ?? STYLES.neutral
  return (
    <span className={`font-num inline-flex w-24 shrink-0 items-center justify-center gap-1 px-2 py-0.5 text-xs ${s.cls}`}>
      <span aria-hidden="true">{s.sym}</span>{label ?? 'unscored'}
    </span>
  )
}
