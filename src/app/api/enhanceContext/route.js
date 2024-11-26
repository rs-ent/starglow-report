// src/app/api/enhanceContext/route.js

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 환경 변수 검증
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables.');
}

// OpenAI 초기 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    // organization: 'your-org-id', // 필요 시 추가
});

/**
 * POST /api/enhanceContext
 */
export async function POST(request) {
    try {
        const { title, context, kpiData, chartConfig } = await request.json();

        if (!context) {
            return NextResponse.json({ error: 'Context is required for enhancement.' }, { status: 400 });
        }

        const prompt = `
다음은 투자 리포트 작성용 데이터입니다. 아래 데이터를 바탕으로 투자 전문가의 어조로 내용을 개선하고, 데이터 기반의 객관적이고 긍정적인 해석을 추가하세요. 작성된 내용은 간결하고, 한국어로 작성되어야 합니다.
문장의 스타일은 '~한다.'로 끝나게 하세요. '결론', '이유', '사례', '포인트'를 각 1~2줄로 총 8줄을 넘기지 말아주세요. 레이 달리오와 워렌 버핏의 말투와 단어 선택을 레퍼런스로 전문적인 인사이트를 도출하세요. 

### 투자포인트 제목:
${title}

### 투자포인트 내용:
${context}

### 투자포인트에 사용할 KPI 데이터:
${JSON.stringify(kpiData, null, 2)}

### 투자포인트에 사용할 차트 구성:
${JSON.stringify(chartConfig, null, 2)}

### 작성된 투자 포인트:
`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo', // 혹은 'gpt-4'로 모델명을 확인하세요
            messages: [
                {
                    role: 'system',
                    content: '당신은 투자 전문가입니다. 주어진 데이터를 바탕으로 투자 리포트를 작성하세요.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        const enhancedContext = completion.choices[0].message.content.trim();

        return NextResponse.json({ enhancedContext }, { status: 200 });
    } catch (error) {
        console.error('Error in OpenAI enhanceContext:', error);

        // OpenAI API Error Handling
        if (error instanceof OpenAI.APIError) {
            return NextResponse.json(
                { error: `OpenAI API Error: ${error.message}` },
                { status: error.status || 500 }
            );
        }

        // 기타 오류 처리
        return NextResponse.json(
            { error: 'Failed to enhance context. Please try again later.' },
            { status: 500 }
        );
    }
}