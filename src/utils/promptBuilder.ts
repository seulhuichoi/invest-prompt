import { autoVariableValues } from './templateStore'

// 모든 투자 탭 프롬프트 앞에 붙는 머리말. 생성 시점의 KST 날짜가 채워진다.
function todayPrefix(): string {
  return `오늘은 ${autoVariableValues().날짜}이다.\n\n`
}

export function buildJongmokPrompt(
  market: string,
  sector: string,
  style: string,
  period: string,
  returnTarget: string,
  count: string,
): string {
  const marketLabel = market === 'KR 한국주식' ? '한국(KOSPI/KOSDAQ)' : '미국(NYSE/NASDAQ)'
  return `${todayPrefix()}${marketLabel} ${sector} 섹터에서 ${style} 전략으로 투자할 종목을 찾아주세요.

[투자 조건]
- 시장: ${marketLabel}
- 섹터: ${sector}
- 투자 스타일: ${style}
- 투자 기간: ${period}
- 목표 수익률: ${returnTarget}
- 추천 종목 수: ${count}

[분석 요청 사항]
1. 위 조건에 부합하는 종목 ${count} 추천
2. 각 종목별 추천 이유 (핵심 지표 포함: PER, PBR, ROE, 매출성장률 등)
3. 현재 주가 수준 평가 (저평가/적정/고평가)
4. 투자 기간 내 목표 수익률 달성 가능성 분석
5. 주요 리스크 요인

실제 최신 데이터를 바탕으로 구체적인 수치와 함께 분석해주세요.`
}

export function buildSimdungPrompt(stock: string): string {
  return `${todayPrefix()}${stock}에 대한 종합적인 심층 분석을 해주세요.

[분석 항목]
1. 기업 개요 및 비즈니스 모델
   - 핵심 사업 영역과 수익 구조
   - 주요 제품/서비스 및 경쟁 포지션

2. 재무 건전성 분석
   - 최근 3~5년 매출, 영업이익, 순이익 추이
   - 주요 재무 지표 (ROE, ROA, 부채비율, 유동비율)
   - 현금흐름 분석 (FCF 중심)

3. 성장성 분석
   - 단기(1년) / 중기(3년) 성장 전망
   - 핵심 성장 동력 및 신사업 기회

4. 경쟁우위 및 해자(Moat)
   - 경쟁사 대비 차별화 요소
   - 시장 점유율 및 가격 결정력

5. 리스크 요인
   - 산업 리스크 / 규제 리스크 / 경쟁 리스크

6. 밸류에이션 및 적정 주가
   - PER / PBR / EV/EBITDA 기반 적정가 산출
   - 현재 주가 대비 투자 매력도

7. 투자 의견 및 목표가 제시

최신 공시 자료와 실적 데이터를 바탕으로 분석해주세요.`
}

export function buildJamuPrompt(stock: string, analysisType: string, focus: string): string {
  const focusMap: Record<string, string> = {
    ROE: '듀퐁 분석(ROE 분해: 순이익률 × 자산회전율 × 재무레버리지)을 중심으로',
    안정성: '유동비율, 부채비율, 이자보상배율 등 재무 안정성 지표를 중심으로',
    성장성: '매출성장률, 이익성장률, CAGR 등 성장성 지표를 중심으로',
  }

  const typeMap: Record<string, string> = {
    종합분석: '균형 있는 종합적 재무 분석',
    비교분석: '동종 업계 경쟁사 대비 상대 비교 분석',
    심층분석: '세부 항목별 심층 재무 분석',
  }

  return `${todayPrefix()}${stock}의 재무제표를 ${typeMap[analysisType] ?? analysisType}으로 분석해주세요.
${focusMap[focus] ? `\n특히 ${focusMap[focus]} 진행해주세요.` : ''}

[분석 항목]
1. 손익계산서 분석 (최근 4분기 / 3개년)
   - 매출액, 영업이익, 순이익 추이
   - 영업이익률, 순이익률 변화

2. 재무상태표 분석
   - 자산 구조 (유동/비유동 비율)
   - 부채 구조 및 자본 건전성

3. 현금흐름표 분석
   - 영업/투자/재무 현금흐름
   - FCF(잉여현금흐름) 추이

4. 주요 재무 지표 (최근 4분기 기준)
   ROE / ROA / EBITDA / 부채비율 / 유동비율 / PER / PBR

5. ${focus} 중심 세부 분석

6. 재무 건전성 종합 평가 및 개선/악화 신호

실제 공시 데이터를 기준으로 수치와 함께 분석해주세요.`
}

