import React from 'react'

export type Category = 'invest' | 'prompt'

interface Props {
  value: Category
  onChange: (c: Category) => void
}

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'invest', label: '투자', emoji: '💹' },
  { id: 'prompt', label: '프롬프트', emoji: '✏️' },
]

export function CategoryBar({ value, onChange }: Props): React.JSX.Element {
  return (
    <div className="flex gap-2">
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            value === c.id
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-transparent border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:border-gray-500 dark:hover:border-zinc-400'
          }`}
        >
          <span>{c.emoji}</span>
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  )
}
