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

    const riskLevelData = calculateRiskLevelPercentage(
        goal_fund,
        expectedAnnualRevenue,
        shareRatio,
    );

    const percentage = riskLevelData.differencePercentage;

    // 차트 데이터
    const data = [
        {
            name: 'Risk Level',
            value: percentage,
            fill: '#6366F1', // 모던한 보라색 계열 색상 사용
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
            riskText: '초저위험',
            description: '수익이 보장됩니다. 안정적인 수익 창출이 예상되며, 시장 변동에 대한 민감도가 낮습니다.',
        },
        {
            min: 20,
            max: 40,
            borderColor: 'border-green-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-600',
            icon: <FaCheckCircle className="text-4xl text-[var(--text-reverse)]" />,
            riskText: '저위험',
            description: '수익이 어느 정도 보장됩니다. 수익이 꾸준히 발생할 가능성이 높으며, 리스크 요인이 제한적입니다.',
        },
        {
            min: 40,
            max: 60,
            borderColor: 'border-yellow-500',
            textColor: 'text-yellow-600',
            bgColor: 'bg-yellow-600',
            icon: <FaExclamationTriangle className="text-4xl text-[var(--text-reverse)]" />,
            riskText: '중위험',
            description: '수용적인 자세가 요구됩니다. 시장 상황과 내부 요인에 따라 수익 변동성이 존재합니다.',
        },
        {
            min: 60,
            max: 80,
            borderColor: 'border-orange-500',
            textColor: 'text-orange-600',
            bgColor: 'bg-orange-600',
            icon: <FaExclamationTriangle className="text-4xl text-[var(--text-reverse)]" />,
            riskText: '고위험',
            description: '주의가 필요합니다. 수익 변동성이 크며, 외부 요인에 민감하게 반응할 수 있습니다.',
        },
        {
            min: 80,
            max: 101,
            borderColor: 'border-red-500',
            textColor: 'text-red-600',
            bgColor: 'bg-red-600',
            icon: <FaTimesCircle className="text-4xl text-[var(--text-reverse)]" />,
            riskText: '초고위험',
            description: '신중한 투자 결정이 필요합니다. 예상치 못한 변동으로 인해 투자 원금 손실 가능성이 높습니다.',
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
                        stroke="#374151" // 중립적인 어두운 색상 사용
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
                                        <RadialBar
                                            background={{ fill: '#F1F1F1' }} // 연한 회색 배경
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
                            <h2 className="text-base font-bold tracking-wide">
                                {currentRiskLevel.riskText}
                            </h2>
                        </div>
                        {/* 상품 분류 텍스트 */}
                        <p className={`text-sm font-semibold mt-4 text-center text-[var(--text-primary)]`}>
                            {currentRiskLevel.riskText} 상품
                        </p>
                    </div>
                </div>
                {/* 설명 텍스트 */}
                <p className={`text-xs mt-2 text-center text-[var(--text-primary)] mb-5 px-6`}>
                    {currentRiskLevel.description}
                </p>
            </div>
            {/* 참고 사항 섹션 */}
            <div className='bg-gray-100 rounded-md p-2 m-3'>
                <h2 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
                    <FaInfoCircle className="text-gray-400 mr-2" />
                    참고 사항
                </h2>
                <p className="text-[var(--text-third)] text-[10px]">
                    본 자료는 투자에 대한 조언이 아니며, 투자 결정은 투자자 본인의 판단에 따라 이루어져야 합니다.
                    위험도는 시장 상황 및 기타 요인에 따라 변동될 수 있으며, 투자 전 반드시 신중한 검토와 전문가의 조언을 구하시기 바랍니다.
                </p>
            </div>
            {/* 추가된 버튼 */}
            <div className="flex justify-end mt-2 space-x-2 w-11/12 mx-auto">
                <button className="text-xs text-[var(--text-third)] underline" onClick={togglePopup}>산정 기준</button>
                <button className="text-xs text-[var(--text-third)] underline">투자 위험 안내</button>
            </div>
            {/* 팝업 */}
            {isPopupOpen && (
                <CriteriaPopup isOpen={isPopupOpen} onClose={togglePopup} />
            )}
        </div>
    );
};

export default RiskLevel;