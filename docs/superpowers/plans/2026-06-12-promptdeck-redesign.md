# PromptDeck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** InvestPrompt를 범용 AI 프롬프트 생성기 **PromptDeck**으로 리브랜딩하고, 변수 템플릿 엔진(자동 변수 감지 + 종류 지정)과 기본 제공 프롬프트(낙서·심층리포트)를 추가한다.

**Architecture:** 카테고리 2단(`투자`/`프롬프트`). 투자 카테고리는 기존 10개 탭 컴포넌트를 그대로 묶고, 프롬프트 카테고리는 데이터 기반 템플릿 엔진으로 구동한다. 순수 로직(`templateStore`)은 Vitest로 단위 테스트하고, UI는 `tsc`(strict) + dev 서버로 검증한다.

**Tech Stack:** React 19, TypeScript(strict), Vite 6, Tailwind CSS 3, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-12-promptdeck-redesign-design.md`

---

## File Structure

신규:
- `src/types.ts` — 공용 타입(`VariableKind`, `VariableSpec`, `PromptTemplate`)
- `src/utils/templateStore.ts` — `parseVariables` / `applyTemplate` / `syncVariableSpecs` / localStorage CRUD
- `src/utils/templateStore.test.ts` — 단위 테스트
- `src/data/templates.ts` — `BUILTIN_TEMPLATES`(낙서, 심층리포트)
- `src/components/CategoryBar.tsx` — 카테고리 칩 + `Category` 타입
- `src/components/InvestSection.tsx` — 기존 10개 투자 탭바(현 App에서 추출)
- `src/components/template/VariableInput.tsx` — 종류별 단일 변수 입력
- `src/components/template/TemplateRunner.tsx` — 변수 입력 → 생성
- `src/components/template/TemplateEditor.tsx` — 새/편집 폼
- `src/components/template/TemplateTabs.tsx` — 프롬프트 항목 탭바 + ＋
- `src/components/template/PromptSection.tsx` — 프롬프트 카테고리 컨테이너(상태/뷰 전환)

변경:
- `src/App.tsx` — 카테고리 상태, 헤더/푸터 리브랜딩, 두 섹션 렌더
- `index.html`, `public/manifest.json` — 리브랜딩
- `package.json`, `vite.config.ts` — Vitest 도입

재사용(변경 없음): `src/components/ui/PromptResult.tsx`, `ButtonGroup.tsx`, `SelectDropdown.tsx`, 기존 `tabs/*`.

---

## Task 1: Vitest 도입 + 공용 타입

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/types.ts`

- [ ] **Step 1: Vitest 설치**

Run: `npm install -D vitest`
Expected: `package.json`의 `devDependencies`에 `vitest` 추가, 설치 성공.

- [ ] **Step 2: `vite.config.ts`를 vitest 설정으로 교체**

`vite.config.ts` 전체를 아래로 교체:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 3: `package.json`에 test 스크립트 추가**

`scripts` 블록을 아래로 교체(기존 dev/build/preview 유지 + test 2개 추가):

```json
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 4: 공용 타입 생성 `src/types.ts`**

```ts
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
```

- [ ] **Step 5: 테스트 러너 동작 확인**

Run: `npm run test`
Expected: "No test files found" 류 메시지와 함께 정상 종료(에러 없음).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/types.ts
git commit -m "chore: add Vitest and shared template types"
```

---

## Task 2: templateStore — parseVariables (TDD)

**Files:**
- Create: `src/utils/templateStore.test.ts`
- Create: `src/utils/templateStore.ts`

- [ ] **Step 1: 실패하는 테스트 작성** `src/utils/templateStore.test.ts`

```ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test`
Expected: FAIL — `parseVariables`를 `./templateStore`에서 찾을 수 없음(모듈/함수 미존재).

- [ ] **Step 3: 최소 구현** `src/utils/templateStore.ts`

```ts
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
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test`
Expected: PASS (5개 통과).

- [ ] **Step 5: Commit**

```bash
git add src/utils/templateStore.ts src/utils/templateStore.test.ts
git commit -m "feat: parseVariables for template engine"
```

---

## Task 3: templateStore — applyTemplate (TDD)

**Files:**
- Modify: `src/utils/templateStore.test.ts`
- Modify: `src/utils/templateStore.ts`

- [ ] **Step 1: 테스트 추가** (파일 끝에 append)

```ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test`
Expected: FAIL — `applyTemplate` 미존재.

- [ ] **Step 3: 구현 추가** (`templateStore.ts`에 append)

```ts
export function applyTemplate(body: string, values: Record<string, string>): string {
  return body.replace(/\{([^{}\n]+)\}/g, (whole, raw) => {
    const key = (raw as string).trim()
    return key in values ? values[key] : whole
  })
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/templateStore.ts src/utils/templateStore.test.ts
git commit -m "feat: applyTemplate substitution"
```

---

## Task 4: templateStore — syncVariableSpecs (TDD)

**Files:**
- Modify: `src/utils/templateStore.test.ts`
- Modify: `src/utils/templateStore.ts`

- [ ] **Step 1: 테스트 추가** (append)

```ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test`
Expected: FAIL — `syncVariableSpecs` 미존재.

- [ ] **Step 3: 구현 추가** (`templateStore.ts`에 append; 파일 상단 import 추가)

`templateStore.ts` 맨 위에 import 추가:

```ts
import type { VariableSpec } from '../types'
```

함수 추가:

```ts
export function syncVariableSpecs(body: string, existing: VariableSpec[]): VariableSpec[] {
  const byName = new Map(existing.map((s) => [s.name, s]))
  return parseVariables(body).map((name) => byName.get(name) ?? { name, kind: 'free' })
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/templateStore.ts src/utils/templateStore.test.ts
git commit -m "feat: syncVariableSpecs merges detected vars with existing specs"
```

---

## Task 5: templateStore — localStorage CRUD (TDD)

**Files:**
- Modify: `src/utils/templateStore.test.ts`
- Modify: `src/utils/templateStore.ts`

- [ ] **Step 1: 테스트 추가** (append)

```ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test`
Expected: FAIL — CRUD 함수 미존재.

- [ ] **Step 3: 구현 추가** (`templateStore.ts`에 append)

먼저 파일 상단의 타입 import에 `PromptTemplate`를 추가한다:

```ts
import type { PromptTemplate, VariableSpec } from '../types'
```

그 다음 함수 추가:

```ts
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
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test`
Expected: PASS (전체 테스트 통과).

- [ ] **Step 5: Commit**

```bash
git add src/utils/templateStore.ts src/utils/templateStore.test.ts
git commit -m "feat: user template localStorage CRUD"
```

---

## Task 6: 기본 제공 템플릿 데이터

**Files:**
- Create: `src/data/templates.ts`
- Modify: `src/utils/templateStore.test.ts`

- [ ] **Step 1: 데이터 파일 생성** `src/data/templates.ts`

```ts
import type { PromptTemplate } from '../types'

export const BUILTIN_TEMPLATES: PromptTemplate[] = [
  {
    id: 'builtin-nakseo',
    emoji: '🖍',
    title: '낙서',
    builtin: true,
    note: '멀티모달 AI(ChatGPT, Gemini 등)에 이미지를 먼저 첨부한 뒤 이 프롬프트를 붙여넣으세요.',
    body: `Redraw the attached image in the most clumsy, scribbly, and utterly pathetic way possible. Use a white background, and make it look like it was drawn in MS Paint with a mouse. It should be vaguely similar but also not really, kind of matching but also off in a confusing, awkward way, with that low-quality pixel-by-pixel feel that really emphasizes how ridiculously bad it is. Actually, you know what, whatever, just draw it however you want.`,
  },
  {
    id: 'builtin-simchung',
    emoji: '📑',
    title: '심층리포트',
    builtin: true,
    description: '전문 리서치 애널리스트 관점의 심층 리포트를 생성합니다.',
    body: `너는 해당 분야에 대한 전문 지식을 갖춘 리서치 애널리스트이자 보고서 작성자다.

다음 주제에 대해 심층 리포트를 작성하라.

주제: {주제}

리포트는 단순한 개요나 요약이 아니라, 독자가 해당 주제를 구조적으로 이해하고 판단할 수 있도록 충분히 깊이 있게 작성해야 한다. 표면적인 설명에 그치지 말고, 역사적 배경, 핵심 개념, 작동 원리, 주요 쟁점, 실제 사례, 장단점, 리스크, 향후 전망까지 종합적으로 다뤄라.

다음 기준을 반드시 반영하라.

1. 주제의 정의와 범위

* {주제}가 무엇을 의미하는지 명확히 정의하라.
* 혼동되기 쉬운 유사 개념이 있다면 구분하라.
* 이 리포트에서 다룰 범위와 다루지 않을 범위를 설명하라.

2. 배경과 맥락

* 이 주제가 왜 중요한지 설명하라.
* 역사적·사회적·기술적·경제적 배경을 정리하라.
* 최근 주목받게 된 이유가 있다면 함께 분석하라.

3. 핵심 구조와 작동 방식

* {주제}를 이해하는 데 필요한 핵심 개념을 체계적으로 설명하라.
* 내부 구조, 작동 원리, 구성 요소, 이해관계자 등을 분석하라.
* 가능한 경우 단계별 흐름이나 구조적 프레임워크로 정리하라.

4. 주요 유형과 분류

* {주제}를 유형별·기준별로 분류하라.
* 각 유형의 특징, 차이점, 대표 사례를 설명하라.

5. 실제 사례와 적용

* 현실에서 {주제}가 어떻게 나타나거나 활용되는지 구체적인 사례를 들어 설명하라.
* 성공 사례와 실패 사례가 있다면 함께 제시하라.
* 사례를 단순 나열하지 말고, 그 사례가 보여주는 의미를 분석하라.

6. 장점과 기회

* {주제}가 제공하는 가치, 장점, 가능성을 분석하라.
* 개인, 조직, 산업, 사회 전체에 미치는 긍정적 영향을 구분해 설명하라.

7. 한계와 리스크

* {주제}의 구조적 한계, 부작용, 위험 요인을 분석하라.
* 과장되었거나 오해되기 쉬운 부분이 있다면 비판적으로 짚어라.
* 단기적 리스크와 장기적 리스크를 구분하라.

8. 주요 쟁점과 논쟁

* 현재 이 주제를 둘러싼 핵심 논쟁을 정리하라.
* 찬성·반대 또는 낙관론·비관론의 논리를 균형 있게 비교하라.
* 어느 쪽 주장이 더 설득력 있는지 평가하되, 불확실성도 명시하라.

9. 향후 전망

* 앞으로 {주제}가 어떻게 변화할 가능성이 있는지 분석하라.
* 단기, 중기, 장기 전망을 구분하라.
* 기술, 정책, 시장, 문화, 사회 변화가 미칠 영향을 고려하라.

10. 종합 평가

* 전체 내용을 바탕으로 {주제}의 핵심 의미를 정리하라.
* 이 주제를 이해할 때 가장 중요한 관점 3~5가지를 제시하라.
* 독자가 실제 판단이나 의사결정에 활용할 수 있는 결론을 제시하라.

작성 방식:

* 제목과 소제목을 명확히 사용하라.
* 가능한 한 논리적이고 분석적인 문체로 작성하라.
* 단순한 정보 나열이 아니라 “왜 중요한가”, “무엇이 문제인가”, “앞으로 어떻게 될 것인가”를 중심으로 설명하라.
* 전문 용어는 사용하되, 처음 등장할 때는 쉽게 풀어 설명하라.
* 불확실한 내용은 단정하지 말고, 가능한 시나리오로 나누어 설명하라.
* 마지막에는 핵심 내용을 요약한 표를 포함하라.

출력 형식(markdown):

1. 제목
2. Executive Summary
3. 본문
4. 핵심 쟁점 정리
5. 향후 전망
6. 종합 결론
7. 요약 표`,
  },
]
```

- [ ] **Step 2: 데이터 sanity 테스트 추가** (`templateStore.test.ts`에 append)

```ts
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

  it('모든 기본 템플릿은 builtin=true, 고유 id', () => {
    const ids = BUILTIN_TEMPLATES.map((t) => t.id)
    expect(BUILTIN_TEMPLATES.every((t) => t.builtin)).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
```

- [ ] **Step 3: 통과 확인**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/data/templates.ts src/utils/templateStore.test.ts
git commit -m "feat: built-in templates (낙서, 심층리포트)"
```

---

## Task 7: VariableInput 컴포넌트

**Files:**
- Create: `src/components/template/VariableInput.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
import React from 'react'
import { ButtonGroup } from '../ui/ButtonGroup'
import type { VariableSpec } from '../../types'

interface Props {
  spec: VariableSpec
  value: string
  onChange: (v: string) => void
}

export function VariableInput({ spec, value, onChange }: Props): React.JSX.Element {
  if (spec.kind === 'select') {
    return (
      <ButtonGroup
        label={spec.name}
        options={spec.options ?? []}
        value={value}
        onChange={onChange}
      />
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">{spec.name}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="직접 입력"
        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500"
      />
      {spec.kind === 'combo' && (spec.options?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2">
          {spec.options!.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                value === opt
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-transparent border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:border-gray-500 dark:hover:border-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크**

Run: `npm run build`
Expected: PASS (tsc + vite build 성공).

- [ ] **Step 3: Commit**

```bash
git add src/components/template/VariableInput.tsx
git commit -m "feat: VariableInput renders free/combo/select controls"
```

---

## Task 8: TemplateRunner 컴포넌트

**Files:**
- Create: `src/components/template/TemplateRunner.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
import React, { useState } from 'react'
import { PromptResult, PromptHistory } from '../ui/PromptResult'
import { VariableInput } from './VariableInput'
import { applyTemplate, syncVariableSpecs } from '../../utils/templateStore'
import type { PromptTemplate, VariableSpec } from '../../types'

interface Props {
  template: PromptTemplate
  onEdit?: () => void
  onDelete?: () => void
}

function initialValues(specs: VariableSpec[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const s of specs) {
    out[s.name] = s.kind === 'select' ? (s.options?.[0] ?? '') : ''
  }
  return out
}

export function TemplateRunner({ template, onEdit, onDelete }: Props): React.JSX.Element {
  const specs = syncVariableSpecs(template.body, template.variables ?? [])
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(specs))
  const [prompt, setPrompt] = useState('')

  const canGenerate = specs.length === 0 || specs.every((s) => (values[s.name] ?? '').trim() !== '')
  const historyKey = `history_tpl_${template.id}`

  function setValue(name: string, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }))
  }

  function generate() {
    setPrompt(applyTemplate(template.body, values))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {template.emoji} {template.title}
          </h2>
          {template.description && (
            <p className="text-sm text-gray-500 dark:text-zinc-400">{template.description}</p>
          )}
        </div>
        {!template.builtin && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onEdit}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              수정
            </button>
            <button
              onClick={onDelete}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-zinc-600 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {template.note && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300">
          {template.note}
        </div>
      )}

      {specs.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 space-y-5">
          {specs.map((s) => (
            <VariableInput
              key={s.name}
              spec={s}
              value={values[s.name] ?? ''}
              onChange={(v) => setValue(s.name, v)}
            />
          ))}
        </div>
      )}

      <button
        onClick={generate}
        disabled={!canGenerate}
        className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-base transition-colors"
      >
        ✨ 프롬프트 생성
      </button>

      {prompt && <PromptResult prompt={prompt} historyKey={historyKey} />}
      <PromptHistory historyKey={historyKey} />
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/template/TemplateRunner.tsx
git commit -m "feat: TemplateRunner with per-kind variable inputs"
```

---

## Task 9: TemplateEditor 컴포넌트

**Files:**
- Create: `src/components/template/TemplateEditor.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
import React, { useState } from 'react'
import { ButtonGroup } from '../ui/ButtonGroup'
import { syncVariableSpecs } from '../../utils/templateStore'
import type { PromptTemplate, VariableKind, VariableSpec } from '../../types'

interface Props {
  initial?: PromptTemplate
  onSave: (tpl: PromptTemplate) => void
  onCancel: () => void
}

const KIND_LABELS: { code: VariableKind; label: string }[] = [
  { code: 'free', label: '직접 입력' },
  { code: 'combo', label: '입력·선택' },
  { code: 'select', label: '목록 선택' },
]
const labelOf = (k: VariableKind) => KIND_LABELS.find((x) => x.code === k)!.label
const codeOf = (label: string) => KIND_LABELS.find((x) => x.label === label)!.code

function OptionEditor({
  spec,
  onAdd,
  onRemove,
}: {
  spec: VariableSpec
  onAdd: (raw: string) => void
  onRemove: (opt: string) => void
}): React.JSX.Element {
  const [input, setInput] = useState('')
  function commit() {
    if (input.trim()) {
      onAdd(input)
      setInput('')
    }
  }
  return (
    <div className="space-y-2 pl-1">
      {(spec.options?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2">
          {spec.options!.map((o) => (
            <span
              key={o}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300"
            >
              {o}
              <button
                type="button"
                onClick={() => onRemove(o)}
                className="text-gray-400 hover:text-red-500"
                aria-label={`${o} 삭제`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              commit()
            }
          }}
          placeholder="선택지 입력 후 Enter"
          className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500"
        />
        <button
          type="button"
          onClick={commit}
          className="bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 px-4 py-2 rounded-lg text-sm"
        >
          추가
        </button>
      </div>
    </div>
  )
}

export function TemplateEditor({ initial, onSave, onCancel }: Props): React.JSX.Element {
  const [emoji, setEmoji] = useState(initial?.emoji ?? '✏️')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [specs, setSpecs] = useState<VariableSpec[]>(
    syncVariableSpecs(initial?.body ?? '', initial?.variables ?? []),
  )
  const [error, setError] = useState('')

  function onBodyChange(v: string) {
    setBody(v)
    setSpecs((prev) => syncVariableSpecs(v, prev))
  }

  function setKind(name: string, kind: VariableKind) {
    setSpecs((prev) =>
      prev.map((s) =>
        s.name === name ? { ...s, kind, options: kind === 'free' ? undefined : s.options ?? [] } : s,
      ),
    )
  }

  function addOption(name: string, raw: string) {
    const parts = raw
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    setSpecs((prev) =>
      prev.map((s) => {
        if (s.name !== name) return s
        const merged = [...(s.options ?? [])]
        for (const p of parts) if (!merged.includes(p)) merged.push(p)
        return { ...s, options: merged }
      }),
    )
  }

  function removeOption(name: string, opt: string) {
    setSpecs((prev) =>
      prev.map((s) =>
        s.name === name ? { ...s, options: (s.options ?? []).filter((o) => o !== opt) } : s,
      ),
    )
  }

  function save() {
    if (!title.trim()) return setError('제목을 입력하세요.')
    if (!body.trim()) return setError('본문을 입력하세요.')
    for (const s of specs) {
      if (s.kind !== 'free' && (s.options?.length ?? 0) === 0) {
        return setError(`'${s.name}' 변수의 선택지를 1개 이상 추가하세요.`)
      }
    }
    const cleaned: VariableSpec[] = specs.map((s) =>
      s.kind === 'free' ? { name: s.name, kind: 'free' } : s,
    )
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      emoji: emoji.trim() || '✏️',
      title: title.trim(),
      description: description.trim() || undefined,
      body,
      variables: cleaned,
      builtin: false,
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {initial ? '프롬프트 수정' : '새 프롬프트'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          본문에 {'{중괄호}'}로 변수를 지정하면 자동 감지됩니다.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex gap-2">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={2}
            placeholder="✏️"
            className="w-16 text-center bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-2 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="설명 (선택)"
          className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500"
        />
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          rows={6}
          placeholder="예: {회사}에 보낼 메일을 {톤} 톤으로 작성해줘."
          className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 font-mono leading-relaxed"
        />
      </div>

      {specs.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 space-y-5">
          <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
            감지된 변수 {specs.length}개
          </p>
          {specs.map((s) => (
            <div key={s.name} className="space-y-2">
              <ButtonGroup
                label={s.name}
                options={KIND_LABELS.map((k) => k.label)}
                value={labelOf(s.kind)}
                onChange={(l) => setKind(s.name, codeOf(l))}
              />
              {s.kind !== 'free' && (
                <OptionEditor
                  spec={s}
                  onAdd={(raw) => addOption(s.name, raw)}
                  onRemove={(o) => removeOption(s.name, o)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={save}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold text-base transition-colors"
        >
          저장
        </button>
        <button
          onClick={onCancel}
          className="px-5 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 rounded-xl font-medium transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/template/TemplateEditor.tsx
git commit -m "feat: TemplateEditor with per-variable kind and options"
```

---

## Task 10: TemplateTabs 컴포넌트

**Files:**
- Create: `src/components/template/TemplateTabs.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
import React from 'react'
import type { PromptTemplate } from '../../types'

interface Props {
  templates: PromptTemplate[]
  activeId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
}

export function TemplateTabs({ templates, activeId, onSelect, onAdd }: Props): React.JSX.Element {
  return (
    <div className="overflow-x-auto">
      <div className="flex items-center min-w-max border-b border-gray-200 dark:border-zinc-800">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeId === t.id
                ? 'border-red-500 text-red-600 dark:text-white'
                : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
            }`}
          >
            <span>{t.emoji}</span>
            <span>{t.title}</span>
          </button>
        ))}
        <button
          onClick={onAdd}
          title="새 프롬프트"
          aria-label="새 프롬프트"
          className="px-3 py-2 text-base font-medium text-gray-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-white"
        >
          ＋
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/template/TemplateTabs.tsx
git commit -m "feat: TemplateTabs item bar with add button"
```

---

## Task 11: PromptSection 컨테이너

**Files:**
- Create: `src/components/template/PromptSection.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
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
```

- [ ] **Step 2: 타입 체크**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/template/PromptSection.tsx
git commit -m "feat: PromptSection container wires tabs/runner/editor"
```

---

## Task 12: InvestSection 추출

**Files:**
- Create: `src/components/InvestSection.tsx`

- [ ] **Step 1: 컴포넌트 작성** (현재 `App.tsx`의 TABS + 탭바 로직을 이전)

```tsx
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
```

- [ ] **Step 2: 타입 체크**

Run: `npm run build`
Expected: PASS (App.tsx는 아직 기존 그대로라도 빌드 성공).

- [ ] **Step 3: Commit**

```bash
git add src/components/InvestSection.tsx
git commit -m "refactor: extract InvestSection from App"
```

---

## Task 13: CategoryBar 컴포넌트

**Files:**
- Create: `src/components/CategoryBar.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
import React from 'react'

export type Category = 'invest' | 'prompt'

interface Props {
  value: Category
  onChange: (c: Category) => void
}

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'invest', label: '투자', emoji: '💹' },
  { id: 'prompt', label: '프롬프트', emoji: '✏️' },
]

export function CategoryBar({ value, onChange }: Props): React.JSX.Element {
  return (
    <div className="flex gap-2">
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            value === c.id
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-transparent border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:border-gray-500 dark:hover:border-zinc-400'
          }`}
        >
          <span>{c.emoji}</span>
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: 타입 체크**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/CategoryBar.tsx
git commit -m "feat: CategoryBar (투자/프롬프트)"
```

---

## Task 14: App 통합 + 리브랜딩(헤더/푸터)

**Files:**
- Modify: `src/App.tsx` (전체 교체)

- [ ] **Step 1: `src/App.tsx` 전체를 아래로 교체**

```tsx
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
```

- [ ] **Step 2: 빌드 + 테스트**

Run: `npm run build && npm run test`
Expected: 둘 다 PASS.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: PromptDeck category layout and rebranded header/footer"
```

---

## Task 15: 메타데이터 리브랜딩 (index.html, manifest)

**Files:**
- Modify: `index.html`
- Modify: `public/manifest.json`

- [ ] **Step 1: `index.html` 텍스트 교체**

세 군데를 수정:
- `<meta name="description" content="AI 투자 프롬프트 생성기" />` → `content="AI 프롬프트 생성기"`
- `<meta name="apple-mobile-web-app-title" content="InvestPrompt" />` → `content="PromptDeck"`
- `<title>InvestPrompt | AI 투자 프롬프트</title>` → `<title>PromptDeck | AI 프롬프트</title>`

- [ ] **Step 2: `public/manifest.json` 확인 후 수정**

Run: `Read public/manifest.json`로 현재 키 확인. 그런 다음 `name`, `short_name`, `description`을 아래 값으로 교체(다른 키-아이콘/색상/start_url 등-는 그대로 유지):
- `"name": "PromptDeck"`
- `"short_name": "PromptDeck"`
- `"description": "AI 프롬프트 생성기"`

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add index.html public/manifest.json
git commit -m "chore: rebrand metadata to PromptDeck"
```

---

## Task 16: 최종 검증 (dev 서버 수동 점검)

**Files:** (없음 — 검증만)

- [ ] **Step 1: 전체 빌드 + 테스트**

Run: `npm run test && npm run build`
Expected: 모두 PASS.

- [ ] **Step 2: dev 서버 실행 후 수동 점검**

Run: `npm run dev` (별도 터미널/백그라운드). 브라우저에서 다음을 확인:
- [ ] 헤더에 "PromptDeck / AI 프롬프트 생성기", 카테고리 칩 `💹 투자` `✏️ 프롬프트` 노출.
- [ ] `투자` 카테고리: 기존 10개 탭 정상 동작, 프롬프트 생성/복사/히스토리 정상. 푸터에 투자 면책문구.
- [ ] `프롬프트` 카테고리: 낙서(변수 없음 — note 배너 + 생성), 심층리포트({주제} 입력 → 생성) 동작. 푸터에 일반 문구.
- [ ] `＋` → 편집기. 본문에 `{회사}에 메일을 {톤} 톤으로. {제안}` 입력 시 변수 3개 자동 감지.
- [ ] `회사`=입력·선택(선택지 SK이노베이션/현대차/LG전자), `톤`=목록 선택(담백한/공식적인/정중한/친근한), `제안`=직접 입력으로 지정 후 저장.
- [ ] 저장된 템플릿이 탭에 추가되고, 실행 화면에서 입력·선택은 텍스트+칩, 목록 선택은 버튼, 직접 입력은 텍스트로 렌더(종류 라벨은 미표기). 생성 결과 정상.
- [ ] 저장된 템플릿 수정/삭제 동작. 새로고침 후에도 사용자 템플릿 유지(localStorage).
- [ ] 라이트/다크/시스템 테마 토글 정상.

- [ ] **Step 3: 최종 정리 커밋(필요 시)**

수동 점검 중 수정이 있었다면 커밋. 없으면 생략.

---

## 검증 메모

- 순수 로직(`templateStore`)은 Vitest로 커버. UI 컴포넌트는 `tsc`(strict, `noUnusedLocals/Parameters`) 통과 + dev 서버 수동 점검으로 검증한다(RTL 등 컴포넌트 테스트 셋업은 범위 밖).
- 모든 기존 localStorage 키(`theme`, `history_<tabid>`)는 보존된다.
