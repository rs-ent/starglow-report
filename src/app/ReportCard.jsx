// src/app/components/ReportCard.jsx
import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

const ReportCard = ({ artistId, image, title, artistEng, artistKor }) => {
    const cardRef = useRef(null);

    return (
        <div className="perspective-1000">
            <div
                ref={cardRef}
                className="bg-white rounded-lg shadow-soft transition-transform duration-300 ease-out transform cursor-pointer"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: transformStyle,
                }}
            >
                <img
                    src={image}
                    alt={title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    loading="lazy"
                />
                <div className="p-6">
                    <h2 className="text-2xl font-heading text-primary mb-2">{title}</h2>
                    <h3 className="text-lg font-body text-secondary">{artistEng} ({artistKor})</h3>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;