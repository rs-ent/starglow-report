// DescriptionToolTip.jsx
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';

// 예시용 지수감쇠 데이터 생성 함수
const createExponentialDecayData = (initialValue = 100, decayRate = 1.2, months = 12) => {
  return Array.from({ length: months + 1 }, (_, t) => ({
    t,
    value: initialValue * Math.exp(-decayRate * t),
  }));
};

const createFVTrendData = (initialFV = 100, months = 12) => {
    return Array.from({ length: months + 1 }, (_, t) => {
      // 0.5 ~ 1.5 사이의 랜덤 값 생성
      const trendFactor = 0.5 + Math.random(); 
      const value = initialFV * trendFactor;
      return { t, value };
    });
};

// rv_t 모델에 맞는 데이터 생성 함수
const createRVTrendData = (initialValue = 100, months = 12) => {
    // linspace 함수: start부터 end까지 num개의 값을 등분할한 배열을 생성
    const linspace = (start, end, num) => {
      if (num === 1) return [start];
      const step = (end - start) / (num - 1);
      return Array.from({ length: num }, (_, i) => start + step * i);
    };
  
    let decayRates = [];
    if (months > 12) {
      // 3개월: 0.6 -> 0.4 선형 감소
      const initialDecay = linspace(0.6, 0.4, 3);
      // 다음 6개월: 0.4 -> 0.3 선형 감소
      const midDecay = linspace(0.4, 0.3, 6);
      // 남은 기간: 0.3을 기반으로 0.9^(i/3) 형태의 지수 감소
      const restCount = months - 9; 
      const longDecay = Array.from({ length: restCount }, (_, i) => 0.56 * Math.pow(0.9, i / 3));
      decayRates = [...initialDecay, ...midDecay, ...longDecay];
    } else {
      // months가 12 이하인 경우
      // 초기 최대 3개월: 0.6 -> 0.4
      const initialPeriod = Math.min(3, months);
      const initialDecay = linspace(0.6, 0.55, initialPeriod);
  
      // 남은 기간(최대 9개월): 0.4 -> 0.3 선형 감소
      const midCount = Math.max(months - 3, 0);
      const midDecay = midCount > 0 ? linspace(0.35, 0.15, midCount) : [];
  
      decayRates = [...initialDecay, ...midDecay];
    }
  
    // decayRates에 따라 각 달별 값을 계산
    return decayRates.map((rate, t) => ({
      t,
      value: initialValue * rate,
    }));
};

const createCEVTrendDataForEvent = (
    cer = 100,
    maxCER = 100,
    decayRate = 1.0,
    baseInfluenceMonths = 3,
    maxInfluenceMonths = 12,
    minInfluenceMonths = 1
  ) => {
    // 영향 개월 수 계산
    const influenceMonths = Math.min(
      Math.max(
        Math.round(baseInfluenceMonths + (cer / maxCER) * (maxInfluenceMonths - baseInfluenceMonths)),
        minInfluenceMonths
      ),
      maxInfluenceMonths
    );
  
    // influenceMonths 동안 cer 값을 지수감쇠 적용
    return Array.from({ length: influenceMonths }, (_, i) => {
      const value = cer * Math.exp(-decayRate * i);
      return { t: i, value };
    });
};

// 예시용 4개월 영향 데이터(트위터 MCV 등) 생성 함수
const createFourMonthDecayData = (initialValue = 100, peakMonth = 1, totalMonths = 4) => {
  return Array.from({ length: totalMonths }, (_, t) => {
    let factor = 1.0;
    if (t > peakMonth) {
      factor = 1 - (t - peakMonth) * (1 / (totalMonths - peakMonth));
    }
    return {
      t,
      value: initialValue * Math.max(factor, 0)
    };
  });
};

