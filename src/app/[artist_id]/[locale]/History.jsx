'use client';

import React from 'react';
import { useHistory } from '../../../context/GlobalData';
import { safeLangValue } from '../../../script/convertLang';

const History = ({ openModal, locale = 'ko' }) => {
    const history = useHistory();
    console.log(history);

    // SectionTitle 타입만 필터링
    const sectionTitles = history?.history.filter(item => item.type === 'SectionTitle') || [];

    // 모달에 전달할 데이터 생성
    const handleOpenModal = (sectionTitleText) => {
        const relatedContents = [];
        const startIndex = history.history.findIndex(a => 
            safeLangValue(a.text, locale) === sectionTitleText
        );
        if (startIndex === -1) return; // 혹시 못 찾으면 리턴

        relatedContents.push(history.history[startIndex]);
        for (let i = startIndex + 1; i < history.history.length; i++) {
            if (history.history[i].type === 'SectionTitle') break;
            relatedContents.push(history.history[i]);
        }

        openModal(relatedContents);
    };

    return (
        <div className="relative flex flex-col items-center p-1">
            {sectionTitles.length > 0 ? (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2">
                    {sectionTitles.map((item, index) => {
                        
                        const isLastItem = index === sectionTitles.length - 1;
                        const isPrevFullSize = index > 0 ? sectionTitles[index - 1].fullSize : false;
                        const shouldFullSize = item.fullSize || (isLastItem && isPrevFullSize);

                        const titleText = safeLangValue(item.text, locale);

                        return (
                            <div
                                key={index}
                                className={`flex-shrink-0 w-full p-1 cursor-pointer col-span-1 ${
                                    shouldFullSize ? 'sm:col-span-2' : ''
                                }`}
                                onClick={() => handleOpenModal(titleText)}
                            >
                                {/* Background Image with Blur and Overlay */}
                                <div className="relative w-full h-24 overflow-hidden rounded-xl border border-[var(--border-mid)] opacity-90 shadow-md">
                                    {/* Background Image */}
                                    <img
                                        src={item.src}
                                        alt={item.text || `Slide ${index + 1}`}
                                        className="w-full h-full object-cover blur-xs z-0"
                                    />

                                    {/* Black Overlay */}
                                    <div className={`absolute inset-0 bg-black ${shouldFullSize ? 'bg-opacity-80' : 'bg-opacity-70'} z-10`}></div>

                                    {/* Centered Text */}
                                    <h2 className="absolute inset-0 flex items-center justify-center text-center text-[var(--text-primary)] text-glow text-lg p-4 whitespace-break-spaces font-semibold z-20">
                                        {titleText}
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