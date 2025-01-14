// src/app/[artist_id]/Rewards.jsx
import React from 'react';
import { useRewards } from '../../context/GlobalData';
import RewardItem from './RewardItem';

const Rewards = () => {
  const rewardsData = useRewards();

  return (
    <>
      {rewardsData?.rewards?.length > 0 && (
        <section className="section-base">
          <h2 className="section-title">Rewards</h2>
          <div className="container mx-auto p-4">
            {/* 리워드 목록 */}
            <section className="grid grid-cols-1 gap-6">
              {rewardsData.rewards.map((reward, index) => (
                <RewardItem key={index} reward={reward} />
              ))}
            </section>
          </div>
        </section>
      )}
    </>
  );
};

export default Rewards;