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
