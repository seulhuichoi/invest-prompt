import React, { useState } from 'react'
import { PromptResult, PromptHistory } from '../ui/PromptResult'
import { VariableInput } from './VariableInput'
import { applyTemplate, syncVariableSpecs } from '../../utils/templateStore'
import type { PromptTemplate, VariableSpec } from '../../types'

interface Props {
  template: PromptTemplate
  onEdit?: () => void
  onDelete?: () => void
}

function initialValues(specs: VariableSpec[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const s of specs) {
    out[s.name] = s.kind === 'select' ? (s.options?.[0] ?? '') : ''
  }
  return out
}

export function TemplateRunner({ template, onEdit, onDelete }: Props): React.JSX.Element {
  const specs = syncVariableSpecs(template.body, template.variables ?? [])
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(specs))
  const [prompt, setPrompt] = useState('')

  const canGenerate = specs.length === 0 || specs.every((s) => (values[s.name] ?? '').trim() !== '')
  const historyKey = `history_tpl_${template.id}`

  function setValue(name: string, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }))
  }

  function generate() {
    setPrompt(applyTemplate(template.body, values))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {template.emoji} {template.title}
          </h2>
          {template.description && (
            <p className="text-sm text-gray-500 dark:text-zinc-400">{template.description}</p>
          )}
        </div>
        {!template.builtin && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onEdit}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              수정
            </button>
            <button
              onClick={onDelete}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-zinc-600 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {template.note && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300">
          {template.note}
        </div>
      )}

      {specs.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 space-y-5">
          {specs.map((s) => (
            <VariableInput
              key={s.name}
              spec={s}
              value={values[s.name] ?? ''}
              onChange={(v) => setValue(s.name, v)}
            />
          ))}
        </div>
      )}

      <button
        onClick={generate}
        disabled={!canGenerate}
        className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-base transition-colors"
      >
        ✨ 프롬프트 생성
      </button>

      {prompt && <PromptResult prompt={prompt} historyKey={historyKey} />}
      <PromptHistory historyKey={historyKey} />
    </div>
  )
}
