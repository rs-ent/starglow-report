"use client";

import React, { useEffect, useRef, useState } from "react";
import { DataSet, Timeline as VisTimeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { fetchMilestones } from "../../firebase/fetch";
import { useParams } from "next/navigation";
import { useTimeline, useMilestones } from "../../../context/GlobalData";

const Timeline = () => {
    const { artist_id: artistId } = useParams() || 'knk_20160303';
    const initialMilestones = useMilestones();
    const [milestones, setMilestones] = useState(null);
    const timelineRef = useRef(null);

    const timelineData = useTimeline();
    const youtubeData = timelineData
        .map((item) => item.production?.media?.youtube || []) // youtube 배열을 추출하거나 빈 배열 반환
        .flat();

    useEffect(() => {
        const loadMilestones = async ({artistId}) => {
            try {
                const fetchedData = await fetchMilestones(artistId);
                setMilestones(fetchedData || initialMilestones);
            } catch (error) {
                console.error("Error fetching milestones:", error);
                setMilestones(initialMilestones);
            }
        };

        if (artistId) {
            loadMilestones();
        } else {
            loadMilestones("knk_20160303");
        }
    }, [artistId, initialMilestones]);

    useEffect(() => {
        if (milestones && timelineRef.current) {
            const container = timelineRef.current;

            const yearEntries = Object.entries(milestones).filter(
                ([key]) => key !== "artist_id" && key !== "id"
            );

            // 데이터를 Vis.js DataSet 형식으로 변환
            let youtubeViewRank = -1;
            const items = new DataSet(
                yearEntries.flatMap(([year, data]) => {
                  return [
                    // Discography 데이터 추가
                    ...data.discography.map((album, index) => ({
                      id: `${year}-discography-${album.albumName}-${album.releaseDate}-${index}`,
                      content: `<div style="
                        font-size: 12px; 
                        text-align: center; 
                        padding: 4px; 
                        word-wrap: break-word; 
                        white-space: normal; 
                        line-height: 1.2;
                      ">🎵 [앨범] ${album.albumName} (${album.releaseDate})</div>`,
                      start: album.releaseDate,
                      type: "box",
                      style: `
                        background-color: #a7c7e7; 
                        border-color: #87b5d6; 
                        color: #fff; 
                        font-size: 10px;
                      `,
                    })),
              
                    // Production 데이터 추가
                    ...data.production.map((prod, index) => {
                      const start = prod.startDate || prod.date || prod.publishDate;
                      if (!start) return null; // start 값이 없으면 무시
                      let content, backgroundColor;
              
                      if (prod.type === "youtube") {
                        const ydata = youtubeData.find((a) => a.id === prod.title);
                        if (ydata.view_count <= youtubeViewRank) return null;
                        youtubeViewRank = ydata.view_count;
                        const magnitude = Math.pow(10, Math.floor(Math.log10(ydata.view_count)));
                        const roundedValue = Math.floor(ydata.view_count / magnitude) * magnitude;
              
                        content = `<div style="
                          font-size: 12px; 
                          text-align: center; 
                          padding: 4px; 
                          word-wrap: break-word; 
                          white-space: normal; 
                          line-height: 1.2;
                        ">📺 유튜브 조회수 ${roundedValue.toLocaleString()}회 달성</div>`;
                        backgroundColor = "#ffd9b3"; // 파스텔 오렌지
                      }
              
                      return {
                        id: `${year}-production-${prod.title}-${prod.startDate}-${index}`,
                        content,
                        start,
                        end: prod.endDate || undefined,
                        type: prod.type === "twitter" || prod.type === "youtube" ? "box" : "range",
                        style: `
                          background-color: ${backgroundColor}; 
                          border-color: ${backgroundColor}; 
                          color: #000;
                          font-size: 10px;
                        `,
                      };
                    }).filter(Boolean),
              
                    // Management 데이터 추가
                    ...data.management.map((manage, index) => {
                      if (!manage.startDate) return null;
                      const backgroundColor = "#e4d3f8"; // 파스텔 퍼플
                      return {
                        id: `${year}-management-${manage.title}-${manage.startDate}-${index}`,
                        content: `<div style="
                          font-size: 12px; 
                          text-align: center; 
                          padding: 4px; 
                          word-wrap: break-word; 
                          white-space: normal; 
                          line-height: 1.2;
                        ">📺 [${manage.category}] ${manage.title} (${manage.startDate})</div>`,
                        start: manage.startDate,
                        end: manage.endDate || undefined,
                        type: "range",
                        style: `
                          background-color: ${backgroundColor}; 
                          border-color: ${backgroundColor}; 
                          color: #000;
                          font-size: 10px;
                        `,
                      };
                    }).filter(Boolean),
              
                    // Etc 데이터 추가
                    ...(Array.isArray(data.etc)
                      ? data.etc.map((etcItem, index) => {
                          if (!etcItem.date) return null;
              
                          let backgroundColor;
              
                          // sentiment 값에 따라 색상 결정
                          if (etcItem.sentiment > 0) {
                            backgroundColor = "#A7C7E7"; // 파스텔 블루 (Positive)
                          } else if (etcItem.sentiment === 0) {
                            backgroundColor = "#f7e7a9"; // 파스텔 옐로우 (Neutral)
                          } else if (etcItem.sentiment < 0) {
                            backgroundColor = "#f4b6c2"; // 파스텔 핑크 레드 (Negative)
                          } else {
                            backgroundColor = "#ffffff"; // 기본 화이트
                          }
              
                          // priority 값에 따른 투명도 조정
                          const opacity =
                            etcItem.priority !== undefined ? 0.6 + etcItem.priority * 0.1 : 1;
              
                          return {
                            id: `${year}-etc-${etcItem.title}-${etcItem.date}-${index}`,
                            content: `<div style="
                              font-size: 12px; 
                              text-align: center; 
                              padding: 4px; 
                              word-wrap: break-word; 
                              white-space: normal; 
                              line-height: 1.2;
                            ">📌 [기타] ${etcItem.title} (${etcItem.date})</div>`,
                            start: etcItem.date,
                            type: "box",
                            style: `
                              background-color: ${backgroundColor}; 
                              opacity: ${opacity}; 
                              border-color: ${backgroundColor}; 
                              color: #000; 
                              font-size: 10px;
                            `,
                          };
                        }).filter(Boolean)
                      : []),
                  ];
                })
            );

            // Vis.js Timeline 생성
            const timeline = new VisTimeline(container, items, {
                selectable: true,
                editable: false, // 편집 비활성화
                margin: { item: 10 },
                orientation: { axis: "top", item: "top" },
                height: "100%", // 부모 컨테이너에 맞춤
                width: "100%", // 부모 컨테이너에 맞춤
                zoomMin: 1000 * 60 * 60 * 24 * 30, // 최소 줌 레벨 (1개월)
                zoomMax: 1000 * 60 * 60 * 24 * 365 * 5, // 최대 줌 레벨 (10년)
            });

            // 커스텀 타임라인 추가
            const customTimeId = "clicked-time";
            timeline.addCustomTime(new Date(), customTimeId); // 기본 위치 설정

            // 클릭 이벤트 등록
            timeline.on("click", (properties) => {
                const clickedTime = properties.time;

                if (clickedTime) {
                    timeline.setCustomTime(clickedTime, customTimeId); // 클릭된 위치로 이동
                    const monthFormat = clickedTime.toISOString().slice(0, 7); // YYYY-MM 형식으로 변환
                    console.log("Click properties:", monthFormat);
                    // 필요 시 상태 업데이트 또는 추가 로직 구현
                }
            });

            // select 이벤트 핸들러 등록
            timeline.on("select", (properties) => {
                console.log("Selected properties:", properties);

                if (properties.items.length > 0) {
                    const selectedId = properties.items[0]; // 선택된 ID
                    const [year, category, ...rest] = selectedId.split("-");
                    const index = parseInt(rest[rest.length - 1], 10);
                    const selectedItem = milestones[year]?.[category]?.[index];
                    console.log(selectedItem);

                    if (selectedItem) {
                        // 예: 상세 정보 모달 표시 등
                        // setSelectedYear(new Date(selectedItem.start).getFullYear());
                    }
                }
            });

            return () => timeline.destroy(); // Cleanup
        }
    }, [milestones]);

    if (!milestones) return <p className="text-center text-gray-500">Loading milestones...</p>;

    return (
        <div>
          <div
            ref={timelineRef}
            className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh] border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-y-scroll mb-8 shadow-md"
          />
        </div>
    );
};

export default Timeline;