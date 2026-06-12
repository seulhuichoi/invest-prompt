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

export function syncVariableSpecs(body: string, existing: VariableSpec[]): VariableSpec[] {
  const byName = new Map(existing.map((s) => [s.name, s]))
  return parseVariables(body).map((name) => byName.get(name) ?? { name, kind: 'free' })
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
