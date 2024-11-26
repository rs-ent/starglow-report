// src/app/api/summaryContext/route.js

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 환경 변수 검증
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables.');
}

// OpenAI 초기 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/summaryContext
 * 아티스트 요약 데이터를 생성
 */
export async function POST(request) {
    try {
        const { artistName, kpiData } = await request.json();

        const cacheKey = `${artistName}-${JSON.stringify(kpiData)}`;
        if (cache.has(cacheKey)) {
            const cachedSummary = cache.get(cacheKey);
            logger.info('캐시된 요약 반환', { artistName });
            return NextResponse.json({ artistName, summary: cachedSummary }, { status: 200 });
        }

        if (!artistName || !kpiData) {
            return NextResponse.json({ error: 'artistName and kpiData are required.' }, { status: 400 });
        }

        // GPT-4 프롬프트 생성
        // GPT-4 프롬프트 생성
const prompt = `
다음은 '${artistName}'의 최근 활동 및 수익 데이터를 기반으로 작성된 아티스트 투자 리포트입니다.
투자 전문가의 어조로 데이터를 해석하고 간결하게 요약하세요. 항목은 다음과 같이 구성하세요:

# 아티스트 요약
## 최근 활동
- **신곡 발매**: 최근 활동에 대한 주요 이벤트 (1~3줄)
- **대표곡**: 스트리밍 기록 또는 주요 히트곡 정보 (1~3줄)

## 수익 분석
- **수익 성장률**: 최근 성장률 데이터 (1~3줄)
- **주요 수익원**: 수익원과 그 기여도 (1~3줄)
- **팬덤**: 데이터를 활용한 정성, 주관 기반 분석 (1~3줄)

## 글로벌 시장
- **해외 팬덤 비중**: 글로벌 플랫폼에서의 비중 (1~3줄)
- **팬덤 확장 잠재력**: 주요 성장 가능성 분석 (1~3줄)

## 리스크 및 개선점
- **리스크**: 주요 리스크 (1~3줄)
- **수익 다각화 필요**: 제안된 개선점 (1~3줄)

## 성장 인사이트
- **2025년 성장 예측**: 성장률 및 주요 기대치 (1~3줄)
- **뮤직비디오 ROI**: 콘텐츠 투자 대비 성과 (1~3줄)

## 최종 요약
- 모든 데이터와 내용을 참고한 최종 요약본 (5줄)

### KPI 데이터 설명:
\`\`\`json
{
  "CAGR": "복합 연간 성장률",
  "activeGrowthRatesAvg": "활동 성장률 평균",
  "activeRevenueAvg": "활동 수익 평균",
  "cumulativeMOV": "누적 종합 가치",
  "currentData": {
    "fv_t": "해당월의 추정 팬덤 가치",
    "sv_t": "해당월의 추정 국내 스트리밍",
    "apv_t": "해당월의 추정 해외 스트리밍",
    "rv_t": "해당월의 추정 음반판매",
    "cev_t": "해당월의 추정 공연/행사"
  },
  "currentDate": "데이터 기준 날짜",
  "ma3Current": "3개월 이동 평균",
  "ma6Current": "6개월 이동 평균",
  "maxCoreRevenueLabel": "최대 핵심 수익원 라벨",
  "maxCoreRevenueValue": "최대 핵심 수익원 값",
  "peakDate": "수익 최고치 날짜",
  "peakValue": "수익 최고치 값",
  "revenueDiversityIndex": "수익 다변화 지수",
  "revenueVolatilityStd": "수익 변동성 표준편차",
  "sortedData": "월별 추정 성과 데이터",
  "totalValue": "총 가치",
  "valuePerFan": "팬당 가치",
  "valuePerFanAvg": "팬당 가치 평균"
}
\`\`\`

### sortedData 설명:
- **fv_t**: 해당월의 추정 팬덤 가치
- **sv_t**: 해당월의 추정 국내 스트리밍
- **apv_t**: 해당월의 추정 해외 스트리밍
- **rv_t**: 해당월의 추정 음반판매
- **cev_t**: 해당월의 추정 공연/행사
- **MOV**: 해당월의 추정 종합 가치
- **discography**: 해당월에 참조된 앨범 및 트랙
- **production**: 해당월에 진행한 공연 및 자체 콘텐츠
- **management**: 해당월에 촬영한 방송, 외부 콘텐츠

### 실제 KPI 데이터:
\`\`\`json
${JSON.stringify(kpiData, null, 2)}
\`\`\`

### 작성된 요약:
`;

        // OpenAI ChatGPT API 호출
        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [
                {
                    role: 'system',
                    content: '당신은 음악 산업 투자 전문가입니다. 주어진 데이터를 바탕으로 간결하고 분석적인 요약을 작성하세요.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        const summary = completion.choices[0].message.content.trim();

        cache.set(cacheKey, summary);
        logger.info('새로운 요약 캐시 저장', { artistName });

        return NextResponse.json({ artistName, summary }, { status: 200 });
    } catch (error) {
        console.error('Error in summaryContext:', error);

        // OpenAI API Error Handling
        if (error instanceof OpenAI.APIError) {
            return NextResponse.json(
                { error: `OpenAI API Error: ${error.message}` },
                { status: error.status || 500 }
            );
        }

        // 기타 오류 처리
        return NextResponse.json(
            { error: 'Failed to generate summary. Please try again later.' },
            { status: 500 }
        );
    }
}