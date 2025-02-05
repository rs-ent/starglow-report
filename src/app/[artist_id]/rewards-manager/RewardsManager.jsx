'use client';

import React, { useState, useEffect } from 'react';
import { saveData, uploadFiles } from '../../firebase/fetch';
import { useRewards } from '../../../context/GlobalData';
import { safeLangValue, updateLangField, convertKor } from '../../../script/convertLang';

export const initialRewards = [
  { 
    id: 'profit_sharing', 
    title: {
      ko: '아티스트 수익 공유',
      en: 'REVENUE SHARING',
    },
    isVisible: true, 
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/redslippers.appspot.com/o/uploads%2F0f116a9e-18b3-4c4f-a26a-1d8bb0ff0595_revenue_share.png?alt=media&token=606b2138-6801-4a69-baab-0d88fab45c43', 
    description: {
      ko: `아티스트 수익 일부를 공유받을 수 있는 권리입니다.`,
      en: `Rights to receive a share of the artist’s revenue.`,
    },
  },
  { 
    id: 'voting_ticket', 
    title: { 
      ko: '투표권',
      en: 'VOTING TICKET',
    },
    isVisible: true, 
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/redslippers.appspot.com/o/uploads%2Fc50b78df-70ec-4401-8f9a-cc9243e4e3a4_voting.png?alt=media&token=d1e12138-23ae-4b4b-b6c3-190f98dd36a0', 
    description: {
      ko: `프로젝트 의사결정에 참여할 수 있는 투표권입니다. 
향후 아티스트의 방향성이나 기획에 의견을 제시할 수 있습니다.`,
      en: `A voting ticket that allows you to influence key decisions about the project's direction and major plans.`,
    },
  },
  { 
    id: 'private_events', 
    title: { 
      ko: '전용 이벤트',
      en: 'PRIVATE EVENTS',
    },
    isVisible: true, 
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/redslippers.appspot.com/o/uploads%2F65ff75f2-7d10-44a6-bdca-498b72899f71_private_events.png?alt=media&token=4b543f14-370a-4055-8550-e1b753bef440', 
    description: {
      ko: `NFT 홀더 전용 라이브 공연, 온라인 팬콘 등 특별한 행사에 참여할 수 있습니다.`,
      en: `Exclusive access to holder-only live performances, online meetups, and other special events.`,
    },
  },
  { 
    id: 'nft_pass', 
    title: { 
      ko: '평생 NFT 소장',
      en: 'LIFETIME NFT HOLDING',
    },
    isVisible: true, 
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/redslippers.appspot.com/o/uploads%2Ff7b13956-b3c8-4220-8af3-65acf0f506a7_nft.png?alt=media&token=7f6e453d-139f-44d4-b17e-08a4caea7b04', 
    description: {
      ko: `아티스트의 대한 팬심을 증명하고 수집 가치를 부여하는 NFT를 평생 보유할 수 있습니다.`,
      en: `An exclusive NFT verifying fandom and offering collectible value, held for a lifetime.`,
    },
  },
];

