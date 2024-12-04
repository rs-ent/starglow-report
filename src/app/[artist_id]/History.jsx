'use client';

import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useHistory } from '../../context/GlobalData';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // 화살표 아이콘을 위해 react-icons 사용

const History = ({ openModal }) => {
    const history = useHistory();

    // SectionTitle 타입만 필터링
    const sectionTitles = history.history.filter(item => item.type === 'SectionTitle');

    // 모달에 전달할 데이터 생성
    const handleOpenModal = (sectionTitleText) => {
        const relatedContents = [];
        const startIndex = history.history.findIndex(a => a.text === sectionTitleText);
        relatedContents.push(history.history[startIndex]);
        for(var i=startIndex+1; i<history.history.length; i++) {
            if(history.history[i].type === 'SectionTitle') break;
            relatedContents.push(history.history[i]);
        }

        openModal(relatedContents); // 모달에 contents 배열 전달
    };

    return (
        <div className="relative flex flex-col items-center p-1">
            {sectionTitles.length > 0 ? (
                <div className="w-full grid grid-cols-2 relative">
                    {sectionTitles.map((item, index) => (
                        <div
                            key={index}
                            className={`flex-shrink-0 w-full p-1 cursor-pointer ${index === sectionTitles.length - 1 && sectionTitles.length % 2 !== 0 ? 'col-span-2' : ''}`}
                            onClick={() => handleOpenModal(item.text)}
                        >
                            {/* Background Image with Blur and Overlay */}
                            <div className="relative w-full h-28 overflow-hidden rounded-xl border">
                                {/* Background Image */}
                                <img
                                    src={item.src}
                                    alt={item.text || `Slide ${index + 1}`}
                                    className="w-full h-full object-cover z-0"
                                />

                                {/* Black Overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div>

                                {/* Centered Text */}
                                <h2 className="absolute inset-0 flex items-center justify-center text-center text-white text-2xl font-semibold z-20">
                                    {item.text}
                                </h2>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No Section Titles available.</p>
            )}
        </div>
    );
};

export default History;