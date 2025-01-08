'use client';

import React, { useEffect, useState } from 'react';
import { useReport, useKPI } from '../../context/GlobalData';
import {
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
    ResponsiveContainer,
} from 'recharts';
import {
    FaInfoCircle,
} from 'react-icons/fa';
import { calculateRiskLevelPercentage } from '../processors/riskLevel';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import CriteriaPopup from './RiskLevel.Criteria';

const RiskLevel = () => {
    const report = useReport();
    const kpiData = useKPI();

    const goal_fund = report.goal_fund || 0;
    const shareRatio = report.investors_share_ratio || 1;
    const expectedAnnualRevenue = kpiData.expectedAnnualRevenue || 0;
    const spectrum = kpiData.expectedRevenueSpectrum.spectrum;
    const minRevenue = kpiData.minRevenue;

    const riskLevelData = calculateRiskLevelPercentage(
        goal_fund,
        shareRatio,
        minRevenue,
        spectrum,
    );

    const percentage = riskLevelData.differencePercentage;

    // 차트 데이터
    const data = [
        {
            name: 'Risk Level',
            value: percentage,
        },
    ];

    // 바늘 상태 관리
    const [needleAngle, setNeedleAngle] = useState(-90); // 초기 각도 (0%)

    useEffect(() => {
        const targetAngle = (percentage / 100) * 180 - 90; // 목표 각도
        const animationDuration = 2000; // 애니메이션 지속 시간 (밀리초)
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1); // 진행률 (0 ~ 1)
            const currentAngle = -90 + progress * (targetAngle + 90); // 보간
            setNeedleAngle(currentAngle);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [percentage]);

    // 5단계 위험 수준 정의
    const riskLevels = [
        {
          min: 0,
          max: 20,
          borderColor: 'border-blue-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-600',
          icon: <FaCheckCircle className="text-4xl text-[var(--text-reverse)]" />,
          riskText: 'Ultra-Low Risk',
          description:
            'Profits are virtually guaranteed. Expected to generate stable returns with minimal sensitivity to market fluctuations.',
        },
        {
          min: 20,
          max: 40,
          borderColor: 'border-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-600',
          icon: <FaCheckCircle className="text-4xl text-[var(--text-reverse)]" />,
          riskText: 'Low',
          description:
            'Profits are somewhat secured. Likely to produce steady returns, with limited risk factors.',
        },
        {
          min: 40,
          max: 60,
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-600',
          icon: <FaExclamationTriangle className="text-4xl text-[var(--text-reverse)]" />,
          riskText: 'Moderate',
          description:
            'Requires a reasonable acceptance of risk. Returns may fluctuate based on market conditions and internal factors.',
        },
        {
          min: 60,
          max: 80,
          borderColor: 'border-orange-500',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-600',
          icon: <FaExclamationTriangle className="text-4xl text-[var(--text-reverse)]" />,
          riskText: 'High',
          description:
            'Caution is advised. Returns can be highly volatile and sensitive to external influences.',
        },
        {
          min: 80,
          max: 101,
          borderColor: 'border-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-600',
          icon: <FaTimesCircle className="text-4xl text-[var(--text-reverse)]" />,
          riskText: 'Ultra-High',
          description:
            'Requires prudent investment decisions. Unforeseen fluctuations may lead to a high potential for principal loss.',
        },
    ];

    // 현재 위험 수준 찾기
    const currentRiskLevel =
        riskLevels.find(
            (level) => percentage >= level.min && percentage < level.max
        ) || riskLevels[riskLevels.length - 1];

    // 커스텀 바늘 렌더링
    const renderNeedle = () => {
        const cx = 50; // 중심 X (%)
        const cy = 50; // 중심 Y (%)
        const radius = 40; // 반지름 (%)

        return (
            <g>
                {/* 바늘 */}
                <g
                    style={{
                        transform: `rotate(${needleAngle}deg)`,
                        transformOrigin: '50% 50%',
                    }}
                >
                    <line
                        x1={`${cx}%`}
                        y1={`${cy}%`}
                        x2={`${cx}%`}
                        y2={`${cy - radius}%`}
                        stroke="rgba(255,255,255,0.7)" // 중립적인 어두운 색상 사용
                        strokeWidth="2"
                    />
                    <circle cx={`${cx}%`} cy={`${cy}%`} r="2%" fill="#374151" />
                </g>
            </g>
        );
    };

    // 팝업 상태 관리
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    return (
        <div className="mx-auto overflow-hidden">
            <div className="mx-auto border-b border-b-[var(--background-muted)]">
                <div className='grid grid-cols-2 py-6'>
                    <div>
                        {/* 차트 */}
                        <div className="px-7" style={{ width: '100%', height: '115px', overflow: 'hidden'}}>
                            <div>
                                <ResponsiveContainer width="100%" aspect={1}>
                                    <RadialBarChart
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="70%"
                                        outerRadius="100%"
                                        startAngle={180}
                                        endAngle={0}
                                        data={data}
                                    >
                                        {/* 그라디언트 */}
                                        <defs>
                                            <radialGradient
                                            id="gradientRiskLevel"
                                            cx="50%"   // 중심점 X
                                            cy="50%"   // 중심점 Y
                                            r="50%"    // 반지름
                                            fx="50%"   // 초점 X
                                            fy="50%"   // 초점 Y
                                            >
                                            <stop offset="0%" stopColor="rgba(178, 65, 261, 0.8)" />
                                            <stop offset="100%" stopColor="rgba(178, 65, 251, 0.3)" />
                                            </radialGradient>
                                        </defs>
                                        <RadialBar
                                            background={{ fill: 'rgba(255, 255, 255, 0.15)' }}
                                            fill="url(#gradientRiskLevel)"
                                            dataKey="value"
                                            cornerRadius={3}
                                            clockWise
                                        />
                                        <PolarAngleAxis
                                            type="number"
                                            domain={[0, 100]}
                                            tick={false}
                                            axisLine={false}
                                        />
                                        {renderNeedle()}
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 퍼센트 표시 */}
                        <div className="text-center mb-1">
                            <span className="text-lg font-extrabold text-[var(--text-primary)]">
                                {`${percentage.toFixed(1)}%`}
                            </span>
                        </div>
                    </div>
                    <div className=' w-11/12 mx-auto'>
                        {/* 위험 수준 표시 */}
                        <div
                            className={`flex flex-col items-center mt-2 w-24 h-24 justify-center mx-auto rounded-full text-[var(--text-reverse)] ${currentRiskLevel.bgColor}`}
                        >
                            {/* 아이콘 */}
                            <div className="mb-1">{currentRiskLevel.icon}</div>
                            {/* 위험 수준 텍스트 */}
                            <h2 className="text-[0.6rem] font-bold tracking-wide">
                                {currentRiskLevel.riskText}
                            </h2>
                        </div>
                        {/* 상품 분류 텍스트 */}
                        <p className={`text-sm font-semibold mt-4 text-center text-[var(--text-primary)]`}>
                            {currentRiskLevel.riskText} Risk
                        </p>
                    </div>
                </div>
                {/* 설명 텍스트 */}
                <p className={`text-xs mt-2 text-center text-[var(--text-primary)] mb-5 px-6`}>
                    {currentRiskLevel.description}
                </p>
            </div>
            {/* Notes Section */}
            <div className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 m-3 border border-[var(--border-mid)]">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center">
                    <FaInfoCircle className="text-[var(--text-primary)] mr-2" />
                    Important Notice
                </h2>
                <p className="text-[var(--text-secondary)] text-[10px]">
                    This material is not intended as investment advice, and any investment decision should be made at the investor’s own discretion.
                    Risk levels may vary depending on market conditions and other factors; please conduct thorough research and seek
                    professional guidance before investing.
                </p>
                </div>

                {/* Additional Buttons */}
                <div className="flex justify-end mt-2 space-x-2 w-11/12 mx-auto">
                <button className="text-xs text-[var(--text-third)] underline" onClick={togglePopup}>
                    Basis for Calculation
                </button>
            </div>

            {/* Popup */}
            {isPopupOpen && (
            <CriteriaPopup isOpen={isPopupOpen} onClose={togglePopup} />
            )}
        </div>
    );
};

export default RiskLevel;