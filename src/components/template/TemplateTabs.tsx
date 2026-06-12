import React from 'react'
import type { PromptTemplate } from '../../types'

interface Props {
  templates: PromptTemplate[]
  activeId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
}

export function TemplateTabs({ templates, activeId, onSelect, onAdd }: Props): React.JSX.Element {
  return (
    <div className="overflow-x-auto">
      <div className="flex items-center min-w-max border-b border-gray-200 dark:border-zinc-800">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeId === t.id
                ? 'border-red-500 text-red-600 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
            }`}
          >
            <span>{t.emoji}</span>
            <span>{t.title}</span>
          </button>
        ))}
        <button
          onClick={onAdd}
          title="새 프롬프트"
          aria-label="새 프롬프트"
          className="px-3 py-2 text-base font-medium text-gray-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-white"
        >
          ＋
        </button>
      </div>
    </div>
  )
}
