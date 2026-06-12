import React, { useState } from 'react'
import { TemplateTabs } from './TemplateTabs'
import { TemplateRunner } from './TemplateRunner'
import { TemplateEditor } from './TemplateEditor'
import { BUILTIN_TEMPLATES } from '../../data/templates'
import {
  loadUserTemplates,
  saveUserTemplate,
  deleteUserTemplate,
} from '../../utils/templateStore'
import type { PromptTemplate } from '../../types'

type View = { kind: 'run'; id: string } | { kind: 'create' } | { kind: 'edit'; id: string }

const FIRST_ID = BUILTIN_TEMPLATES[0].id

export function PromptSection(): React.JSX.Element {
  const [userTemplates, setUserTemplates] = useState<PromptTemplate[]>(() => loadUserTemplates())
  const [view, setView] = useState<View>({ kind: 'run', id: FIRST_ID })

  const templates = [...BUILTIN_TEMPLATES, ...userTemplates]
  const find = (id: string) => templates.find((t) => t.id === id)

  function handleSave(tpl: PromptTemplate) {
    setUserTemplates(saveUserTemplate(tpl))
    setView({ kind: 'run', id: tpl.id })
  }

  function handleDelete(id: string) {
    setUserTemplates(deleteUserTemplate(id))
    setView({ kind: 'run', id: FIRST_ID })
  }

  const activeId = view.kind === 'run' ? view.id : null
  const editing = view.kind === 'edit' ? find(view.id) : undefined
  const running = view.kind === 'run' ? find(view.id) : undefined

  return (
    <div className="space-y-5">
      <TemplateTabs
        templates={templates}
        activeId={activeId}
        onSelect={(id) => setView({ kind: 'run', id })}
        onAdd={() => setView({ kind: 'create' })}
      />

      {view.kind === 'create' && (
        <TemplateEditor onSave={handleSave} onCancel={() => setView({ kind: 'run', id: FIRST_ID })} />
      )}

      {view.kind === 'edit' && editing && (
        <TemplateEditor
          initial={editing}
          onSave={handleSave}
          onCancel={() => setView({ kind: 'run', id: editing.id })}
        />
      )}

      {view.kind === 'run' && running && (
        <TemplateRunner
          key={running.id}
          template={running}
          onEdit={() => setView({ kind: 'edit', id: running.id })}
          onDelete={() => handleDelete(running.id)}
        />
      )}
    </div>
  )
}
