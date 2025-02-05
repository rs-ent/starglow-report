// [src/app/[artist_id]/Rewards.jsx]
'use client';

import React from 'react';
import Image from 'next/image';
import { useRewards } from '../../../context/GlobalData';
import { initialRewards } from '../rewards-manager/RewardsManager';
import { convertKor } from '../../../script/convertLang';
import { AnimatedBlock } from '../../components/client/AnimationHook';

export default function Rewards({locale}) {
    const existedRewards = useRewards();
    const rewards = existedRewards?.rewards?.filter(a => a.isVisible) || initialRewards;

    if (!rewards.length) {
        return null;
    }

    return (
        <section className="section-base">
        <h2 className="section-title">Exclusive Rewards</h2>
        <div className="grid grid-cols-1 gap-4">
            {rewards.map((reward, index) => (
                <AnimatedBlock key={'a' + index}>
                    <div
                        className="
                        relative
                        grid grid-cols-1 gap-0
                        border border-[rgba(255,255,255,0.1)]
                        rounded-lg
                        overflow-hidden
                        shadow-sm
                        bg-gradient-to-br
                        from-[rgba(255,255,255,0.03)]
                        to-[rgba(255,255,255,0.12)]
                        "
                    >
                        {reward.imageUrl && (
                        <div className="relative w-full h-36 border-b border-b-[var(--border-mid)]">
                            <Image
                                src={reward.imageUrl}
                                alt="프로필 사진"
                                fill
                                quality={100}
                                sizes="(max-width: 768px) 100vw, 80vw"
                                className="object-cover"
                                loading="lazy"
                            />
                        </div>
                        )}
                        {/* 본문 영역 */}
                        <div className="p-4 items-center">
                        <h3 className="text-xl font-semibold text-gradient purple-text-glow-5 mb-2">
                            {convertKor(reward.title)[locale]}
                        </h3>
                        <p className="text-xs whitespace-pre-line text-[var(--text-secondary)]">
                            {convertKor(reward.description)[locale]}
                        </p>
                        </div>
                    </div>
                </AnimatedBlock>
            ))}
        </div>
        </section>
    );
}