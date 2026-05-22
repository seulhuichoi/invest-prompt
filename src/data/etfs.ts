export interface ETF {
  ticker: string
  desc: string
}

export const US_ETFS: ETF[] = [
  { ticker: 'SPY', desc: 'S&P500 추종 (미국 대표)' },
  { ticker: 'QQQ', desc: '나스닥100 (기술주 중심)' },
  { ticker: 'VOO', desc: 'S&P500 (뱅가드, 저비용)' },
  { ticker: 'VTI', desc: '미국 전체시장 3,500종목' },
  { ticker: 'SCHD', desc: '배당성장 (10년 연속 배당)' },
  { ticker: 'JEPI', desc: '월배당 커버드콜 (7-10%)' },
  { ticker: 'IVV', desc: 'S&P500 (iShares, 저비용)' },
  { ticker: 'DIA', desc: '다우존스30 추종' },
  { ticker: 'IWM', desc: '러셀2000 소형주' },
  { ticker: 'VIG', desc: '배당성장 (10년+ 연속 증배)' },
  { ticker: 'JEPQ', desc: '나스닥 월배당 커버드콜' },
  { ticker: 'BIL', desc: '미국 단기국채 (현금 대용)' },
  { ticker: 'IEF', desc: '미국 중기국채 (7-10년)' },
  { ticker: 'TLT', desc: '미국 장기국채 (20년+)' },
  { ticker: 'LQD', desc: '미국 투자등급 회사채' },
  { ticker: 'TIP', desc: '미국 물가연동국채 (TIPS)' },
  { ticker: 'BND', desc: '미국 종합채권' },
  { ticker: 'HYG', desc: '미국 하이일드 채권' },
  { ticker: 'PDBC', desc: '원자재 종합 (에너지·금속·농산물)' },
  { ticker: 'GLD', desc: '금 현물 추종' },
  { ticker: 'SLV', desc: '은 현물 추종' },
  { ticker: 'EFA', desc: '선진국 주식 (미국 제외)' },
  { ticker: 'VWO', desc: '신흥국 전체' },
  { ticker: 'VEA', desc: '선진국 (미국 제외)' },
  { ticker: 'ARKK', desc: '파괴적 혁신 (액티브)' },
  { ticker: 'XLK', desc: '미국 기술 섹터' },
  { ticker: 'XLF', desc: '미국 금융 섹터' },
  { ticker: 'XLE', desc: '미국 에너지 섹터' },
  { ticker: 'VNQ', desc: '미국 리츠 (부동산)' },
]

export const KR_ETFS: ETF[] = [
  { ticker: 'KODEX 200', desc: 'KOSPI200 추종' },
  { ticker: 'KODEX 코스닥150', desc: '코스닥 대표 150종목' },
  { ticker: 'TIGER 미국S&P500', desc: 'S&P500 원화투자' },
  { ticker: 'TIGER 미국나스닥100', desc: '나스닥100 원화투자' },
  { ticker: 'TIGER 미국배당다우존스', desc: 'SCHD 한국판 월배당' },
  { ticker: 'KODEX 미국배당프리미엄액티브', desc: 'JEPI 한국판 월배당' },
  { ticker: 'ARIRANG 고배당주', desc: '국내 고배당 우량주' },
]
