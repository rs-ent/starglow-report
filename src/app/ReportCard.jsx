// src/app/components/ReportCard.jsx
'use client';

import React, { useRef, useEffect, useState } from 'react';

const ReportCard = ({ artistId, image, title, artistEng, artistKor }) => {
    const cardRef = useRef(null);

    return (
        <div className="perspective-1000">
            <div
                ref={cardRef}
                className="border border-[var(--border-mid)] bg-white bg-opacity-5 rounded-lg shadow-soft transition-transform duration-300 ease-out transform cursor-pointer backdrop-blur-sm drop-shadow-md"
            >
                <img
                    src={image}
                    alt={title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    loading="lazy"
                />
                <div className="p-6">
                    <h3 className="text-2xl">{artistEng}</h3>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;