export default function RewardsManager({ artist_id }) {

  const existedRewards = useRewards();
  const [activeLanguage, setActiveLanguage] = useState('ko');
  const [rewards, setRewards] = useState([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (existedRewards?.rewards?.length > 0) {
      // DB에 저장된 리워드가 있다면, 각 title/description을 다국어 구조로 변환
      const mapped = existedRewards.rewards.map((item) => ({
        ...item,
        title: typeof item.title === 'object'
          ? item.title
          : { ko: item.title || '', en: '' },
        description: typeof item.description === 'object'
          ? item.description
          : { ko: item.description || '', en: '' },
      }));
      setRewards(mapped);
    } else {
      // 없으면 initialRewards 사용
      setRewards(initialRewards);
    }
  }, [existedRewards]);

  // 표시 여부 토글
  const toggleRewardVisibility = (id) => {
    const updated = rewards.map((item) =>
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    );
    setRewards(updated);
  };

  // 제목(Title) 수정
  const editRewardTitle = (id, newValue) => {
    const updated = rewards.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          title: updateLangField(item.title, activeLanguage, newValue),
        };
      }
      return item;
    });
    setRewards(updated);
  };

  // 설명(Description) 수정
  const editRewardDescription = (id, newDesc) => {
    const updated = rewards.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          description: updateLangField(item.description, activeLanguage, newDesc),
        };
      }
      return item;
    });
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
      title: { ko: '', en: '' },
      isVisible: true,
      imageUrl: '',
      description: { ko: '', en: '' },
    };
    // 현재 언어에 대해서만 값 넣기
    newReward.title[activeLanguage] = newTitle.trim();
    
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

  // 초기 데이터로 리셋
  const handleReset = async () => {
    try {
      if (confirm('Are you sure you want to reset Rewards?')) {
        setRewards(initialRewards);
        await saveData('Rewards', { artist_id, rewards: initialRewards }, artist_id);
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

      {/* 언어 탭 */}
      <div className="sticky top-0 z-10 bg-black border-b border-[rgba(255,255,255,0.2)] flex space-x-2">
        <button
          type="button"
          className={`
            px-4 py-2 transition 
            ${
              activeLanguage === 'ko'
                ? 'border-b-2 border-[rgba(59,130,246,1)] text-[rgba(59,130,246,1)]'
                : 'text-[rgba(200,200,200,0.8)]'
            }
          `}
          onClick={() => setActiveLanguage('ko')}
        >
          한국어
        </button>
        <button
          type="button"
          className={`
            px-4 py-2 transition
            ${
              activeLanguage === 'en'
                ? 'border-b-2 border-[rgba(59,130,246,1)] text-[rgba(59,130,246,1)]'
                : 'text-[rgba(200,200,200,0.8)]'
            }
          `}
          onClick={() => setActiveLanguage('en')}
        >
          English
        </button>
      </div>

      {/* 리워드 목록 */}
      <ul className="space-y-4">
        {rewards.map((reward) => {
          // 현재 언어에 맞는 title/description
          const currentTitle = safeLangValue(reward.title, activeLanguage);
          const currentDesc = safeLangValue(reward.description, activeLanguage);

          return (
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
                {/* 제목 수정 (현재 언어만) */}
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => editRewardTitle(reward.id, e.target.value)}
                  className="bg-transparent border-b border-[rgba(255,255,255,0.2)] focus:outline-none"
                  placeholder={
                    activeLanguage === 'ko' ? '제목 입력' : 'Enter title'
                  }
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
                <div className="bg-gray-800 flex-shrink-0 overflow-hidden rounded aspect-[21/9]">
                  {reward.imageUrl ? (
                    <img
                      src={reward.imageUrl}
                      alt="reward preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-gray-400 text-center mt-5">
                      {activeLanguage === 'ko' ? '이미지 없음' : 'No Image'}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  {/* 이미지 URL 직접 입력 */}
                  <label className="block mb-1 text-sm font-semibold">
                    {activeLanguage === 'ko' ? '이미지 URL' : 'Image URL'}
                  </label>
                  <input
                    type="text"
                    value={reward.imageUrl}
                    onChange={(e) => editRewardImageUrl(reward.id, e.target.value)}
                    placeholder={
                      activeLanguage === 'ko'
                        ? '이미지 주소를 입력하거나 아래 업로드'
                        : 'Enter image URL or upload below'
                    }
                    className="p-2 border border-[rgba(255,255,255,0.2)] rounded w-full mb-2 bg-transparent"
                  />

                  {/* 파일 업로드 */}
                  <label className="block mb-1 text-sm font-semibold">
                    {activeLanguage === 'ko' ? '이미지 업로드' : 'Upload Image'}
                    <span className="block text-xs text-gray-400">
                      (2100×900 권장)
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

              {/* 설명(Description) 필드 (현재 언어만) */}
              <label className="block mb-1 text-sm font-semibold">
                {activeLanguage === 'ko' ? '설명' : 'Description'}
              </label>
              <textarea
                rows={3}
                value={currentDesc}
                onChange={(e) => editRewardDescription(reward.id, e.target.value)}
                placeholder={
                  activeLanguage === 'ko'
                    ? '이 리워드에 대한 상세 설명을 입력'
                    : 'Enter a detailed description of this reward'
                }
                className="w-full p-2 border border-[rgba(255,255,255,0.2)] rounded bg-transparent focus:outline-none text-sm"
              />
            </li>
          );
        })}
      </ul>

      {/* 새 리워드 추가 */}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          placeholder={
            activeLanguage === 'ko'
              ? '새 리워드 제목'
              : 'New Reward Title'
          }
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 py-1 px-2 bg-[var(--background-muted)] border border-[rgba(255,255,255,0.2)] rounded-sm focus:outline-none"
        />
        <button
          onClick={addReward}
          className="bg-[var(--primary)] text-[var(--text-reverse)] px-3 py-1 rounded-sm"
        >
          {activeLanguage === 'ko' ? '추가' : 'Add'}
        </button>
      </div>

      {/* 리셋 버튼 */}
      <div className="mt-6">
        <button
          onClick={handleReset}
          className="bg-green-600 text-white px-2 py-2 rounded shadow-sm text-xs"
        >
          {activeLanguage === 'ko' ? '기본 데이터로 리셋' : 'Reset to Initial Data'}
        </button>
      </div>

      {/* 저장 버튼 */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded shadow-sm"
        >
          {activeLanguage === 'ko' ? '저장' : 'Save'}
        </button>
      </div>
    </div>
  );
}