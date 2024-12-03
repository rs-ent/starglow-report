// src/app/[artist_id]/Rewards.jsx
import React from 'react';
import { useRewards } from '../../context/GlobalData';
import RewardItem from './RewardItem';

const Rewards = () => {
  const rewardsData = useRewards();

  if (!rewardsData || !rewardsData.rewards) {
    return (
      <p className="text-center text-[var(--text-secondary)]">
        리워드 데이터를 불러오는 중입니다...
      </p>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* 리워드 목록 */}
      <section className="grid grid-cols-1 gap-6">
        {rewardsData.rewards.map((reward, index) => (
          <RewardItem key={index} reward={reward} />
        ))}
      </section>
    </div>
  );
};

export default Rewards;