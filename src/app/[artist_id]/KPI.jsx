'use client';

import React, { useState, useRef, useMemo } from 'react';
import 'chart.js/auto';
import { useReport, useKPI } from '../../context/GlobalData';
import { calculateRiskLevelPercentage } from '../processors/riskLevel';
import { formatNumber } from '../utils/formatNumber';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceDot,
    ResponsiveContainer,
} from 'recharts';

export const revenueSpectrumChart = (totalValueMultiple, currentRevenue, minPercentage, maxPercentage) => {
    console.log(totalValueMultiple, currentRevenue, minPercentage, maxPercentage);
    // 데이터 계산
    const avgPoint1 = totalValueMultiple;
    const avgPoint3 = currentRevenue;

    const lowerBoundPoint1 = totalValueMultiple * (1 - (minPercentage / 3));
    const lowerBoundPoint2 = currentRevenue * (1 - minPercentage); // 최저 기대 수익 x:2

    const upperBoundPoint1 = totalValueMultiple * (1 + (maxPercentage / 2));
    const upperBoundPoint2 = currentRevenue * (1 + maxPercentage); // 최고 기대 수익 x:2

    const data = [
        { label: '평균 기대 수익', x: 0, value: avgPoint1 },
        { label: '평균 기대 수익', x: 10, value: avgPoint3 },
        { label: '최저 기대 수익', x: 0, value: lowerBoundPoint1 },
        { label: '최저 기대 수익', x: 10, value: lowerBoundPoint2 },
        { label: '최고 기대 수익', x: 0, value: upperBoundPoint1 },
        { label: '최고 기대 수익', x: 10, value: upperBoundPoint2 },
    ];

    return (
        <div className="mx-auto  border-b border-b-gray-200">
            <ResponsiveContainer width="90%" height={200}>
                <LineChart
                    data={data}
                    margin={{ top: 15, right: 40, left: 0, bottom: 0 }}
                >
                    <XAxis dataKey="x" 
                            stroke="#A0A0A0" 
                            tick={false}
                            type="number"
                            domain={[0, 10]}
                    />
                    <YAxis stroke="#A0A0A0"
                            tickFormatter={(tick) => formatNumber(tick,'',0)}
                            style={{ fontWeight: 100, fontSize: '8px' }}
                            domain={[lowerBoundPoint2 * 0.9, upperBoundPoint2 * 1.03]}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        name="평균 기대 수익"
                        stroke="#83358f"
                        strokeWidth={1}
                        data={data.filter(d => d.label === '평균 기대 수익')}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        name="최저 기대 수익"
                        stroke="#5b1166"
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        data={data.filter(d => d.label === '최저 기대 수익')}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        name="최고 기대 수익"
                        stroke="#5b1166"
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        data={data.filter(d => d.label === '최고 기대 수익')}
                        dot={false}
                    />

                    {/* 평균값 표시 */}
                    <ReferenceDot
                        x={10}
                        y={avgPoint3}
                        r={0} // 점 숨김
                        label={{
                            value: `${formatNumber(avgPoint3)}`,
                            position: 'right',
                            fontSize: 10,
                            fill: '#83358f',
                        }}
                    />

                    {/* 최소값 표시 */}
                    <ReferenceDot
                        x={10}
                        y={lowerBoundPoint2}
                        r={0} // 점 숨김
                        label={{
                            value: `${formatNumber(lowerBoundPoint2)}`,
                            position: 'right',
                            fontSize: 10,
                            fill: '#5b1166',
                        }}
                    />

                    {/* 최대값 표시 */}
                    <ReferenceDot
                        x={10}
                        y={upperBoundPoint2}
                        r={0} // 점 숨김
                        label={{
                            value: `${formatNumber(upperBoundPoint2)}`,
                            position: 'right',
                            fontSize: 10,
                            fill: '#5b1166',
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const KPI = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedKPI, setSelectedKPI] = useState(null);
    const containerRef = useRef(null);
    const reportData = useReport();
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
        activityFrequency,
        expectedAnnualRevenue,
        expectedRevenueSpectrum,

    } = calculatedKPIs;

    const riskLevel = calculateRiskLevelPercentage(
        reportData.goal_fund,
        expectedAnnualRevenue,
        reportData.investors_share_ratio,
    );

    const revenueSpectrum = `-${Math.ceil(expectedRevenueSpectrum.spectrumMin * 100)}% ~ ${Math.ceil(expectedRevenueSpectrum.spectrumMax * 100)}%`;
    const totalValueMultiple = (totalValue + reportData.goal_fund) * (1 + activeGrowthRatesAvg);

    // 표시할 KPI 목록을 준비합니다.
    const allKPIs = useMemo(() => [
        { label: '목표 모집 금액', value: reportData.goal_fund, suffix: '₩', importance: 10, higherIsBetter: true },
        { label: `현재 가치`, value: totalValueMultiple, suffix: '₩', importance: 9, higherIsBetter: true },
        { label: '위험도', value: riskLevel.differencePercentage, suffix: '%', importance: 10, higherIsBetter: false},
        { label: '위험성평가', value: riskLevel.riskText, suffix: '상품', importance: 10, higherIsBetter: true},
        { label: '예상기대수익', value: expectedAnnualRevenue, suffix: '₩', importance: 10, higherIsBetter: true},
        { label: '예상기대수익 스펙트럼', value: revenueSpectrum, suffix: '', importance: 10, higherIsBetter: true},
        //{ label: '최고점 가치', value: peakValue, suffix: '₩', importance: 10, higherIsBetter: true },
        //{ label: '최고점 날짜', value: peakDate, suffix: '', importance: 8, higherIsBetter: false },
        { label: '활동기 평균 매출 성장률', value: parseFloat((activeGrowthRatesAvg * 100).toFixed(2)), suffix: '%', importance: 6, higherIsBetter: true },
        //{ label: '6개월 이동평균', value: ma6Current ? parseFloat(ma6Current.toFixed(2)) : null, suffix: '₩', importance: 6, higherIsBetter: true },
        { label: '수익 다양성 지표', value: parseFloat(((1 - normalizedDiversityIndex) * 100).toFixed(2)), suffix: '%', importance: 5, higherIsBetter: false },
        { label: '핵심 수익원', value: maxCoreRevenueLabel, suffix: ' 수익', importance: 4, higherIsBetter: false },
        //{ label: `${maxCoreRevenueLabel} 누적 가치`, value: maxCoreRevenueValue, suffix: '₩', importance: 3, higherIsBetter: true },
        //{ label: '누적 가치', value: cumulativeMOV, suffix: '₩', importance: 9, higherIsBetter: true },
        //{ label: '활동기 가치 평균', value: parseFloat(activeRevenueAvg.toFixed(2)), suffix: '₩', importance: 7, higherIsBetter: true },
        //{ label: '3개월 이동평균', value: ma3Current ? parseFloat(ma3Current.toFixed(2)) : null, suffix: '₩', importance: 6, higherIsBetter: true },
        //{ label: '수익 다양성 지수', value: parseFloat(revenueDiversityIndex.toFixed(2)), suffix: '', importance: 5, higherIsBetter: true },
        //{ label: '복합 연평균 성장률 (CAGR)', value: parseFloat((CAGR * 100).toFixed(2)), suffix: '%', importance: 7, higherIsBetter: true },
        //{ label: '팬당 가치 평균', value: parseFloat(valuePerFanAvg.toFixed(2)), suffix: '₩', importance: 5, higherIsBetter: true },
        //{ label: '팬당 가치 (현재)', value: parseFloat(valuePerFan.toFixed(2)), suffix: '₩', importance: 6, higherIsBetter: true },
        
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
    const fixedKPIs = useMemo(() => allKPIs.slice(0, 6), [allKPIs]);
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
                        <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 border-b border-b-gray-200">
                            <h4 className="text-[var(--primary)] text-sm">
                                {kpi.label}
                            </h4>
                            <p className="text-sm font-semibold text-right">
                                {kpi.suffix === '₩'
                                    ? `₩${formatNumber(kpi.value)}`
                                    : `${formatNumber(kpi.value)}${kpi.suffix}`}
                            </p>
                        </div>
                        {isExpanded && kpi.label === '예상기대수익 스펙트럼' && (
                            revenueSpectrumChart(totalValueMultiple, expectedAnnualRevenue, expectedRevenueSpectrum.spectrumMin, expectedRevenueSpectrum.spectrumMax)
                        )}
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