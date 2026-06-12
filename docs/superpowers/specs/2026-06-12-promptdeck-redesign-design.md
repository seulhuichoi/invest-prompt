# PromptDeck — 설계 문서

- 날짜: 2026-06-12
- 상태: 승인 대기 (사용자 리뷰 전)
- 기존 앱: InvestPrompt (AI 투자 프롬프트 생성기) → **PromptDeck** (범용 AI 프롬프트 생성기)로 리브랜딩

## 1. 배경 & 목표

기존 InvestPrompt는 10개의 투자 분석 프롬프트 빌더를 가진 정적 React SPA다. 다음 3가지를 추가하면서 앱을 투자 전용에서 **범용 프롬프트 도구**로 확장한다.

1. 사용자가 앱 안에서 자신만의 프롬프트(변수 템플릿)를 추가하는 기능
2. 기본 제공 프롬프트 "낙서"
3. 기본 제공 프롬프트 "심층리포트"

핵심 결정(브레인스토밍에서 확정):

- "프롬프트 추가" = **변수 템플릿 빌더**. 사용자가 제목/이모지/본문을 입력하고 본문에 `{변수}` 자리표시자를 넣어 자기 프롬프트를 만든다.
- 네비게이션 = **카테고리 2단**. 카테고리는 `💹 투자`, `✏️ 프롬프트` 두 개.
- 앱 이름 = **PromptDeck**.
- 범용(기본 제공)과 내 프롬프트는 **하나의 `✏️ 프롬프트` 카테고리로 통합**한다. 새 프롬프트 추가는 항목 탭바 끝의 **`＋`** 아이콘으로 표시한다.
- 테스트로 **Vitest**를 도입한다.

## 2. 정체성 / 리브랜딩

- 이름: `PromptDeck`, 부제: `AI 프롬프트 생성기`.
- 테마색(`#ef4444` red), 다크모드, PWA 동작은 유지.
- 아이콘 이미지(`icon-192/512`, `apple-touch-icon`)는 **이번 범위에서 재생성하지 않는다**(YAGNI). 텍스트/메타데이터만 변경.

## 3. 정보구조 & 네비게이션

```
헤더: PromptDeck  ·  부제 · 테마 토글(시스템/라이트/다크) — 기존 토글 유지
─────────────────────────────────────────
카테고리 칩:   [ 💹 투자 ]   [ ✏️ 프롬프트 ]
─────────────────────────────────────────
항목 탭바(선택된 카테고리에 종속):
  · 투자   → 종목찾기 · 심층분석 · 재무 · … · 용어   (기존 10개, 가로 스크롤)
  · 프롬프트 → 🖍 낙서 · 📑 심층리포트 · (내 템플릿들…) · ＋
─────────────────────────────────────────
본문: 선택된 항목 렌더
  · 투자 항목   → 기존 탭 컴포넌트 그대로
  · 프롬프트 항목 → TemplateRunner (변수 입력 → 생성)
  · ＋          → TemplateEditor (새 템플릿 작성)
─────────────────────────────────────────
푸터: 면책/안내 문구 (카테고리에 따라 분기, §9 참조)
```

- `투자` 카테고리는 기존 코드를 **거의 그대로 유지**한다(회귀 위험 최소화). 기존 `TABS` 배열이 투자 카테고리의 항목 목록이 된다.
- `프롬프트` 카테고리의 항목 목록 = `[...기본 제공 템플릿, ...사용자 템플릿]` + 마지막에 `＋`.
- 기본 제공 템플릿(낙서/심층리포트)은 수정·삭제 불가. 사용자 템플릿은 수정·삭제 가능.

## 4. 데이터 모델

```ts
// src/data/templates.ts 및 src/utils/templateStore.ts 공용 타입

export type VariableKind = 'free' | 'combo' | 'select'
// 내부 코드값은 free/combo/select 로 고정. UI 표시 라벨은 아래와 같다.
// free   = 직접 입력 : 사용자가 직접 입력
// combo  = 입력·선택 : 직접 입력하거나 기존 선택지 중에서 고름
// select = 목록 선택 : 기존 선택지 중에서만 고름

export interface VariableSpec {
  name: string          // 본문의 {name} 토큰과 일치
  kind: VariableKind    // 입력 방식
  options?: string[]    // combo/select 일 때의 선택지 목록 (≥1)
}

export interface PromptTemplate {
  id: string            // 안정적 식별자. 히스토리 키로도 사용
  emoji: string         // 탭/목록 아이콘
  title: string         // 표시명
  description?: string   // 실행 화면 상단 안내 (선택)
  body: string          // 프롬프트 본문. {변수} 자리표시자 포함 가능
  note?: string         // 사용 안내 배너 (예: 낙서의 "이미지 첨부" 안내)
  variables?: VariableSpec[]  // 자동 감지된 변수별 종류/선택지. 생략 시 전부 free 취급
  builtin: boolean      // true=기본 제공(수정/삭제 불가), false=사용자 생성
}
```

