import React, { useState, useEffect } from 'react'
import { CategoryBar, Category } from './components/CategoryBar'
import { InvestSection } from './components/InvestSection'
import { PromptSection } from './components/template/PromptSection'

type ThemeMode = 'system' | 'light' | 'dark'

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(mode: ThemeMode) {
  const isDark = mode === 'dark' || (mode === 'system' && getSystemDark())
  document.documentElement.classList.toggle('dark', isDark)
}

export default function App(): React.JSX.Element {
  const [category, setCategory] = useState<Category>('invest')
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme') as ThemeMode) ?? 'system'
  })

  useEffect(() => {
    applyTheme(themeMode)
    localStorage.setItem('theme', themeMode)

    if (themeMode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [themeMode])

  function cycleTheme() {
    setThemeMode((prev) => {
      if (prev === 'system') return 'light'
      if (prev === 'light') return 'dark'
      return 'system'
    })
  }

  const themeIcon = themeMode === 'light' ? '☀️' : themeMode === 'dark' ? '🌙' : '⚙️'
  const themeLabel = themeMode === 'light' ? '라이트' : themeMode === 'dark' ? '다크' : '시스템'

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">PromptDeck</h1>
            <p className="text-xs text-gray-500 dark:text-zinc-500">AI 프롬프트 생성기</p>
          </div>
          <button
            onClick={cycleTheme}
            title={`현재: ${themeLabel} 모드 (클릭해서 변경)`}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-2.5 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <span>{themeIcon}</span>
            <span>{themeLabel}</span>
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-3">
          <CategoryBar value={category} onChange={setCategory} />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {category === 'invest' ? <InvestSection /> : <PromptSection />}
      </main>

      <footer className="max-w-2xl mx-auto w-full px-4 py-4 border-t border-gray-200 dark:border-zinc-800 mt-4">
        <p className="text-xs text-gray-400 dark:text-zinc-600 text-center">
          {category === 'invest'
            ? '※ 본 앱의 투자 관련 콘텐츠는 학습 및 정보 제공 목적이며, 투자 판단에 따른 손익은 전적으로 이용자 본인에게 귀속됩니다.'
            : '※ 본 앱은 학습 및 정보 제공 목적으로 제작되었습니다.'}
        </p>
      </footer>
    </div>
  )
}
