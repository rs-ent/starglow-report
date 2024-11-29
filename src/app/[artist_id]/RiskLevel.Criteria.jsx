'use client';

import React from 'react';
import {
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
} from 'recharts';
import {
    FaCheckCircle,
    FaExclamationTriangle,
    FaTimesCircle,
    FaBuilding,
    FaInfoCircle,
} from 'react-icons/fa';

const CriteriaPage = ({ onClose }) => {
    const riskLevel = {
        percentage: 40,
        text: '중위험',
        description: '리스크 수용 자세가 필요합니다.',
        color: '#FBBF24', // Tailwind CSS의 yellow-500
        icon: <FaExclamationTriangle className="text-yellow-500 text-4xl" />,
    };

    const evaluationFactors = [
        {
            factor: '과거 활동',
            description:
                '소속사가 제공한 과거 활동 데이터를 기반으로 아티스트의 성과 및 성장 추이를 심층 분석하여, 향후 수익 창출 능력을 평가합니다.'
        },
        {
            factor: '시장 동향',
            description:
                '해당 아티스트의 시장 내 위치와 성장 가능성을 분석하여, 향후 수익 창출 능력을 평가합니다.',
        },
        {
            factor: '활동 지표',
            description:
                '최근 활동 빈도와 팬들과의 소통 수준을 고려하여, 아티스트의 현재 인기와 지속 가능성을 평가합니다.',
        },
        {
            factor: '팬덤 규모',
            description:
                '팬카페 회원 수, SNS 팔로워 수 등 팬덤의 크기를 분석하여, 수익의 안정성과 성장 가능성을 예측합니다.',
        },
        {
            factor: '수익 다양성',
            description:
                '음원, 공연, 굿즈 등 다양한 수익원의 존재 여부를 확인하여, 수익 구조의 안정성을 평가합니다.',
        },
    ];

    // 위험 등급 데이터
    const riskLevels = [
        {
            min: 0,
            max: 20,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            icon: <FaCheckCircle className="text-blue-600 text-xl" />,
            riskText: '초저위험',
            description: '위험이 매우 낮은 안정적인 투자입니다.',
            qualitative: '안정적인 수익 창출이 예상되며, 시장 변동에 대한 민감도가 낮습니다.',
        },
        {
            min: 20,
            max: 40,
            color: 'bg-green-500',
            textColor: 'text-green-600',
            icon: <FaCheckCircle className="text-green-600 text-xl" />,
            riskText: '저위험',
            description: '위험이 낮아 비교적 안정적인 투자입니다.',
            qualitative: '수익이 꾸준히 발생할 가능성이 높으며, 리스크 요인이 제한적입니다.',
        },
        {
            min: 40,
            max: 60,
            color: 'bg-yellow-500',
            textColor: 'text-yellow-600',
            icon: <FaExclamationTriangle className="text-yellow-600 text-xl" />,
            riskText: '중위험',
            description: '수익과 손실의 가능성이 모두 있는 투자입니다.',
            qualitative: '시장 상황과 내부 요인에 따라 수익 변동성이 존재합니다.',
        },
        {
            min: 60,
            max: 80,
            color: 'bg-orange-500',
            textColor: 'text-orange-600',
            icon: <FaExclamationTriangle className="text-orange-600 text-xl" />,
            riskText: '고위험',
            description: '손실 위험이 높아 신중한 접근이 필요합니다.',
            qualitative: '수익 변동성이 크며, 외부 요인에 민감하게 반응할 수 있습니다.',
        },
        {
            min: 80,
            max: 100,
            color: 'bg-red-500',
            textColor: 'text-red-600',
            icon: <FaTimesCircle className="text-red-600 text-xl" />,
            riskText: '초고위험',
            description: '손실 가능성이 매우 높아 매우 신중한 투자가 필요합니다.',
            qualitative: '예상치 못한 변동으로 인해 투자 원금 손실 가능성이 높습니다.',
        },
    ];

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* 배경 블러 효과 */}
            <div
                className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            {/* 팝업 컨테이너 */}
            <div className="relative bg-white rounded-lg p-4 w-[90%] max-w-[480px] max-h-[90%] overflow-y-auto transition-transform duration-300 ease-in-out transform scale-100">
                {/* 닫기 버튼 */}
                <button
                    className="absolute top-4 right-4 rounded-lg bg-[var(--primary)] text-[var(--text-reverse)] text-sm px-3 py-1"
                    onClick={onClose}
                    aria-label="팝업 닫기"
                >
                    닫기
                </button>

                {/* 헤더 섹션 */}
                <header className="mb-6">
                    <h1 className="text-xl font-bold mb-2 flex items-center">
                        <FaInfoCircle className="text-blue-500 mr-2" />
                        위험도 산정 기준
                    </h1>
                    <p className="text-gray-700 text-xs">
                        당사는 전문적인 데이터 분석을 통해 투자 위험도를 제공합니다.
                    </p>
                </header>

                {/* 투자 위험도 섹션 */}
                <section className="mb-6 bg-[var(--background-brushed)] rounded-md p-2.5">
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                        <FaExclamationTriangle className="text-red-500 mr-2" />
                        투자 위험도
                    </h2>
                    <p className="text-gray-700 text-xs mb-2">
                        투자 위험도는 펀딩 후 예상되는 추정 수익과 목표 모집 금액 간의 관계를 기반으로 산정됩니다.
                        이는 투자자가 목표한 수익을 달성할 가능성을 평가하는 지표로 활용됩니다.
                    </p>
                    <div className="bg-gray-200 p-2 rounded-sm mb-2">
                        <p className="font-mono text-xs">
                            위험도 = |미래 추정 수익 - 목표 금액| ÷ 목표 금액
                        </p>
                    </div>
                    <p className="text-gray-700 text-xs mb-2">
                        위 공식에서,
                    </p>
                    <ul className="list-disc list-inside mb-2 text-xs">
                        <li>
                            <strong>펀딩 후 추정 수익</strong>: 펀딩을 통해 조달된 자금을 기반으로 예상되는 수익입니다.
                        </li>
                        <li>
                            <strong>목표 금액</strong>: 펀딩을 통해 조달할 자금이자 투자 수익의 최소 목표치입니다.
                        </li>
                    </ul>
                    <p className="text-gray-700 text-xs">
                        이 공식은 예상 수익이 목표 금액과 얼마나 차이가 있는지를 백분율로 나타냅니다.
                        위험도 값이 높을수록 목표 수익 달성에 어려움이 있을 수 있음을 의미합니다.
                    </p>
                    <p className="text-gray-700 text-xs">
                        이 공식은 투자 리스크를 직관적으로 파악할 수 있도록 설계되었습니다.
                        그러나 단순한 수치 비교로는 반영되지 않는 다양한 요인들이 존재하므로,
                        당사의 고유한 평가 모델을 통해 추가적인 조정을 거쳐 최종적인 위험 등급을 산출합니다.
                        이러한 조정은 시장 상황, 아티스트의 잠재력, 팬덤의 참여도 등 정성적 요소를 포함합니다.
                    </p>
                    <div className="flex items-center mt-4">
                        <div style={{ width: 100, height: 100 }}>
                            <ResponsiveContainer>
                                <RadialBarChart
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="80%"
                                    outerRadius="100%"
                                    startAngle={180}
                                    endAngle={0}
                                    barSize={10}
                                    data={[
                                        { name: 'Risk Level', value: riskLevel.percentage },
                                    ]}
                                >
                                    <RadialBar
                                        minAngle={15}
                                        background
                                        clockWise
                                        dataKey="value"
                                        fill={riskLevel.color}
                                    />
                                    <PolarAngleAxis
                                        type="number"
                                        domain={[0, 100]}
                                        tick={false}
                                        axisLine={false}
                                    />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="ml-4">
                            {riskLevel.icon}
                            <h3 className="text-base font-bold mt-1">{riskLevel.text}</h3>
                            <p className="text-gray-700 text-xs mt-1">{riskLevel.description}</p>
                        </div>
                    </div>
                    <p className="text-gray-700 text-xs mt-2">
                        현재 위험 수준은 위와 같으며, 이는 투자 결정 시 중요한 참고 자료로 활용될 수 있습니다.
                    </p>
                </section>

                {/* 평가 기준 섹션 */}
                <section className="mb-6 bg-[var(--background-brushed)] rounded-md p-2.5">
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                        <FaBuilding className="text-indigo-500 mr-2" />
                        평가 기준
                    </h2>
                    <p className="text-gray-700 text-xs mb-2">
                        당사는 다양한 핵심 지표들을 활용하여 종합적인 평가를 수행합니다.
                        아래는 주요 평가 요소와 그 설명입니다:
                    </p>
                    <table className="min-w-full bg-white text-xs">
                        <thead>
                            <tr>
                                <th className="py-1 px-2 bg-gray-100 text-left text-gray-600 font-bold uppercase">
                                    평가 요소
                                </th>
                                <th className="py-1 px-2 bg-gray-100 text-left text-gray-600 font-bold uppercase">
                                    상세 설명
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {evaluationFactors.map((factor, index) => (
                                <tr key={index} className="border-b">
                                    <td className="py-1 px-2">{factor.factor}</td>
                                    <td className="py-1 px-2">{factor.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="text-gray-700 text-xs mt-2">
                        이러한 평가 요소들은 정량적 데이터와 정성적 분석을 결합하여 투자 위험도를 보다 정확하게 산정하는 데 활용됩니다.
                        각 요소는 투자 수익에 직간접적으로 영향을 미치며, 종합적인 판단을 위해 필수적으로 고려됩니다.
                    </p>
                </section>

                {/* 위험 등급 표 섹션 */}
                <section className="mb-6 bg-[var(--background-brushed)] rounded-md p-2.5">
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                        <FaInfoCircle className="text-blue-500 mr-2" />
                        위험 등급 상세 설명
                    </h2>
                    <p className="text-gray-700 text-xs mb-2">
                        아래 표는 각 위험 등급에 대한 상세한 설명과 산정 기준을 모호하게 정성적으로 나타냅니다.
                        이를 통해 투자자는 각 등급이 의미하는 바를 직관적으로 이해할 수 있습니다.
                    </p>
                    <table className="min-w-full bg-white text-xs">
                        <thead>
                            <tr>
                                <th className="py-1 px-2 bg-gray-100 text-left text-gray-600 font-bold">
                                    등급
                                </th>
                                <th className="py-1 px-2 bg-gray-100 text-left text-gray-600 font-bold">
                                    위험도 (%)
                                </th>
                                <th className="py-1 px-2 bg-gray-100 text-left text-gray-600 font-bold">
                                    설명
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {riskLevels.map((level, index) => (
                                <tr key={index} className="border-b">
                                    <td className="py-2 px-2 flex items-center">
                                        <div
                                            className={`w-4 h-4 mr-2 rounded-full ${level.color}`}
                                        ></div>
                                        <span className={`${level.textColor} font-semibold`}>
                                            {level.riskText}
                                        </span>
                                    </td>
                                    <td className="py-2 px-2">
                                        {level.min}% - {level.max}%
                                    </td>
                                    <td className="py-2 px-2">{level.qualitative}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* 참고 사항 섹션 */}
                <section className='bg-[var(--background-brushed)] rounded-md p-2.5'>
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                        <FaInfoCircle className="text-gray-500 mr-2" />
                        참고 사항
                    </h2>
                    <p className="text-gray-700 text-xs">
                        본 자료는 투자에 대한 조언이 아니며, 투자 결정은 투자자 본인의 판단에 따라 이루어져야 합니다.
                        추정 수익과 위험도는 시장 상황 및 기타 요인에 따라 변동될 수 있으며,
                        당사는 이에 대한 책임을 지지 않습니다. 투자 전 반드시 신중한 검토와 전문가의 조언을 구하시기 바랍니다.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default CriteriaPage;