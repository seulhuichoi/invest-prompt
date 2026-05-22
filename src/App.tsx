import React, { useState } from 'react'
import { JongmokTab } from './components/tabs/JongmokTab'
import { SimdungTab } from './components/tabs/SimdungTab'
import { JamuTab } from './components/tabs/JamuTab'
import { GachiTab } from './components/tabs/GachiTab'
import { ChartTab } from './components/tabs/ChartTab'
import { JungseongTab } from './components/tabs/JungseongTab'
import { WihomTab } from './components/tabs/WihomTab'
import { PortfolioTab } from './components/tabs/PortfolioTab'
import { EtfTab } from './components/tabs/EtfTab'
import { YongeoTab } from './components/tabs/YongeoTab'

const TABS = [
  { id: 'jongmok', label: '종목찾기', emoji: '💡', component: JongmokTab },
  { id: 'simdung', label: '심층분석', emoji: '🔍', component: SimdungTab },
  { id: 'jamu', label: '재무', emoji: '📊', component: JamuTab },
  { id: 'gachi', label: '가치', emoji: '💰', component: GachiTab },
  { id: 'chart', label: '차트', emoji: '📈', component: ChartTab },
  { id: 'jungseong', label: '정성적', emoji: '🧠', component: JungseongTab },
  { id: 'wihom', label: '위험', emoji: '⚠️', component: WihomTab },
  { id: 'portfolio', label: '포트폴리오', emoji: '💼', component: PortfolioTab },
  { id: 'etf', label: 'ETF', emoji: '🏦', component: EtfTab },
  { id: 'yongeo', label: '용어', emoji: '📖', component: YongeoTab },
] as const

type TabId = (typeof TABS)[number]['id']

export default function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('jongmok')

  const ActiveComponent = TABS.find((t) => t.id === activeTab)!.component

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white">InvestPrompt</h1>
            <p className="text-xs text-zinc-500">AI 투자 프롬프트 생성기</p>
          </div>
          <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-1 rounded-full">
            v1.0
          </span>
        </div>

        {/* Tab bar — horizontal scroll */}
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex px-4 pb-0 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        <ActiveComponent />
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto w-full px-4 py-4 border-t border-zinc-800 mt-4">
        <p className="text-xs text-zinc-600 text-center">
          ※ 본 앱은 투자 학습 및 정보 제공 목적으로만 제작되었습니다.
          투자 판단에 따른 손익은 전적으로 이용자 본인에게 귀속됩니다.
        </p>
      </footer>
    </div>
  )
}
