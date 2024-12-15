'use client';

import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useHistory } from '../../context/GlobalData';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // 화살표 아이콘을 위해 react-icons 사용

const History = ({ openModal }) => {
    const history = useHistory();

    // SectionTitle 타입만 필터링
    const sectionTitles = history?.history.filter(item => item.type === 'SectionTitle') || [];

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
                <div className="w-full grid grid-cols-1 sm:grid-cols-2">
                    {sectionTitles.map((item, index) => {
                        // 현재 항목이 마지막 항목인지 확인
                        const isLastItem = index === sectionTitles.length - 1;
                        // 이전 항목이 존재하고 fullSize인지 확인
                        const isPrevFullSize = index > 0 ? sectionTitles[index - 1].fullSize : false;
                        // 조건에 따라 fullSize 설정
                        const shouldFullSize = item.fullSize || (isLastItem && isPrevFullSize);

                        return (
                            <div
                                key={index}
                                className={`flex-shrink-0 w-full p-1 cursor-pointer col-span-1 ${
                                    shouldFullSize ? 'sm:col-span-2' : ''
                                }`}
                                onClick={() => handleOpenModal(item.text)}
                            >
                                {/* Background Image with Blur and Overlay */}
                                <div className="relative w-full h-24 overflow-hidden rounded-xl border">
                                    {/* Background Image */}
                                    <img
                                        src={item.src}
                                        alt={item.text || `Slide ${index + 1}`}
                                        className="w-full h-full object-cover blur-xs z-0"
                                    />

                                    {/* Black Overlay */}
                                    <div className={`absolute inset-0 bg-black ${shouldFullSize ? 'bg-opacity-60' : 'bg-opacity-50'} z-10`}></div>

                                    {/* Centered Text */}
                                    <h2 className="absolute inset-0 flex items-center justify-center text-center text-white text-lg p-4 whitespace-break-spaces font-semibold z-20">
                                        {item.text}
                                    </h2>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-gray-500">No Section Titles available.</p>
            )}
        </div>
    );
};

export default History;