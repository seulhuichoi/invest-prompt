import React, { useState } from 'react'
import { StockPicker } from '../ui/StockPicker'
import { ButtonGroup } from '../ui/ButtonGroup'
import { PromptResult, PromptHistory } from '../ui/PromptResult'
import { buildGachiPrompt } from '../../utils/promptBuilder'

export function GachiTab(): React.JSX.Element {
  const [stock, setStock] = useState('')
  const [method, setMethod] = useState('상대가치')
  const [margin, setMargin] = useState('20%')
  const [prompt, setPrompt] = useState('')

  function generate() {
    if (!stock) return
    setPrompt(buildGachiPrompt(stock, method, margin))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">💰 밸류에이션</h2>
        <p className="text-sm text-zinc-400">적정 주가 산출</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-5">
        <StockPicker value={stock} onChange={setStock} />

        <ButtonGroup
          label="평가 방법"
          options={['상대가치', '절대가치', '종합']}
          value={method}
          onChange={setMethod}
          hint="💡 상대가치: PER/PBR 업종비교"
        />

        <ButtonGroup
          label="안전마진"
          options={['10%', '20%', '30%', '40%']}
          value={margin}
          onChange={setMargin}
        />
      </div>

      <button
        onClick={generate}
        disabled={!stock}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-3 rounded-xl font-semibold text-base transition-colors"
      >
        ✨ 프롬프트 생성
      </button>

      {prompt && <PromptResult prompt={prompt} historyKey="history_gachi" />}
      <PromptHistory historyKey="history_gachi" />
    </div>
  )
}
