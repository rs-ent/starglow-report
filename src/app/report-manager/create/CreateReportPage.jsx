"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { saveData, uploadFiles, fetchData } from "../../firebase/fetch";
import { krw_usd } from "../../../script/exchange";
import { formatNumber } from "../../utils/formatNumber";
import { set } from "lodash";

export default function CreateReportPage() {
  const searchParams = useSearchParams();
  const docIdParams = searchParams.get("docId");
  const [docId, setDocId] = useState(docIdParams);
  const artistId = searchParams.get("artistId");
  const [formData, setFormData] = useState({
    artist_eng: "KNK",
    artist_id: "knk_20160303",
    artist_kor: "크나큰",
    background: null,
    circlechart_target: "202409",
    current_fund: 13875000,
    gallery: null,
    goal_fund: 200000000,
    image_alpha: "",
    pre_applier_count: 0,
    investor_count: 0,
    investors_share_ratio: 0.4,
    macro_marketGrowth_comment: "-",
    main_color: "#FFB1B9",
    melon_artist_id: "946943",
    meso_circlechart_comment: "TEST",
    project_status: "모집중",
    sub_title: "크나큰 IPO 리포트",
    title: "KNK IPO REPORT",
    type: "아이돌",
    nft_sales_start: "",
    nft_sales_end: "",
    glow_start: "",
    glow_end: "",
    settlement_date: "",
    minted_nft: 4000000,
    nft_price: 50,
    sectionVisibility: {
      header: true,
      outline: true,
      introduction: true,
      kpi: true,
      summary: true,
      rewards: true,
      investmentPoints: true,
      history: true,
      risk: true,
      estimation: true,
      riskLevel: true,
    },
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dateError, setDateError] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(0);

  // 기존 리포트 불러오기
  useEffect(() => {
    const getExchangeRate = async () => {
      const rate = await krw_usd();
      setExchangeRate(rate);
    };
    getExchangeRate();

    if (docId) {
      (async () => {
        const report = await fetchData("Report", { comp: "docId", val: docId });
        if (report) {
          setFormData((prev) => ({ ...prev, ...report }));
        }
      })();
    } else if (artistId) {
      (async () => {
        const report = await fetchData("Report", {
          comp: "artist_id",
          sign: "==",
          val: artistId,
        });
        if (report) {
          setFormData((prev) => ({ ...prev, ...report }));
          setDocId(report.docId);
        }
      })();
    }
  }, [docId, artistId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    // checkbox인 경우 checked 값을 사용
    if (type === "checkbox") {
      newValue = checked;
    } else if (["current_fund", "goal_fund", "investor_count"].includes(name)) {
      newValue = parseInt(value, 10);
    } else if (name === "investors_share_ratio") {
      newValue = parseFloat(value);
    }

    // sectionVisibility 내부 필드 처리
    if (name.startsWith("sectionVisibility.")) {
      const sectionName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        sectionVisibility: {
          ...prev.sectionVisibility,
          [sectionName]: newValue,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }

    if (name === "project_launch_date" || name === "project_deadline_date") {
      const launchDate =
        name === "project_launch_date"
          ? new Date(newValue)
          : new Date(formData.project_launch_date);
      const deadlineDate =
        name === "project_deadline_date"
          ? new Date(newValue)
          : new Date(formData.project_deadline_date);
      if (!isNaN(launchDate) && !isNaN(deadlineDate)) {
        if (launchDate >= deadlineDate) {
          setDateError("Launch Date must be earlier than Deadline.");
        } else {
          setDateError(null);
        }
      }
    } else if (name === "goal_fund") {
      const goalFund = parseInt(newValue, 10);
      if (goalFund > 0) {
        const newPrice = goalFund / formData.minted_nft;
        setFormData((prev) => ({
          ...prev,
          goal_fund: goalFund,
          nft_price: parseFloat(newPrice),
        }));
      }
    } else if (name === "minted_nft") {
      const mintedNftInt = parseInt(newValue, 10);
      if (mintedNftInt > 0) {
        const newPrice = formData.goal_fund / mintedNftInt;
        setFormData((prev) => ({
          ...prev,
          minted_nft: mintedNftInt,
          nft_price: parseFloat(newPrice),
        }));
      }
    } else if (name === "nft_price") {
      const nftPriceFloat = parseFloat(newValue);
      if (nftPriceFloat > 0) {
        const newMinted = formData.goal_fund / nftPriceFloat;
        setFormData((prev) => ({
          ...prev,
          nft_price: nftPriceFloat,
          minted_nft: parseInt(newMinted, 10),
        }));
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const localURL = URL.createObjectURL(file);
      setUploading(true);
      setUploadProgress(0);
      try {
        const results = await uploadFiles(
          [file],
          "reports/KNK/image_alpha/",
          (index, progress) => {
            setUploadProgress(progress);
          }
        );
        const { downloadURL } = results[0];
        setFormData((prev) => ({
          ...prev,
          image_alpha: downloadURL,
        }));
        setUploading(false);
      } catch (error) {
        console.error("Image upload error:", error);
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const launchDate = new Date(formData.project_launch_date);
    const deadlineDate = new Date(formData.project_deadline_date);
    if (!isNaN(launchDate) && !isNaN(deadlineDate)) {
      if (launchDate >= deadlineDate) {
        alert("Project Launch Date must be earlier than Project Deadline.");
        return;
      }
    }
    try {
      const savedDocId = await saveData("Report", formData, docId || null);
      alert(
        `리포트가 ${docId ? "수정" : "생성"}되었습니다! 문서 ID: ${savedDocId}`
      );
    } catch (error) {
      console.error("리포트 저장 중 오류 발생:", error);
      alert("리포트 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-3xl p-6 rounded-lg shadow-xl bg-[var(--background-second)]">
        <h1 className="text-4xl font-bold mb-6 text-gradient border-b border-gradient-b pb-2">
          {docId ? "리포트 수정" : "리포트 생성"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Artist Information */}
          <fieldset className="border border-[var(--border-mid)] rounded p-4 mb-6">
            <legend className="px-2 text-xl font-bold text-gradient">
              Artist Information
            </legend>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="artist_eng"
                  className="block font-semibold mb-2"
                >
                  Artist (Eng):
                </label>
                <input
                  type="text"
                  id="artist_eng"
                  name="artist_eng"
                  value={formData.artist_eng}
                  onChange={handleChange}
                  className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
              <div>
                <label htmlFor="artist_id" className="block font-semibold mb-2">
                  Artist ID:
                </label>
                <input
                  type="text"
                  id="artist_id"
                  name="artist_id"
                  value={formData.artist_id}
                  onChange={handleChange}
                  className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="artist_kor"
                  className="block font-semibold mb-2"
                >
                  Artist (Kor):
                </label>
                <input
                  type="text"
                  id="artist_kor"
                  name="artist_kor"
                  value={formData.artist_kor}
                  onChange={handleChange}
                  className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            </div>
          </fieldset>

          {/* Report Details */}
          <fieldset className="border border-[var(--border-mid)] rounded p-4 mb-6">
            <legend className="px-2 text-xl font-bold text-gradient">
              Report Details
            </legend>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block font-semibold mb-2">
                  Title:
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
              <div>
                <label htmlFor="sub_title" className="block font-semibold mb-2">
                  Sub Title:
                </label>
                <input
                  type="text"
                  id="sub_title"
                  name="sub_title"
                  value={formData.sub_title}
                  onChange={handleChange}
                  className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="image_alpha_file"
                  className="block font-semibold mb-2"
                >
                  Image Alpha:
                </label>
                <input
                  type="file"
                  id="image_alpha_file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
                {uploading && (
                  <div className="mt-2">
                    <p>이미지 업로드 중: {uploadProgress.toFixed(2)}%</p>
                  </div>
                )}
                {formData.image_alpha && !uploading && (
                  <div className="mt-2">
                    <img
                      src={formData.image_alpha}
                      alt="Uploaded Preview"
                      className="w-64 h-auto rounded mt-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          {/* Dates */}
          <fieldset className="border border-[var(--border-mid)] rounded p-4 mb-6">
            <legend className="px-2 text-xl font-bold text-gradient">
              Dates
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="nft_sales_start"
                  className="block font-semibold mb-2"
                >
                  NFT 판매 시작일:
                </label>
                <input
                  type="date"
                  id="nft_sales_start"
                  name="nft_sales_start"
                  value={formData.nft_sales_start}
                  onChange={handleChange}
                  className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="nft_sales_end"
                  className="block font-semibold mb-2"
                >
                  NFT 판매 종료일:
                </label>
                <input
                  type="date"
                  id="nft_sales_end"
                  name="nft_sales_end"
                  value={formData.nft_sales_end}
                  onChange={handleChange}
                  className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="glow_start"
                  className="block font-semibold mb-2"
                >
                  프로젝트 시작일 (GLOW Start Date):
                </label>
                <input
                  type="date"
                  id="glow_start"
                  name="glow_start"
                  value={formData.glow_start}
                  onChange={handleChange}
                  className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
              <div>
                <label htmlFor="glow_end" className="block font-semibold mb-2">
                  프로젝트 종료일 (GLOW End Date):
                </label>
                <input
                  type="date"
                  id="glow_end"
                  name="glow_end"
                  value={formData.glow_end}
                  onChange={handleChange}
                  className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="settlement_date"
                  className="block font-semibold mb-2"
                >
                  투자자 정산일:
                </label>
                <input
                  type="date"
                  id="settlement_date"
                  name="settlement_date"
                  value={formData.settlement_date}
                  onChange={handleChange}
                  className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            </div>
            {dateError && (
              <p className="mt-2 text-danger text-sm">{dateError}</p>
            )}
          </fieldset>

          {/* Funding Information */}
          <fieldset className="border border-[var(--border-mid)] rounded p-4 mb-6">
            <legend className="px-2 text-xl font-bold text-gradient">
              Funding Information
            </legend>
            <div className="mb-4">
              <label htmlFor="goal_fund" className="block font-semibold mb-2">
                목표 금액 : {formatNumber(formData.goal_fund, " $", 0, "en")} ≈{" "}
                {formatNumber(formData.goal_fund / exchangeRate, "원", 3, "ko")}
              </label>
              <div className="flex items-center text-lg">
                <p className="mr-1">$</p>
                <input
                  type="number"
                  id="goal_fund"
                  name="goal_fund"
                  value={formData.goal_fund}
                  onChange={handleChange}
                  className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="minted_nft"
                  className="block font-semibold mb-2"
                >
                  Minted NFT: {formatNumber(formData.minted_nft, "개", 0, "ko")}
                </label>
                <input
                  type="number"
                  id="minted_nft"
                  name="minted_nft"
                  value={formData.minted_nft}
                  onChange={handleChange}
                  className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
              <div>
                <label htmlFor="nft_price" className="block font-semibold mb-2">
                  NFT Price ($):{" "}
                  {formatNumber(formData.nft_price, " $", 0, "en")} ≈{" "}
                  {formatNumber(
                    formData.nft_price / exchangeRate,
                    "원",
                    3,
                    "ko"
                  )}
                </label>
                <div className="flex items-center text-lg">
                  <p className="mr-1">$</p>
                  <input
                    type="number"
                    id="nft_price"
                    name="nft_price"
                    value={formData.nft_price}
                    onChange={handleChange}
                    className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                </div>
              </div>
            </div>
          </fieldset>

          {/* Investor Information */}
          <fieldset className="border border-[var(--border-mid)] rounded p-4 mb-6">
            <legend className="px-2 text-xl font-bold text-gradient">
              Investor Information
            </legend>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="investors_share_ratio"
                  className="block font-semibold mb-2"
                >
                  Investors Share Ratio: 매출의{" "}
                  {formData.investors_share_ratio * 100}%를 투자자에게 배분
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="investors_share_ratio"
                  name="investors_share_ratio"
                  value={formData.investors_share_ratio}
                  onChange={handleChange}
                  className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            </div>
          </fieldset>

          {/* Additional Settings */}
          <fieldset className="border border-[var(--border-mid)] rounded p-4">
            <legend className="px-2 text-xl font-bold text-gradient">
              Additional Settings
            </legend>
            <div>
              <label
                htmlFor="pre_applier_count"
                className="block font-semibold mb-2"
              >
                Pre Applier Count:
              </label>
              <input
                type="number"
                id="pre_applier_count"
                name="pre_applier_count"
                value={formData.pre_applier_count}
                onChange={handleChange}
                className="w-full p-3 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              />
            </div>
            <div>
              <label htmlFor="main_color" className="block font-semibold mb-2">
                Main Color:
              </label>
              <input
                type="color"
                id="main_color"
                name="main_color"
                value={formData.main_color}
                onChange={handleChange}
                className="w-full h-[120px] p-[1px] rounded border border-[var(--border-mid)] bg-[var(--background-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              />
            </div>
          </fieldset>

          {/* Section Visibility Settings */}
          <fieldset className="border border-[var(--border-mid)] rounded p-4">
            <legend className="px-2 text-xl font-bold text-gradient">
              Section Visibility Settings
            </legend>
            <div className="text-sm text-[var(--foreground-muted)] mb-4">
              체크된 섹션만 리포트에 표시됩니다.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="sectionVisibility.header"
                  className="flex items-center font-semibold mb-2"
                >
                  <input
                    type="checkbox"
                    id="sectionVisibility.header"
                    name="sectionVisibility.header"
                    checked={formData.sectionVisibility.header}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  Header
                </label>
              </div>
              <div>
                <label
                  htmlFor="sectionVisibility.outline"
                  className="flex items-center font-semibold mb-2"
                >
                  <input
                    type="checkbox"
                    id="sectionVisibility.outline"
                    name="sectionVisibility.outline"
                    checked={formData.sectionVisibility.outline}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  Outline (개요)
                </label>
              </div>
              <div>
                <label
                  htmlFor="sectionVisibility.introduction"
                  className="flex items-center font-semibold mb-2"
                >
                  <input
                    type="checkbox"
                    id="sectionVisibility.introduction"
                    name="sectionVisibility.introduction"
                    checked={formData.sectionVisibility.introduction}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  Introduction (소개)
                </label>
              </div>
              <div>
                <label
                  htmlFor="sectionVisibility.kpi"
                  className="flex items-center font-semibold mb-2"
                >
                  <input
                    type="checkbox"
                    id="sectionVisibility.kpi"
                    name="sectionVisibility.kpi"
                    checked={formData.sectionVisibility.kpi}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  KPI (핵심성과지표)
                </label>
              </div>
              <div>
                <label
                  htmlFor="sectionVisibility.summary"
                  className="flex items-center font-semibold mb-2"
                >
                  <input
                    type="checkbox"
                    id="sectionVisibility.summary"
                    name="sectionVisibility.summary"
                    checked={formData.sectionVisibility.summary}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  Summary (투자요약)
                </label>
              </div>
              <div>
                <label
                  htmlFor="sectionVisibility.rewards"
                  className="flex items-center font-semibold mb-2"
                >
                  <input
                    type="checkbox"
                    id="sectionVisibility.rewards"
                    name="sectionVisibility.rewards"
                    checked={formData.sectionVisibility.rewards}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  Rewards (리워드)
                </label>
              </div>
              <div>
                <label
                  htmlFor="sectionVisibility.investmentPoints"
                  className="flex items-center font-semibold mb-2"
                >
                  <input
                    type="checkbox"
                    id="sectionVisibility.investmentPoints"
                    name="sectionVisibility.investmentPoints"
                    checked={formData.sectionVisibility.investmentPoints}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  Investment Points (투자포인트)
                </label>
              </div>
              <div>
                <label
                  htmlFor="sectionVisibility.history"
                  className="flex items-center font-semibold mb-2"
                >
                  <input
                    type="checkbox"
                    id="sectionVisibility.history"
                    name="sectionVisibility.history"
                    checked={formData.sectionVisibility.history}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  History (히스토리)
                </label>
              </div>
              <div>
                <label
                  htmlFor="sectionVisibility.risk"
                  className="flex items-center font-semibold mb-2"
                >
                  <input
                    type="checkbox"
                    id="sectionVisibility.risk"
                    name="sectionVisibility.risk"
                    checked={formData.sectionVisibility.risk}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  Risk (리스크)
                </label>
              </div>
              <div>
                <label
                  htmlFor="sectionVisibility.estimation"
                  className="flex items-center font-semibold mb-2"
                >
                  <input
                    type="checkbox"
                    id="sectionVisibility.estimation"
                    name="sectionVisibility.estimation"
                    checked={formData.sectionVisibility.estimation}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  Estimation (추정)
                </label>
              </div>
              <div>
                <label
                  htmlFor="sectionVisibility.riskLevel"
                  className="flex items-center font-semibold mb-2"
                >
                  <input
                    type="checkbox"
                    id="sectionVisibility.riskLevel"
                    name="sectionVisibility.riskLevel"
                    checked={formData.sectionVisibility.riskLevel}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 rounded border border-[var(--border-mid)] bg-[var(--background-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  Risk Level (위험도)
                </label>
              </div>
            </div>
          </fieldset>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[var(--primary)] text-[var(--text-reverse)] font-semibold rounded hover:bg-[var(--accent)] transition-all"
          >
            {docId ? "리포트 수정" : "리포트 생성"}
          </button>
        </form>
      </div>
    </div>
  );
}
