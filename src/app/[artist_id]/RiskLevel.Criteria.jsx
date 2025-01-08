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

import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

const CriteriaPage = ({ onClose }) => {
    const riskLevel = {
        percentage: 40,
        text: 'Moderate Risk',
        description: 'Requires an acceptance of potential risk.',
        color: '#FBBF24', // Tailwind CSS yellow-500
        icon: <FaExclamationTriangle className="text-yellow-500 text-sm" />,
    };

    const evaluationFactors = [
        {
            factor: 'Past Activities',
            description:
                'Using historical data provided by the agency, we conduct an in-depth analysis of the artist’s performance and growth trends to assess their revenue-generating potential.',
        },
        {
            factor: 'Market Trends',
            description:
                'We evaluate the artist’s position and growth prospects within the industry to estimate future revenue possibilities.',
        },
        {
            factor: 'Activity Indicators',
            description:
                'We take into account the frequency of recent activities and fan interactions to gauge the artist’s current popularity and sustainability.',
        },
        {
            factor: 'Fan Base Size',
            description:
                'We analyze factors such as fan club membership and social media followers to predict revenue stability and growth potential.',
        },
        {
            factor: 'Revenue Diversification',
            description:
                'We verify the presence of multiple revenue sources—such as music releases, concerts, and merchandise—to assess the stability of the artist’s revenue structure.',
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
            riskText: 'Ultra-Low Risk',
            description: 'An extremely stable investment with minimal risk.',
            qualitative:
                'Expected to generate stable returns with very low sensitivity to market fluctuations.',
        },
        {
            min: 20,
            max: 40,
            color: 'bg-green-500',
            textColor: 'text-green-600',
            icon: <FaCheckCircle className="text-green-600 text-xl" />,
            riskText: 'Low Risk',
            description: 'A relatively stable investment with low risk.',
            qualitative:
                'Likely to produce steady returns with limited risk factors.',
        },
        {
            min: 40,
            max: 60,
            color: 'bg-yellow-500',
            textColor: 'text-yellow-600',
            icon: <FaExclamationTriangle className="text-yellow-600 text-xl" />,
            riskText: 'Moderate Risk',
            description: 'An investment with the potential for both profits and losses.',
            qualitative:
                'Returns may fluctuate based on market conditions and internal factors.',
        },
        {
            min: 60,
            max: 80,
            color: 'bg-orange-500',
            textColor: 'text-orange-600',
            icon: <FaExclamationTriangle className="text-orange-600 text-xl" />,
            riskText: 'High Risk',
            description: 'A high-risk investment requiring careful consideration.',
            qualitative:
                'Returns can be highly volatile and may be significantly affected by external factors.',
        },
        {
            min: 80,
            max: 100,
            color: 'bg-red-500',
            textColor: 'text-red-600',
            icon: <FaTimesCircle className="text-red-600 text-xl" />,
            riskText: 'Ultra-High Risk',
            description: 'An extremely high-risk investment demanding great caution.',
            qualitative:
                'Unanticipated fluctuations may result in a high likelihood of principal loss.',
        },
    ];

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* 배경 블러 효과 */}
            <div
                className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-lg"
                onClick={onClose}
            ></div>
            {/* 팝업 컨테이너 */}
            <div className="relative bg-[rgba(8,2,20,0.95)] rounded-lg w-[90%] max-w-[480px] max-h-[88%] overflow-y-scroll transition-transform duration-300 ease-in-out transform scale-100">
                {/* 닫기 버튼 */}
                <button
                    className="sticky top-0 w-full bg-[rgba(255,255,255,0.1)] text-[var(--text-secondary)] text-xs px-3 py-1 backdrop-blur-lg"
                    onClick={onClose}
                    aria-label="팝업 닫기"
                    style={{
                        fontFamily : 'Conthrax'
                    }}
                >
                    Close
                </button>
                
                <div className='p-4'>
                    {/* 헤더 섹션 */}
                    <header className="mt-6 mb-6">
                        <h1 className="text-lg font-bold mb-2 flex items-center">
                            <FaInfoCircle className="text-[var(--primary)] mr-2" />
                            Risk Assessment Criteria
                        </h1>
                        <p className="text-[var(--text-third)] text-xs">
                            We provide investment risk assessments based on professional data analysis.
                        </p>
                    </header>

                    {/* 투자 위험도 섹션 */}
                    <section className="mb-6 bg-[var(--background-brushed)] rounded-md p-2.5">
                        <h2 className="text-base font-semibold mb-2 flex items-center">
                            <FaExclamationTriangle className="text-red-500 mr-2" />
                            Investment Risk
                        </h2>
                        <p className="text-[var(--text-secondary)] text-xs mb-2">
                            Our calculation of investment risk is based on the relationship 
                            between estimated revenue after funding and the target fundraising amount. 
                            This serves as an indicator for the likelihood of achieving 
                            the investor’s desired returns.
                        </p>
                        <div 
                            className="bg-[rgba(255,255,255,0.2)] p-1 rounded-sm my-4 mx-2"
                            style={{ overflowX: "auto" }}
                        >
                            <div style={{ 
                                    transform: "scale(0.6)", 
                                    transformOrigin: "left",
                                }}>
                            <BlockMath>
                                {'\\text{Risk} = \\frac{\\left| \\text{Target Amount} - \\text{Minimum Estimated Revenue} \\right|}{\\text{Target Amount}} + \\text{Volatility Index}'}
                            </BlockMath>
                            </div>
                        </div>
                        <h4 className="text-[var(--text-secondary)] text-xs mt-4 mb-2">
                            In this formula:
                        </h4>
                        <ul className="list-disc list-inside mb-4 text-xs text-[var(--text-secondary)]">
                            <li>
                                <strong>Minimum Estimated Revenue</strong>: The lowest projected revenue, estimated using data from the agency.
                            </li>
                            <li>
                                <strong>Target Amount (Break-Even Point)</strong>: The minimum financial goal to be raised through funding, representing the baseline for potential returns.
                            </li>
                        </ul>
                        <p className="text-[var(--text-secondary)] text-xs mb-3">
                            Essentially, this formula calculates the percentage difference between 
                            the minimum estimated revenue and the target amount. 
                            A higher risk value indicates greater difficulty in meeting the target returns.
                        </p>
                        <p className="text-[var(--text-secondary)] text-xs">
                            While this formula offers an intuitive measure of investment risk, there are various 
                            qualitative factors that simple numerical comparisons can’t capture. 
                            Therefore, we use our unique evaluation model to apply additional adjustments 
                            before determining the final risk rating. These adjustments include market conditions, 
                            the artist’s potential, fan engagement levels, and other qualitative elements.
                        </p>
                        <div className="flex items-start mt-8 justify-start">
                            <div style={{ width: 90, height: 70 }}>
                                <ResponsiveContainer>
                                    <RadialBarChart
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="70%"
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
                            <div className="ml-4 mt-1">
                                <div className='flex'>
                                <div className="mr-1 mt-1">{riskLevel.icon}</div>
                                <h3 className="text-xs font-bold mt-1">{riskLevel.text}</h3>
                                </div>
                                <p className="text-[0.6rem] mt-0.5">{riskLevel.description}</p>
                            </div>
                        </div>
                        <p className="text-[var(--text-secondary)] text-xs mt-2">
                            The current risk level is as shown above. It can serve as a key reference 
                            when making investment decisions.
                        </p>
                    </section>

                    {/* 평가 기준 섹션 */}
                    <section className="mb-6 bg-[var(--background-brushed)] rounded-md p-2.5">
                        <h2 className="text-base font-semibold mb-2 flex items-center">
                            <FaBuilding className="text-indigo-500 mr-2" />
                            Evaluation Criteria
                        </h2>
                        <p className="text-[var(--text-secondary)] text-xs mb-2">
                            We conduct comprehensive assessments by leveraging various key indicators. 
                            Below are the main evaluation factors and their descriptions:
                        </p>
                        <table className="min-w-full bg-[rgba(255,255,255,0.1)] text-xs my-6">
                            <thead>
                                <tr>
                                    <th className="py-1 px-2 bg-[rgba(255,255,255,0.2)] text-left text-[var(--text-primary)] font-bold uppercase">
                                        Factor
                                    </th>
                                    <th className="py-1 px-2 bg-[rgba(255,255,255,0.2)] text-left text-[var(--text-primary)] font-bold uppercase">
                                        Description
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {evaluationFactors.map((factor, index) => (
                                    <tr key={index} className="border-b border-b-[rgba(255,255,255,0.25)]">
                                        <td className="py-1 px-2">{factor.factor}</td>
                                        <td className="py-1 px-2 text-[0.6rem]">{factor.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-[var(--text-secondary)] text-xs mt-2">
                            We combine quantitative data and qualitative analysis for a more accurate 
                            determination of the investment risk level. Each factor directly or indirectly 
                            affects potential returns, and all are considered crucial to forming a well-rounded judgment.
                        </p>
                    </section>

                    {/* 위험 등급 표 섹션 */}
                    <section className="mb-6 bg-[var(--background-brushed)] rounded-md p-2.5">
                        <h2 className="text-base font-semibold mb-2 flex items-center">
                            <FaInfoCircle className="text-blue-500 mr-2" />
                            Detailed Risk Levels
                        </h2>
                        <p className="text-[var(--text-secondary)] text-xs mb-2">
                            The table below provides detailed descriptions of each risk level and 
                            qualitative criteria. Through this, investors can intuitively understand 
                            the implications of each level.
                        </p>
                        <table className="min-w-full bg-[rgba(255,255,255,0.1)] text-xs my-6">
                            <thead>
                                <tr>
                                    <th
                                        className="py-1 px-2 bg-[rgba(255,255,255,0.2)] text-left text-[var(--text-primary)] font-bold uppercase"
                                        style={{ width: '30%' }}
                                    >
                                        Level
                                    </th>
                                    <th
                                        className="py-1 px-2 bg-[rgba(255,255,255,0.2)] text-left text-[var(--text-primary)] font-bold uppercase"
                                        style={{ width: '20%' }}
                                    >
                                        Risk (%)
                                    </th>
                                    <th className="py-1 px-2 bg-[rgba(255,255,255,0.2)] text-left text-[var(--text-primary)] font-bold uppercase">
                                        Description
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {riskLevels.map((level, index) => (
                                    <tr key={index} className="border-b border-b-[rgba(255,255,255,0.25)] justify-center items-center">
                                        <td className="py-2 px-2 items-center">
                                            <div className='flex'>
                                                <div
                                                    className={`w-4 h-4 mr-1 rounded-full ${level.color}`}
                                                ></div>
                                                <span className={`${level.textColor} font-semibold text-[0.7rem]`}>
                                                    {level.riskText.replace(' Risk', '')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-2 text-[0.7rem]">
                                            {level.min}-{level.max}%
                                        </td>
                                        <td className="py-2 px-2 text-[0.6rem]">{level.qualitative}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* 참고 사항 섹션 */}
                    <section className="bg-[var(--background-brushed)] rounded-md p-2.5">
                        <h2 className="text-base font-semibold mb-2 flex items-center">
                            <FaInfoCircle className="text-gray-500 mr-2" />
                            Important Notice
                        </h2>
                        <p className="text-[var(--text-secondary)] text-xs mb-2">
                            This material is not intended as investment advice; 
                            any investment decision should be made at the sole discretion of the investor. 
                        </p>

                        <p className="text-[var(--text-secondary)] text-xs mb-2">
                            Estimated returns and risk levels may vary according to market conditions 
                            and other factors, and we bear no responsibility for these variations. 
                            Please conduct thorough research and consult with professionals before investing.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CriteriaPage;