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
      <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
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
