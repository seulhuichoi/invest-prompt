import React, { useState } from 'react'
import { StockPicker } from '../ui/StockPicker'
import { PromptResult, PromptHistory } from '../ui/PromptResult'
import { buildSimdungPrompt } from '../../utils/promptBuilder'

export function SimdungTab(): React.JSX.Element {
  const [stock, setStock] = useState('')
  const [prompt, setPrompt] = useState('')

  function generate() {
    if (!stock) return
    setPrompt(buildSimdungPrompt(stock))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">🔍 내 종목 분석</h2>
        <p className="text-sm text-zinc-400">관심 종목 심층 분석</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <StockPicker value={stock} onChange={setStock} />
      </div>

      <button
        onClick={generate}
        disabled={!stock}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-3 rounded-xl font-semibold text-base transition-colors"
      >
        ✨ 프롬프트 생성
      </button>

      {prompt && <PromptResult prompt={prompt} historyKey="history_simdung" />}
      <PromptHistory historyKey="history_simdung" />
    </div>
  )
}