- 변수는 항상 **본문에서 자동 감지**되고(`parseVariables`), `variables`는 그 위에 얹는 **메타데이터**다. 렌더링할 입력 목록의 기준은 언제나 본문 토큰이며, `variables`는 각 변수의 종류·선택지만 제공한다.
- 본문에 있으나 `variables`에 없는 변수 → `kind: 'free'`로 취급. `variables`에 있으나 본문에 없는 변수 → 무시. (편집기에서 저장 시 `syncVariableSpecs`로 동기화 — §5)
- 기본 제공 템플릿은 코드(`data/templates.ts`)에 상수로 둔다(`builtin: true`).
- 사용자 템플릿은 localStorage(`promptdeck_templates`)에 배열로 저장한다(`builtin: false`).

## 5. 템플릿 엔진 (파싱 / 치환)

`src/utils/templateStore.ts`에 순수 함수로 구현한다(테스트 용이).

- **변수 추출** `parseVariables(body: string): string[]`
  - 정규식 `/\{([^{}\n]+)\}/g`로 토큰을 찾는다.
  - 캡처 그룹을 `trim()` 한다.
  - **고유**하게, **첫 등장 순서**로 반환한다(중복 제거).
  - 예) `"{회사}에 {톤} 톤으로. 제안:{제안}, 회사 재확인 {회사}"` → `["회사","톤","제안"]`
- **치환** `applyTemplate(body: string, values: Record<string,string>): string`
  - 본문의 모든 `{변수}` 등장 위치를 해당 값으로 치환한다.
  - `values`에 없는 변수는 원문 `{변수}` 그대로 둔다(방어적).
- **변수 스펙 동기화** `syncVariableSpecs(body: string, existing: VariableSpec[]): VariableSpec[]`
  - `parseVariables(body)`로 현재 변수명을 구한 뒤, 본문 등장 순서대로 스펙 배열을 재구성한다.
  - 이미 `existing`에 있는 이름은 종류·선택지를 **보존**한다.
  - 새 이름은 기본값 `{ kind: 'free' }`로 추가한다.
  - 본문에서 사라진 이름은 **제거**한다.
  - 편집기에서 본문이 바뀔 때마다, 그리고 저장 직전에 호출한다.

### 변수 입력 렌더링 규칙 (종류별)

TemplateRunner는 `parseVariables(body)` 순서대로 각 변수의 입력 컨트롤을 그린다. **변수명만 라벨로 표시하고 종류(직접 입력/입력·선택/목록 선택)는 화면에 적지 않는다** — 종류는 컨트롤 형태로만 드러난다. 해당 변수의 `VariableSpec`(없으면 `free`)에 따라:

| 종류 | 컨트롤 | 비고 |
|---|---|---|
| `free` 직접 입력 | 텍스트 입력 | 자유 입력 |
| `combo` 입력·선택 | 텍스트 입력 + 선택지 버튼(클릭 시 입력칸 채움) | 직접 입력·선택 모두 가능 |
| `select` 목록 선택 | 선택지 버튼(칩) — `ButtonGroup` 스타일, 선택 시 강조 | 선택지 중에서만. 기본값=첫 선택지 |

- 두 선택형 모두 **드롭다운이 아니라 버튼(칩)** 으로 그린다. `combo`는 위에 텍스트 입력칸이 함께 있고, `select`는 버튼만 있다.
- **생성 버튼 활성 조건**
  - 변수 0개 템플릿: 항상 활성.
  - 변수 ≥1개: 모든 변수 값이 `trim()` 후 비어있지 않을 때만 활성. (`select`는 기본값이 첫 선택지이므로 항상 채워진 상태)

localStorage CRUD(같은 파일):

