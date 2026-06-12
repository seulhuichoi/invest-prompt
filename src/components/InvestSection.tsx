import React, { useState } from 'react'
import { JongmokTab } from './tabs/JongmokTab'
import { SimdungTab } from './tabs/SimdungTab'
import { JamuTab } from './tabs/JamuTab'
import { GachiTab } from './tabs/GachiTab'
import { ChartTab } from './tabs/ChartTab'
import { JungseongTab } from './tabs/JungseongTab'
import { WihomTab } from './tabs/WihomTab'
import { PortfolioTab } from './tabs/PortfolioTab'
import { EtfTab } from './tabs/EtfTab'
import { YongeoTab } from './tabs/YongeoTab'

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

export function InvestSection(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('jongmok')
  const ActiveComponent = TABS.find((t) => t.id === activeTab)!.component

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto">
        <div className="flex min-w-max border-b border-gray-200 dark:border-zinc-800">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <ActiveComponent />
    </div>
  )
}
