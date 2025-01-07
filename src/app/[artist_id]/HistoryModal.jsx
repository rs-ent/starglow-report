'use client';

import React, { useMemo } from 'react';
import BlocksRenderer from './analysis-manager/BlocksRenderer'; // BlocksRenderer 가져오기

const HistoryModal = ({ onClose, contents }) => {
    if (!contents || contents.length === 0) return null;

    const images = [
        '/flow.png',
    ];

    const randomImage = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="relative w-full max-w-[480px] max-h-dvh bg-animated-glow shadow-lg flex flex-col">
                <div
                    className="bg-cover bg-center bg-no-repeat absolute inset-0 z-0 backdrop-blur-sm"
                    style={{
                        backgroundImage: `url(${randomImage})`,
                        backgroundColor: "rgba(0, 0, 0, 0.5)", // 어두운 반투명 배경
                        backgroundBlendMode: "multiply",        // overlay, multiply, screen 등
                    }}
                />
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-black px-3 py-1 rounded-lg z-50"
                    aria-label="Close Modal"
                >
                    닫기
                </button>

                {/* 스크롤 가능한 콘텐츠 */}
                <div className="mt-8 flex flex-col gap-1 min-h-dvh flex-grow overflow-y-auto z-20">
                    <div className="p-9">
                        {contents.map((block, index) => (
                            <BlocksRenderer key={index} block={block} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;