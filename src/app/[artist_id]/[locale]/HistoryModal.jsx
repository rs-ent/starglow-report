'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import BlocksRenderer from '../analysis-manager/BlocksRenderer';
import { AnimatedBlock } from '../../components/client/AnimationHook';

const HistoryModal = ({ onClose, contents, locale }) => {
    if (!contents || contents.length === 0) return null;

    const images = [
        '/flow.png',
    ];

    const parallaxRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const randomImage = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }, []);

    // 스크롤 이벤트 핸들러
    const handleScroll = () => {
        if (scrollContainerRef.current && parallaxRef.current) {
            // scrollTop: 스크롤 컨테이너의 스크롤 양
            const scrollTop = scrollContainerRef.current.scrollTop;
            // 배경이 “조금만” 움직이도록 0.3 같은 배수를 곱함
            parallaxRef.current.style.backgroundPositionY = `-${scrollTop * 0.2}px`;
        }
    };

    useEffect(() => {
        const scrollEl = scrollContainerRef.current;
        scrollEl.addEventListener("scroll", handleScroll);
        return () => {
            scrollEl.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center"
             onClick={(e) => e.stopPropagation()} 
        >
            <div className="p-[1px] bg-gradient-to-br from-[rgba(255,255,255,0.4)] to-[rgba(255,255,255,0.1)] shadow-inner">
                <div className="relative w-full max-w-[480px] max-h-dvh bg-animated-glow shadow-lg flex flex-col">
                    {/* 패럴랙스 백그라운드 div */}
                    <div
                        ref={parallaxRef}
                        className="bg-cover bg-center bg-no-repeat absolute inset-0 z-0 backdrop-blur-sm"
                        style={{
                            backgroundImage: `url(${randomImage})`,
                            backgroundColor: "rgba(0, 0, 0, 0.55)",
                            backgroundBlendMode: "multiply",
                            backgroundPosition: "center 0",
                        }}
                    />

                    {/* 닫기 버튼 */}
                    <button
                        onClick={onClose}
                        className="sticky top-0 w-full bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] text-sm px-3 py-1 backdrop-blur-lg"
                        aria-label="Close Modal"
                        style={{
                            fontFamily: 'Conthrax'
                        }}
                    >
                        CLOSE
                    </button>

                    {/* 스크롤 가능한 컨텐츠 */}
                    <div
                        ref={scrollContainerRef}
                        className="relative gap-1 min-h-dvh min-w-0 w-[99dvw] max-w-[480px] overflow-y-auto z-50"
                    >

                        <div className="p-4">
                            {contents.map((block, index) => (
                                <BlocksRenderer key={index} block={block} locale={locale} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;