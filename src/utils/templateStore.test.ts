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