// 각 지표에 대한 매우 상세한 설명
// 각 설명은 데이터 출처, 계산 과정, 감쇠 공식, 가중치 적용, 그리고 예시값 및 그래프 설명을 포함
const DESCRIPTION_MAP = {
    apv_t: {
        title: '인기도(APV, 스포티파이 기반)',
        description: `
    데이터 소스: Spotify API에서 가져온 아티스트 팔로워 수와 각 트랙별 인기도(popularity) 지표.
    
    계산 과정:
    1. 각 앨범에 속한 모든 트랙의 popularity 값을 합산.
    2. 합산값 × 아티스트 팔로워 수를 통해 해당 앨범의 인기도 가치를 산정.
    3. 모든 앨범에 대해 이 값을 합산하면 총 APV(인기도 가치)가 도출됨.
    
    감쇠(Decay) 적용:
    - 인기도는 시간이 지날수록 신곡 출시, 트렌드 변화 등에 따라 자연스럽게 감소.
    - 지수 감쇠 함수를 적용하여, 초기 인기도가 높더라도 일정 시간이 흐르면 점진적으로 영향력이 희석됨.
    
    분석적 해석:
    APV_t는 신보 발매 직후 최고조에 달한 인기도가 시간이 흐름에 따라 어떻게 줄어드는지를 수학적으로 모델링한 값.
    이는 아티스트의 "인지도 수명 주기"를 나타내며, 초기 관심을 잘 유지하거나 재점화하는 전략의 중요성을 시사.
        `,
        graphData: createExponentialDecayData(100, 0.3, 12),
        lineColor: '#8884d8'
    },

    sv_t: {
        title: '스트리밍 가치(SV, 멜론 기반)',
        description: `
    데이터 소스: 멜론(Melon) 플랫폼의 앨범별 스트리밍 횟수와 스트리밍당 예상 수익.
    
    계산 과정:
    1. 모든 앨범 트랙의 월간 스트리밍 횟수를 합산.
    2. 스트리밍 수익 단가를 곱해 총 스트리밍 수익(가치) 추정.
    3. 시간 경과에 따른 감쇠를 적용해 오래된 스트리밍의 영향력 감소 반영.
    
    감쇠 적용:
    - 최신 발매 직후 스트리밍 수치 최고점 → 이후 지속 청취 감소.
    - 지수감쇠를 통해 장기적으로 스트리밍 가치가 하락하는 추세를 반영.
    
    분석적 해석:
    SV_t는 팬들이 음악 소비 패턴을 어떻게 변화시키는지 보여주는 지표.
    스트리밍 가치 하락 속도를 살펴보면, 프로모션 전략 변화나 신곡 발매 시점을 판단할 근거를 제공.
        `,
        graphData: createExponentialDecayData(100, 0.3, 12),
        lineColor: '#FF7F50'
    },

    rv_t: {
        title: '음반 판매 가치(RV, 써클차트 기반)',
        description: `
    데이터 소스: 써클 차트(Circle Chart)의 월별 앨범 판매량, 최신 앨범 가격(LAP), 할인율(DISCOUNT_RATE).
    
    계산 과정:
    1. 특정 기간의 앨범 판매량 합산 후 앨범 단가(LAP) 곱 → 초기 가치 산정.
    2. 판매 시점으로부터의 경과 연수에 따라 할인율 적용 → 현재가치로 환산.
    3. 초기 몇 달간은 비교적 높은 가치 유지, 이후 점진적 하락(선형→지수감쇠).
    
    감쇠 적용:
    - 발매 초기: 팬덤에 의한 폭발적 구매, 이후 신보 출시, 시장 포화, 관심도 하락으로 판매량 기여도 감소.
    
    분석적 해석:
    RV_t는 물리적 음반의 "수명 주기"를 반영.
    앨범 재발매나 스페셜 에디션 출시, 또는 추가 프로모션을 통해 자연감쇠를 늦출 전략을 고민하게 함.
        `,
        graphData: createRVTrendData(100, 12),
        lineColor: '#8A2BE2'
    },

    fv_t: {
        title: '팬덤 가치(FV) 시계열',
        description: `
    데이터 소스:
    - FB(팬베이스 규모), ER(참여도), G(팬덤 경제력), 그리고 트렌드(검색 데이터) 활용.
    
    계산 과정:
    1. FV = FB × ER × G를 기본 축으로 함.
    2. 검색 트렌드 기반 계수를 곱해 월별 변동 반영(FV_t).
    3. 팬덤 규모는 쉽게 바뀌지 않지만, 트렌드 변화로 월별 FV 값이 출렁일 수 있음.
    
    분석적 해석:
    FV_t는 팬덤의 "기초 체력"을 가늠하는 지표.  
    트렌드가 상승하면 팬덤 규모 변화 없이도 FV_t가 상승, 반대로 관심도 저하 시 감소.
    이는 팬덤 유지 전략, 커뮤니케이션, 콘텐츠 공급 등이 어떻게 팬덤 활력을 좌우하는지 보여줌.
        `,
        graphData: createFVTrendData(100, 12),
        lineColor: '#2E8B57'
    },

    cev_t: {
        title: '공연/행사 가치(CEV)',
        description: `
    데이터 소스: 공연, 팬미팅, 페스티벌 등의 이벤트 기반 CER(추정/실제 수익).

    계산 과정:
    1. 이벤트별 CER 산정(실제 수익 or FV, AV, ER을 활용한 추정치).
    2. CER 규모에 따라 이벤트 영향 기간(influenceMonths) 결정: 큰 이벤트일수록 영향 기간 길어짐.
    3. 기간 동안 CER × exp(-decayRate×i)로 가치 분배 → 시간이 지날수록 감소.
    
    분석적 해석:
    CEV_t는 공연/행사가 아티스트 가치에 미치는 "시한부 영향력"을 정량화.
    큰 공연은 오랜 기간 가치 기여, 소규모 이벤트는 단기간 효과 후 사라짐.
    이를 통해 이벤트 규모, 주기, 프로모션 시점 등을 전략적으로 계획 가능.
        `,
        graphData: createCEVTrendDataForEvent(200, 500, 1.2, 3, 12, 1),
        lineColor: '#FFA07A'
    },

    mcv_t: {
        title: '미디어 콘텐츠 가치(MCV)',
        description: `
    데이터 소스: 트위터, 유튜브, 인스타그램 상의 노출, 반응(좋아요, 댓글, 리트윗, 구독 등).

    계산 과정:
    1. SNS별 이벤트(게시물) 발생 시점 기준 4개월 영향 모델 적용.
       초기(게시 1~2개월) 최대 효과, 이후 점진적 감소.
    2. 각 플랫폼별 가중치(트위터, 유튜브, 인스타그램)를 적용해 합산한 MCV 도출.
    
    분석적 해석:
    MCV_t는 SNS 콘텐츠 수명 주기 모델.  
    콘텐츠 발행 이후 관심이 어떻게 사그라드는지 가시화,
    지속적인 콘텐츠 생산, 플랫폼별 최적 전략 수립에 도움.
        `,
        graphData: createFourMonthDecayData(100, 1, 4),
        lineColor: '#87CEEB'
    },

    mds_t: {
        title: '굿즈/MD 판매 가치(MDS)',
        description: `
    데이터 소스: 굿즈/MD 판매 데이터, FV, AV, ER, 앨범 발매 시점 등.
    
    계산 과정:
    1. FV_t(팬덤 가치), AV(인기도), ER(참여도)를 결합해 MD 수요/잠재력 산출.
    2. 발매일 경과에 따라 굿즈 영향력 감쇠 및 할인율 적용.
    3. MDS_t = ((FV_t_rolling × ER) + (AV_value × AIF_t × ER)) × Discount Factor
       여기서 AIF_t는 앨범 영향력(시간 경과로 감소) 반영.

    분석적 해석:
    MDS_t는 상품 판매력이 팬덤 환경, 인기 변동, 시간 경과로 어떻게 약화되는지 보여줌.
    특정 시점에 MD 출시나 리뉴얼을 통해 가치 하락을 제어하는 전략을 수립할 수 있음.
        `,
        graphData: createFVTrendData(100, 12),
        lineColor: '#FFD700'
    },

    mrv_t: {
        title: '출연료/초상권 가치(MRV)',
        description: `
    데이터 소스: 방송 출연료, 광고 모델료, 초상권 라이선싱 수익 또는 추정치.
    
    계산 과정:
    1. FV_t, AV, ER, 그리고 카테고리 가중치를 활용해 BF_event(기본 수익가치) 산출.
    2. BF_event 규모에 따라 영향 기간 및 감쇠율 적용 → 시간이 지날수록 가치 감소.
    
    분석적 해석:
    MRV_t는 아티스트 이미지, 초상권, 방송 출연 가치의 "소모 곡선"을 표현.
    고부가 이벤트일수록 장기간 가치 유지, 소규모 출연은 단기 효과만 남김.
    이를 통해 계약 전략, 방송 출연 빈도, 초상권 관리 방향성 제시.
        `,
        graphData: createExponentialDecayData(100, 0.4, 6), 
        lineColor: '#BC8F8F'
    },

    MOV: {
        title: '종합평가(MOV)',
        description: `
    데이터 소스:
    FV, PFV, PCV, MRV 등 모든 지표 합산을 통한 총 시장가치.

    계산 과정:
    MOV_t = FV_t + (SV_t+APV_t+RV_t) + (CEV_t+MCV_t+MDS_t) + MRV_t
    즉, 팬덤·음원·공연/MD·출연료 가치의 총합.

    분석적 해석:
    MOV_t는 아티스트 전체 시장가치를 시간 흐름에 따라 한눈에 보여주는 종합가치.
    특정 이벤트(컴백, 공연, 광고, SNS 이슈)로 인한 가치 변동을 통합적으로 파악 가능.
    MOV_t 추세를 통해 장기적인 브랜드 가치 관리, 전략 재정비, 성장 기회 포착 가능.
        `,
        graphData: createFVTrendData(100, 24),
        lineColor: '#000000'
    }
};

const DescriptionToolTip = ({ metricKey }) => {
    if(metricKey === 'mcv_twitter' || metricKey === 'mcv_youtube' || metricKey === 'mcv_instagram') {
        metricKey = 'mcv_t';
    }
    const metricInfo = DESCRIPTION_MAP[metricKey] || null;

    if (!metricInfo) {
        return (
            <div className="p-4 text-sm text-gray-800">
                해당 지표에 대한 상세 정보가 없습니다.
            </div>
        );
    }

    const { title, description, graphData, lineColor } = metricInfo;

    return (
        <div className="p-4 text-sm text-gray-800">
            <h4 className="font-semibold mb-2">{title}</h4>
            <div className="whitespace-pre-line mb-4">
                {description}
            </div>
            {graphData && graphData.length > 0 && (
                <div className="mt-2 bg-white p-2 border rounded">
                    <LineChart width={200} height={100} data={graphData}>
                        <XAxis dataKey="t" hide />
                        <YAxis hide />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="value" stroke={lineColor || '#8884d8'} dot={false}/>
                    </LineChart>
                </div>
            )}
        </div>
    );
};

export default DescriptionToolTip;