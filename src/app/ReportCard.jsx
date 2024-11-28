// src/app/components/ReportCard.jsx
import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

const ReportCard = ({ artistId, image, title, artistEng, artistKor, mousePosition }) => {
    const cardRef = useRef(null);
    const [transformStyle, setTransformStyle] = useState('');

    useEffect(() => {
        const handleTransform = () => {
            const card = cardRef.current;
            if (!card) return;

            const rect = card.getBoundingClientRect();
            const cardX = rect.left + rect.width / 2;
            const cardY = rect.top + rect.height / 2;

            const deltaX = mousePosition.x - cardX;
            const deltaY = mousePosition.y - cardY;

            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = 300; // 최대 반응 거리 설정

            if (distance < maxDistance) {
                // 상호작용 반전
                const rotateX = (-deltaY / rect.height) * 10; // 최대 10도 회전
                const rotateY = (-deltaX / rect.width) * 10; // 최대 10도 회전
                setTransformStyle(`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`);
            } else {
                setTransformStyle(`rotateX(0deg) rotateY(0deg) scale(1)`);
            }
        };

        handleTransform();
    }, [mousePosition]);

    return (
        <div className="perspective-1000">
            <Link href={`/${artistId}`} className="block">
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
            </Link>
        </div>
    );
};

export default ReportCard;