'use client';

import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useHistory } from '../../context/GlobalData';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // 화살표 아이콘을 위해 react-icons 사용

const History = ({ openModal }) => {
    const history = useHistory();

    // SectionTitle 타입만 필터링
    const sectionTitles = history.history.filter(item => item.type === 'SectionTitle');

    const [currentIndex, setCurrentIndex] = useState(0);

    // Next and Previous Handlers
    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === sectionTitles.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? sectionTitles.length - 1 : prevIndex - 1
        );
    };

    // Swipe Handlers
    const handlers = useSwipeable({
        onSwipedLeft: handleNext,
        onSwipedRight: handlePrev,
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    });

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
                <div className="w-full max-w-4xl relative">
                    {/* Image Slider */}
                    <div
                        {...handlers}
                        className="w-full overflow-hidden"
                    >
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {sectionTitles.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex-shrink-0 w-full px-8 cursor-pointer"
                                    onClick={() => handleOpenModal(item.text)} 
                                >
                                    {/* Background Image with Blur and Overlay */}
                                    <div className="relative w-full h-60 overflow-hidden rounded-xl border">
                                        {/* Background Image */}
                                        <img
                                            src={item.src}
                                            alt={item.text || `Slide ${index + 1}`}
                                            className="w-full h-full object-cover blur-sm z-0"
                                        />

                                        {/* Black Overlay */}
                                        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>

                                        {/* Centered Text */}
                                        <h2 className="absolute inset-0 flex items-center justify-center text-center text-white text-3xl font-semibold z-20">
                                            {item.text}
                                        </h2>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex justify-center mt-4">
                        {sectionTitles.map((_, index) => (
                            <button
                                key={index}
                                className={`h-3 w-3 mx-1 rounded-full transition-colors duration-300 ${
                                    currentIndex === index
                                        ? 'bg-blue-500'
                                        : 'bg-gray-300 hover:bg-blue-500'
                                }`}
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            ></button>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    {/* 왼쪽 화살표 */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:scale-105 transition-all"
                        aria-label="Previous Slide"
                    >
                        <FaArrowLeft className="text-gray-700" />
                    </button>
                    {/* 오른쪽 화살표 */}
                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:scale-105 transition-all"
                        aria-label="Next Slide"
                    >
                        <FaArrowRight className="text-gray-700" />
                    </button>
                </div>
            ) : (
                <p className="text-gray-500">No Section Titles available.</p>
            )}
        </div>
    );
};

export default History;