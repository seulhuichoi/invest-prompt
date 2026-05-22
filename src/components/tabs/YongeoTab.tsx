import React, { useState } from 'react'
import { TERMS, TERM_CATEGORIES, type TermCategory } from '../../data/terms'

export function YongeoTab(): React.JSX.Element {
  const [category, setCategory] = useState<TermCategory>('기본')
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">📖 주식 용어 사전</h2>
        <p className="text-sm text-zinc-400">터치하면 상세 설명이 나와요!</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TERM_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat)
              setExpanded(null)
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              category === cat
                ? 'bg-red-500 border-red-500 text-white'
                : 'bg-transparent border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white'
            }`}
          >
            {cat === '기본' ? '📊 기본' : cat === '재무' ? '💰 재무' : cat === '밸류' ? '🎯 밸류' : cat === 'ETF' ? '🏦 ETF' : cat === '매매' ? '📈 매매' : '📉 기술적'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {TERMS[category].map((term) => (
          <div key={term.name} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === term.name ? null : term.name)}
              className="w-full text-left px-4 py-3 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{term.name}</span>
                  <span className="text-xs text-gray-500 dark:text-zinc-400">{term.full}</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{term.short}</p>
              </div>
              <span className="text-zinc-500 text-sm flex-shrink-0 mt-0.5">
                {expanded === term.name ? '▲' : '▼'}
              </span>
            </button>

            {expanded === term.name && (
              <div className="px-4 pb-4 pt-0">
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{term.detail}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 space-y-1">
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">📚 용어 학습 팁</p>
        <p className="text-xs text-gray-400 dark:text-zinc-500">• 기본 → 재무 → 밸류 → ETF → 매매 순서로 학습하세요</p>
        <p className="text-xs text-gray-400 dark:text-zinc-500">• 실제 종목에 적용해보면 이해가 빨라요</p>
        <p className="text-xs text-gray-400 dark:text-zinc-500">• 모르는 용어는 AI에게 추가 질문하세요!</p>
      </div>
    </div>
  )
}
