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
          label: "Music/Album",
          value: "Full-length and Remake Albums",
          spend: "600,000,000",
        },
        {
          label: "Concert/Event",
          value: "Concerts/Tours/Fan Meetings, etc.",
          spend: "550,000,000",
        },
        {
          label: "Contents",
          value: "YouTube and Other Media Content",
          spend: "142,000,000",
        },
        {
          label: "Merchandise (MD)",
          value: "Photo Cards, Keychains, etc.",
          spend: "215,000,000",
        },
        {
          label: "Management",
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

    // 그라데이션 색상쌍 예시 (from -> to)
    const GRADIENT_COLORS = [
        {
          from: 'rgba(106, 35, 214, 0.4)',
          to: 'rgba(187, 134, 252, 0.9)',
        },
        {
          from: 'rgba(9, 153, 113, 0.4)',
          to: 'rgba(0, 255, 198, 0.9)',
        },
        {
          from: 'rgba(240, 45, 101, 0.4)',
          to: 'rgba(255, 109, 175, 0.9)',
        },
        {
          from: 'rgba(51, 72, 187, 0.4)',
          to: 'rgba(111, 134, 232, 0.9)',
        },
        {
          from: 'rgba(158, 74, 172, 0.4)',
          to: 'rgba(200, 119, 219, 0.9)',
        },
        {
          from: 'rgba(196, 167, 8, 0.4)',
          to: 'rgba(241, 215, 109, 0.9)',
        },
        {
          from: 'rgba(231, 211, 0, 0.4)',
          to: 'rgba(255, 245, 48, 0.9)',
        },
    ];
    
    // PieChart 컴포넌트
    function InvestmentPieChart({ data = sampleData }) {
        return (
        <ResponsiveContainer width="100%" height={280}>
            <PieChart>
            <defs>
                {/* 네온 쉐도우 필터 (원하시면 유지) */}
                <filter id="neonShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="5"
                    floodColor="rgb(150,100,255)"
                    floodOpacity="0.25"
                />
                </filter>
    
                {/* 각 파이 조각에 쓰일 그라데이션 정의 */}
                {data.map((entry, index) => {
                const gradientId = `gradientColor-${index}`;
                const colorPair = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                return (
                    <linearGradient
                    key={gradientId}
                    id={gradientId}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                    >
                    <stop offset="0%" stopColor={colorPair.from} />
                    <stop offset="100%" stopColor={colorPair.to} />
                    </linearGradient>
                );
                })}
            </defs>
    
            <Pie
                data={data}
                dataKey="spend"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={90}
                fontSize={9}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                startAngle={90}   // 시작 각도
                endAngle={-270}  // 시계 방향으로 360도
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={0}
                filter="url(#neonShadow)"
            >
                {data.map((entry, index) => {
                const gradientId = `gradientColor-${index}`;
                return (
                    <Cell
                        key={`cell-${index}`}
                        fill={`url(#${gradientId})`}
                        opacity={0.9}
                    />
                );
                })}
            </Pie>
            </PieChart>
        </ResponsiveContainer>
        );
    }

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
                    <defs>
                        <filter id="neonShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow
                            dx="0" dy="0" stdDeviation="5"
                            floodColor="#fff" floodOpacity="0.5"
                            />
                        </filter>
                    </defs>
                    <LineChart
                        data={formattedData}
                        margin={{ top: 20, right: 30, left: -10, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.15)" />
                        
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
                            stroke="rgba(255,255,255,0.7)"
                            strokeDasharray="6 6"
                        />

                        {/* 라인 차트 */}
                        <Line
                            type="monotone"
                            dataKey="percentage"
                            stroke="rgba(188,71,251,0.5)"
                            strokeWidth={2}
                            filter="url(#neonShadow)"
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
                        <tr className="bg-[rgba(255,255,255,0.2)]">
                            <th className="py-2 px-4 border border-gray-500 font-bold">Category</th>
                            <th className="py-2 px-4 border border-gray-500 font-bold">Details</th>
                            <th className="py-2 px-4 border border-gray-500 font-bold">Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border border-gray-500 font-medium bg-[rgba(255,255,255,0.1)]">
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
            <section className="mt-20 px-6">
                <h3 className="text-base text-[var(--primary)] mb-2">Revenue Spectrum & Expected Returns</h3>
                <PerformanceChart revenueData={revenueData} />
                <table className="min-w-full border-collapse border border-gray-500 text-center text-xs text-[var(--text-primary)]">
                    <thead>
                        <tr className="bg-[rgba(255,255,255,0.2)]">
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
                                <td className="py-2 px-4 border border-gray-500 font-medium bg-[rgba(255,255,255,0.1)]">
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