- `loadUserTemplates(storage = window.localStorage): PromptTemplate[]`
- `saveUserTemplate(tpl, storage?)` — id 없으면 새로 생성 후 추가, 있으면 갱신
- `deleteUserTemplate(id, storage?)`
- id 생성: `crypto.randomUUID()` 사용(접두사 `tpl_`는 선택). 저장/조회 함수는 `storage` 인자를 받아 기본값 `window.localStorage`를 쓰되, 테스트에서는 Map 기반 가짜 Storage를 주입한다(→ jsdom 의존 불필요).

## 6. 컴포넌트 구조 (신규 / 변경)

```
src/
├─ App.tsx                         [변경] 카테고리+항목 상태, 헤더/푸터 리브랜딩
├─ data/
│  └─ templates.ts                 [신규] BUILTIN_TEMPLATES (낙서, 심층리포트)
├─ components/
│  ├─ CategoryBar.tsx              [신규] 투자/프롬프트 카테고리 칩 전환
│  ├─ tabs/ (기존 10개)            [유지]
│  └─ template/
│     ├─ TemplateTabs.tsx          [신규] 프롬프트 항목 탭바 + ＋ 버튼
│     ├─ TemplateRunner.tsx        [신규] 종류별 변수 입력→생성, PromptResult 재사용, (사용자 템플릿) 수정/삭제
│     ├─ TemplateEditor.tsx        [신규] 새/편집 폼: 이모지·제목·본문·설명 + 변수별 종류/선택지 지정
│     └─ VariableInput.tsx         [신규] 종류(free/combo/select)에 맞는 단일 변수 입력 컨트롤
├─ utils/
│  ├─ promptBuilder.ts             [유지] 투자 10종 빌더
│  └─ templateStore.ts             [신규] parseVariables / applyTemplate / CRUD
└─ components/ui/
   ├─ PromptResult.tsx             [유지·재사용] 복사 + AI도구 링크 + 히스토리
   └─ (ButtonGroup/SelectDropdown/StockPicker 유지)
```

App 상태(개략):

```ts
type Category = 'invest' | 'prompt'
const [category, setCategory] = useState<Category>('invest')
const [investTab, setInvestTab] = useState<TabId>('jongmok')   // 기존 activeTab 역할
const [promptView, setPromptView] =
  useState<{ kind: 'run'; id: string } | { kind: 'create' } | { kind: 'edit'; id: string }>(...)
const [userTemplates, setUserTemplates] = useState<PromptTemplate[]>(() => loadUserTemplates())
```

- 카테고리 전환 시 각 카테고리는 마지막(또는 기본) 항목을 보여준다. 프롬프트 카테고리 기본 항목 = 첫 번째 기본 제공 템플릿(낙서).
- `＋` 클릭 → `promptView = { kind: 'create' }`.
- 저장 성공 → `userTemplates` 갱신 + 해당 템플릿 실행 화면(`run`)으로 이동.
- 삭제 성공 → 첫 항목으로 이동.

### 편집기의 변수 설정 UI (TemplateEditor)

본문 textarea 아래에 **자동 감지된 변수 목록**이 본문 등장 순서대로 나열되고, 변수마다 한 행을 차지한다:

- 변수명(읽기 전용, 본문에서 추출).
- 종류 선택: `직접 입력 / 입력·선택 / 목록 선택` (ButtonGroup 재사용).
- `입력·선택`·`목록 선택`이면 그 아래 **선택지 편집기**가 펼쳐진다 — 칩 입력(텍스트 + Enter/쉼표로 추가, 칩의 × 로 삭제).
- 본문이 바뀌면 `syncVariableSpecs`로 행 목록을 갱신(기존 설정 보존).

**저장 유효성**: 제목·본문 비어있지 않음. `입력·선택`·`목록 선택` 변수는 선택지 **≥1개** 필요(없으면 저장 차단 + 안내). 위반 시 인라인 메시지.

## 7. 기본 제공 프롬프트 (전문)

### 7.1 🖍 낙서 (`id: "builtin-nakseo"`, 변수 없음)

`note`: "멀티모달 AI(ChatGPT, Gemini 등)에 이미지를 먼저 첨부한 뒤 이 프롬프트를 붙여넣으세요."

`body`:

```
Redraw the attached image in the most clumsy, scribbly, and utterly pathetic way possible. Use a white background, and make it look like it was drawn in MS Paint with a mouse. It should be vaguely similar but also not really, kind of matching but also off in a confusing, awkward way, with that low-quality pixel-by-pixel feel that really emphasizes how ridiculously bad it is. Actually, you know what, whatever, just draw it however you want.
```

### 7.2 📑 심층리포트 (`id: "builtin-simchung"`, 변수 `{주제}`)

