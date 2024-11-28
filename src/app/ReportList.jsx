// src/app/components/ReportList.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReportCard from './ReportCard';

const ReportList = ({ reports }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const requestRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (event) => {
            mousePositionRef.current = { x: event.clientX, y: event.clientY };
            if (!requestRef.current) {
                requestRef.current = requestAnimationFrame(updateMousePosition);
            }
        };

        const updateMousePosition = () => {
            setMousePosition(mousePositionRef.current);
            requestRef.current = null;
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    return (
        <div className="w-full flex flex-col gap-6 p-4 bg-[var(--background)] min-h-screen">
            {reports.map(report => (
                <ReportCard
                    key={report.id}
                    artistId={report.artist_id}
                    image={report.image_alpha}
                    title={report.title}
                    artistEng={report.artist_eng}
                    artistKor={report.artist_kor}
                    mousePosition={mousePosition}
                />
            ))}
        </div>
    );
};

export default ReportList;