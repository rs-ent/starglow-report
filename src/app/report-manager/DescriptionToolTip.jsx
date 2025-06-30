// DescriptionToolTip.jsx
"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

// 예시용 지수감쇠 데이터 생성 함수
const createExponentialDecayData = (
  initialValue = 100,
  decayRate = 1.2,
  months = 12
) => {
  return Array.from({ length: months + 1 }, (_, t) => ({
    t,
    value: initialValue * Math.exp(-decayRate * t),
  }));
};

const createFVTrendData = (initialFV = 100, months = 12) => {
  return Array.from({ length: months + 1 }, (_, t) => {
    // 0.5 ~ 1.5 사이의 랜덤 값 생성
    const trendFactor = 0.5 + Math.random();
    const value = initialFV * trendFactor;
    return { t, value };
  });
};

// rv_t 모델에 맞는 데이터 생성 함수
const createRVTrendData = (initialValue = 100, months = 12) => {
  // linspace 함수: start부터 end까지 num개의 값을 등분할한 배열을 생성
  const linspace = (start, end, num) => {
    if (num === 1) return [start];
    const step = (end - start) / (num - 1);
    return Array.from({ length: num }, (_, i) => start + step * i);
  };

  let decayRates = [];
  if (months > 12) {
    // 3개월: 0.6 -> 0.4 선형 감소
    const initialDecay = linspace(0.6, 0.4, 3);
    // 다음 6개월: 0.4 -> 0.3 선형 감소
    const midDecay = linspace(0.4, 0.3, 6);
    // 남은 기간: 0.3을 기반으로 0.9^(i/3) 형태의 지수 감소
    const restCount = months - 9;
    const longDecay = Array.from(
      { length: restCount },
      (_, i) => 0.56 * Math.pow(0.9, i / 3)
    );
    decayRates = [...initialDecay, ...midDecay, ...longDecay];
  } else {
    // months가 12 이하인 경우
    // 초기 최대 3개월: 0.6 -> 0.4
    const initialPeriod = Math.min(3, months);
    const initialDecay = linspace(0.6, 0.55, initialPeriod);

    // 남은 기간(최대 9개월): 0.4 -> 0.3 선형 감소
    const midCount = Math.max(months - 3, 0);
    const midDecay = midCount > 0 ? linspace(0.35, 0.15, midCount) : [];

    decayRates = [...initialDecay, ...midDecay];
  }

  // decayRates에 따라 각 달별 값을 계산
  return decayRates.map((rate, t) => ({
    t,
    value: initialValue * rate,
  }));
};

const createCEVTrendDataForEvent = (
  cer = 100,
  maxCER = 100,
  decayRate = 1.0,
  baseInfluenceMonths = 3,
  maxInfluenceMonths = 12,
  minInfluenceMonths = 1
) => {
  // 영향 개월 수 계산
  const influenceMonths = Math.min(
    Math.max(
      Math.round(
        baseInfluenceMonths +
          (cer / maxCER) * (maxInfluenceMonths - baseInfluenceMonths)
      ),
      minInfluenceMonths
    ),
    maxInfluenceMonths
  );

  // influenceMonths 동안 cer 값을 지수감쇠 적용
  return Array.from({ length: influenceMonths }, (_, i) => {
    const value = cer * Math.exp(-decayRate * i);
    return { t: i, value };
  });
};

// 예시용 4개월 영향 데이터(트위터 MCV 등) 생성 함수
const createFourMonthDecayData = (
  initialValue = 100,
  peakMonth = 1,
  totalMonths = 4
) => {
  return Array.from({ length: totalMonths }, (_, t) => {
    let factor = 1.0;
    if (t > peakMonth) {
      factor = 1 - (t - peakMonth) * (1 / (totalMonths - peakMonth));
    }
    return {
      t,
      value: initialValue * Math.max(factor, 0),
    };
  });
};

