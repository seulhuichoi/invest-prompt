import React, { useState } from 'react'
import { StockPicker } from '../ui/StockPicker'
import { ButtonGroup } from '../ui/ButtonGroup'
import { PromptResult, PromptHistory } from '../ui/PromptResult'
import { buildWihomPrompt } from '../../utils/promptBuilder'

export function WihomTab(): React.JSX.Element {
  const [stock, setStock] = useState('')
  const [scenarios, setScenarios] = useState('3가지')
  const [stopLoss, setStopLoss] = useState('15%')
  const [prompt, setPrompt] = useState('')

  function generate() {
    if (!stock) return
    setPrompt(buildWihomPrompt(stock, scenarios, stopLoss))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">⚠️ 리스크 분석</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">시나리오 & 손익 관리</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 space-y-5">
        <StockPicker value={stock} onChange={setStock} />

        <ButtonGroup
          label="시나리오 수"
          options={['3가지', '5가지', '7가지']}
          value={scenarios}
          onChange={setScenarios}
        />

        <ButtonGroup
          label="손절 기준"
          options={['10%', '15%', '20%', '25%']}
          value={stopLoss}
          onChange={setStopLoss}
        />
      </div>

      <button
        onClick={generate}
        disabled={!stock}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-3 rounded-xl font-semibold text-base transition-colors"
      >
        ✨ 프롬프트 생성
      </button>

      {prompt && <PromptResult prompt={prompt} historyKey="history_wihom" />}
      <PromptHistory historyKey="history_wihom" />
    </div>
  )
}
