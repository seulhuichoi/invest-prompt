export type VariableKind = 'free' | 'combo' | 'select'

export interface VariableSpec {
  name: string
  kind: VariableKind
  options?: string[]
}

export interface PromptTemplate {
  id: string
  emoji: string
  title: string
  description?: string
  body: string
  note?: string
  variables?: VariableSpec[]
  builtin: boolean
}
