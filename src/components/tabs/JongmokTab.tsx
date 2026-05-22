import React, { useState } from 'react'
import { ButtonGroup } from '../ui/ButtonGroup'
import { SelectDropdown } from '../ui/SelectDropdown'
import { PromptResult, PromptHistory } from '../ui/PromptResult'
import { buildJongmokPrompt } from '../../utils/promptBuilder'

const SECTORS = [
  'AI', '반도체', '방산', '로봇', '바이오',
  'IT플랫폼', '조선/해운', '2차전지', '원전', '사이버보안',
  '우주산업', '핀테크', '에너지', '금융', '소비재',
  '자동차', '엔터/게임', '항공/여행', '건설', '통신',
]

const PERIODS = ['1개월', '3개월', '6개월', '1년', '2년', '3년', '5년', '10년']
const RETURNS = ['5%', '10%', '15%', '20%', '25%', '30%', '35%', '40%', '50%', '70%', '100%']

export function JongmokTab(): React.JSX.Element {
  const [market, setMarket] = useState('KR 한국주식')
  const [sector, setSector] = useState('AI')
  const [style, setStyle] = useState('성장주')
  const [period, setPeriod] = useState('6개월')
  const [returnTarget, setReturnTarget] = useState('30%')
  const [count, setCount] = useState('5개')
  const [prompt, setPrompt] = useState('')

  function generate() {
    setPrompt(buildJongmokPrompt(market, sector, style, period, returnTarget, count))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">💡 종목찾기</h2>
        <p className="text-sm text-zinc-400">프롬프트로 AI가 종목 발굴</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-5">
        <ButtonGroup
          label="🌏 시장"
          options={['KR 한국주식', 'US 미국주식']}
          value={market}
          onChange={setMarket}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-300">🎯 섹터</p>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((s) => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  sector === s
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-transparent border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <ButtonGroup
          label="📊 투자 스타일"
          options={['성장주', '가치주', '배당주']}
          value={style}
          onChange={setStyle}
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectDropdown label="📅 투자 기간" options={PERIODS} value={period} onChange={setPeriod} />
          <SelectDropdown label="📈 목표 수익률" options={RETURNS} value={returnTarget} onChange={setReturnTarget} />
        </div>

        <ButtonGroup
          label="🔢 추천 개수"
          options={['3개', '5개', '7개', '10개']}
          value={count}
          onChange={setCount}
        />
      </div>

      <button
        onClick={generate}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold text-base transition-colors"
      >
        ✨ 프롬프트 생성
      </button>

      {prompt && <PromptResult prompt={prompt} historyKey="history_jongmok" />}
      <PromptHistory historyKey="history_jongmok" />
    </div>
  )
}
