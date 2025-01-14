'use client';

import React, { useState } from 'react';
import { saveData, uploadFiles } from '../../firebase/fetch';
import { useRewards } from '../../../context/GlobalData';

export default function RewardsManager({ artist_id }) {
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
  const [rewards, setRewards] = useState(() => {
    if (existedRewards?.rewards?.length > 0) {
      return existedRewards.rewards;
    } else {
      return initialRewards;
    }
  });

  // 새 리워드의 '제목' 입력값
  const [newTitle, setNewTitle] = useState('');

  // 표시 여부 토글
  const toggleRewardVisibility = (id) => {
    const updated = rewards.map((item) =>
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    );
    setRewards(updated);
  };

  // 제목(Title) 수정
  const editRewardTitle = (id, newValue) => {
    const updated = rewards.map((item) =>
      item.id === id ? { ...item, title: newValue } : item
    );
    setRewards(updated);
  };

  // 설명(Description) 수정
  const editRewardDescription = (id, newDesc) => {
    const updated = rewards.map((item) =>
      item.id === id ? { ...item, description: newDesc } : item
    );
    setRewards(updated);
  };

  // 이미지 URL 수정
  const editRewardImageUrl = (id, newUrl) => {
    const updated = rewards.map((item) =>
      item.id === id ? { ...item, imageUrl: newUrl } : item
    );
    setRewards(updated);
  };

  // 파일 업로드
  const handleUploadImage = async (id, files) => {
    if (files.length === 0) return;
    try {
      const uploadResult = await uploadFiles(files, 'uploads/', (index, progress) => {
        console.log(`File ${index + 1} progress: ${progress}%`);
      });
      // 첫 번째 파일만 사용
      const uploadedFile = uploadResult[0];
      if (uploadedFile) {
        // 업로드된 downloadURL을 해당 reward의 imageUrl에 반영
        editRewardImageUrl(id, uploadedFile.downloadURL);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  // 리워드 삭제
  const removeReward = (id) => {
    const updated = rewards.filter((item) => item.id !== id);
    setRewards(updated);
  };

  // 새 리워드 추가
  const addReward = () => {
    if (!newTitle.trim()) return;
    const newReward = {
      id: `reward_${Date.now()}`,
      title: newTitle.trim(),
      isVisible: true,
      imageUrl: '',
      description: '',
    };
    setRewards([...rewards, newReward]);
    setNewTitle('');
  };

  // 파이어스토어에 저장
  const handleSave = async () => {
    try {
      await saveData('Rewards', { artist_id, rewards }, artist_id);
      alert('Rewards saved successfully!');
    } catch (error) {
      console.error('Error saving rewards:', error);
      alert('Failed to save rewards.');
    }
  };

  const handleReset = async () => {
    try {
        if (confirm('Are you sure you want to reset Rewards?')) {
            setRewards(initialRewards);
            await saveData('Rewards', { artist_id, initialRewards }, artist_id);
            alert('Reset Rewards successfully!');
        }
    } catch (error) {
      console.error('Error saving rewards:', error);
      alert('Failed to save rewards.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-3">Rewards Manager</h2>

      {/* 리워드 목록 */}
      <ul className="space-y-4">
        {rewards.map((reward) => (
          <li
            key={reward.id}
            className="border-b border-[rgba(255,255,255,0.1)] py-3"
          >
            <div className="flex items-center gap-3 mb-2">
              {/* 표시 여부 토글 */}
              <input
                type="checkbox"
                checked={reward.isVisible}
                onChange={() => toggleRewardVisibility(reward.id)}
              />
              {/* 제목 수정 */}
              <input
                type="text"
                value={reward.title}
                onChange={(e) => editRewardTitle(reward.id, e.target.value)}
                className="bg-transparent border-b border-[rgba(255,255,255,0.2)] focus:outline-none"
              />
              <button
                onClick={() => removeReward(reward.id)}
                className="ml-auto text-xs text-red-500 hover:text-red-300"
              >
                Remove
              </button>
            </div>

            {/* 이미지 미리보기 & 업로드 */}
            <div className="grid grid-cols-2 items-start gap-3 mb-3">
              {/* 미리보기 */}
              <div className=" bg-gray-800 flex-shrink-0 overflow-hidden rounded aspect-[21/9]">
                {reward.imageUrl ? (
                  <img
                    src={reward.imageUrl}
                    alt="reward preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xs text-gray-400 text-center mt-5">No Image</div>
                )}
              </div>

              <div className="flex-1">
                {/* 이미지 URL 직접 입력 */}
                <label className="block mb-1 text-sm font-semibold">Image URL</label>
                <input
                  type="text"
                  value={reward.imageUrl}
                  onChange={(e) => editRewardImageUrl(reward.id, e.target.value)}
                  placeholder="Enter image URL or upload below"
                  className="p-2 border border-[rgba(255,255,255,0.2)] rounded w-full mb-2"
                />

                {/* 파일 업로드 */}
                <label className="block mb-1 text-sm font-semibold">
                    Upload Image 
                    <span className="block text-xs text-gray-400">
                        (Recommended size: 2100px × 900px, 21:9 ratio)
                    </span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    handleUploadImage(reward.id, files);
                  }}
                  className="p-2 border border-[rgba(255,255,255,0.2)] rounded w-full"
                />
              </div>
            </div>

            {/* 설명(Description) 필드 */}
            <label className="block mb-1 text-sm font-semibold">Description</label>
            <textarea
              rows={3}
              value={reward.description}
              onChange={(e) => editRewardDescription(reward.id, e.target.value)}
              placeholder="Enter a detailed description of this reward"
              className="w-full p-2 border border-[rgba(255,255,255,0.2)] rounded bg-transparent focus:outline-none text-sm"
            />
          </li>
        ))}
      </ul>

      {/* 새 리워드 추가 */}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="New Reward Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 py-1 px-2 bg-[var(--background-muted)] border border-[rgba(255,255,255,0.2)] rounded-sm focus:outline-none"
        />
        <button
          onClick={addReward}
          className="bg-[var(--primary)] text-[var(--text-reverse)] px-3 py-1 rounded-sm"
        >
          Add
        </button>
      </div>

      {/* 리셋 버튼 */}
      <div className="mt-6">
        <button
          onClick={handleReset}
          className="bg-green-600 text-white px-2 py-2 rounded shadow-sm text-xs"
        >
          Reset to Initial Data
        </button>
      </div>

      {/* 저장 버튼 */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded shadow-sm"
        >
          Save to Firestore
        </button>
      </div>

      
    </div>
  );
}