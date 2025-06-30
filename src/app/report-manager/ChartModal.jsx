"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { formatNumber } from "../utils/formatNumber";
import { TimelineData } from "../processors/preprocessor";
import { fetchData, saveData } from "../firebase/fetch";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { WEIGHT } from "../utils/constants";
import DescriptionToolTip from "./DescriptionToolTip";

const LABEL_MAP = {
  apv_t: "Popularity (Spotify)",
  cev_t: "Concerts/Events",
  copyright: "Neighboring Rights",
  fv_t: "Fan Value",
  mcv_instagram: "MCV (Instagram)",
  mcv_twitter: "MCV (Twitter)",
  mcv_youtube: "MCV (Youtube)",
  mds_t: "Merchandises",
  mrv_t: "Royalties/Copyright",
  rv_t: "Album Sales (Circle Chart)",
  sv_t: "Streaming (Melon)",
  MOV: "Total Valuation",
};

const TEST = true;

const ChartModal = ({ isModalOpen, setIsModalOpen, artist_id }) => {
  const [chartLoading, setChartLoading] = useState(false);
  const [timelineData, setTimelineData] = useState([]);
  const [valuationData, setValuationData] = useState({});
  const [weights, setWeights] = useState(null);
  const [weightLoading, setWeightLoading] = useState(false);
  const [docId, setDocId] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);

  useEffect(() => {
    if (isModalOpen) {
      loadValuationData();
      setValuationChart();
    }
  }, [isModalOpen]);

  const loadValuationData = async () => {
    setWeightLoading(true);
    const data = await fetchData("valuation", {
      comp: "docId",
      sign: "==",
      val: artist_id,
    });
    if (data) {
      setDocId(data.id);

      // data.WEIGHT 있으면 사용, 없으면 기본값 WEIGHT 사용
      const loadedWeights =
        data.WEIGHT && Object.keys(data.WEIGHT).length > 0
          ? data.WEIGHT
          : WEIGHT;

      setWeights(loadedWeights);
      setValuationData(data || {});
      console.log("ValuationData : ", data);
    } else {
      // Firestore에서 가져오지 못했으므로 기본값 사용
      setWeights(WEIGHT);
      console.warn("Couldn't find valuation data for this artist.");
    }
    setWeightLoading(false);
  };

  const setValuationChart = async () => {
    setChartLoading(true);
    const data = await TimelineData(artist_id);
    setTimelineData(data.timelineData.timeline || []);
    setChartLoading(false);
  };

  const numericKeys =
    timelineData.length > 0
      ? Object.keys(timelineData[0]).filter((key) => key !== "date")
      : [];

  const getColor = (index) => {
    const hue = (index * 50) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
  };

  const handleWeightChange = (key, value) => {
    setWeights((prev) => ({ ...prev, [key]: parseFloat(value) }));
  };

  const saveWeights = async () => {
    if (!docId) {
      alert("Couldn't find document ID. Can't save.");
      return;
    }
    try {
      await saveData("valuation", { WEIGHT: weights }, docId);
      alert("Weights saved successfully!");
      setValuationChart();
    } catch (error) {
      console.error("Error saving weights:", error);
    }
  };

  return (
    isModalOpen && (
      <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 font-sans transition-all">
        <div className="relative w-full h-full max-w-7xl flex flex-col overflow-hidden shadow-2xl rounded-lg bg-white overflow-y-scroll">
          {/* 헤더 영역 */}
          <div className="relative p-6 rounded-t-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-xl">
            <button
              className="absolute top-6 right-6 text-white hover:bg-white hover:text-red-500 rounded-full p-2 transition transform hover:scale-110 z-50"
              onClick={() => setIsModalOpen(false)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <h3 className="text-3xl font-extrabold text-white text-center drop-shadow-lg">
              {valuationData
                ? `${valuationData.artist_name} Timeline Data`
                : "Timeline Data"}
            </h3>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="p-8 bg-gray-100 flex-1 flex flex-col space-y-10">
            {/* 차트 영역 */}
            {chartLoading ? (
              <div className="flex-1 flex items-center justify-center text-gray-600 animate-pulse text-lg font-semibold">
                Calculating data...
              </div>
            ) : (
              <div className="flex-1 flex justify-center items-center relative">
                {timelineData.length === 0 ? (
                  <div className="text-gray-500 italic">No data.</div>
                ) : (
                  <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-lg p-6 shadow-inner hover:shadow-lg transition-shadow w-full overflow-auto">
                    <LineChart width={1000} height={600} data={timelineData}>
                      <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis
                        tickFormatter={(value) =>
                          formatNumber(value, " KRW", 0)
                        }
                      />
                      <Tooltip
                        followCursor={true}
                        labelFormatter={formatDate}
                        formatter={(value) =>
                          `${formatNumber(value, "KRW", 2)}`
                        }
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                          background: "white",
                        }}
                      />
                      <Legend
                        align="left"
                        verticalAlign="bottom"
                        layout="horizontal"
                        formatter={(value) => LABEL_MAP[value] || value}
                        width={800}
                        wrapperStyle={{
                          whiteSpace: "wrap",
                          fontSize: "0.9rem",
                        }}
                      />
                      {numericKeys.map((key, index) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          name={LABEL_MAP[key] || key}
                          stroke={getColor(index)}
                          dot={false}
                          activeDot={{ r: 8 }}
                          strokeWidth={3}
                          onClick={() => setSelectedMetric(key)}
                          className="cursor-pointer"
                        />
                      ))}
                    </LineChart>
                  </div>
                )}
              </div>
            )}

            {/* 가중치 조정 영역 */}
            {!TEST &&
              (weightLoading ? (
                <div className="py-10 text-center text-gray-600 italic animate-pulse">
                  Loading weights...
                </div>
              ) : (
                weights &&
                Object.keys(weights).length > 0 && (
                  <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-lg p-6 shadow-inner hover:shadow-lg transition-shadow">
                    <h4 className="text-xl font-semibold mb-4 text-gray-800">
                      Adjust Weights
                    </h4>
                    <p className="text-gray-600 mb-4 text-sm">
                      Adjust the weights of each item and save them to see the
                      changes immediately on the chart.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                      {Object.keys(weights).map((key) => (
                        <div
                          key={key}
                          className="flex flex-col bg-gray-50 p-3 rounded hover:shadow transition-shadow"
                        >
                          <label className="font-medium text-gray-700 mb-2 text-sm">
                            {LABEL_MAP[key] || key}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:border-indigo-500 text-gray-700"
                            value={weights[key]}
                            onChange={(e) =>
                              handleWeightChange(key, e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-right">
                      <button
                        className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-2 rounded font-semibold hover:from-indigo-600 hover:to-blue-700 transition-colors shadow hover:shadow-lg transform hover:scale-105"
                        onClick={saveWeights}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )
              ))}

            {/* 지표 설명 섹션 */}
            {numericKeys.length > 0 && (
              <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-lg p-6 shadow-inner hover:shadow-lg transition-shadow">
                <h4 className="text-xl font-semibold mb-4 text-gray-800">
                  Metric Description
                </h4>
                <p className="text-gray-600 mb-4 text-sm">
                  Select the metric you want to know more about.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {numericKeys.map((key) => (
                    <button
                      key={key}
                      className={`px-3 py-1 rounded font-semibold transition transform hover:scale-105 ${
                        selectedMetric === key
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => setSelectedMetric(key)}
                    >
                      {LABEL_MAP[key] || key}
                    </button>
                  ))}
                </div>

                {selectedMetric && (
                  <div className="mt-4">
                    <DescriptionToolTip metricKey={selectedMetric} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default ChartModal;
