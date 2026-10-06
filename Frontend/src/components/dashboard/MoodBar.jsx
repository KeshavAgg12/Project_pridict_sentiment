const CELL = { positive: 'bg-teal', negative: 'bg-orange', neutral: 'bg-neu' }

export default function MoodBar({ articles }) {
  const count = (k) => articles.filter((a) => a.sentiment_label === k).length
  return (
    <div>
      <div className="flex flex-wrap gap-1" role="img" aria-label="One square per recent headline, coloured by sentiment">
        {articles.map((a, i) => (
          <span key={a.id ?? i} title={`${a.sentiment_label ?? 'unscored'}: ${a.text}`} className={`h-6 w-6 ${CELL[a.sentiment_label] ?? 'bg-line'}`} />
        ))}
      </div>
      <p className="font-num mt-3 text-sm">
        ▲ {count('positive')} positive · ● {count('neutral')} neutral · ▼ {count('negative')} negative
      </p>
    </div>
  )
}