`description`: "전문 리서치 애널리스트 관점의 심층 리포트를 생성합니다."

`body`(요약 표기 — 실제 구현은 사용자가 제시한 전문 그대로 사용):

```
너는 해당 분야에 대한 전문 지식을 갖춘 리서치 애널리스트이자 보고서 작성자다.

다음 주제에 대해 심층 리포트를 작성하라.

주제: {주제}

리포트는 단순한 개요나 요약이 아니라 … (이하 사용자가 제공한 10개 기준 + 작성 방식 + 출력 형식 전문 그대로)
```

> 구현 시 §원문(사용자 메시지)의 심층리포트 프롬프트 전체를 그대로 `body`에 넣는다. `{주제}` 토큰이 변수로 자동 감지된다. 두 기본 제공 템플릿 모두 `variables`를 생략하므로 `{주제}`는 `free`(완전자율)로 동작한다.

## 8. 상태 & 영속화 (localStorage)

| 키 | 용도 | 변경 |
|---|---|---|
| `theme` | 테마 모드 | 유지 |
| `history_<tabid>` | 투자 탭 히스토리 | 유지 |
| `history_tpl_<templateId>` | 템플릿 프롬프트 히스토리 | 신규 (PromptResult `historyKey`로 전달) |
| `promptdeck_templates` | 사용자 템플릿 배열 | 신규 |

기존 키와 충돌 없음. 기존 사용자 데이터(테마/투자 히스토리)는 보존된다.

## 9. 리브랜딩 변경 상세

- `index.html`: `<title>`, `description` meta, `apple-mobile-web-app-title` → PromptDeck 관련 문구.
- `public/manifest.json`: `name`, `short_name`, `description` 갱신. 아이콘/색상 유지.
- `App.tsx` 헤더: h1 `PromptDeck`, 부제 `AI 프롬프트 생성기`.
- 푸터 면책: **투자 카테고리에서만** 기존 투자 면책문구를 보여주고, 그 외에는 일반 안내("본 앱은 학습 및 정보 제공 목적으로 제작되었습니다.")를 보여준다.

## 10. 테스트 & 검증

- **Vitest 도입**: `devDependencies`에 `vitest` 추가, `package.json` 스크립트 `"test": "vitest run"` (watch는 `vitest`).
- `vite.config.ts`에 `test` 설정 추가(별도 jsdom 불필요 — 순수 함수 + 주입형 Storage 사용).
- 단위 테스트 대상(`src/utils/templateStore.test.ts`):
  - `parseVariables`: 변수 없음 / 1개 / 중복 / 등장순서 / 공백 트림 / 인접 토큰.
  - `applyTemplate`: 정상 치환 / 다중 등장 치환 / 누락 변수 원문 유지.
  - `syncVariableSpecs`: 새 변수 `free` 기본값 / 기존 종류·선택지 보존 / 삭제된 변수 제거 / 본문 등장 순서 유지.
  - CRUD: 가짜 Storage 주입 후 add → load → update → delete 라운드트립.
- **UI 검증**: `npm run dev` 후 브라우저(또는 Visual Companion)에서 카테고리 전환, 낙서/심층리포트 생성, 새 템플릿 작성·수정·삭제, 복사·히스토리 동작 확인.

## 11. 범위 밖 (YAGNI)

- 백엔드·계정·동기화 없음 (전부 클라이언트 + localStorage).
- 템플릿 import/export, 공유 링크 없음.
- 변수 종류는 **직접 입력 / 입력·선택 / 목록 선택** 3종까지. 숫자·날짜·다중선택 등 추가 입력 타입은 범위 밖.
- 아이콘 이미지 재생성 없음.
- 투자 10개 탭의 내부 로직 변경 없음(카테고리로 묶기만 함).

## 12. 구현 순서 (개략 — 구체화는 plan 단계)

1. `templateStore.ts` 순수 함수(`parseVariables`/`applyTemplate`/`syncVariableSpecs`/CRUD) + 테스트 (TDD).
2. Vitest 설정(package.json, vite.config.ts).
3. `data/templates.ts` 기본 제공 템플릿(낙서/심층리포트).
4. `VariableInput` → `TemplateRunner` → `TemplateEditor` → `TemplateTabs`.
5. `CategoryBar` + `App.tsx` 통합(카테고리/항목 상태, 푸터 분기).
6. 리브랜딩(index.html, manifest, 헤더).
7. dev 서버로 전체 흐름 검증.
