import React, { useState } from 'react'
import { ButtonGroup } from '../ui/ButtonGroup'
import { syncVariableSpecs } from '../../utils/templateStore'
import type { PromptTemplate, VariableKind, VariableSpec } from '../../types'

interface Props {
  initial?: PromptTemplate
  onSave: (tpl: PromptTemplate) => void
  onCancel: () => void
}

const KIND_LABELS: { code: VariableKind; label: string }[] = [
  { code: 'free', label: '직접 입력' },
  { code: 'combo', label: '입력·선택' },
  { code: 'select', label: '목록 선택' },
]
const labelOf = (k: VariableKind) => KIND_LABELS.find((x) => x.code === k)!.label
const codeOf = (label: string) => KIND_LABELS.find((x) => x.label === label)!.code

function OptionEditor({
  spec,
  onAdd,
  onRemove,
}: {
  spec: VariableSpec
  onAdd: (raw: string) => void
  onRemove: (opt: string) => void
}): React.JSX.Element {
  const [input, setInput] = useState('')
  function commit() {
    if (input.trim()) {
      onAdd(input)
      setInput('')
    }
  }
  return (
    <div className="space-y-2 pl-1">
      {(spec.options?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2">
          {spec.options!.map((o) => (
            <span
              key={o}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300"
            >
              {o}
              <button
                type="button"
                onClick={() => onRemove(o)}
                className="text-gray-400 hover:text-red-500"
                aria-label={`${o} 삭제`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              commit()
            }
          }}
          placeholder="선택지 입력 후 Enter"
          className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500"
        />
        <button
          type="button"
          onClick={commit}
          className="bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 px-4 py-2 rounded-lg text-sm"
        >
          추가
        </button>
      </div>
    </div>
  )
}

export function TemplateEditor({ initial, onSave, onCancel }: Props): React.JSX.Element {
  const [emoji, setEmoji] = useState(initial?.emoji ?? '✏️')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [specs, setSpecs] = useState<VariableSpec[]>(
    syncVariableSpecs(initial?.body ?? '', initial?.variables ?? []),
  )
  const [error, setError] = useState('')

  function onBodyChange(v: string) {
    setBody(v)
    setSpecs((prev) => syncVariableSpecs(v, prev))
  }

  function setKind(name: string, kind: VariableKind) {
    setSpecs((prev) =>
      prev.map((s) =>
        s.name === name ? { ...s, kind, options: kind === 'free' ? undefined : s.options ?? [] } : s,
      ),
    )
  }

  function addOption(name: string, raw: string) {
    const parts = raw
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    setSpecs((prev) =>
      prev.map((s) => {
        if (s.name !== name) return s
        const merged = [...(s.options ?? [])]
        for (const p of parts) if (!merged.includes(p)) merged.push(p)
        return { ...s, options: merged }
      }),
    )
  }

  function removeOption(name: string, opt: string) {
    setSpecs((prev) =>
      prev.map((s) =>
        s.name === name ? { ...s, options: (s.options ?? []).filter((o) => o !== opt) } : s,
      ),
    )
  }

  function save() {
    if (!title.trim()) return setError('제목을 입력하세요.')
    if (!body.trim()) return setError('본문을 입력하세요.')
    for (const s of specs) {
      if (s.kind !== 'free' && (s.options?.length ?? 0) === 0) {
        return setError(`'${s.name}' 변수의 선택지를 1개 이상 추가하세요.`)
      }
    }
    const cleaned: VariableSpec[] = specs.map((s) =>
      s.kind === 'free' ? { name: s.name, kind: 'free' } : s,
    )
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      emoji: emoji.trim() || '✏️',
      title: title.trim(),
      description: description.trim() || undefined,
      body,
      variables: cleaned,
      builtin: false,
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {initial ? '프롬프트 수정' : '새 프롬프트'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          본문에 {'{중괄호}'}로 변수를 지정하면 자동 감지됩니다.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex gap-2">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={2}
            placeholder="✏️"
            className="w-16 text-center bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-2 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="설명 (선택)"
          className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500"
        />
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          rows={6}
          placeholder="예: {회사}에 보낼 메일을 {톤} 톤으로 작성해줘."
          className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 font-mono leading-relaxed"
        />
      </div>

      {specs.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 space-y-5">
          <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
            감지된 변수 {specs.length}개
          </p>
          {specs.map((s) => (
            <div key={s.name} className="space-y-2">
              <ButtonGroup
                label={s.name}
                options={KIND_LABELS.map((k) => k.label)}
                value={labelOf(s.kind)}
                onChange={(l) => setKind(s.name, codeOf(l))}
              />
              {s.kind !== 'free' && (
                <OptionEditor
                  spec={s}
                  onAdd={(raw) => addOption(s.name, raw)}
                  onRemove={(o) => removeOption(s.name, o)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={save}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold text-base transition-colors"
        >
          저장
        </button>
        <button
          onClick={onCancel}
          className="px-5 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 rounded-xl font-medium transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  )
}
