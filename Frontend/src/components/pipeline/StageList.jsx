export default function StageList({ title, tag, note, stages }) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="font-head text-2xl font-bold">{title}</h2>
        <span className="font-num bg-lemon px-2 py-0.5 text-xs">{tag}</span>
      </div>
      <p className="mb-4 mt-1 text-sm">{note}</p>
      <ol className="space-y-3 border-l-4 border-ink pl-4">
        {stages.map((s, i) => (
          <li key={s.name} className="border-2 border-ink bg-panel p-4">
            <h3 className="font-head text-lg font-bold">{i + 1}. {s.name}</h3>
            <p className="font-num text-xs">{s.file}</p>
            <p className="mt-2 text-sm">{s.does}</p>
            <p className="mt-2 text-sm font-semibold">Result: {s.result}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