export function buildGachiPrompt(stock: string, method: string, margin: string): string {
  const methodDesc: Record<string, string> = {
    상대가치: 'PER/PBR 기반 업종 동종 비교를 통한 상대 가치 평가',
    절대가치: 'DCF(현금흐름 할인법) 기반 내재 가치 산출',
    종합: '상대가치(PER/PBR)와 절대가치(DCF) 두 방법론 모두 적용 후 종합',
  }

  return `${todayPrefix()}${stock}의 적정 주가를 산출해주세요.

[평가 방법]: ${methodDesc[method] ?? method}
[안전마진]: ${margin} (내재가치 대비 ${margin} 할인된 가격을 매수 기준으로 설정)

[분석 항목]
1. ${method === '절대가치' || method === '종합' ? 'DCF 분석\n   - 향후 5년 FCF 추정\n   - 할인율(WACC) 산정\n   - 영구성장률 가정\n   - 내재가치 계산\n\n' : ''}${method === '상대가치' || method === '종합' ? '상대가치 분석\n   - 업종 평균 PER 대비 현재 PER\n   - 업종 평균 PBR 대비 현재 PBR\n   - EV/EBITDA 비교\n   - 적정 주가 범위 도출\n\n' : ''}2. 현재 주가 vs 적정가 비교
   - 현재 주가
   - 산출된 적정가
   - 괴리율 (고평가/저평가 여부)

3. 안전마진 ${margin} 적용 매수 기준가

4. 주가 상승/하락 시나리오 (Bull / Base / Bear)

5. 투자 의견 (매수 / 보유 / 매도)

최신 재무 데이터를 기반으로 분석해주세요.`
}

export function buildChartPrompt(
  stock: string,
  timeframe: string,
  indicator: string,
  pattern: string,
): string {
  return `${todayPrefix()}${stock}의 기술적 분석을 진행해주세요.

[분석 조건]
- 타임프레임: ${timeframe}
- 주요 지표: ${indicator}
- 패턴 분석: ${pattern}

[분석 항목]
1. 현재 추세 분석 (${timeframe} 기준)
   - 상승/하락/횡보 추세 판단
   - 추세의 강도 및 지속 가능성

2. ${indicator} 지표 분석
   - 현재 지표 수치 및 해석
   - 매수/매도 신호 여부

3. ${pattern} 분석
   - 주요 ${pattern} 패턴 식별
   - 패턴에 따른 목표가 및 손절 기준

4. 지지선 / 저항선
   - 주요 지지 구간 (1차, 2차)
   - 주요 저항 구간 (1차, 2차)

5. 거래량 분석
   - 최근 거래량 동향
   - 가격-거래량 관계 분석

6. 단기 / 중기 전망 및 매매 전략
   - 진입 시점 (매수 기준가)
   - 목표가 (1차, 2차)
   - 손절 기준가

차트 데이터를 기반으로 객관적인 기술적 분석을 해주세요.`
}

export function buildJungseongPrompt(stock: string, focus: string): string {
  const focusDesc: Record<string, string> = {
    경쟁우위: '경제적 해자(Economic Moat)와 지속 가능한 경쟁우위 분석',
    경영진: '경영진 역량, 자본 배분 전략, 주주 친화적 정책 평가',
    ESG: 'ESG(환경·사회·지배구조) 요소 및 지속가능성 평가',
  }

  return `${todayPrefix()}${stock}의 정성적 분석을 해주세요.

[중점 분석 영역]: ${focusDesc[focus] ?? focus}

[분석 항목]
1. 경쟁우위 (Economic Moat) 분석
   - 브랜드 파워 / 네트워크 효과 / 비용 우위 / 전환 비용 / 규모의 경제
   - 해자의 지속 가능성 평가 (강력/보통/약함)

2. 경영진 및 지배구조
   - CEO/경영진 이력 및 트랙 레코드
   - 자본 배분 전략 (R&D / M&A / 배당 / 자사주 매입)
   - 주주 친화도 및 내부자 지분 현황

3. ESG 평가
   - 환경(E): 탄소 배출, 친환경 전략
   - 사회(S): 임직원 처우, 사회적 책임
   - 지배구조(G): 이사회 독립성, 감사 체계

4. 산업 포지셔닝
   - 시장 내 위치 (리더 / 도전자 / 틈새)
   - 5 Forces 분석 (포터의 경쟁 모델)

5. 비재무적 리스크
   - 규제 리스크 / 평판 리스크 / 지정학적 리스크

6. 종합 평가: ${focus} 관점에서의 투자 매력도

최신 뉴스, 공시, 애널리스트 리포트를 참조해 분석해주세요.`
}

