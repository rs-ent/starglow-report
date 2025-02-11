'use client';

import React from 'react';
import { useReport, useKPI, useRoadmap } from '../../../context/GlobalData';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { formatNumber } from '../../utils/formatNumber';
import { translations } from '../../../lib/translations';
import { safeLangValue } from '../../../script/convertLang';

const Estimation = ({ locale, exchangeRate = 1 }) => {
  const t = translations[locale] || translations.en;

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

  const bepLabel = {
    en: 'Break-Even Point (BEP)',
    ko: '손익분기점',
  };

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

  const data =
    roadmap && Array.isArray(roadmap.investments) && roadmap.investments.length > 0
      ? roadmap.investments
      : defaultData;

  const totalAmount = data.reduce(
    (sum, row) => sum + Number(row.spend.replace(/,/g, '')),
    0
  );

  // PieChart에 사용할 데이터 변환
  const pieChartData = data
    .map((row) => ({
      label: safeLangValue(row.label, locale),
      spend: Number(row.spend.replace(/,/g, '')),
    }))
    .sort((a, b) => {
      if (
        a.label === "기타" ||
        a.label === "Miscellaneous" ||
        a.label === "etc" ||
        a.label === "etc."
      )
        return 1;
      if (
        b.label === "기타" ||
        b.label === "Miscellaneous" ||
        b.label === "etc" ||
        b.label === "etc."
      )
        return -1;
      return b.spend - a.spend;
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
  function InvestmentPieChart({ data }) {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <defs>
            {data.map((entry, index) => (
              <linearGradient
                key={index}
                id={`gradientColor-${index}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={GRADIENT_COLORS[index].from} />
                <stop offset="100%" stopColor={GRADIENT_COLORS[index].to} />
              </linearGradient>
            ))}
          </defs>

          <Pie
            data={data}
            dataKey="spend"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={90}
            fontSize={9}
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
            startAngle={90}   // 시작 각도
            endAngle={-270}   // 시계 방향으로 360도
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={0}
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
  const revenueDataName = {
    en: {
      max: 'Max',
      avg: 'Avg',
      min: 'Min',
      bep: 'BEP',
    },
    ko: {
      max: '최대 매출',
      avg: '평균 매출',
      min: '최소 매출',
      bep: '손익분기점',
    },
  };

  const revenueData = [
    { name: revenueDataName[locale]['max'], Revenue: maxRevenue, Investors: investorsMaxRevenue },
    { name: revenueDataName[locale]['avg'], Revenue: avgRevenue, Investors: investorsAvgRevenue },
    { name: revenueDataName[locale]['min'], Revenue: minRevenue, Investors: investorsMinRevenue },
    { name: revenueDataName[locale]['bep'], Revenue: bep, Investors: investorsBEPRevenue },
  ];

  revenueData.sort((a, b) => b.Investors - a.Investors);

  const PerformanceChart = ({ revenueData, exchangeRate }) => {
    // 손익분기점의 Revenue 값
    const breakEvenRevenue =
      revenueData.find((row) => row.name === revenueDataName[locale]['bep'])
        ?.Revenue || 1;

    // y축 퍼센트 계산 (손익분기점 대비)
    const formattedData = revenueData
      .map((row) => ({
        ...row,
        percentage: ((row.Revenue - breakEvenRevenue) / breakEvenRevenue) * 100,
      }))
      .sort((a, b) => a.Revenue - b.Revenue);

    return (
      <div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: -10, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(255,255,255,0.15)"
            />

            {/* X축: Revenue 값 */}
            <XAxis
              dataKey="Revenue"
              tickFormatter={(value) =>
                `₩${formatNumber(value * exchangeRate, '', 2)}`
              }
              tick={{ fontSize: 9 }}
            />

            {/* Y축: 손익분기점 대비 퍼센트 */}
            <YAxis
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              tick={{ fontSize: 9 }}
            />

            {/* 손익분기점 기준 0% 라인 */}
            <ReferenceLine
              y={0}
              label={{
                value: bepLabel[locale],
                position: 'insideTop',
                fontSize: 10,
                fill: 'white',
              }}
              stroke="rgba(255,255,255,0.7)"
              strokeDasharray="6 6"
            />

            {/* 라인 차트 */}
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="rgba(203,86,255,0.5)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      {/* 투자 배분 원형 차트 */}
      <section className="mb-4 px-4 sm:px-6">
        <h3 className="text-base text-gradient py-2">{t.investmentAllocation}</h3>
        <InvestmentPieChart data={pieChartData} />
      </section>

      {/* 투자 배분 표 */}
      <section className="px-4 sm:px-6 mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-500 text-center text-xs text-[var(--text-primary)]">
            <thead>
              <tr className="bg-[rgba(255,255,255,0.2)]">
                <th className="py-2 px-4 border border-gray-500 font-bold">
                  {t.category}
                </th>
                <th className="py-2 px-4 border border-gray-500 font-bold">
                  {t.details}
                </th>
                <th className="py-2 px-4 border border-gray-500 font-bold">
                  {t.share}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border border-gray-500 font-medium bg-[rgba(255,255,255,0.1)]">
                    {safeLangValue(row.label, locale)}
                  </td>
                  <td className="py-2 px-4 border border-gray-500">
                    {safeLangValue(row.value, locale)}
                  </td>
                  <td className="py-2 px-4 border border-gray-500">
                    {(
                      (Number(row.spend.replace(/,/g, '')) / totalAmount) *
                      100
                    ).toFixed(0)}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 매출 스펙트럼 및 투자자 수익 표 */}
      <section className="mt-10 sm:mt-20 px-4 sm:px-6">
        <h3 className="text-base text-gradient mb-2">
          {t.revenueSpectrumAndExpectedRevenue}
        </h3>
        <PerformanceChart revenueData={revenueData} exchangeRate={exchangeRate} />
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-500 text-center text-xs text-[var(--text-primary)]">
            <thead>
              <tr className="bg-[rgba(255,255,255,0.2)]">
                <th
                  className="py-2 px-4 border border-gray-500 font-bold"
                  style={{ width: '18%' }}
                >
                  {t.revenueCategory}
                </th>
                <th
                  className="py-2 px-4 border border-gray-500 font-bold"
                  style={{ width: '25%' }}
                >
                  {t.estimatedRevenue}
                </th>
                <th
                  className="py-2 px-4 border border-gray-500 font-bold"
                  style={{ width: '25%' }}
                >
                  {t.returnsWithShare}
                  <br />
                  (
                  {t.returnsWithSharePrefix}
                  {(investorsShareRatio * 100).toFixed(0)}%
                  {t.returnsWithShareSurffix})
                </th>
                <th
                  className="py-2 px-4 border border-gray-500 font-bold"
                  style={{ width: '15%' }}
                >
                  {t.rateOfReturn}
                </th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((row, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border border-gray-500 font-medium bg-[rgba(255,255,255,0.1)]">
                    {row.name}
                  </td>
                  <td className="py-2 px-4 border border-gray-500">
                    {locale === 'ko' ? '₩' : '$'}
                    {formatNumber(row.Revenue * exchangeRate, '', 2, locale)}
                  </td>
                  <td className="py-2 px-4 border border-gray-500">
                    {locale === 'ko' ? '₩' : '$'}
                    {formatNumber(row.Investors * exchangeRate, '', 2, locale)}
                  </td>
                  <td className="py-2 px-4 border border-gray-500">
                    {(((row.Revenue - bep) / bep) * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Estimation;
