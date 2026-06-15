import { describe, it, expect } from 'vitest'
import { parseVariables } from './templateStore'

describe('parseVariables', () => {
  it('변수가 없으면 빈 배열', () => {
    expect(parseVariables('변수 없는 본문')).toEqual([])
  })

  it('단일 변수', () => {
    expect(parseVariables('주제: {주제}')).toEqual(['주제'])
  })

  it('중복 변수는 한 번만, 첫 등장 순서 유지', () => {
    expect(parseVariables('{회사}에 {톤} 톤으로. 회사 재확인 {회사}')).toEqual(['회사', '톤'])
  })

  it('토큰 안쪽 공백은 trim', () => {
    expect(parseVariables('값: { 제안 }')).toEqual(['제안'])
  })

  it('인접 토큰도 모두 인식', () => {
    expect(parseVariables('{a}{b}')).toEqual(['a', 'b'])
  })
})

import { applyTemplate } from './templateStore'

describe('applyTemplate', () => {
  it('변수를 값으로 치환', () => {
    expect(applyTemplate('주제: {주제}', { 주제: 'HBM' })).toBe('주제: HBM')
  })

  it('여러 번 등장하는 변수 모두 치환', () => {
    expect(applyTemplate('{x}-{x}', { x: 'A' })).toBe('A-A')
  })

  it('값이 없는 변수는 원문 토큰 유지', () => {
    expect(applyTemplate('{a} {b}', { a: 'A' })).toBe('A {b}')
  })

  it('토큰 안쪽 공백이 있어도 trim된 이름으로 치환', () => {
    expect(applyTemplate('{ 주제 }', { 주제: 'X' })).toBe('X')
  })
})

import { syncVariableSpecs } from './templateStore'
import type { VariableSpec } from '../types'

describe('syncVariableSpecs', () => {
  it('새 변수는 free 기본값', () => {
    expect(syncVariableSpecs('{주제}', [])).toEqual([{ name: '주제', kind: 'free' }])
  })

  it('기존 종류·선택지를 보존', () => {
    const existing: VariableSpec[] = [{ name: '톤', kind: 'select', options: ['담백한'] }]
    expect(syncVariableSpecs('{톤}', existing)).toEqual([
      { name: '톤', kind: 'select', options: ['담백한'] },
    ])
  })

  it('본문에서 사라진 변수는 제거, 순서는 본문 기준', () => {
    const existing: VariableSpec[] = [
      { name: '회사', kind: 'free' },
      { name: '톤', kind: 'select', options: ['담백한'] },
    ]
    expect(syncVariableSpecs('{톤} {신규}', existing)).toEqual([
      { name: '톤', kind: 'select', options: ['담백한'] },
      { name: '신규', kind: 'free' },
    ])
  })
})

import { loadUserTemplates, saveUserTemplate, deleteUserTemplate } from './templateStore'
import type { PromptTemplate } from '../types'

function memStorage(): Pick<Storage, 'getItem' | 'setItem'> {
  const m = new Map<string, string>()
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => {
      m.set(k, v)
    },
  }
}

const sample: PromptTemplate = {
  id: 't1',
  emoji: '📨',
  title: '콜드메일',
  body: '{회사}에 메일',
  variables: [{ name: '회사', kind: 'free' }],
  builtin: false,
}

describe('user template CRUD', () => {
  it('초기에는 빈 배열', () => {
    expect(loadUserTemplates(memStorage())).toEqual([])
  })

  it('add → load 라운드트립', () => {
    const s = memStorage()
    saveUserTemplate(sample, s)
    expect(loadUserTemplates(s)).toEqual([sample])
  })

  it('같은 id는 갱신(중복 추가 아님)', () => {
    const s = memStorage()
    saveUserTemplate(sample, s)
    saveUserTemplate({ ...sample, title: '수정됨' }, s)
    const list = loadUserTemplates(s)
    expect(list).toHaveLength(1)
    expect(list[0].title).toBe('수정됨')
  })

  it('delete 후 제거', () => {
    const s = memStorage()
    saveUserTemplate(sample, s)
    deleteUserTemplate('t1', s)
    expect(loadUserTemplates(s)).toEqual([])
  })

  it('손상된 JSON이면 빈 배열', () => {
    const s = memStorage()
    s.setItem('promptdeck_templates', '{not json')
    expect(loadUserTemplates(s)).toEqual([])
  })
})

import { BUILTIN_TEMPLATES } from '../data/templates'

describe('BUILTIN_TEMPLATES', () => {
  it('낙서는 변수가 없다', () => {
    const t = BUILTIN_TEMPLATES.find((x) => x.id === 'builtin-nakseo')!
    expect(parseVariables(t.body)).toEqual([])
  })

  it('심층리포트는 {주제} 변수를 가진다', () => {
    const t = BUILTIN_TEMPLATES.find((x) => x.id === 'builtin-simchung')!
    expect(parseVariables(t.body)).toEqual(['주제'])
  })

  it('AI 전문가 템플릿은 {질문} 변수를 가진다', () => {
    const t = BUILTIN_TEMPLATES.find((x) => x.id === 'builtin-ai-strategist')!
    expect(t.title).toBe('AI 전문가')
    expect(parseVariables(t.body)).toEqual(['질문'])
  })

  it('산업 전문가 템플릿은 {산업},{질문} 변수를 가진다', () => {
    const t = BUILTIN_TEMPLATES.find((x) => x.id === 'builtin-industry-expert')!
    expect(t.title).toBe('산업 전문가')
    expect(parseVariables(t.body)).toEqual(['산업', '질문'])
  })

  it('모든 기본 템플릿은 builtin=true, 고유 id', () => {
    const ids = BUILTIN_TEMPLATES.map((t) => t.id)
    expect(BUILTIN_TEMPLATES.every((t) => t.builtin)).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

import { isAutoVariable, autoVariableValues } from './templateStore'

describe('auto variables (날짜/시간)', () => {
  it('isAutoVariable 식별', () => {
    expect(isAutoVariable('날짜')).toBe(true)
    expect(isAutoVariable('시간')).toBe(true)
    expect(isAutoVariable('회사')).toBe(false)
  })

  it('KST 기준 날짜/시간 포맷', () => {
    const d = new Date('2026-06-13T03:50:00Z') // KST 2026-06-13 12:50
    expect(autoVariableValues(d)).toEqual({ 날짜: '2026년 6월 13일', 시간: 'KST 12:50' })
  })

  it('앞자리 0 없는 월/일, 2자리 시각', () => {
    const d = new Date('2026-01-05T23:05:00Z') // KST 2026-01-06 08:05
    expect(autoVariableValues(d)).toEqual({ 날짜: '2026년 1월 6일', 시간: 'KST 08:05' })
  })

  it('자정은 00:00 (h23), 날짜 넘어감', () => {
    const d = new Date('2026-06-13T15:00:00Z') // KST 2026-06-14 00:00
    expect(autoVariableValues(d)).toEqual({ 날짜: '2026년 6월 14일', 시간: 'KST 00:00' })
  })

  it('syncVariableSpecs는 자동 변수를 입력 목록에서 제외', () => {
    expect(syncVariableSpecs('{날짜} {회사} {시간}', [])).toEqual([{ name: '회사', kind: 'free' }])
  })

  it('applyTemplate은 주입된 자동 값으로 치환', () => {
    const vals = autoVariableValues(new Date('2026-06-13T03:50:00Z'))
    expect(applyTemplate('현재 시점은 {날짜} {시간}이야.', vals)).toBe(
      '현재 시점은 2026년 6월 13일 KST 12:50이야.',
    )
  })
})
