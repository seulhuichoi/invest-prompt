import React, { useState } from 'react'
import { US_ETFS, KR_ETFS } from '../../data/etfs'
import { ButtonGroup } from '../ui/ButtonGroup'
import { PromptResult, PromptHistory } from '../ui/PromptResult'
import { buildEtfPrompt } from '../../utils/promptBuilder'

export function EtfTab(): React.JSX.Element {
  const [selected, setSelected] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [purpose, setPurpose] = useState('장기투자')
  const [style, setStyle] = useState('패시브')
  const [region, setRegion] = useState('미국')
  const [prompt, setPrompt] = useState('')

  function toggle(ticker: string) {
    setSelected((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker],
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
    setPrompt(buildEtfPrompt(selected.join(', '), purpose, style, region))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">🏦 ETF 분석</h2>
        <p className="text-sm text-zinc-400">ETF 비교 & 포트폴리오</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-5">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-zinc-200">📌 ETF 선택</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="ETF명 직접 입력"
              className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
            <button
              onClick={handleAdd}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              추가
            </button>
          </div>

          <p className="text-xs text-zinc-500">🇺🇸 미국 ETF</p>
          <div className="flex flex-wrap gap-2">
            {US_ETFS.map((etf) => (
              <button
                key={etf.ticker}
                onClick={() => toggle(etf.ticker)}
                className={`flex flex-col items-start px-3 py-2 rounded-xl text-xs border transition-colors ${
                  selected.includes(etf.ticker)
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-transparent border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white'
                }`}
              >
                <span className="font-bold">{etf.ticker}</span>
                <span className={`text-[10px] mt-0.5 ${selected.includes(etf.ticker) ? 'text-red-100' : 'text-zinc-500'}`}>
                  {etf.desc}
                </span>
              </button>
            ))}
          </div>

          <p className="text-xs text-zinc-500">🇰🇷 한국 ETF</p>
          <div className="flex flex-wrap gap-2">
            {KR_ETFS.map((etf) => (
              <button
                key={etf.ticker}
                onClick={() => toggle(etf.ticker)}
                className={`flex flex-col items-start px-3 py-2 rounded-xl text-xs border transition-colors ${
                  selected.includes(etf.ticker)
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-transparent border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white'
                }`}
              >
                <span className="font-bold">{etf.ticker}</span>
                <span className={`text-[10px] mt-0.5 ${selected.includes(etf.ticker) ? 'text-red-100' : 'text-zinc-500'}`}>
                  {etf.desc}
                </span>
              </button>
            ))}
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 bg-red-500/20 border border-red-500/40 text-red-300 text-xs px-2 py-1 rounded-full"
                >
                  {t}
                  <button onClick={() => toggle(t)} className="hover:text-white">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-zinc-500">💡 선택한 ETF에 따라 자동 설정됩니다</p>
        </div>

        <ButtonGroup
          label="투자 목적"
          options={['장기투자', '배당수익', '단기트레이딩']}
          value={purpose}
          onChange={setPurpose}
        />

        <ButtonGroup
          label="투자 스타일"
          options={['패시브', '액티브', '테마']}
          value={style}
          onChange={setStyle}
        />

        <ButtonGroup
          label="투자 지역"
          options={['미국', '한국', '글로벌']}
          value={region}
          onChange={setRegion}
        />
      </div>

      <button
        onClick={generate}
        disabled={selected.length === 0}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-3 rounded-xl font-semibold text-base transition-colors"
      >
        ✨ 프롬프트 생성
      </button>

      {prompt && <PromptResult prompt={prompt} historyKey="history_etf" />}
      <PromptHistory historyKey="history_etf" />
    </div>
  )
}
