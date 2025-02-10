'use client';

import React from 'react';
import Image from 'next/image';
import { useHistory } from '../../../context/GlobalData';
import { safeLangValue } from '../../../script/convertLang';

const History = ({ openModal, locale = 'en' }) => {
    const history = useHistory();

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
                <div>
                    <div
                        className='absolute top-4 w-full'
                        style={{
                            height: '1.5px',
                            backgroundImage:
                                "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%222%22 viewBox=%220 0 12 2%22%3E%3Ccircle cx=%220.5%22 cy=%221%22 r=%220.5%22 fill=%22rgba(255,255,255,1)%22/%3E%3Crect x=%223%22 y=%220.5%22 width=%225%22 height=%221%22 fill=%22rgba(255,255,255,1)%22/%3E%3C/svg%3E')",
                            backgroundRepeat: 'repeat-x'
                        }}
                    />
                    <div className="w-full flex items-center justify-between px-6 mb-4">
                        {sectionTitles.map((item, index) => {
                            const titleText = safeLangValue(item.text, locale);

                            return (
                                <div
                                    key={index}
                                    className='w-[25px] h-[75px] flex flex-col items-center justify-start gap-1 cursor-pointer'
                                    onClick={() => handleOpenModal(titleText)}
                                >
                                    <Image
                                        src="/star.png"
                                        alt="Star Icon"
                                        width={20}
                                        height={20}
                                        className='mx-auto'
                                    />
                                    <p className="mt-2 text-xs text-center">{titleText}</p>
                                </div>
                            );

                        })}
                    </div>

                    <div className="w-full grid grid-cols-1 sm:grid-cols-2">
                        {sectionTitles.map((item, index) => {

                            const isLastItem = index === sectionTitles.length - 1;
                            const isPrevFullSize = index > 0 ? sectionTitles[index - 1].fullSize : false;
                            const shouldFullSize = item.fullSize || (isLastItem && isPrevFullSize);

                            const titleText = safeLangValue(item.text, locale);

                            return (
                                <div
                                    key={index}
                                    className={`flex-shrink-0 w-full p-1 cursor-pointer col-span-1 ${shouldFullSize ? 'sm:col-span-2' : ''
                                        }`}
                                    onClick={() => handleOpenModal(titleText)}
                                >
                                    {/* Background Image with Blur and Overlay */}
                                    <div className="relative w-full h-24 overflow-hidden rounded-lg border border-[var(--border-mid)] opacity-90 shadow-md">
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
                </div>
            ) : (
                <p className="text-gray-500">No Section Titles available.</p>
            )}
        </div>
    );
};

export default History;