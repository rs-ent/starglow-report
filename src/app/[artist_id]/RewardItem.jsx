// src/app/[artist_id]/RewardItem.jsx
import React, { useState } from 'react';
import RewardMockup from './RewardMockup';
import Image from 'next/image';

const RewardItem = ({ reward }) => {
  const [selectedGiftIndex, setSelectedGiftIndex] = useState(0);

  const selectGift = (idx) => {
    setSelectedGiftIndex(idx);
    document.dispatchEvent(
      new CustomEvent('giftSelected', { detail: { index: idx } })
    );
  };

  return (
    <div className="flex flex-col bg-[var(--background-brushed)] rounded-xl border border-[var(--text-third)] p-4">
      {/* 조건 */}
      <div className="my-1">
        <p className="text-2xl text-[var(--primary)] font-extrabold italic mx-2">
          {reward.condition}
        </p>
      </div>
      {/* Gift 렌더링 영역 */}
      <div className="flex-shrink-0 w-full h-48 rounded-xl flex items-center justify-center overflow-hidden">
        {reward.gift[selectedGiftIndex].thumb ? (
          <Image
            src={reward.gift[selectedGiftIndex].thumb}
            alt={`리워드 ${reward.id} ${reward.gift[selectedGiftIndex].id} 썸네일`}
            width={256}
            height={256}
            className="object-contain"
          />
        ) : (
          <div style={{ width: '100%', height: '100%' }}>
            <RewardMockup
              gift={reward.gift[selectedGiftIndex]} // 선택된 Gift 전달
            />
          </div>
        )}
      </div>

      {/* Gift 선택 버튼들 */}
      <div className="flex flex-wrap justify-center my-1 gap-2">
        {reward.gift.map((gift, idx) => (
          <button
            key={idx}
            onClick={() => selectGift(idx)}
            className={`px-2 py-1 m-1 rounded-md border text-sm ${
              idx === selectedGiftIndex
                ? 'bg-[var(--primary)] text-[var(--text-reverse)]'
                : 'bg-[var(--background-brushed)] text-[var(--text-primary)]'
            }`}
          >
            {gift.description ? (
              gift.description
            ) : (
              <>
                {gift.id === 'photoCard' && '포토카드'}
                {gift.id === 'album' && '앨범'}
                {gift.id === 'videoCall' && '영상통화'}
                {gift.id === 'invitation' && '초대장'}
                {gift.id === 'goods' && '상품'}
                {/* 필요한 경우 다른 Gift id에 따른 라벨 추가 */}
              </>
            )}
          </button>
        ))}
      </div>

      {/* 프로모션 */}
      <div className="my-1 flex flex-col ">
        {reward.promotion && (
          <div className="mt-2">
            <p className="text-[var(--warning)] font-medium">
              프로모션: {reward.promotion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardItem;