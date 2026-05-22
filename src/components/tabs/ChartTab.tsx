import React, { useState } from 'react'
import { StockPicker } from '../ui/StockPicker'
import { ButtonGroup } from '../ui/ButtonGroup'
import { PromptResult, PromptHistory } from '../ui/PromptResult'
import { buildChartPrompt } from '../../utils/promptBuilder'

export function ChartTab(): React.JSX.Element {
  const [stock, setStock] = useState('')
  const [timeframe, setTimeframe] = useState('일봉')
  const [indicator, setIndicator] = useState('이동평균')
  const [pattern, setPattern] = useState('추세')
  const [prompt, setPrompt] = useState('')

  function generate() {
    if (!stock) return
    setPrompt(buildChartPrompt(stock, timeframe, indicator, pattern))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">📈 기술적 분석</h2>
        <p className="text-sm text-zinc-400">차트 & 지표 분석</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-5">
        <StockPicker value={stock} onChange={setStock} />

        <ButtonGroup
          label="타임프레임"
          options={['일봉', '주봉', '월봉']}
          value={timeframe}
          onChange={setTimeframe}
        />

        <ButtonGroup
          label="주요 지표"
          options={['이동평균', '모멘텀', '거래량']}
          value={indicator}
          onChange={setIndicator}
        />

        <ButtonGroup
          label="패턴 분석"
          options={['추세', '패턴', '캔들']}
          value={pattern}
          onChange={setPattern}
        />
      </div>

      <button
        onClick={generate}
        disabled={!stock}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-3 rounded-xl font-semibold text-base transition-colors"
      >
        ✨ 프롬프트 생성
      </button>

      {prompt && <PromptResult prompt={prompt} historyKey="history_chart" />}
      <PromptHistory historyKey="history_chart" />
    </div>
  )
}