const DESCRIPTION_MAP = {
  apv_t: {
    title: "Popularity Value (APV, Based on Spotify)",
    description: `
    Data Source: Artist follower counts and track popularity metrics retrieved from the Spotify API.
    
    Calculation Process:
    1. Sum the popularity scores of all tracks within an album.
    2. Multiply the sum by the artist’s follower count to estimate the album’s popularity value.
    3. Add up these values across all albums to derive the total APV (Aggregate Popularity Value).
    
    Decay Application:
    - Popularity naturally decreases over time due to new releases, shifting trends, etc.
    - An exponential decay function is applied so that even high initial popularity diminishes gradually.

    Analytical Interpretation:
    APV_t mathematically models how peak popularity following a new release declines over time.
    It represents the "lifespan of awareness" for an artist, emphasizing the importance of sustaining or reigniting initial interest.
        `,
    graphData: createExponentialDecayData(100, 0.3, 12),
    lineColor: "#8884d8",
  },

  sv_t: {
    title: "Streaming Value (SV, Based on Melon)",
    description: `
    Data Source: Melon platform’s streaming counts per album and estimated revenue per stream.
    
    Calculation Process:
    1. Aggregate monthly streaming counts of all album tracks.
    2. Multiply by the per-stream revenue rate to estimate total streaming value.
    3. Apply decay over time to reflect the diminishing influence of older streams.

    Decay Application:
    - Streams peak immediately after release and gradually decline with time.
    - Exponential decay models long-term decreasing streaming value.

    Analytical Interpretation:
    SV_t shows how fans’ music consumption patterns evolve.
    The rate of decline provides strategic insight into promotional timing or new release scheduling.
        `,
    graphData: createExponentialDecayData(100, 0.3, 12),
    lineColor: "#FF7F50",
  },

  rv_t: {
    title: "Record Sales Value (RV, Based on Circle Chart)",
    description: `
    Data Source: Monthly album sales from Circle Chart, latest album price (LAP), and discount rate.

    Calculation Process:
    1. Multiply album sales during a specific period by LAP to get initial value.
    2. Apply discount rate based on time elapsed since release to calculate present value.
    3. Value remains relatively high early on, then gradually declines (linear → exponential decay).

    Decay Application:
    - Initial phase: surge in purchases due to fandom support.
    - Later: new releases, market saturation, and reduced attention lower sales contribution.

    Analytical Interpretation:
    RV_t reflects the "life cycle" of physical album sales.
    It informs strategies such as re-releases, special editions, or additional promotions to delay natural decline.
        `,
    graphData: createRVTrendData(100, 12),
    lineColor: "#8A2BE2",
  },

  fv_t: {
    title: "Fandom Value (FV) Time Series",
    description: `
    Data Source:
    - FB (Fandom Base size), ER (Engagement Rate), G (Economic Strength), and trend data (search metrics).

    Calculation Process:
    1. FV = FB × ER × G as the base formula.
    2. Multiply by a trend-based coefficient to reflect monthly variation (FV_t).
    3. Fandom size is relatively stable, but trends can cause monthly FV to fluctuate.

    Analytical Interpretation:
    FV_t indicates the "core strength" of a fandom.
    Rising trends can lift FV_t even without base changes, while declining interest brings it down.
    It highlights how strategy in communication, content, and retention affects fandom vitality.
        `,
    graphData: createFVTrendData(100, 12),
    lineColor: "#2E8B57",
  },

  cev_t: {
    title: "Concert/Event Value (CEV)",
    description: `
    Data Source: Actual or estimated revenue (CER) from concerts, fan meetings, and festivals.

    Calculation Process:
    1. Determine CER per event (either actual income or estimate using FV, AV, ER).
    2. Define event influence duration (influenceMonths) based on CER size — larger events last longer.
    3. Distribute CER across months using CER × exp(-decayRate×i) — value fades over time.

    Analytical Interpretation:
    CEV_t quantifies the "time-limited impact" of live events on artist value.
    Larger events contribute longer-lasting value; smaller ones have a short-term effect.
    Helps in planning event size, timing, and promotional cycles.
        `,
    graphData: createCEVTrendDataForEvent(200, 500, 1.2, 3, 12, 1),
    lineColor: "#FFA07A",
  },

  mcv_t: {
    title: "Media Content Value (MCV)",
    description: `
    Data Source: Exposure and reactions (likes, comments, retweets, subscribers) on Twitter, YouTube, Instagram.

    Calculation Process:
    1. For each SNS post, apply a 4-month impact model.
       Peak influence occurs in the first 1–2 months, followed by gradual decline.
    2. Apply platform-specific weights (Twitter, YouTube, Instagram) and sum to derive MCV.

    Analytical Interpretation:
    MCV_t models the content life cycle on social media.
    It visualizes how interest fades post-publication and aids in ongoing content production strategy.
        `,
    graphData: createFourMonthDecayData(100, 1, 4),
    lineColor: "#87CEEB",
  },

  mds_t: {
    title: "Merchandise Sales Value (MDS)",
    description: `
    Data Source: Sales data of merchandise/MD, FV, AV, ER, and album release timing.

    Calculation Process:
    1. Combine FV_t (fandom value), AV (popularity), and ER (engagement rate) to estimate MD demand/potential.
    2. Apply decay and discount factors based on time since release.
    3. MDS_t = ((FV_t_rolling × ER) + (AV_value × AIF_t × ER)) × Discount Factor
       Where AIF_t reflects time-based album influence.

    Analytical Interpretation:
    MDS_t shows how product sales power declines with changing fandom environment, popularity, and time.
    Helps in planning timely product launches or renewals to control value degradation.
        `,
    graphData: createFVTrendData(100, 12),
    lineColor: "#FFD700",
  },

  mrv_t: {
    title: "Media/Portrait Rights Value (MRV)",
    description: `
    Data Source: TV appearance fees, advertisement/modeling fees, and image licensing income or estimates.

    Calculation Process:
    1. Use FV_t, AV, ER, and category weights to calculate BF_event (base revenue value).
    2. Apply influence duration and decay rate based on BF_event scale — value declines over time.

    Analytical Interpretation:
    MRV_t represents the "consumption curve" of media appearance and image rights.
    High-value appearances retain value longer, while smaller roles fade quickly.
    Guides decisions on contracts, appearance frequency, and image rights management.
        `,
    graphData: createExponentialDecayData(100, 0.4, 6),
    lineColor: "#BC8F8F",
  },

  MOV: {
    title: "Market Overall Value (MOV)",
    description: `
    Data Source:
    Aggregation of all metrics including FV, PFV, PCV, MRV to estimate total market value.

    Calculation Process:
    MOV_t = FV_t + (SV_t+APV_t+RV_t) + (CEV_t+MCV_t+MDS_t) + MRV_t  
    That is, the sum of fandom, streaming, event/merch, and appearance values.

    Analytical Interpretation:
    MOV_t offers a comprehensive view of the artist’s total market value over time.
    Enables integrated analysis of how events (comebacks, shows, ads, social issues) affect value.
    Facilitates long-term brand management, strategy refinement, and growth opportunity identification.
        `,
    graphData: createFVTrendData(100, 24),
    lineColor: "#000000",
  },
};

const DescriptionToolTip = ({ metricKey }) => {
  if (
    metricKey === "mcv_twitter" ||
    metricKey === "mcv_youtube" ||
    metricKey === "mcv_instagram"
  ) {
    metricKey = "mcv_t";
  }
  const metricInfo = DESCRIPTION_MAP[metricKey] || null;

  if (!metricInfo) {
    return (
      <div className="p-4 text-sm text-gray-800">
        해당 지표에 대한 상세 정보가 없습니다.
      </div>
    );
  }

  const { title, description, graphData, lineColor } = metricInfo;

  return (
    <div className="p-4 text-sm text-gray-800">
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className="whitespace-pre-line mb-4">{description}</div>
      {graphData && graphData.length > 0 && (
        <div className="mt-2 bg-white p-2 border rounded">
          <LineChart width={200} height={100} data={graphData}>
            <XAxis dataKey="t" hide />
            <YAxis hide />
            <RechartsTooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor || "#8884d8"}
              dot={false}
            />
          </LineChart>
        </div>
      )}
    </div>
  );
};

export default DescriptionToolTip;
