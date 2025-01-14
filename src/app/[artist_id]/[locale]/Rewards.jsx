// [src/app/[artist_id]/Rewards.jsx]
'use client';

import React from 'react';
import Image from 'next/image';
import { useRewards } from '../../../context/GlobalData';

export default function Rewards() {
    const initialRewards = [
        { 
            id: 'profit_sharing', 
            title: 'REVENUE DISTRIBUTION RIGHTS', 
            isVisible: true, 
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/redslippers.appspot.com/o/uploads%2F0f116a9e-18b3-4c4f-a26a-1d8bb0ff0595_revenue_share.png?alt=media&token=606b2138-6801-4a69-baab-0d88fab45c43', 
            description: `Grants you the right to receive a portion of the artist’s future revenue. 
        It provides long-term value and a direct stake in the project’s success.`,
        },
        { 
            id: 'voting_ticket', 
            title: 'VOTING TICKET', 
            isVisible: true, 
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/redslippers.appspot.com/o/uploads%2Fc50b78df-70ec-4401-8f9a-cc9243e4e3a4_voting.png?alt=media&token=d1e12138-23ae-4b4b-b6c3-190f98dd36a0', 
            description: `A vital part of our NFT’s governance system, empowering holders to influence 
        key decisions about project direction and future developments.`,
        },
        { 
            id: 'private_events', 
            title: 'PRIVATE EVENTS', 
            isVisible: true, 
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/redslippers.appspot.com/o/uploads%2F65ff75f2-7d10-44a6-bdca-498b72899f71_private_events.png?alt=media&token=4b543f14-370a-4055-8550-e1b753bef440', 
            description: `Enjoy exclusive access to member-only live performances, online meetups, 
        and behind-the-scenes content. Elevate your engagement with the artist.`,
        },
        { 
            id: 'nft_pass', 
            title: 'LIFETIME COLLECTION', 
            isVisible: true, 
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/redslippers.appspot.com/o/uploads%2Ff7b13956-b3c8-4220-8af3-65acf0f506a7_nft.png?alt=media&token=7f6e453d-139f-44d4-b17e-08a4caea7b04', 
            description: `An exclusive digital asset verifying ownership and providing collectible value. 
        The NFT also serves as a gateway to all other perks within our ecosystem.`,
        },
    ];
    const existedRewards = useRewards();
    const rewards = existedRewards?.rewards?.filter(a => a.isVisible) || initialRewards;


    if (!rewards.length) {
        return null;
    }

    return (
        <section className="section-base">
        <h2 className="section-title">Exclusive Rewards</h2>
        <div className="grid grid-cols-1 gap-4">
            {rewards.map((reward) => (
            <div
                key={reward.id}
                className="
                relative
                grid grid-cols-1 gap-0
                {reward}
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
                    {reward.title}
                </h3>
                <p className="text-xs whitespace-pre-line text-[var(--text-secondary)]">
                    {reward.description}
                </p>
                </div>
            </div>
            ))}
        </div>
        </section>
    );
}