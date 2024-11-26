// src/app/investment-point-manager/[artist_id]/InvestmentPoint.js

import React, { useState } from 'react';
import './InvestmentPoint.css';

const MagicWithOpenAI = ({ title, context, setContext, kpiData, chartConfig }) => {
    const [loading, setLoading] = useState(false);

    const handleEnhance = async () => {
        if (!context) {
            console.error('컨텍스트를 입력하세요.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/enhanceContext', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    context,
                    kpiData,
                    chartConfig,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unknown error');
            }

            const result = await response.json();
            setContext(result.enhancedContext);
            console.log('컨텍스트가 성공적으로 개선되었습니다!');
        } catch (error) {
            console.error('컨텍스트 개선 오류:', error);
            console.error(`컨텍스트 개선에 실패했습니다: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={handleEnhance} disabled={loading} className="magic-button">
                {loading ? '개선 중...' : 'Magic With OpenAI'}
            </button>
        </div>
    );
};

export default MagicWithOpenAI;