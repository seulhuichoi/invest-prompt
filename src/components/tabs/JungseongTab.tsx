import React, { useState } from 'react'
import { StockPicker } from '../ui/StockPicker'
import { ButtonGroup } from '../ui/ButtonGroup'
import { PromptResult, PromptHistory } from '../ui/PromptResult'
import { buildJungseongPrompt } from '../../utils/promptBuilder'

export function JungseongTab(): React.JSX.Element {
  const [stock, setStock] = useState('')
  const [focus, setFocus] = useState('경쟁우위')
  const [prompt, setPrompt] = useState('')

  function generate() {
    if (!stock) return
    setPrompt(buildJungseongPrompt(stock, focus))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">🧠 정성적 분석</h2>
        <p className="text-sm text-zinc-400">경쟁우위 & 경영진 평가</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-5">
        <StockPicker value={stock} onChange={setStock} />

        <ButtonGroup
          label="중점 영역"
          options={['경쟁우위', '경영진', 'ESG']}
          value={focus}
          onChange={setFocus}
        />
      </div>

      <button
        onClick={generate}
        disabled={!stock}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-3 rounded-xl font-semibold text-base transition-colors"
      >
        ✨ 프롬프트 생성
      </button>

      {prompt && <PromptResult prompt={prompt} historyKey="history_jungseong" />}
      <PromptHistory historyKey="history_jungseong" />
    </div>
  )
}
