"use client";

import React, { useState, useRef, useMemo } from "react";
import "chart.js/auto";
import { useReport, useKPI } from "../../../context/GlobalData";
import { calculateRiskLevelPercentage } from "../../processors/riskLevel";
import { formatNumber } from "../../utils/formatNumber";
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
} from "recharts";
import { translations } from "../../../lib/translations";

function formatYearMonth(yyyyMM, localeRaw = "en") {
  const locale = localeRaw === "en" ? "en-US" : "ko-KR";
  const [yearStr, monthStr] = yyyyMM.split("-");
  if (!yearStr || !monthStr) {
    return "Invalid format"; // 형식 예외 처리
  }

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const date = new Date(year, month - 1, 1);

  const monthAbbr = date.toLocaleString(locale, { month: "short" });

  if (localeRaw === "ko") {
    return `${year}년 ${monthAbbr}`;
  } else {
    return `${monthAbbr}, ${year}`;
  }
}

export const revenueSpectrumChart = (
  totalValueMultiple,
  spectrum,
  currentRevenue,
  minRevenue,
  maxRevenue,
  locale,
  exchangeRate
) => {
  // 데이터 계산
  const avgPoint1 = totalValueMultiple;
  const avgPoint3 = currentRevenue;

  const lowerBoundPoint1 = totalValueMultiple * (1 - spectrum / 3);
  const lowerBoundPoint2 = minRevenue; // 최저 기대 수익 x:2

  const upperBoundPoint1 = totalValueMultiple * (1 + spectrum / 2);
  const upperBoundPoint2 = maxRevenue; // 최고 기대 수익 x:2

  const data = [
    { label: "평균 기대 수익", x: 0, value: avgPoint1 },
    { label: "평균 기대 수익", x: 10, value: avgPoint3 },
    { label: "최저 기대 수익", x: 0, value: lowerBoundPoint1 },
    { label: "최저 기대 수익", x: 10, value: lowerBoundPoint2 },
    { label: "최고 기대 수익", x: 0, value: upperBoundPoint1 },
    { label: "최고 기대 수익", x: 10, value: upperBoundPoint2 },
  ];

  return (
    <div className="mx-auto  border-b border-b-[var(--background-muted)]">
      <ResponsiveContainer width="95%" height={200}>
        <LineChart
          data={data}
          margin={{ top: 15, right: 65, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="x"
            stroke="#A0A0A0"
            tick={false}
            type="number"
            domain={[0, 10]}
          />
          <YAxis
            stroke="#A0A0A0"
            tickFormatter={(tick) => formatNumber(tick, "", 0, locale)}
            style={{ fontWeight: 100, fontSize: "8px" }}
            domain={[lowerBoundPoint2 * 0.9, upperBoundPoint2 * 1.03]}
          />
          <Line
            type="monotone"
            dataKey="value"
            name="평균 기대 수익"
            stroke="#ffffff"
            strokeWidth={1}
            data={data.filter((d) => d.label === "평균 기대 수익")}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="value"
            name="최저 기대 수익"
            stroke="#555555"
            strokeDasharray="5 5"
            strokeWidth={1}
            data={data.filter((d) => d.label === "최저 기대 수익")}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="value"
            name="최고 기대 수익"
            stroke="#555555"
            strokeDasharray="5 5"
            strokeWidth={1}
            data={data.filter((d) => d.label === "최고 기대 수익")}
            dot={false}
          />

          {/* 평균값 표시 */}
          <ReferenceDot
            x={10}
            y={avgPoint3}
            r={0} // 점 숨김
            label={{
              value: `${locale === "ko" ? "₩" : "$"}${formatNumber(
                avgPoint3 * exchangeRate,
                "",
                2,
                locale
              )}`,
              position: "right",
              fontSize: 10,
              fill: "#ffffff",
            }}
          />

          {/* 최소값 표시 */}
          <ReferenceDot
            x={10}
            y={lowerBoundPoint2}
            r={0} // 점 숨김
            label={{
              value: `${locale === "ko" ? "₩" : "$"}${formatNumber(
                lowerBoundPoint2 * exchangeRate,
                "",
                2,
                locale
              )}`,
              position: "right",
              fontSize: 10,
              fill: "#999999",
            }}
          />

          {/* 최대값 표시 */}
          <ReferenceDot
            x={10}
            y={upperBoundPoint2}
            r={0} // 점 숨김
            label={{
              value: `${locale === "ko" ? "₩" : "$"}${formatNumber(
                upperBoundPoint2 * exchangeRate,
                "",
                2,
                locale
              )}`,
              position: "right",
              fontSize: 10,
              fill: "#999999",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const KPI = ({ locale, exchangeRate = 1 }) => {
  const t = translations[locale] || translations.en;

  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  const reportData = useReport();
  const calculatedKPIs = useKPI();

  if (!calculatedKPIs) {
    return <p>No KPI data available</p>;
  }

  const avgRevenue = calculatedKPIs.expectedAnnualRevenue;
  const spectrum = calculatedKPIs.expectedRevenueSpectrum.spectrum;
  const maxRevenue = calculatedKPIs.maxRevenue;
  const minRevenue = calculatedKPIs.minRevenue;
  const revenueSpectrum = `-${Math.ceil(
    (1 - minRevenue / avgRevenue) * 100
  )}% ~ ${Math.ceil((1 - avgRevenue / maxRevenue) * 100)}%`;
  const totalValueMultiple = calculatedKPIs.currentData.MOV
    ? calculatedKPIs.currentData.MOV + reportData.goal_fund
    : 0;

  const riskLevel = calculateRiskLevelPercentage(
    reportData.goal_fund || 1,
    reportData.investors_share_ratio || 1,
    minRevenue,
    spectrum
  );

  // 표시할 KPI 목록을 준비합니다.
  const allKPIs = useMemo(
    () => [
      {
        label: t.currentMonthValue,
        value: totalValueMultiple * exchangeRate,
        suffix: "₩",
        importance: 9,
        higherIsBetter: true,
      },
      {
        label: t.riskRating,
        value: riskLevel.differencePercentage,
        suffix: "%",
        importance: 10,
        higherIsBetter: false,
      },
      {
        label: t.riskLevel,
        value: riskLevel.riskText[locale],
        suffix: "",
        importance: 10,
        higherIsBetter: true,
      },
      {
        label: t.estimatedRevenue,
        value: calculatedKPIs.expectedAnnualRevenue * exchangeRate,
        suffix: "₩",
        importance: 10,
        higherIsBetter: true,
      },
      {
        label: t.revenueSpectrum,
        value: revenueSpectrum,
        suffix: "",
        importance: 10,
        higherIsBetter: true,
      },
      {
        label: t.peakDate,
        value: formatYearMonth(calculatedKPIs.peakDate, locale),
        suffix: "",
        importance: 8,
        higherIsBetter: false,
      },
      {
        label: t.revenueDiversityRatio,
        value: (calculatedKPIs.normalizedDiversityIndex * 100).toFixed(2),
        suffix: "%",
        importance: 5,
        higherIsBetter: false,
      },
      {
        label: t.coreRevenue,
        value: calculatedKPIs.maxCoreRevenueLabel[locale],
        suffix: "",
        importance: 4,
        higherIsBetter: false,
      },
    ],
    [calculatedKPIs]
  );

  // 초기 표시할 8개의 KPI
  const fixedKPIs = useMemo(() => allKPIs.slice(0, 5), [allKPIs]);

  // 표시할 KPI 결정
  const displayedKPIs = useMemo(() => {
    return isExpanded ? allKPIs : fixedKPIs;
  }, [isExpanded, allKPIs, fixedKPIs]);

  return (
    <div ref={containerRef}>
      {/* KPI 목록 */}
      <div className="grid grid-cols-1 h-auto">
        {displayedKPIs.map((kpi, index) => (
          <div key={index}>
            {/* 카드 내용 */}
            <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 border-b border-b-[var(--background-muted)]">
              <h4 className="text-gradient text-xs">{kpi.label}</h4>
              <p className="text-xs font-semibold text-right purple-text-glow-5">
                {kpi.suffix === "₩"
                  ? `${locale === "ko" ? "₩" : "$"}${formatNumber(
                      kpi.value,
                      "",
                      2,
                      locale
                    )}`
                  : `${formatNumber(kpi.value)}${kpi.suffix}`}
              </p>
            </div>
            {isExpanded &&
              kpi.label === t.revenueSpectrum &&
              revenueSpectrumChart(
                totalValueMultiple,
                spectrum,
                avgRevenue,
                minRevenue,
                maxRevenue,
                locale,
                exchangeRate
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
        {isExpanded ? "Collapse" : "Expand"}
      </button>
    </div>
  );
};

export default KPI;
