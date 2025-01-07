'use client';

import React from 'react';
import { useReport, useKPI } from '../../context/GlobalData';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Area,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend,
} from 'recharts';
import { formatNumber } from '../utils/formatNumber';
import { useRoadmap } from '../../context/GlobalData';

const RoadMap = () => {
    const report = useReport();
    const roadmap = useRoadmap();
    const kpiData = useKPI();

    const investorsBEPRevenue = report.goal_fund;
    const investorsShareRatio = report.investors_share_ratio;
    const bep = investorsBEPRevenue / investorsShareRatio;
    const avgRevenue = kpiData.expectedAnnualRevenue;
    const minRevenue = kpiData.minRevenue;
    const maxRevenue = kpiData.maxRevenue;
    
    const investorsAvgRevenue = avgRevenue * investorsShareRatio;
    const investorsMaxRevenue = maxRevenue * investorsShareRatio;
    const investorsMinRevenue = minRevenue * investorsShareRatio;

    const defaultData = [
        {
          label: "Music/Album Release",
          value: "Full-length and Remake Albums",
          spend: "600,000,000",
        },
        {
          label: "Concert/Event Planning",
          value: "Concerts/Tours/Fan Meetings, etc.",
          spend: "550,000,000",
        },
        {
          label: "Content Planning and Production",
          value: "YouTube and Other Media Content",
          spend: "142,000,000",
        },
        {
          label: "Merchandise (MD) Production",
          value: "Photo Cards, Keychains, etc.",
          spend: "215,000,000",
        },
        {
          label: "Management Activities",
          value: "Film/TV/External Content, etc.",
          spend: "65,000,000",
        },
        {
          label: "Promotion/Marketing",
          value: "Distributors/Social Media, etc.",
          spend: "345,000,000",
        },
        {
          label: "Miscellaneous",
          value: "",
          spend: "95,000,000",
        },
    ];

    const data = (roadmap && Array.isArray(roadmap.investments) && roadmap.investments.length > 0)
        ? roadmap.investments
        : defaultData;

    const totalAmount = data.reduce((sum, row) => sum + Number(row.spend.replace(/,/g,'')), 0);

    // PieChart에 사용할 데이터 변환
    const pieChartData = data.map((row) => ({
        label: row.label,
        spend: Number(row.spend.replace(/,/g,'')),
    }))
    .sort((a, b) => {
        if (a.label === "기타") return 1; // "기타"는 항상 마지막으로
        if (b.label === "기타") return -1;
        return b.spend - a.spend; // 나머지는 spend 기준으로 내림차순 정렬
    });

    const COLORS = [
        "#6A23D6", // 어두운 네온 퍼플
        "#C4A708", // 톤다운 아쿠아 블루
        "#F02D65", // 깊이감 있는 핑크 네온
        "#E7D300", // 살짝 어두워진 형광 옐로
        "#3348BB", // 짙은 코발트 블루
        "#099971", // 어둡게 처리한 그린/민트
        "#9E4AAC", // 짙은 보라빛 라일락
    ];
    const InvestmentPieChart = ({ data }) => {
        return (
            <ResponsiveContainer width="100%" height={270}>
                <PieChart>
                    <defs>
                        <filter id="neonShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow
                            dx="0" dy="0" stdDeviation="5"
                            floodColor="#fff" floodOpacity="0.35" 
                        />
                        </filter>
                    </defs>
                    <Pie
                        data={data}
                        dataKey="spend"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        fontSize={9}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        startAngle={90} // 시작 각도를 90도로 설정
                        endAngle={-270}
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth={2}
                    >
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                opacity={0.7}
                                style={{ filter: 'url(#neonShadow)'}}
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        );
    };

    // RevenueChart에 사용할 데이터
    const revenueData = [
        { name: 'Max', Revenue: maxRevenue, Investors: investorsMaxRevenue },
        { name: 'Avg', Revenue: avgRevenue, Investors: investorsAvgRevenue },
        { name: 'Min', Revenue: minRevenue, Investors: investorsMinRevenue },
        { name: 'BEP', Revenue: bep, Investors: investorsBEPRevenue },
    ];

    revenueData.sort((a, b) => b.Investors - a.Investors);

    const PerformanceChart = ({ revenueData }) => {
        // 손익분기점의 Revenue 값
        const breakEvenRevenue = revenueData.find(row => row.name === 'BEP')?.Revenue || 1;

        // y축 퍼센트 계산
        const formattedData = revenueData.map(row => ({
            ...row,
            percentage: ((row.Revenue - breakEvenRevenue) / breakEvenRevenue) * 100, // 손익분기점 대비 퍼센트
        })).sort((a, b) => a.Revenue - b.Revenue);

        return (
            <div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                        data={formattedData}
                        margin={{ top: 20, right: 30, left: -10, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="4 4" stroke="#333" />
                        
                        {/* X축: row.Revenue */}
                        <XAxis
                            dataKey="Revenue"
                            tickFormatter={(value) => `₩${formatNumber(value,'',2)}`}
                            tick={{ fontSize: 9 }}
                        />

                        {/* Y축: 손익분기점 기준 퍼센트 */}
                        <YAxis
                            tickFormatter={(value) => `${value.toFixed(0)}%`}
                            tick={{ fontSize: 9 }}
                        />

                        {/* 손익분기점 기준 0% 라인 */}
                        <ReferenceLine
                            y={0}
                            label={{
                                value: "Break-Even Point (BEP)",
                                position: "insideTop",
                                fontSize: 10,
                                fill: "white",
                            }}
                            stroke="white"
                            strokeDasharray="6 6"
                        />

                        {/* 라인 차트 */}
                        <Line
                            type="monotone"
                            dataKey="percentage"
                            stroke="#9D4EDD"
                            strokeWidth={1}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div>
            {/* 투자 배분 원형 차트 */}
            <section className="mb-1 px-6">
                <h3 className="text-base text-[var(--primary)] py-2">Investment Allocation</h3>
                <InvestmentPieChart data={pieChartData} />
            </section>

            {/* 투자 배분 표 */}
            <section className="px-6">
                <table className="min-w-full border-collapse border border-gray-500 text-center text-xs text-[var(--text-primary)]">
                    <thead>
                        <tr className="bg-gray-800">
                            <th className="py-2 px-4 border border-gray-500 font-bold">Category</th>
                            <th className="py-2 px-4 border border-gray-500 font-bold">Details</th>
                            <th className="py-2 px-4 border border-gray-500 font-bold">Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border border-gray-500 font-medium bg-gray-900">
                                    {row.label}
                                </td>
                                <td className="py-2 px-4 border border-gray-500">
                                    {row.value}
                                </td>
                                <td className="py-2 px-4 border border-gray-500">
                                    {(Number(row.spend.replace(/,/g,'')) / totalAmount * 100).toFixed(0)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* 매출 스펙트럼 및 투자자 수익 표 */}
            <section className="mt-16 px-6">
                <h3 className="text-base text-[var(--primary)] mb-2">Revenue Spectrum & Expected Returns</h3>
                <PerformanceChart revenueData={revenueData} />
                <table className="min-w-full border-collapse border border-gray-500 text-center text-xs text-[var(--text-primary)]">
                    <thead>
                        <tr className="bg-gray-800">
                            <th className="py-2 px-4 border border-gray-500 font-bold" style={{ width: '18%' }}>
                                Revenue Category
                            </th>
                            <th className="py-2 px-4 border border-gray-500 font-bold" style={{ width: '25%' }}>
                                Estimated Revenue
                            </th>
                            <th className="py-2 px-4 border border-gray-500 font-bold" style={{ width: '25%' }}>
                                Returns
                                <br />
                                ({(investorsShareRatio * 100).toFixed(0)}% of Revenue)
                            </th>
                            <th className="py-2 px-4 border border-gray-500 font-bold" style={{ width: '15%' }}>
                                Rate of Return
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {revenueData.map((row, index) => (
                            <tr
                                key={index}
                            >
                                <td className="py-2 px-4 border border-gray-500 font-medium bg-gray-900">
                                    {row.name}
                                </td>
                                <td className="py-2 px-4 border border-gray-500">
                                    ₩{formatNumber(row.Revenue,'',2)}
                                </td>
                                <td className="py-2 px-4 border border-gray-500">
                                    ₩{formatNumber(row.Investors,'',2)}
                                </td>
                                <td className="py-2 px-4 border border-gray-500">
                                    {(((row.Revenue - bep) / bep) * 100).toFixed(0)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default RoadMap;