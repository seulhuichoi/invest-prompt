import React from 'react'

interface Props {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  hint?: string
}

export function ButtonGroup({ label, options, value, onChange, hint }: Props): React.JSX.Element {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-300">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              value === opt
                ? 'bg-red-500 border-red-500 text-white'
                : 'bg-transparent border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}
