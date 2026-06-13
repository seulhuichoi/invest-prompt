import type { PromptTemplate, VariableSpec } from '../types'

export function parseVariables(body: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const m of body.matchAll(/\{([^{}\n]+)\}/g)) {
    const name = m[1].trim()
    if (name && !seen.has(name)) {
      seen.add(name)
      out.push(name)
    }
  }
  return out
}

export function applyTemplate(body: string, values: Record<string, string>): string {
  return body.replace(/\{([^{}\n]+)\}/g, (whole, raw) => {
    const key = (raw as string).trim()
    return key in values ? values[key] : whole
  })
}

export const AUTO_VARIABLE_NAMES = ['날짜', '시간'] as const

export function isAutoVariable(name: string): boolean {
  return (AUTO_VARIABLE_NAMES as readonly string[]).includes(name)
}

// 생성 시점의 현재 날짜/시간을 한국(KST) 기준으로 포맷한다.
// 날짜: "2026년 6월 13일" (앞자리 0 없음), 시간: "KST 12:50" (24시간제, 2자리)
export function autoVariableValues(now: Date = new Date()): Record<string, string> {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return {
    날짜: `${get('year')}년 ${Number(get('month'))}월 ${Number(get('day'))}일`,
    시간: `KST ${get('hour')}:${get('minute')}`,
  }
}

export function syncVariableSpecs(body: string, existing: VariableSpec[]): VariableSpec[] {
  const byName = new Map(existing.map((s) => [s.name, s]))
  return parseVariables(body)
    .filter((name) => !isAutoVariable(name))
    .map((name) => byName.get(name) ?? { name, kind: 'free' })
}

const STORAGE_KEY = 'promptdeck_templates'

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export function loadUserTemplates(storage: StorageLike = localStorage): PromptTemplate[] {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PromptTemplate[]) : []
  } catch {
    return []
  }
}

export function saveUserTemplate(
  tpl: PromptTemplate,
  storage: StorageLike = localStorage,
): PromptTemplate[] {
  const list = loadUserTemplates(storage)
  const idx = list.findIndex((t) => t.id === tpl.id)
  if (idx >= 0) list[idx] = tpl
  else list.push(tpl)
  storage.setItem(STORAGE_KEY, JSON.stringify(list))
  return list
}

export function deleteUserTemplate(
  id: string,
  storage: StorageLike = localStorage,
): PromptTemplate[] {
  const list = loadUserTemplates(storage).filter((t) => t.id !== id)
  storage.setItem(STORAGE_KEY, JSON.stringify(list))
  return list
}
