import React from 'react';
import BlocksRenderer from './analysis-manager/BlocksRenderer'; // BlocksRenderer 가져오기

const HistoryModal = ({ onClose, contents }) => {
    if (!contents || contents.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="relative w-full max-w-[480px] max-h-dvh bg-[var(--background)] shadow-lg flex flex-col">
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-black px-3 py-1 rounded-lg"
                    aria-label="Close Modal"
                >
                    닫기
                </button>

                {/* 스크롤 가능한 콘텐츠 */}
                <div className="mt-8 flex flex-col gap-1 min-h-dvh flex-grow overflow-y-auto">
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