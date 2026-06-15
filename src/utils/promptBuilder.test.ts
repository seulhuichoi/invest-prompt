import { describe, it, expect } from 'vitest'
import { buildSimdungPrompt, buildJongmokPrompt, buildPortfolioPrompt } from './promptBuilder'

describe('투자 빌더 날짜 머리말', () => {
  it('심층분석은 "오늘은 YYYY년 M월 D일이다." 로 시작', () => {
    expect(buildSimdungPrompt('삼성전자')).toMatch(/^오늘은 \d{4}년 \d{1,2}월 \d{1,2}일이다\.\n\n/)
  })

  it('종목찾기도 날짜 머리말 포함', () => {
    const out = buildJongmokPrompt('KR 한국주식', 'AI', '성장주', '6개월', '30%', '5개')
    expect(out.startsWith('오늘은 ')).toBe(true)
  })

  it('포트폴리오도 날짜 머리말 포함', () => {
    expect(buildPortfolioPrompt('삼성전자, NAVER', '1000만원', '균등분산')).toMatch(/^오늘은 /)
  })
})
