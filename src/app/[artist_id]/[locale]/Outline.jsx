// src/app/[artist_id]/Introduction.jsx

"use client";

import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import {
  useReport,
  useIntroduction,
  useKPI,
} from "../../../context/GlobalData";
import Image from "next/image";
import "react-circular-progressbar/dist/styles.css";
import ApplyButton from "./Outline.ApplyButton";
import { translations } from "../../../lib/translations";

function getProjectStatus(launchDate, deadlineDate, currentDate) {
  if (!launchDate || !deadlineDate) {
    return "Unknown"; // 날짜가 하나라도 없으면 상태 판단 불가
  }

  const ld = new Date(launchDate);
  const dd = new Date(deadlineDate);

  if (isNaN(ld.getTime()) || isNaN(dd.getTime())) {
    return {
      en: "",
      ko: "",
    };
  }

  if (currentDate < ld) {
    return {
      en: "Scheduled",
      ko: "예정됨",
    };
  } else if (currentDate >= ld && currentDate <= dd) {
    return {
      en: "Ongoing",
      ko: "진행중",
    };
  } else if (currentDate > dd) {
    return {
      en: "Ended",
      ko: "종료됨",
    };
  }

  return {
    en: "",
    ko: "",
  };
}

function easeOutCirc(t, b, c, d) {
  t = t / d - 1;
  return c * Math.sqrt(1 - t * t) + b;
}