export function buildWihomPrompt(stock: string, scenarios: string, stopLoss: string): string {
  return `${todayPrefix()}${stock}의 투자 리스크를 분석하고 리스크 관리 전략을 제시해주세요.

[시나리오 수]: ${scenarios}
[손절 기준]: ${stopLoss}

[분석 항목]
1. 주요 리스크 요인 식별
   - 거시경제 리스크 (금리, 환율, 경기 사이클)
   - 산업 리스크 (규제, 경쟁 심화, 기술 변화)
   - 기업 리스크 (실적 부진, 경영진 리스크, 부채)

2. ${scenarios} 시나리오 분석
   - Bull Case (최선): 조건 및 예상 주가
   - Base Case (기본): 조건 및 예상 주가
   - Bear Case (최악): 조건 및 예상 주가
   ${scenarios === '5가지' || scenarios === '7가지' ? '- 추가 시나리오 2~4가지\n' : ''}
3. 리스크 관리 전략
   - 손절 기준: ${stopLoss} 하락 시 매도
   - 분할 매도 전략 (단계별 비중 축소)
   - 헤지 방법 (반대 포지션, 분산투자)

4. 변동성 분석
   - 역사적 변동성 (베타값)
   - 최대 낙폭 (MDD) 분석

5. 리스크 대비 수익 비율 (Risk/Reward Ratio)

6. 포지션 사이징 권고 (전체 포트폴리오 내 비중)

리스크 관리 관점에서 실용적인 전략을 제시해주세요.`
}

export function buildPortfolioPrompt(
  stocks: string,
  amount: string,
  strategy: string,
): string {
  const strategyDesc: Record<string, string> = {
    균등분산: '선택 종목에 동일 비중으로 배분',
    차등배분: '종목별 확신도와 리스크에 따라 차등 배분',
    집중투자: '가장 확신도 높은 1~3개 종목에 집중 배분',
  }

  return `${todayPrefix()}아래 종목들로 ${amount} 규모의 포트폴리오를 구성해주세요.

[보유 예정 종목]: ${stocks}
[투자 금액]: ${amount}
[배분 전략]: ${strategyDesc[strategy] ?? strategy}

[포트폴리오 구성 요청]
1. 종목별 비중 추천
   - ${strategy} 전략 기반 각 종목 비중 (%)
   - 실제 매수 금액 (${amount} 기준)
   - 매수 단가 기준 예상 주식 수

2. 포트폴리오 특성 분석
   - 섹터 분산도
   - 예상 포트폴리오 베타 (시장 민감도)
   - 예상 배당수익률

3. 리밸런싱 전략
   - 리밸런싱 주기 (분기 / 반기 / 연간)
   - 리밸런싱 기준 (비중 이탈 시 조정)

4. 단계적 매수 계획
   - 1차 매수 시점 및 금액
   - 추가 매수 조건 및 시점

5. 목표 수익률 시뮬레이션
   - 1년 / 3년 예상 수익률 (보수 / 중립 / 낙관)

6. 포트폴리오 리스크 평가 및 개선 제안

실제 데이터 기반으로 구체적인 포트폴리오 플랜을 제시해주세요.`
}

export function buildEtfPrompt(
  etfs: string,
  purpose: string,
  style: string,
  region: string,
): string {
  return `${todayPrefix()}선택한 ETF를 분석하고 포트폴리오 구성을 제안해주세요.

[선택 ETF]: ${etfs}
[투자 목적]: ${purpose}
[투자 스타일]: ${style}
[투자 지역]: ${region}

[분석 항목]
1. 선택 ETF 기본 정보
   - 운용사 / 총보수(TER) / 운용 규모
   - 기초지수 또는 투자 전략
   - 배당/분배금 현황

2. 성과 분석
   - 1년 / 3년 / 5년 수익률 (연환산)
   - 최대 낙폭(MDD) 및 변동성
   - 샤프 비율 (위험 대비 수익)

3. 포트폴리오 내 역할
   - ${purpose} 목적에서의 활용 방법
   - 다른 자산과의 상관관계

4. ETF 비교 분석 (유사 ETF 대비 장단점)

5. ${purpose} / ${style} 전략에 맞는 비중 배분 제안

6. 투자 시 주의사항
   - 환 헤지 여부
   - 괴리율 / 추적오차 관리
   - 세금 고려 (해외 ETF 양도세 등)

7. 최종 투자 의견 및 추천 매수 시점

최신 데이터를 바탕으로 분석해주세요.`
}
