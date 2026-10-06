export default function Chips({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="mb-4 flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)} aria-pressed={value === o.id}
          className={`border-2 border-ink px-3 py-1 text-sm font-semibold ${value === o.id ? 'bg-ink text-white' : 'bg-panel hover:bg-lemon'}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
