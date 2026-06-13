# CLAUDE.md

PromptDeck — 한국어 모바일 우선 **AI 프롬프트 생성기**. 사용자가 고른 옵션을 한국어 프롬프트 문자열로 조립해 ChatGPT/Claude 등에 붙여넣게 해준다. 백엔드·API 없이 전부 클라이언트에서 동작하는 정적 SPA이며, 상태는 `localStorage`에만 저장한다. (구 InvestPrompt에서 리브랜딩 — 투자는 이제 여러 카테고리 중 하나.)

## 명령어

```bash
npm run dev        # Vite 개발 서버 (localhost:5173)
npm run build      # tsc(strict 타입체크) && vite build
npm run preview    # 빌드 결과 미리보기
npm run test       # vitest run (1회 실행)
npm run test:watch # vitest watch
```

## 기술 스택

React 19 + TypeScript(strict) + Vite 6 + Tailwind CSS 3. 테스트는 Vitest. 의존성은 `react`/`react-dom`뿐 — 라우터·상태관리 라이브러리 없음. PWA는 `manifest.json` + 메타 태그만(서비스워커 없음).

## 구조

```
src/
├─ App.tsx                  헤더(테마 토글) + CategoryBar + 푸터, 카테고리별 섹션 렌더
├─ types.ts                 공용 타입: VariableKind, VariableSpec, PromptTemplate
├─ components/
│  ├─ CategoryBar.tsx       💹 투자 / ✏️ 프롬프트 카테고리 칩 (+ Category 타입 export)
│  ├─ InvestSection.tsx     투자 10개 탭바 + 활성 탭 렌더 (기존 투자 기능)
│  ├─ tabs/                 투자 탭 10종 (종목찾기…용어). promptBuilder 사용
│  ├─ template/
│  │  ├─ PromptSection.tsx  프롬프트 카테고리 컨테이너: 탭 목록 + run/create/edit 뷰 전환
│  │  ├─ TemplateTabs.tsx   템플릿 항목 탭바 + ＋(새 프롬프트)
│  │  ├─ TemplateRunner.tsx 변수 입력 → 생성, PromptResult 재사용, 사용자 템플릿이면 수정/삭제
│  │  ├─ TemplateEditor.tsx 새/편집 폼: 제목·이모지·본문 + 변수별 종류/선택지
│  │  └─ VariableInput.tsx  종류별 단일 변수 컨트롤 (free=텍스트, combo=텍스트+칩, select=칩)
│  └─ ui/                   ButtonGroup, SelectDropdown, StockPicker, PromptResult(복사·AI링크·히스토리)
├─ data/
│  ├─ templates.ts          BUILTIN_TEMPLATES (낙서, 심층리포트)
│  └─ stocks.ts / etfs.ts / terms.ts   투자 탭 정적 데이터
└─ utils/
   ├─ promptBuilder.ts      투자 10종 build*Prompt() 함수
   └─ templateStore.ts      변수 파싱·치환·스펙 동기화 + 사용자 템플릿 localStorage CRUD
```

## 두 갈래 아키텍처

앱은 카테고리 2개로 나뉜다:

- **투자** (`InvestSection`): 기존 10개 탭. 각 탭은 전용 UI(버튼그룹·드롭다운·종목선택)로 입력을 받아 `promptBuilder.ts`의 함수로 프롬프트를 만든다. **데이터 기반이 아니라 손으로 짠 컴포넌트.**
- **프롬프트** (`PromptSection`): 데이터 기반 **템플릿 엔진**. 기본 제공(낙서·심층리포트) + 사용자 추가 템플릿이 한 목록에 섞이고, 탭바 끝 `＋`로 새로 만든다.

새 기능을 추가할 때 위치 판단:
- 투자 분석류로 전용 입력 UI가 필요하면 → `tabs/`에 탭 추가 + `promptBuilder`에 빌더 + `InvestSection`의 `TABS`에 등록.
- 그 외 일반 프롬프트면 → `data/templates.ts`의 `BUILTIN_TEMPLATES`에 항목 추가(코드 수정 최소).

## 템플릿 엔진 (`templateStore.ts`)

- `parseVariables(body)` — 본문의 `{변수}` 토큰을 trim·중복제거·등장순서로 추출.
- `applyTemplate(body, values)` — `{변수}`를 값으로 치환(값 없으면 토큰 유지).
- `syncVariableSpecs(body, existing)` — 본문 변경 시 변수 스펙을 병합(기존 종류·선택지 보존, 새 변수는 `free`, 사라진 변수 제거).
- CRUD: `loadUserTemplates / saveUserTemplate / deleteUserTemplate`. 둘째 인자로 `Storage`를 주입할 수 있어(기본 `localStorage`) 테스트에서 가짜 스토리지를 넣는다.

**변수 종류(VariableKind):** `free`(직접 입력) / `combo`(입력·선택) / `select`(목록 선택). 내부 코드값은 고정이고 UI 라벨만 한국어. 실행 화면에선 종류 라벨을 적지 않고 컨트롤 형태로만 구분한다.

## localStorage 키

| 키 | 용도 |
|---|---|
| `theme` | 테마 모드 (system/light/dark) |
| `history_<tabid>` | 투자 탭별 프롬프트 히스토리 |
| `history_tpl_<templateId>` | 템플릿 프롬프트 히스토리 |
| `promptdeck_templates` | 사용자 템플릿 배열 |

## 관례

- **모든 컴포넌트 반환 타입은 `React.JSX.Element`** — tsconfig `strict` + `noUnusedLocals/noUnusedParameters` 때문에 `import React`가 미사용으로 잡히지 않도록 일부러 이 타입을 쓴다(빌드가 tsc로 타입체크됨).
- 강조색 **red-500**, 다크모드는 `dark:` 변형 + `zinc` 팔레트, 모바일 우선 `max-w-2xl`.
- 영속 데이터는 전부 `localStorage`(서버 없음).
- 푸터 면책문구는 카테고리별로 분기(투자 카테고리만 투자 면책).

## 테스트

순수 로직(`templateStore`)만 Vitest로 단위 테스트(`templateStore.test.ts`). UI 컴포넌트는 RTL 셋업 없이 `npm run build`(strict 타입체크) + dev 서버 수동/브라우저 확인으로 검증한다. Vitest 환경은 `node`(jsdom 불필요 — store는 주입형 스토리지 사용).

## 설계 문서

- 스펙: `docs/superpowers/specs/2026-06-12-promptdeck-redesign-design.md`
- 구현 계획: `docs/superpowers/plans/2026-06-12-promptdeck-redesign.md`
