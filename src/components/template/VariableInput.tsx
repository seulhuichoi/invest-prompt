import React from 'react'
import { ButtonGroup } from '../ui/ButtonGroup'
import type { VariableSpec } from '../../types'

interface Props {
  spec: VariableSpec
  value: string
  onChange: (v: string) => void
}

export function VariableInput({ spec, value, onChange }: Props): React.JSX.Element {
  if (spec.kind === 'select') {
    return (
      <ButtonGroup
        label={spec.name}
        options={spec.options ?? []}
        value={value}
        onChange={onChange}
      />
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">{spec.name}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="직접 입력"
        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500"
      />
      {spec.kind === 'combo' && (spec.options?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2">
          {spec.options!.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                value === opt
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-transparent border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:border-gray-500 dark:hover:border-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
