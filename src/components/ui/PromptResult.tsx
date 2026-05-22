import React, { useState } from 'react'

interface HistoryItem {
  text: string
  createdAt: number
}

interface Props {
  prompt: string
  historyKey: string
}

const AI_TOOLS = [
  { name: 'ChatGPT', url: 'https://chat.openai.com', emoji: '🤖' },
  { name: 'Claude', url: 'https://claude.ai', emoji: '🧠' },
  { name: 'Gemini', url: 'https://gemini.google.com', emoji: '✨' },
  { name: 'Perplexity', url: 'https://www.perplexity.ai', emoji: '🔍' },
  { name: 'AI Studio', url: 'https://aistudio.google.com', emoji: '🎨' },
]

export function PromptResult({ prompt, historyKey }: Props): React.JSX.Element {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    const stored = localStorage.getItem(historyKey)
    const history: HistoryItem[] = stored ? JSON.parse(stored) : []
    const updated = [{ text: prompt, createdAt: Date.now() }, ...history].slice(0, 10)
    localStorage.setItem(historyKey, JSON.stringify(updated))
  }

  return (
    <div className="space-y-3 mt-4">
      <div className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">생성된 프롬프트</p>
          <button
            onClick={handleCopy}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-300'
            }`}
          >
            {copied ? '✓ 복사됨' : '복사하기'}
          </button>
        </div>
        <pre className="text-sm text-gray-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans">
          {prompt}
        </pre>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-gray-400 dark:text-zinc-500">AI 도구에서 바로 사용하기</p>
        <div className="flex flex-wrap gap-2">
          {AI_TOOLS.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-600 hover:border-gray-300 dark:hover:border-zinc-500 rounded-full text-sm text-gray-700 dark:text-zinc-300 transition-colors"
            >
              <span>{tool.emoji}</span>
              <span>{tool.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PromptHistory({ historyKey }: { historyKey: string }): React.JSX.Element {
  const stored = localStorage.getItem(historyKey)
  const history: HistoryItem[] = stored ? JSON.parse(stored) : []

  if (history.length === 0) return <></>

  return (
    <div className="mt-6 space-y-2">
      <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">히스토리 (최근 {history.length}개)</p>
      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.createdAt}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-3"
          >
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">
              {new Date(item.createdAt).toLocaleString('ko-KR')}
            </p>
            <p className="text-xs text-gray-600 dark:text-zinc-400 line-clamp-2">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
