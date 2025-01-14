'use client';

import React, { useEffect, useState } from 'react';
import { useReport, useKPI } from '../../../context/GlobalData';
import {
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
    ResponsiveContainer,
} from 'recharts';
import {
    FaInfoCircle,
} from 'react-icons/fa';
import { calculateRiskLevelPercentage } from '../../processors/riskLevel';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import CriteriaPopup from './RiskLevel.Criteria';

import { useParams } from "next/navigation";
import { translations } from '../../../lib/translations';

const RiskLevel = () => {
    const { locale } = useParams(); 
    const t = translations[locale] || translations.en;

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
    const riskTextSurffix = {
        'en': 'Risk',
        'ko': '상품',
    }
    const riskLevels = [
        {
          min: 0,
          max: 20,
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          icon: <FaCheckCircle className="text-blue-600 text-xl" />,
          riskText: {
            en: 'Ultra-Low Risk',
            ko: '초저위험',
          },
          description: {
            en: 'An extremely stable investment with minimal risk.',
            ko: '매우 안정적인 투자이며, 위험이 극도로 낮습니다.',
          },
          qualitative: {
            en: 'Expected to generate stable returns with very low sensitivity to market fluctuations.',
            ko: '시장 변동에 대한 민감도가 매우 낮아, 안정적인 수익을 기대할 수 있습니다.',
          },
        },
        {
          min: 20,
          max: 40,
          color: 'bg-green-500',
          textColor: 'text-green-600',
          icon: <FaCheckCircle />,
          riskText: {
            en: 'Low Risk',
            ko: '저위험',
          },
          description: {
            en: 'A relatively stable investment with low risk.',
            ko: '비교적 안정적이며, 위험이 낮은 투자입니다.',
          },
          qualitative: {
            en: 'Likely to produce steady returns with limited risk factors.',
            ko: '위험 요소가 제한되어 꾸준한 수익을 기대할 수 있습니다.',
          },
        },
        {
          min: 40,
          max: 60,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          icon: <FaExclamationTriangle />,
          riskText: {
            en: 'Moderate Risk',
            ko: '중간 위험',
          },
          description: {
            en: 'An investment with the potential for both profits and losses.',
            ko: '이익과 손실이 모두 발생할 가능성이 있는 투자입니다.',
          },
          qualitative: {
            en: 'Returns may fluctuate based on market conditions and internal factors.',
            ko: '시장 상황과 내부 요인에 따라 수익률이 변동될 수 있습니다.',
          },
        },
        {
          min: 60,
          max: 80,
          color: 'bg-orange-500',
          textColor: 'text-orange-600',
          icon: <FaExclamationTriangle />,
          riskText: {
            en: 'High Risk',
            ko: '고위험',
          },
          description: {
            en: 'A high-risk investment requiring careful consideration.',
            ko: '주의 깊은 검토가 필요한 고위험 투자입니다.',
          },
          qualitative: {
            en: 'Returns can be highly volatile and may be significantly affected by external factors.',
            ko: '수익 변동성이 크고, 외부 요인에 큰 영향을 받을 수 있습니다.',
          },
        },
        {
          min: 80,
          max: 100,
          color: 'bg-red-500',
          textColor: 'text-red-600',
          icon: <FaTimesCircle />,
          riskText: {
            en: 'Ultra-High Risk',
            ko: '초고위험',
          },
          description: {
            en: 'An extremely high-risk investment demanding great caution.',
            ko: '매우 주의가 필요한 극도로 높은 위험의 투자입니다.',
          },
          qualitative: {
            en: 'Unanticipated fluctuations may result in a high likelihood of principal loss.',
            ko: '예상치 못한 변동으로 원금 손실 가능성이 매우 큽니다.',
          },
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
                            className={`flex flex-col items-center mt-2 w-24 h-24 justify-center mx-auto rounded-full text-[var(--text-reverse)] ${currentRiskLevel.color} opacity-85`}
                        >
                            {/* 아이콘 */}
                            <div className="mb-1">{currentRiskLevel.icon}</div>
                            {/* 위험 수준 텍스트 */}
                            <h2 className="text-[0.6rem] font-bold tracking-wide">
                                {currentRiskLevel.riskText[locale]}
                            </h2>
                        </div>
                        {/* 상품 분류 텍스트 */}
                        <p className={`text-sm font-semibold mt-4 text-center text-[var(--text-primary)]`}>
                            {currentRiskLevel.riskText[locale]} {riskTextSurffix[locale]}
                        </p>
                    </div>
                </div>
                {/* 설명 텍스트 */}
                <p className={`text-xs mt-2 text-center text-[var(--text-secondary)] mb-5 px-6`}>
                    {currentRiskLevel.description[locale]}
                </p>
            </div>
            {/* Notes Section */}
            <div className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 m-3 border border-[var(--border-mid)]">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center">
                    <FaInfoCircle className="text-[var(--text-primary)] mr-2" />
                    {t.risk_importantNotice}
                </h2>
                <p className="text-[var(--text-secondary)] text-[10px]">
                    {t.risk_notice}
                </p>
                </div>

                {/* Additional Buttons */}
                <div className="flex justify-end mt-2 space-x-2 w-11/12 mx-auto">
                <button className="text-xs text-[var(--text-third)] underline" onClick={togglePopup}>
                    {t.basisCalculation}
                </button>
            </div>

            {/* Popup */}
            {isPopupOpen && (
            <CriteriaPopup isOpen={isPopupOpen} onClose={togglePopup} percentage={percentage} />
            )}
        </div>
    );
};

export default RiskLevel;