const Outline = ({ locale, fixedExchangeRate = 1 }) => {
  const t = translations[locale] || translations.en;

  const reportData = useReport();
  const kpiData = useKPI();
  const data = useIntroduction();

  const artistName = {
    en: reportData.artist_eng,
    ko: reportData.artist_kor,
  };

  const goal_fund = reportData.goal_fund;
  const investor_count = reportData.investor_count || 0;
  const pre_applier_count = reportData.pre_applier_count || 0;
  const minted_nft = reportData.minted_nft || 100000;
  const nft_price = reportData.nft_price || 50;

  const avgRevenue = kpiData.expectedAnnualRevenue;
  const investorsShareRatio = reportData.investors_share_ratio;
  const investorsAvgRevenue = avgRevenue * investorsShareRatio;

  const nft_sales_start = reportData.nft_sales_start || "2025-01-31";
  const nftSalesStart = new Date(nft_sales_start);
  const nftSalesStartString = {
    en:
      (nftSalesStart.getMonth() + 1 < 10
        ? "0" + (nftSalesStart.getMonth() + 1)
        : nftSalesStart.getMonth() + 1) +
      "." +
      (nftSalesStart.getDate() < 10
        ? "0" + nftSalesStart.getDate()
        : nftSalesStart.getDate()) +
      "." +
      (nftSalesStart.getFullYear() % 100),
    ko:
      (nftSalesStart.getFullYear() % 100) +
      "." +
      (nftSalesStart.getMonth() + 1 < 10
        ? "0" + (nftSalesStart.getMonth() + 1)
        : nftSalesStart.getMonth() + 1) +
      "." +
      (nftSalesStart.getDate() < 10
        ? "0" + nftSalesStart.getDate()
        : nftSalesStart.getDate()),
  };
  const nft_sales_end = reportData.nft_sales_end || "2025-05-31";
  const nftSalesEnd = new Date(nft_sales_end);
  const nftSalesEndString = {
    en:
      (nftSalesEnd.getMonth() + 1 < 10
        ? "0" + (nftSalesEnd.getMonth() + 1)
        : nftSalesEnd.getMonth() + 1) +
      "." +
      (nftSalesEnd.getDate() < 10
        ? "0" + nftSalesEnd.getDate()
        : nftSalesEnd.getDate()) +
      "." +
      (nftSalesEnd.getFullYear() % 100),
    ko:
      (nftSalesEnd.getFullYear() % 100) +
      "." +
      (nftSalesEnd.getMonth() + 1 < 10
        ? "0" + (nftSalesEnd.getMonth() + 1)
        : nftSalesEnd.getMonth() + 1) +
      "." +
      (nftSalesEnd.getDate() < 10
        ? "0" + nftSalesEnd.getDate()
        : nftSalesEnd.getDate()),
  };

  const today = new Date();

  const projectStatus = getProjectStatus(nftSalesStart, nftSalesEnd, today)[
    locale
  ];
  const [isPre, setIsPre] = useState(true);
  const [applyButtonLabel, setApplyButtonLabel] = useState("PRE APPLY");

  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    let targetDate;
    if (today < nftSalesStart) {
      targetDate = nftSalesStart;
      setIsPre(true);
      setApplyButtonLabel(t.preApplyButtonLabel);
    } else {
      targetDate = nftSalesEnd;
      setIsPre(false);
      setApplyButtonLabel(t.applyButtonLabel);
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diffInSeconds = Math.floor((targetDate - now) / 1000);
      if (diffInSeconds > 0) {
        const d = Math.floor(diffInSeconds / (3600 * 24));
        const h = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
        const m = Math.floor((diffInSeconds % 3600) / 60);
        const s = diffInSeconds % 60;

        setDays(d);
        setHours(h);
        setMinutes(m);
        setSeconds(s);
      } else {
        // 이미 마감 시간을 지난 경우
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nftSalesEndString]);

  const { profilePicture = null } = data || {};

  return (
    <div>
      <section className="section-base-without-py6-px3">
        {/* 로고 및 프로필 사진 */}
        <div className="w-full aspect-w-16 aspect-h-9 shadow-soft overflow-hidden purple-glow-5">
          <div className="w-full h-full">
            <Image
              src={profilePicture}
              alt="Profile Picture"
              fill
              quality={100}
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className="flex justify-between items-baseline border-gradient-b">
          <div className="pt-6 pb-3 px-3 flex gap-2 items-baseline">
            {/* Artist Korean Name */}
            <h1 className="text-gradient text-4xl font-bold leading-none tracking-wide text-glow">
              {artistName[locale]}
            </h1>
          </div>
          <h4 className="text-gradient text-sm text-left w-36 purple-text-glow-3">
            {days + hours + minutes + seconds > 0
              ? `D-${days}:${String(hours).padStart(2, "0")}:${String(
                  minutes
                ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
              : "Ended"}
          </h4>
        </div>
      </section>

      <section className="grid pb-4 items-center">
        <div className="grid grid-cols-2">
          <div className="text-left border-b border-b-[var(--border-mid)] border-r border-r-[var(--border-mid)]">
            <p className="text-sm text-[var(--text-secondary)] ml-6 mt-3">
              {t.glowChance}
            </p>
            <h2 className="text-glow text-lg ml-6 mb-3">{projectStatus}</h2>
          </div>

          <div className="text-left border-b border-b-[var(--border-mid)]">
            <p className="text-sm text-[var(--text-secondary)] ml-6 mt-3">
              {t.period}
            </p>
            <h2 className="text-glow text-base ml-6 mb-3">
              {nftSalesStartString[locale]} ~ {nftSalesEndString[locale]}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="text-left border-b border-b-[var(--border-mid)] border-r border-r-[var(--border-mid)]">
            <p className="text-sm text-[var(--text-secondary)] ml-6 mt-3">
              {t.price}
            </p>
            <h2 className="text-glow text-lg ml-6 mb-3">
              <CountUp
                start={0}
                end={
                  locale === "ko" ? nft_price / fixedExchangeRate : nft_price
                }
                decimals={0} // 소수점 자릿수
                prefix={locale === "ko" ? "￦ " : "$ "} // 앞에 달러 기호 붙이기
                duration={1} // 애니메이션 진행 시간(초 단위)
                easingFn={easeOutCirc} // Easing
                separator="," // 천 단위 구분자(선택)
                decimal="." // 소수점 구분 문자(선택)
              />
            </h2>
          </div>

          <div className="text-left border-b border-b-[var(--border-mid)]">
            <p className="text-sm text-[var(--text-secondary)] ml-6 mt-3">
              {isPre ? t.awaiters : t.holders}
            </p>
            <h2 className="text-glow text-lg ml-6 mb-3">
              <CountUp
                start={0}
                end={isPre ? pre_applier_count : investor_count}
                duration={1.5} // 애니메이션 진행 시간(초 단위)
                easingFn={easeOutCirc} // Easing
                separator="," // 천 단위 구분자(선택)
              />
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="text-left border-b border-b-[var(--border-mid)] border-r border-r-[var(--border-mid)]">
            <p className="text-sm text-[var(--text-secondary)] ml-6 mt-3">
              {t.amount}
            </p>
            <h2 className="text-glow text-lg ml-6 mb-3">
              <CountUp
                start={0}
                end={minted_nft}
                duration={2} // 애니메이션 진행 시간(초 단위)
                easingFn={easeOutCirc} // Easing
                separator="," // 천 단위 구분자(선택)
              />
            </h2>
          </div>

          <div className="text-left border-b border-b-[var(--border-mid)]">
            <p className="text-sm text-[var(--text-secondary)] ml-6 mt-3">
              {t.estimatedRoi}
            </p>
            <h2 className="text-glow text-lg ml-6 mb-3">
              <CountUp
                start={0}
                end={((investorsAvgRevenue - goal_fund) / goal_fund) * 100}
                suffix="%" // 앞에 달러 기호 붙이기
                duration={2.5} // 애니메이션 진행 시간(초 단위)
                easingFn={easeOutCirc} // Easing
                separator="," // 천 단위 구분자(선택)
              />
            </h2>
          </div>
        </div>

        <ApplyButton isPre={isPre} label={applyButtonLabel} />
      </section>
    </div>
  );
};

export default Outline;
