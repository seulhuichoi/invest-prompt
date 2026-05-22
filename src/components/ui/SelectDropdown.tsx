import React from 'react'

interface Props {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}

export function SelectDropdown({ label, options, value, onChange }: Props): React.JSX.Element {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-300">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
