import React, { useState } from 'react'
import { US_STOCKS, KR_STOCKS } from '../../data/stocks'

interface Props {
  value: string
  onChange: (v: string) => void
}

export function StockPicker({ value, onChange }: Props): React.JSX.Element {
  const [input, setInput] = useState('')

  function handleAdd() {
    const trimmed = input.trim()
    if (trimmed) {
      onChange(trimmed)
      setInput('')
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">📌 종목 선택</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="종목명 직접 입력"
          className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500"
        />
        <button
          onClick={handleAdd}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          추가
        </button>
      </div>

      <p className="text-xs text-gray-400 dark:text-zinc-500">🇺🇸 미국</p>
      <div className="flex flex-wrap gap-2">
        {US_STOCKS.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              value === s
                ? 'bg-red-500 border-red-500 text-white'
                : 'bg-transparent border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:border-gray-500 dark:hover:border-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-zinc-500">🇰🇷 한국</p>
      <div className="flex flex-wrap gap-2">
        {KR_STOCKS.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              value === s
                ? 'bg-red-500 border-red-500 text-white'
                : 'bg-transparent border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:border-gray-500 dark:hover:border-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {value && (
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          선택됨: <span className="text-red-500 font-medium">{value}</span>
          <button onClick={() => onChange('')} className="ml-2 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300">
            ×
          </button>
        </p>
      )}
    </div>
  )
}
