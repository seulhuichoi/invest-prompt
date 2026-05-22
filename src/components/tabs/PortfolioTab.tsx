import React, { useState } from 'react'
import { US_STOCKS, KR_STOCKS } from '../../data/stocks'
import { ButtonGroup } from '../ui/ButtonGroup'
import { PromptResult, PromptHistory } from '../ui/PromptResult'
import { buildPortfolioPrompt } from '../../utils/promptBuilder'

export function PortfolioTab(): React.JSX.Element {
  const [selected, setSelected] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [amount, setAmount] = useState('1000만원')
  const [strategy, setStrategy] = useState('균등분산')
  const [prompt, setPrompt] = useState('')

  function toggle(stock: string) {
    setSelected((prev) =>
      prev.includes(stock) ? prev.filter((s) => s !== stock) : [...prev, stock],
    )
  }

  function handleAdd() {
    const trimmed = input.trim()
    if (trimmed && !selected.includes(trimmed)) {
      setSelected((prev) => [...prev, trimmed])
      setInput('')
    }
  }

  function generate() {
    if (selected.length === 0) return
    setPrompt(buildPortfolioPrompt(selected.join(', '), amount, strategy))
  }

  const ALL_STOCKS = [...US_STOCKS, ...KR_STOCKS]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">💼 포트폴리오</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">종목 배분 & 실행 전략</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 space-y-5">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">📌 종목 선택 (복수 선택 가능)</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
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

          <div className="flex flex-wrap gap-2">
            {ALL_STOCKS.map((s) => (
              <button
                key={s}
                onClick={() => toggle(s)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selected.includes(s)
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-transparent border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:border-gray-500 dark:hover:border-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 bg-red-500/20 border border-red-500/40 text-red-600 dark:text-red-300 text-xs px-2 py-1 rounded-full"
                >
                  {s}
                  <button onClick={() => toggle(s)} className="hover:text-red-800 dark:hover:text-white">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <ButtonGroup label="투자금액" options={['1000만원', '3000만원', '5000만원', '1억원']} value={amount} onChange={setAmount} />
        <ButtonGroup label="배분 전략" options={['균등분산', '차등배분', '집중투자']} value={strategy} onChange={setStrategy} />
      </div>

      <button
        onClick={generate}
        disabled={selected.length === 0}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-200 dark:disabled:bg-zinc-700 disabled:text-gray-400 dark:disabled:text-zinc-500 text-white py-3 rounded-xl font-semibold text-base transition-colors"
      >
        ✨ 프롬프트 생성
      </button>

      {prompt && <PromptResult prompt={prompt} historyKey="history_portfolio" />}
      <PromptHistory historyKey="history_portfolio" />
    </div>
  )
}
