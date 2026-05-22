export interface Term {
  name: string
  full: string
  short: string
  detail: string
}

export type TermCategory = '기본' | '재무' | '밸류' | 'ETF' | '매매' | '기술적'

export const TERM_CATEGORIES: TermCategory[] = ['기본', '재무', '밸류', 'ETF', '매매', '기술적']

export const TERMS: Record<TermCategory, Term[]> = {
  기본: [
    { name: 'PER', full: '주가수익비율 (Price Earning Ratio)', short: '주가를 주당순이익(EPS)으로 나눈 값입니다.', detail: 'PER = 주가 ÷ EPS. 낮을수록 저평가, 업종 평균과 비교하는 것이 중요합니다. 성장주는 PER이 높고, 가치주는 낮은 경향이 있습니다.' },
    { name: 'PBR', full: '주가순자산비율 (Price Book Ratio)', short: '주가를 주당순자산(BPS)으로 나눈 값입니다.', detail: 'PBR = 주가 ÷ BPS. 1 이하면 청산가치보다 저평가. 자산 집약적 업종(은행, 제조업)에 유용합니다.' },
    { name: 'ROE', full: '자기자본이익률 (Return On Equity)', short: '내 돈(자본)으로 얼마나 벌었는지 보여주는 수익성 지표입니다.', detail: 'ROE = 순이익 ÷ 자기자본 × 100. 워렌 버핏은 ROE 15% 이상 기업을 선호합니다.' },
    { name: 'EPS', full: '주당순이익 (Earnings Per Share)', short: '주식 1주당 회사가 벌어들인 순이익입니다.', detail: 'EPS = 순이익 ÷ 발행주식수. EPS가 꾸준히 성장하는 기업이 좋은 투자 대상입니다.' },
    { name: '시가총액', full: 'Market Capitalization', short: '회사의 총 가치를 나타내는 지표입니다.', detail: '시가총액 = 주가 × 발행주식수. 대형주(10조+), 중형주(1~10조), 소형주(1조 미만)로 분류합니다.' },
    { name: '배당수익률', full: 'Dividend Yield', short: '주가 대비 1년간 받는 배당금의 비율입니다.', detail: '배당수익률 = 주당 배당금 ÷ 주가 × 100. 3% 이상이면 배당주로 분류하는 경우가 많습니다.' },
    { name: '거래량', full: 'Trading Volume', short: '하루 동안 거래된 주식의 수량입니다.', detail: '거래량 급등은 세력의 진입 또는 이탈 신호일 수 있습니다. 가격 변동과 함께 분석합니다.' },
    { name: '52주 신고가/신저가', full: '52-Week High/Low', short: '최근 1년간 가장 높았던/낮았던 주가입니다.', detail: '52주 신고가 돌파는 강한 매수 신호로 볼 수 있으며, 신저가는 반등 기회나 추가 하락의 분기점이 됩니다.' },
  ],
  재무: [
    { name: 'EBITDA', full: '이자·세금·감가상각 전 이익', short: '영업 현금흐름을 간단히 보여주는 수익성 지표입니다.', detail: 'EBITDA = 영업이익 + 감가상각비. 부채 구조나 세금 영향을 제거한 순수한 영업 성과를 나타냅니다.' },
    { name: 'FCF', full: '잉여현금흐름 (Free Cash Flow)', short: '실제로 회사에 남는 현금입니다.', detail: 'FCF = 영업현금흐름 - 자본지출. 배당, 자사주 매입, 부채 상환에 쓸 수 있는 진짜 현금.' },
    { name: '부채비율', full: 'Debt to Equity Ratio', short: '타인자본(부채) 대비 자기자본의 비율입니다.', detail: '부채비율 = 총부채 ÷ 자기자본 × 100. 200% 이하가 일반적으로 안전하다고 봅니다.' },
    { name: '유동비율', full: 'Current Ratio', short: '단기 채무를 갚을 수 있는 능력을 나타냅니다.', detail: '유동비율 = 유동자산 ÷ 유동부채 × 100. 150% 이상이면 단기 유동성이 양호합니다.' },
    { name: '영업이익률', full: 'Operating Profit Margin', short: '매출에서 영업비용을 뺀 비율입니다.', detail: '영업이익률 = 영업이익 ÷ 매출액 × 100. 업종 평균보다 높으면 경쟁우위가 있다고 볼 수 있습니다.' },
    { name: 'ROA', full: '총자산이익률 (Return On Assets)', short: '총자산 대비 얼마나 이익을 냈는지 나타냅니다.', detail: 'ROA = 순이익 ÷ 총자산 × 100. 자산 활용 효율성을 측정하며 5% 이상이면 양호합니다.' },
  ],
  밸류: [
    { name: 'PEG', full: 'Price/Earnings to Growth', short: 'PER을 성장률로 나눈 밸류에이션 지표입니다.', detail: 'PEG = PER ÷ EPS성장률. 1 이하면 성장 대비 저평가. 성장주 분석에 특히 유용합니다.' },
    { name: 'EV/EBITDA', full: 'Enterprise Value / EBITDA', short: '기업 전체 가치를 EBITDA로 나눈 배수입니다.', detail: 'M&A 시 기업 가치 평가에 자주 쓰입니다. 10배 이하면 저평가로 보는 경우가 많습니다.' },
    { name: 'DCF', full: '현금흐름 할인법 (Discounted Cash Flow)', short: '미래 현금흐름을 현재 가치로 환산하는 방법입니다.', detail: '내재 가치를 계산하는 가장 이론적인 방법. 할인율(WACC)과 성장률 가정이 핵심입니다.' },
    { name: '내재가치', full: 'Intrinsic Value', short: '기업의 실제 가치로, 현재 주가와 비교합니다.', detail: '내재가치 > 주가면 매수 기회, 내재가치 < 주가면 고평가. 안전마진을 두고 투자합니다.' },
    { name: '안전마진', full: 'Margin of Safety', short: '내재가치 대비 주가의 할인율입니다.', detail: '벤저민 그레이엄이 강조한 개념. 계산 오류나 예상치 못한 리스크에 대비해 30% 이상 할인된 가격에 매수합니다.' },
  ],
  ETF: [
    { name: 'NAV', full: '순자산가치 (Net Asset Value)', short: 'ETF 1주당 실제 자산 가치입니다.', detail: 'NAV = 총자산 ÷ 발행주식수. ETF 시장가격과 NAV의 차이가 크면 괴리율이 발생합니다.' },
    { name: '괴리율', full: 'Premium/Discount to NAV', short: 'ETF 시장가격과 NAV의 차이 비율입니다.', detail: '양수면 프리미엄(고평가), 음수면 디스카운트(저평가). 0.5% 이내가 정상적인 수준입니다.' },
    { name: '추적오차', full: 'Tracking Error', short: 'ETF가 기초지수를 얼마나 잘 따라가는지 나타냅니다.', detail: '낮을수록 좋습니다. 패시브 ETF는 0.1% 미만, 액티브 ETF는 그보다 높습니다.' },
    { name: '총보수', full: 'Total Expense Ratio (TER)', short: 'ETF 보유 시 매년 차감되는 운용 비용입니다.', detail: '낮을수록 유리. 미국 ETF(VOO 0.03%)는 국내 ETF(0.1~0.5%)보다 저렴한 경우가 많습니다.' },
    { name: '분배금', full: 'Distribution', short: 'ETF가 보유한 종목의 배당금을 투자자에게 지급하는 것입니다.', detail: '월 분배형(JEPI, SCHD 등)은 매달 현금 흐름이 발생합니다. 연간 분배율을 확인하세요.' },
    { name: '커버드콜', full: 'Covered Call', short: '보유 주식에 콜옵션을 매도해 월 수익을 얻는 전략입니다.', detail: 'JEPI, JEPQ 등이 대표적. 상승장에서 수익이 제한되지만 안정적인 월 수입이 발생합니다.' },
  ],
  매매: [
    { name: '손절', full: 'Stop Loss', short: '손실을 일정 수준에서 확정하고 매도하는 것입니다.', detail: '원칙 없는 장기 보유보다 손절이 유리한 경우가 많습니다. 진입 전 손절 기준을 미리 정하세요.' },
    { name: '물타기', full: 'Averaging Down', short: '주가 하락 시 추가 매수해 평균 단가를 낮추는 전략입니다.', detail: '좋은 기업의 일시적 하락에는 유효하지만, 악화된 기업의 하락에는 위험합니다.' },
    { name: '분할매수', full: 'Dollar Cost Averaging (DCA)', short: '일정 금액을 나누어 정기적으로 매수하는 전략입니다.', detail: '고점 매수 위험을 줄이고 장기적으로 평균 단가를 낮출 수 있습니다.' },
    { name: '목표가', full: 'Price Target', short: '분석을 통해 도출한 적정 매도 시점의 주가입니다.', detail: '내재가치 또는 기술적 저항선을 기반으로 설정합니다. 목표가 달성 시 전부 또는 일부 매도를 고려합니다.' },
    { name: '익절', full: 'Take Profit', short: '목표 수익을 달성했을 때 매도하는 것입니다.', detail: '욕심을 자제하고 계획한 수익률에서 실행하는 것이 장기적으로 유리합니다.' },
  ],
  기술적: [
    { name: '이동평균선', full: 'Moving Average (MA)', short: '일정 기간 주가의 평균을 이은 선입니다.', detail: '20일선(단기), 60일선(중기), 120일선(장기). 주가가 이평선 위에 있으면 상승 추세로 봅니다.' },
    { name: 'RSI', full: '상대강도지수 (Relative Strength Index)', short: '과매수/과매도를 판단하는 모멘텀 지표입니다.', detail: '70 이상이면 과매수(매도 고려), 30 이하면 과매도(매수 고려). 기본 기간은 14일입니다.' },
    { name: 'MACD', full: 'Moving Average Convergence Divergence', short: '두 이동평균의 차이로 추세 전환을 포착하는 지표입니다.', detail: 'MACD선이 시그널선을 상향 돌파하면 매수 신호, 하향 돌파하면 매도 신호로 봅니다.' },
    { name: '볼린저밴드', full: 'Bollinger Bands', short: '주가 변동성을 상하 밴드로 표시하는 지표입니다.', detail: '주가가 하단 밴드에 닿으면 과매도, 상단 밴드에 닿으면 과매수로 판단합니다.' },
    { name: '지지선/저항선', full: 'Support/Resistance', short: '주가가 반등하거나 멈추는 가격대입니다.', detail: '지지선은 매수 세력이 몰리는 가격대, 저항선은 매도 세력이 몰리는 가격대입니다.' },
    { name: '골든크로스', full: 'Golden Cross', short: '단기 이평선이 장기 이평선을 상향 돌파하는 것입니다.', detail: '20일선이 60일선을 상향 돌파하면 강한 매수 신호로 봅니다. 반대는 데드크로스입니다.' },
  ],
}
