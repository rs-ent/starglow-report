"use client";

import React, { useEffect, useRef, useState } from "react";
import { DataSet, Timeline as VisTimeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { useParams } from "next/navigation";
import { useTimeline, useMilestones } from "../../context/GlobalData";

const Timeline = () => {
    const { artist_id: artistId } = useParams();
    const milestones = useMilestones();
    const timelineRef = useRef(null);
    const youtubeData = useTimeline().flatMap(item => item.production?.media?.youtube || []);

    const createContentStyle = (backgroundColor, color = "#000", fontSize = "16px") => `
      background-color: ${backgroundColor}; 
      border-color: ${backgroundColor}; 
      color: ${color}; 
      font-size: ${fontSize};
      padding: 5px;
      border-radius: 200px;
    `;

    useEffect(() => {
        if (!milestones || !timelineRef.current) return;

        const container = timelineRef.current;
        const yearEntries = Object.entries(milestones).filter(([key]) => key !== "artist_id" && key !== "id");
        
        if (yearEntries.length === 0) return;

        const firstYear = parseInt(yearEntries[0], 10);
        const lastYear = parseInt(yearEntries[yearEntries.length - 1], 10);

        const startDate = new Date(firstYear, 0, 1);
        const endDate = new Date(lastYear, 11, 31);
        
        let youtubeViewRank = -1;
        const items = new DataSet(
            yearEntries.flatMap(([year, data]) => [
                ...data.discography.map((album, index) => ({
                    id: `${year}-discography-${album.albumName}-${album.releaseDate}-${index}`,
                    content: `<div class="common-content-timeline">🎵 [앨범] ${album.albumName} (${album.releaseDate})</div>`,
                    start: album.releaseDate,
                    type: "box",
                    style: createContentStyle('#a7c7e7', '#fff'),
                })),
                ...data.production
                .filter(prod => prod.type === "youtube")
                .map((prod, index) => {
                    const start = prod.startDate || prod.date || prod.publishDate;
                    if (!start) return null;

                    const ydata = youtubeData.find(a => a.id === prod.title);
                    if (!ydata || ydata.view_count <= youtubeViewRank) return null;

                    if (prod.type === "youtube") {
                        youtubeViewRank = ydata.view_count;
                        const roundedValue = Math.floor(ydata.view_count / Math.pow(10, Math.floor(Math.log10(ydata.view_count)))) * Math.pow(10, Math.floor(Math.log10(ydata.view_count)));
                        return {
                            id: `${year}-production-${prod.title}-${prod.startDate}-${index}`,
                            content: `<div class="common-content-timeline">📺 유튜브 조회수 ${roundedValue.toLocaleString()}회 달성</div>`,
                            start,
                            end: prod.endDate || undefined,
                            type: "box",
                            style: createContentStyle("#ffd9b3", '#000'),
                        };
                    }


                    return {
                        id: `${year}-production-${prod.title}-${prod.startDate}-${index}`,
                        content: `<div class="common-content-timeline">📦 [Production] ${prod.title}</div>`, // 적절한 content 설정
                        start,
                        end: prod.endDate || undefined,
                        type: prod.type === "twitter" ? "box" : "range",
                        style: createContentStyle('#fff', '#000'),
                    };
                }).filter(Boolean),
                ...data.management.map((manage, index) => ({
                        id: `${year}-management-${manage.title}-${manage.startDate}-${index}`,
                        content: `<div class="common-content-timeline">📺 [${manage.category}] ${manage.title} (${manage.startDate})</div>`,
                        start: manage.startDate,
                        end: manage.endDate || undefined,
                        type: "range",
                    style: createContentStyle("#e4d3f8", '#000'),
                })).filter(item => item.startDate),
                ...(Array.isArray(data.etc) ? data.etc.map((etcItem, index) => {
                    if (!etcItem.date) return null;
                    const backgroundColor = etcItem.sentiment > 0 ? "#A7C7E7" : etcItem.sentiment < 0 ? "#f4b6c2" : "#f7e7a9";
                    const opacity = etcItem.priority !== undefined ? 0.6 + etcItem.priority * 0.1 : 1;
              
                          return {
                            id: `${year}-etc-${etcItem.title}-${etcItem.date}-${index}`,
                            content: `<div class="common-content-timeline">📌 [기타] ${etcItem.title} (${etcItem.date})</div>`,
                            start: etcItem.date,
                            type: "box",
                            style: createContentStyle(backgroundColor, '#000'),
                          };
                  }).filter(Boolean) : []),
            ])
        );

        const timeline = new VisTimeline(container, items, {
            selectable: true,
            editable: false,
            margin: { item: 5 },
            orientation: { axis: "top", item: "top" },
            height: "100%",
            width: "100%",
            zoomMin: 1000 * 60 * 60 * 24 * 30,
            zoomMax: 1000 * 60 * 60 * 24 * 365 * 5,
            start: startDate,
            end: endDate, 
        });

        const customTimeId = "clicked-time";
        timeline.addCustomTime(new Date(), customTimeId);

        timeline.setWindow(startDate, endDate, { animation: false });

        timeline.on("click", ({ time }) => {
          if (!time) return;
          timeline.setCustomTime(time, customTimeId);
          console.log("Click properties:", time.toISOString().slice(0, 7));
        });

        timeline.on("select", ({ items }) => {
          if (items.length > 0) {
            const [year, category, ...rest] = items[0].split("-");
            console.log(milestones[year]?.[category]?.[parseInt(rest[rest.length - 1], 10)]);
          }
        });

        return () => timeline.destroy();
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