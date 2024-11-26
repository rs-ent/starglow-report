'use client';

import React, { useState, useRef, useMemo } from 'react';
import 'chart.js/auto';
import { formatNumber } from '../utils/formatNumber';
import { useKPI } from '../../context/GlobalData';

const KPI = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedKPI, setSelectedKPI] = useState(null);
    const containerRef = useRef(null);
    const calculatedKPIs = useKPI();

    if (!calculatedKPIs) {
        return <p>No KPI data available</p>;
    }

    const {
        peakValue,
        peakDate,
        totalValue,
        activeRevenueAvg,
        activeGrowthRatesAvg,
        ma6Current,
        ma3Current,
        revenueVolatilityStd,
        maxCoreRevenueLabel,
        maxCoreRevenueValue,
        CAGR,
        cumulativeMOV,
        valuePerFan,
        valuePerFanAvg,
        revenueDiversityIndex,
        normalizedDiversityIndex,
        sortedData,
        currentDate,
        currentData,
    } = calculatedKPIs;

    // 표시할 KPI 목록을 준비합니다.
    const allKPIs = useMemo(() => [
        { label: '최고점 가치', value: peakValue, suffix: '₩', importance: 10, higherIsBetter: true },
        { label: `현재 가치`, value: totalValue, suffix: '₩', importance: 9, higherIsBetter: true },
        { label: '최고점 날짜', value: peakDate, suffix: '', importance: 8, higherIsBetter: false },
        { label: '활동기 평균 매출 성장률', value: parseFloat((activeGrowthRatesAvg * 100).toFixed(2)), suffix: '%', importance: 6, higherIsBetter: true },
        { label: '6개월 이동평균', value: ma6Current ? parseFloat(ma6Current.toFixed(2)) : null, suffix: '₩', importance: 6, higherIsBetter: true },
        { label: '수익 변동성 지표', value: parseFloat(normalizedDiversityIndex.toFixed(2)), suffix: '', importance: 5, higherIsBetter: false },
        { label: '핵심 수익원', value: maxCoreRevenueLabel, suffix: '', importance: 4, higherIsBetter: false },
        { label: `${maxCoreRevenueLabel} 누적 가치`, value: maxCoreRevenueValue, suffix: '₩', importance: 3, higherIsBetter: true },
        { label: '누적 가치', value: cumulativeMOV, suffix: '₩', importance: 9, higherIsBetter: true },
        { label: '활동기 가치 평균', value: parseFloat(activeRevenueAvg.toFixed(2)), suffix: '₩', importance: 7, higherIsBetter: true },
        { label: '3개월 이동평균', value: ma3Current ? parseFloat(ma3Current.toFixed(2)) : null, suffix: '₩', importance: 6, higherIsBetter: true },
        { label: '수익 다양성 지수', value: parseFloat(revenueDiversityIndex.toFixed(2)), suffix: '', importance: 5, higherIsBetter: true },
        { label: '복합 연평균 성장률 (CAGR)', value: parseFloat((CAGR * 100).toFixed(2)), suffix: '%', importance: 7, higherIsBetter: true },
        { label: '팬당 가치 평균', value: parseFloat(valuePerFanAvg.toFixed(2)), suffix: '₩', importance: 5, higherIsBetter: true },
        { label: '팬당 가치 (현재)', value: parseFloat(valuePerFan.toFixed(2)), suffix: '₩', importance: 6, higherIsBetter: true },
        
    ], [
        peakValue,
        peakDate,
        totalValue,
        activeRevenueAvg,
        activeGrowthRatesAvg,
        ma6Current,
        ma3Current,
        revenueVolatilityStd,
        maxCoreRevenueLabel,
        maxCoreRevenueValue,
        CAGR,
        cumulativeMOV,
        valuePerFan,
        valuePerFanAvg,
        revenueDiversityIndex,
    ]);

    // 초기 표시할 8개의 KPI
    const fixedKPIs = useMemo(() => allKPIs.slice(0, 8), [allKPIs]);
    const additionalKPIs = useMemo(() => allKPIs.filter(kpi => !fixedKPIs.some(fixedKPI => fixedKPI.label === kpi.label)));

    // 표시할 KPI 결정
    const displayedKPIs = useMemo(() => {
        return isExpanded ? allKPIs : fixedKPIs;
    }, [isExpanded, allKPIs, fixedKPIs]);

    // KPI 아이템 클릭 핸들러
    const handleKpiClick = (kpi) => {
        setSelectedKPI({
            ...kpi,
            chartsData: getChartsDataForKPI(kpi.label),
        });
    };

    return (
        <div
            ref={containerRef}
        >
            {/* KPI 목록 */}
            <div className="grid grid-cols-1 h-auto">
                {displayedKPIs.map((kpi, index) => (
                    <div
                        key={index}
                        onClick={() => handleKpiClick(kpi)}
                    >
                    
                        {/* 카드 내용 */}
                        <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-4 border-b border-b-gray-100">
                            <h4 className="text-[var(--primary)] text-sm">
                                {kpi.label}
                            </h4>
                            <p className="text-sm font-semibold">
                                {kpi.suffix === '₩'
                                    ? `₩${formatNumber(kpi.value)}`
                                    : `${formatNumber(kpi.value)}${kpi.suffix}`}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 더보기 버튼 */}
            <button
            className="expand-button mt-2"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            >
            {isExpanded ? 'Collapse' : 'Expand'}
            </button>
        </div>
    );
};

export default KPI;