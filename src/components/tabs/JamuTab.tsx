import React, { useState } from 'react'
import { StockPicker } from '../ui/StockPicker'
import { ButtonGroup } from '../ui/ButtonGroup'
import { PromptResult, PromptHistory } from '../ui/PromptResult'
import { buildJamuPrompt } from '../../utils/promptBuilder'

export function JamuTab(): React.JSX.Element {
  const [stock, setStock] = useState('')
  const [analysisType, setAnalysisType] = useState('종합분석')
  const [focus, setFocus] = useState('ROE')
  const [prompt, setPrompt] = useState('')

  function generate() {
    if (!stock) return
    setPrompt(buildJamuPrompt(stock, analysisType, focus))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">📊 재무 분석</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">재무 건전성 분석</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 space-y-5">
        <StockPicker value={stock} onChange={setStock} />

        <ButtonGroup
          label="분석 유형"
          options={['종합분석', '비교분석', '심층분석']}
          value={analysisType}
          onChange={setAnalysisType}
          hint="💡 종합분석: 균형있는 전체 평가"
        />

        <ButtonGroup
          label="중점 영역"
          options={['ROE', '안정성', '성장성']}
          value={focus}
          onChange={setFocus}
          hint="💡 ROE: 듀퐁분석으로 수익성 분해"
        />
      </div>

      <button
        onClick={generate}
        disabled={!stock}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-3 rounded-xl font-semibold text-base transition-colors"
      >
        ✨ 프롬프트 생성
      </button>

      {prompt && <PromptResult prompt={prompt} historyKey="history_jamu" />}
      <PromptHistory historyKey="history_jamu" />
    </div>
  )
}
