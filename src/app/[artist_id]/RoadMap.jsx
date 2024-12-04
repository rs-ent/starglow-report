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
import { format } from 'date-fns';

const RoadMap = () => {
    const report = useReport();
    const kpiData = useKPI();

    const bep = report.goal_fund;
    const avgRevenue = kpiData.expectedAnnualRevenue
    const maxRevenue = avgRevenue * (1 + kpiData.expectedRevenueSpectrum.spectrumMax);
    const minRevenue = avgRevenue * (1 - kpiData.expectedRevenueSpectrum.spectrumMin);
    const lossRevenue = bep * 0.8;
    const investorsShareRatio = report.investors_share_ratio;
    const investorsAvgRevenue = avgRevenue * investorsShareRatio;
    const investorsMaxRevenue = maxRevenue * investorsShareRatio;
    const investorsMinRevenue = minRevenue * investorsShareRatio;
    const investorsBEPRevenue = bep * investorsShareRatio;
    const investorsLossRevenue = lossRevenue * investorsShareRatio;

    const data = [
        { label: "음원/음반 발매", value: "정규 및 리메이크 앨범 등", spend: "600,000,000" },
        { label: "공연/행사 기획", value: "콘서트/투어/팬미팅 등", spend: "550,000,000" },
        { label: "콘텐츠 기획 및 제작", value: "유튜브 콘텐츠 등", spend: "142,000,000" },
        { label: "굿즈/MD 제작", value: "포토카드/열쇠고리 등", spend: "215,000,000" },
        { label: "매니지먼트 활동", value: "영화/방송/외부콘텐츠 등", spend: "65,000,000"},
        { label: "홍보/마케팅", value: "유통사/소셜미디어 등", spend: "345,000,000"},
        { label: "기타", value: "식대/유류비 등", spend: "95,000,000"},
    ];

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

    const COLORS = ['#4A90E2', '#40BFA3', '#F1C40F', '#EC7063', '#9B59B6', '#F1948A', '#85C1E9'];
    const InvestmentPieChart = ({ data }) => {
        return (
            <ResponsiveContainer width="100%" height={270}>
                <PieChart>
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
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        );
    };

    // RevenueChart에 사용할 데이터
    const revenueData = [
        { name: '최대 예상 수익', Revenue: maxRevenue, Investors: investorsMaxRevenue },
        { name: '평균 예상 수익', Revenue: avgRevenue, Investors: investorsAvgRevenue },
        { name: '최소 예상 수익', Revenue: minRevenue, Investors: investorsMinRevenue },
        { name: '손익분기점', Revenue: bep, Investors: investorsBEPRevenue },
        { name: 'Loss 80%', Revenue: lossRevenue, Investors: investorsLossRevenue },
        { name: 'Loss 50%', Revenue: bep * 0.5, Investors: bep * 0.5 * investorsShareRatio },
    ];

    const PerformanceChart = ({ revenueData }) => {
        // 손익분기점의 Revenue 값
        const breakEvenRevenue = revenueData.find(row => row.name === '손익분기점')?.Revenue || 1;

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
                        <CartesianGrid strokeDasharray="4 4" stroke="#e9e9e9" />
                        
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
                                value: "손익분기점",
                                position: "insideTop",
                                fontSize: 10,
                                fill: "gray",
                            }}
                            stroke="gray"
                            strokeDasharray="3 3"
                        />

                        {/* 라인 차트 */}
                        <Line
                            type="monotone"
                            dataKey="percentage"
                            stroke="#4A90E2"
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
                <h3 className="text-basefont-bold text-[var(--primary)]">투자 배분율</h3>
                <InvestmentPieChart data={pieChartData} />
            </section>

            {/* 투자 배분 표 */}
            <section className="px-6">
                <table className="min-w-full border-collapse border border-gray-300 text-center text-xs text-[var(--text-primary)]">
                    {/* 헤더 */}
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 border border-gray-300 font-bold">분류</th>
                            <th className="py-2 px-4 border border-gray-300 font-bold">내용</th>
                            <th className="py-2 px-4 border border-gray-300 font-bold">비중</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td className={row.type && row.type === "bold" ? "py-2 px-4 border font-bold bg-gray-100" : "py-2 px-4 border font-medium bg-gray-100"}>
                                    {row.label}
                                </td>
                                <td className={row.type && row.type === "bold" ? "py-2 px-4 border font-bold" : "py-2 px-4 border"}>
                                    {row.value}
                                </td>
                                <td className={row.type && row.type === "bold" ? "py-2 px-4 border font-bold" : "py-2 px-4 border"}>
                                    {(Number(row.spend.replace(/,/g,'')) / totalAmount * 100).toFixed(0)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* 매출 스펙트럼 및 투자자 수익 표 */}
            <section className="mt-12 px-6">
                <h3 className="text-base font-bold text-[var(--primary)] mb-2">매출 스펙트럼 및 예상 수익률</h3>
                <PerformanceChart revenueData={revenueData} />
                <table className="min-w-full border-collapse border border-gray-300 text-center text-xs text-[var(--text-primary)]">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 border border-gray-300 font-bold">매출 범주</th>
                            <th className="py-2 px-4 border border-gray-300 font-bold">연간 매출</th>
                            <th className="py-2 px-4 border border-gray-300 font-bold">투자자 수익</th>
                            <th className="py-2 px-4 border border-gray-300 font-bold">수익률</th>
                        </tr>
                    </thead>
                    <tbody>
                        {revenueData.map((row, index) => (
                            <tr
                                key={index}
                                className={row.name.includes('Loss') ? 'bg-blue-50' : row.name.includes('수익') ? 'bg-red-50' : ''}
                            >
                                <td className="py-2 px-4 border font-medium bg-gray-100">
                                    {row.name}
                                </td>
                                <td className="py-2 px-4 border">
                                    ₩{formatNumber(row.Revenue,'',2)}
                                </td>
                                <td className="py-2 px-4 border">
                                    ₩{formatNumber(row.Investors,'',2)}
                                </td>
                                <td className="py-2 px-4 border">
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