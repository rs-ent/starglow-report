'use client';

import React, { useEffect, useRef, useState } from "react";
import { DataSet, Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { useParams } from "next/navigation";
import { useMilestones, useKPI } from "../../../context/GlobalData";
import AddMilestone from "./AddMilestone";
import { fetchMilestones, addMilestones } from "../../firebase/fetch";
import { processFutureValuation } from "../../processors/future-valuation";
import './MilestonesEditor.css';

const MilestonesEditor = () => {
    const { artist_id: artistId } = useParams();
    const initialMilestones = useMilestones();
    const [milestones, setMilestones] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isDataVisible, setIsDataVisible] = useState(false);
    const timelineRef = useRef(null);
    const kpiData = useKPI();

    useEffect(() => {
        const loadMilestones = async () => {
            const fetchedData = await fetchMilestones(artistId);
            setMilestones(fetchedData || initialMilestones);
        };

        if (artistId) {
            loadMilestones();
        }
    }, [artistId, initialMilestones]);

    useEffect(() => {
        if (milestones && timelineRef.current) {
            const container = timelineRef.current;

            const yearEntries = Object.entries(milestones).filter(
                ([key]) => key !== "artist_id" && key !=="id"
            );
    
            // 데이터를 Vis.js DataSet 형식으로 변환
            const items = new DataSet(
                yearEntries.flatMap(([year, data]) => {
                    return [
                        // Discography 데이터 추가
                        ...data.discography.map((album,index) => ({
                            id: `${year}-discography-${album.albumName}-${album.releaseDate}-${index}`,
                            content: `🎵 [앨범] ${album.albumName} (${album.releaseDate})`,
                            start: album.releaseDate,
                            type: "box",
                            style: "background-color: #a7c7e7; border-color: #87b5d6; color: #fff;",
                        })),
                        // Production 데이터 추가
                        ...data.production.map((prod, index) => {
                            const start = prod.startDate || prod.date || prod.publishDate;
                            if (!start) return null; // start 값이 없으면 무시
                            let content, backgroundColor;
                            if (prod.type === "youtube") {
                                content = `📺 [유튜브] ${prod.title} (${prod.publishDate?.split("T")[0] || "날짜 없음"})`;
                                backgroundColor = "#ffd9b3"; // 파스텔 오렌지
                            } else if (prod.type === "twitter") {
                                content = `🐦 [트위터] ${prod.title.slice(0, 50)}...`;
                                backgroundColor = "#f5f5dc"; // 파스텔 핑크
                            } else {
                                content = `🎤 [이벤트] ${prod.title} (${prod.startDate} ~ ${prod.endDate || "종료일 없음"})`;
                                backgroundColor = "#c8e6c9"; // 파스텔 그린
                            }
                            return {
                                id: `${year}-production-${prod.title}-${prod.startDate}-${index}`,
                                content,
                                start,
                                end: prod.endDate || undefined,
                                type: prod.type === "twitter" || prod.type === "youtube"
                                        ? "box"
                                        : prod.type === "event"
                                        ? "range"
                                        : "box",
                                style: `background-color: ${backgroundColor}; border-color: ${backgroundColor}; color: #000;`,
                            };
                        }).filter(Boolean),
                        // Management 데이터 추가
                        ...data.management.map((manage, index) => {
                            if (!manage.startDate) return null;
                            const backgroundColor = "#e4d3f8"; // 파스텔 퍼플
                            return {
                                id: `${year}-management-${manage.title}-${manage.startDate}-${index}`,
                                content: `📺 [${manage.category}] ${manage.title} (${manage.startDate})`,
                                start: manage.startDate,
                                end: manage.endDate || undefined,
                                type: "range",
                                style: `background-color: ${backgroundColor}; border-color: ${backgroundColor}; color: #000;`,
                            };
                        }).filter(Boolean),
                        ...Array.isArray(data.etc) ? data.etc.map((etcItem, index) => {
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
                            const opacity = etcItem.priority !== undefined ? 0.6 + etcItem.priority * 0.1 : 1;
                        
                            return {
                                id: `${year}-etc-${etcItem.title}-${etcItem.date}-${index}`,
                                content: `📌 [기타] ${etcItem.title} (${etcItem.date})`,
                                start: etcItem.date,
                                type: "box",
                                style: `background-color: ${backgroundColor}; opacity: ${opacity}; border-color: ${backgroundColor}; color: #000;`,
                            };
                        }).filter(Boolean) : [],
                    ];
                })
            );
    
            // Vis.js Timeline 생성
            const timeline = new Timeline(container, items, {
                selectable: true,
                editable: true,
                margin: { item: 10 },
                orientation: { axis: "top", item: "top" },
                height: "300px",
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
                    setSelectedDate(monthFormat);
                }
            });

            // select 이벤트 핸들러 등록
            timeline.on("select", (properties) => {
                console.log("Selected properties:", properties);
            
                if (properties.items.length > 0) {
                    const selectedId = properties.items[0]; // 선택된 ID
                    const [year, category, ...rest] = selectedId.split("-");
                    const index = parseInt(rest[rest.length - 1], 10);
                    const selectedItem = milestones[year][category][index];
                    console.log(selectedItem);
            
                    if (selectedItem) {
                        setSelectedYear(new Date(selectedItem.start).getFullYear());
                    }
                }
            });

            // DataSet의 remove 이벤트 핸들러 등록
            items.on('remove', async (event, properties) => {
                const deletedItems = properties.items;
        
                const confirmation = window.confirm(
                    `${deletedItems.join(", ")} is Deleted. Apply for Firebase Firestore?`
                );

                if (confirmation) {
                    try {
                        // milestones 상태 업데이트
                        const updatedMilestones = { ...milestones };
            
                        deletedItems.forEach((deletedItem) => {
                            const [year, category, ...rest] = deletedItem.split("-");
                            const index = parseInt(rest[rest.length - 1], 10); // 문자열을 숫자로 변환
                        
                            if (isNaN(index)) {
                                console.warn(`Invalid index '${index}' for deletedItem: ${deletedItem}`);
                                return;
                            }
                        
                            console.log(`Category: ${category}, Year: ${year}, Index: ${index}`);
                        
                            if (!updatedMilestones[year] || !updatedMilestones[year][category]) {
                                console.warn(`Category '${category}' not found in year '${year}'`);
                                return;
                            }
                        
                            // 삭제 대상 필터링
                            updatedMilestones[year][category] = updatedMilestones[year][category].filter((_, idx) => idx !== index);
                        });
            
                        setMilestones(updatedMilestones);
                        console.log(updatedMilestones);
            
                        // Firebase 저장
                        await handleSaveChanges(); // 기존 저장 함수 호출
                    } catch (error) {
                        console.error("Error deleting milestone:", error);
                        alert("Failed to delete and save changes.");
                    }
                }
            });
    
            return () => timeline.destroy(); // Cleanup
        }
    }, [milestones]);

    const addNewMilestone = async (newEvent) => {

        const dateValues = Object.values(newEvent).filter(value => 
            typeof value === "string" && /^\d{4}-\d{2}$/.test(value)
        );
    
        // 가장 작은 날짜 찾기
        const earliestDate = dateValues.reduce((minDate, currentDate) =>
            currentDate < minDate ? currentDate : minDate
        );        
        
        const eventYear = earliestDate.split("-")[0];
        const category = newEvent.dist || "etc"; // 기본 카테고리

        if (new Date(earliestDate) > new Date(kpiData.currentDate)) {
            console.log("Future event detected:", earliestDate);
            const valuation = processFutureValuation(newEvent, kpiData);
            console.log("Valuation: ", valuation);
            if (valuation) {
                newEvent.valuation = valuation;
            } else {
                console.warn("Valuation failed: No value returned from processFutureValuation.");
            }
        }
        
        const updatedMilestones = {
            ...milestones,
            [eventYear]: {
                ...milestones[eventYear],
                [category]: [
                    ...(milestones[eventYear]?.[category] || []), // 기존 데이터 가져오기
                    { ...newEvent }, // newEvent의 모든 필드를 추가
                ],
            },
        };

        setMilestones(updatedMilestones);
        await addMilestones(updatedMilestones, artistId);
        alert("Milestone added and saved successfully!");
    };

    const handleSaveChanges = async () => {
        try {
            await addMilestones(milestones, artistId);
            alert("Milestones saved successfully!");
        } catch (error) {
            console.error("Error saving milestones:", error);
            alert("An error occurred while saving milestones.");
        }
    };

    const handleReset = () => {
        // Reset milestones to the initial state
        setMilestones(initialMilestones);
        alert("Milestones reset to initial state.");
    };

    if (!milestones) return <p>Loading milestones...</p>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">

            <h2 className="text-3xl font-bold mb-6 text-center text-slate-600">Milestones Editor</h2>

            {selectedYear && (
                <div className="bg-white shadow p-6 rounded-lg mb-6">
                    <h3 className="text-xl font-semibold mb-2 text-slate-600">
                        Editing Data for {selectedYear}
                    </h3>

                    {/* 버튼 추가 */}
                    <button
                        onClick={() => setIsDataVisible((prev) => !prev)} // 보이기/숨기기 토글
                        className="px-4 py-2 mb-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        {isDataVisible ? "Hide Data" : "Show Data"}
                    </button>

                    {/* 현재 선택된 데이터 표시 */}
                    {isDataVisible && (
                        <div className="bg-gray-800 p-4 rounded border overflow-auto">
                            <pre className="text-white">
                                {JSON.stringify(milestones[selectedYear], null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Save and Reset Buttons */}
                    <div className="flex gap-4 mt-4">
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={handleSaveChanges}
                        >
                            Save Changes
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            onClick={handleReset}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}

            <div
                ref={timelineRef}
                style={{
                    height: "300px",
                    border: "2px solid #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                    overflow: "hidden",
                    marginBottom: "2rem",
                }}
            />

            {/* Add Milestone Section */}
            <AddMilestone onAdd={addNewMilestone} selectedDate={selectedDate} />
        </div>
    );
};

export default MilestonesEditor;