// src/app/components/client/InvestmentPoints.js
'use client';

import React, { useState } from 'react';
import InvestmentPointItem from './InvestmentPointsAndRisks/InvestmentPointItem';
import { useKPI, useInvestmentPoints } from '../../context/GlobalData';

const InvestmentPoints = ({type = "Investment Point"}) => { // async 제거
    const pointsData = useInvestmentPoints();
    const investmentData = pointsData.filter(a => a.type === type);
    const kpiData = useKPI();

    // 현재 활성화된 아이템 상태 관리
    const [activeItem, setActiveItem] = useState(null);

    // 아이템 클릭 핸들러
    const toggleItem = (index) => {
        setActiveItem((prev) => (prev === index ? null : index));
    };

    return (
        <div className="space-y-4">
            {investmentData.map((item, index) => (
                <div
                    key={index}
                    className="rounded-lg overflow-hidden shadow-md bg-[var(--background)] border border-[var(--border-muted)]"
                >
                    {/* 제목 라벨 */}
                    <button
                        className="w-full text-left p-4 bg-[var(--primary)] text-[var(--background)] font-medium hover:bg-opacity-90 transition-all"
                        onClick={() => toggleItem(index)}
                    >
                        {item.title}
                    </button>

                    {/* 내용 */}
                    <div
                        className={`transition-all duration-300 ease-in-out ${
                            activeItem === index
                                ? 'max-h-screen opacity-100'
                                : 'max-h-0 opacity-0'
                        }`}
                        style={{
                            overflow: 'hidden',
                            transitionProperty: 'max-height, opacity, padding',
                        }}
                    >
                        <div className="bg-[var(--surface)] shadow-inner">
                            <InvestmentPointItem
                                data={item}
                                timeline={kpiData.timeline}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InvestmentPoints;