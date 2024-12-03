// src/app/[artist_id]/rewards-manager/RewardsManager.jsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchData, uploadFiles, saveData, deleteFile } from '../../firebase/fetch';
import { MockupList } from '../../utils/constants'; 
import ImagePool from './ImagePool'; // 새로 추가된 컴포넌트
import Toast from '../../components/client/Toast';

const RewardsManager = ({ artist_id }) => {
    const [toastMessage, setToastMessage] = useState('');
    const [rewards, setRewards] = useState([]);
    const [selectedMockups, setSelectedMockups] = useState({}); // Changed to object
    const [imagePool, setImagePool] = useState({});
    const [newReward, setNewReward] = useState({
        gift: [],
        thumb: '',
        condition: '',
        promotion: '',
    });

    // New States for Editing
    const [isEditing, setIsEditing] = useState(false);
    const [editRewardIndex, setEditRewardIndex] = useState(null);

    // 초기 데이터 로드
    useEffect(() => {
        const loadRewards = async () => {
            try {
                const loadedRewards = await fetchData(
                    'Rewards',
                    { comp: 'docId', sign: '==', val: artist_id },
                    false
                );
                setRewards(loadedRewards.rewards);
                setImagePool(loadedRewards.imagePool || {}); // 이미지 풀 초기화
            } catch (error) {
                console.error('Error while getting Rewards Data: ', error);
            }
        };
        loadRewards();
    }, [artist_id]);

    const handleInputChange = useCallback((field, value) => {
        setNewReward((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const handleQuantityChange = (mockup, value) => {
        setSelectedMockups((prev) => {
            const updated = { ...prev, [mockup]: { ...prev[mockup], quantity: Number(value) } };
            return updated;
        });
    };

    const handleDescriptionChange = (mockup, value) => {
        setSelectedMockups((prev) => {
            const updated = { ...prev, [mockup]: { ...prev[mockup], description: value } };
            return updated;
        });
    };

    const toggleMockupSelection = (mockup) => {
        setSelectedMockups((prev) => {
            if (mockup in prev) {
                const { [mockup]: _, ...remaining } = prev; // 선택 해제 시 해당 항목 제거
                return remaining;
            } else {
                return { ...prev, [mockup]: { quantity: 1, description: '' } };
            }
        });
    };

    // Reward 추가
    const handleAddReward = useCallback(() => {
        const missingFields = [];
        
        if (!newReward.condition) {
            missingFields.push("Condition");
        }
    
        if (missingFields.length > 0) {
            alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
            return;
        }
    
        const updatedReward = {
            ...newReward,
            gift: Object.entries(selectedMockups).map(([id, data]) => ({
                id,
                quantity: data.quantity,
                description: data.description || "", // 선택적 설명
            })),
        };
    
        if (isEditing && editRewardIndex !== null) {
            // Update existing reward
            setRewards((prev) => {
                const updatedRewards = [...prev];
                updatedRewards[editRewardIndex] = updatedReward;
                return updatedRewards;
            });
            setToastMessage('Reward updated successfully!');
        } else {
            // Add new reward
            setRewards((prev) => [...prev, updatedReward]);
            setToastMessage('Reward added successfully!');
        }
    
        // Reset form and editing state
        setNewReward({
            gift: [],
            thumb: '',
            condition: '',
            promotion: '',
        });
        setSelectedMockups({});
        setIsEditing(false);
        setEditRewardIndex(null);
    }, [isEditing, editRewardIndex, newReward, selectedMockups]);

    // Reward 썸네일 업로드
    const handleThumbUpload = useCallback(async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const [uploadResult] = await uploadFiles([file], `rewards/${artist_id}/`, (index, progress) => {
                    console.log(`Uploading thumbnail: ${progress}%`);
                });
                setNewReward((prev) => ({
                    ...prev,
                    thumb: uploadResult.downloadURL,
                }));
                setToastMessage('Thumbnail uploaded successfully!');
            } catch (error) {
                console.error('Error uploading thumbnail:', error);
                alert('Failed to upload thumbnail.');
            }
        }
    }, [artist_id]);

    // Add this function inside the RewardsManager component
    const handleEditReward = (index) => {
        const rewardToEdit = rewards[index];
        if (!rewardToEdit) return;

        // Populate newReward state
        setNewReward({
            gift: [], // Will be set below
            thumb: rewardToEdit.thumb || '',
            condition: rewardToEdit.condition || '',
            promotion: rewardToEdit.promotion || '',
        });

        // Populate selectedMockups
        const mockups = {};
        rewardToEdit.gift.forEach(g => {
            mockups[g.id] = {
                quantity: g.quantity || 1,
                description: g.description || '',
            };
        });
        setSelectedMockups(mockups);

        // Set editing state
        setIsEditing(true);
        setEditRewardIndex(index);
    };

    const handleCancelEdit = () => {
        // Reset form and editing state
        setNewReward({
            gift: [],
            thumb: '',
            condition: '',
            promotion: '',
        });
        setSelectedMockups({});
        setIsEditing(false);
        setEditRewardIndex(null);
    };

    // Reward 삭제 핸들러
    const handleDeleteReward = useCallback(async (index) => {
        const rewardToDelete = rewards[index];

        if (!rewardToDelete) {
            console.error('Reward not found at index:', index);
            return;
        }

        const confirmDelete = window.confirm('Are you sure you want to delete this reward?');
        if (!confirmDelete) return;

        try {
            // 썸네일 이미지가 있는 경우 Firebase Storage에서 삭제
            if (rewardToDelete.thumb) {
                // 썸네일 URL에서 파일 경로 추출
                const url = rewardToDelete.thumb;
                const urlParts = url.split('/');
                const filePathWithParams = urlParts.slice(3).join('/'); // 스토리지 URL의 3번째 슬래시 이후가 파일 경로
                const filePath = filePathWithParams.split('?')[0]; // 쿼리 파라미터 제거

                await deleteFile(filePath);
                setToastMessage('Thumbnail image deleted successfully!');
            }

            // rewards 상태 업데이트 (해당 인덱스 제거)
            setRewards((prev) => prev.filter((_, i) => i !== index));
            setToastMessage('Reward deleted successfully!');
        } catch (error) {
            console.error('Error deleting reward:', error);
            alert('Failed to delete reward.');
        }
    }, [rewards, deleteFile]);

    // Save Rewards 및 Image Pool
    const handleSaveRewards = useCallback(async () => {
        try {
            const result = { 
                artist_id: artist_id, 
                rewards: rewards,
                imagePool: imagePool,
            };
            console.log(result);
            await saveData('Rewards', result, artist_id);
            setToastMessage('Rewards saved successfully!');
        } catch (error) {
            console.error('Error saving rewards:', error);
            alert('Failed to save rewards.');
        }
    }, [artist_id, rewards, imagePool]);

    return (
        <section className="p-6">
            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage('')} // Toast가 닫힐 때 상태 초기화
                />
            )}
            <h2 className="text-xl font-bold mb-4">Rewards Manager</h2>

            {/* Image Pool 관리 섹션 */}
            <ImagePool 
                artist_id={artist_id} 
                imagePool={imagePool} 
                setImagePool={setImagePool}
                setToastMessage={setToastMessage}
            />

            {/* 리워드 리스트 */}
            <div className="p-6 mb-6 bg-[var(--background)] border border-[var(--foreground)]">
                <div>
                    <h3 className="text-lg font-bold mb-4">Rewards List</h3>
                    {rewards && rewards.length > 0 ? (
                        rewards.map((reward, index) => (
                            <div key={index} className="border rounded p-4 mb-4 relative">
                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDeleteReward(index)}
                                    className="absolute top-2 right-8 text-red-500 hover:text-red-700"
                                    title="Delete Reward"
                                >
                                    &times;
                                </button>
                                
                                {/* Edit Button */}
                                <button
                                    onClick={() => handleEditReward(index)}
                                    className="absolute top-2 right-2 text-blue-500 hover:text-blue-700"
                                    title="Edit Reward"
                                >
                                    &#9998;
                                </button>
                                
                                {/* Reward Details */}
                                <p>
                                    <strong>Condition:</strong> {reward.condition}
                                </p>
                                <p>
                                    <strong>Gift:</strong>{' '}
                                    {reward.gift.map((g) => `${g.description || g.id} (${g.id} x ${g.quantity})`).join(', ')}
                                </p>
                                <p>
                                    <strong>Promotion:</strong> {reward.promotion}
                                </p>
                                {reward.thumb && (
                                    <img
                                        src={reward.thumb}
                                        alt="Reward Thumbnail"
                                        className="mt-2 w-32 h-32 object-cover"
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No rewards added yet.</p>
                    )}
                </div>

                {/* Save Rewards 버튼 */}
                <button
                    onClick={handleSaveRewards}
                    className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
                >
                    Save Rewards
                </button>
            </div>

            {/* 리워드 입력 폼 */}
            <div className="p-6 mb-6 bg-[var(--background)] border border-[var(--foreground)]">
                <h3 className="text-lg font-bold mb-4">Add Reward</h3>
                <div className="grid grid-cols-1 gap-4 mb-6">
                    {/* 1. 조건 입력 */}
                    <div>
                        <label className="block text-sm font-medium mb-1">조건 입력</label>
                        <input
                            type="text"
                            value={newReward.condition}
                            onChange={(e) => handleInputChange('condition', e.target.value)}
                            className="border rounded w-full p-2"
                            placeholder="Enter reward condition"
                        />
                    </div>

                    {/* 2. Mockup Select */}
                    <div className="grid grid-cols-2 gap-4">
                    {MockupList.map((mockup) => (
                        <div key={mockup.id} className="p-4 border rounded">
                        <label className="flex items-center space-x-2">
                            <input
                            type="checkbox"
                            checked={mockup.id in selectedMockups}
                            onChange={() => toggleMockupSelection(mockup.id)}
                            className="w-5 h-5"
                            />
                            <span className="text-sm font-medium">{mockup.name}</span>
                        </label>

                        {mockup.id in selectedMockups && (
                            <>
                            {/* Quantity Input */}
                            <div className="mt-2">
                                <label className="block text-sm font-medium">Quantity</label>
                                <input
                                type="number"
                                value={selectedMockups[mockup.id]?.quantity || 1}
                                onChange={(e) => handleQuantityChange(mockup.id, e.target.value)}
                                className="border rounded w-full p-2"
                                min="1"
                                />
                            </div>

                            {/* Description Input */}
                            <div className="mt-2">
                                <label className="block text-sm font-medium">Description</label>
                                <input
                                type="text"
                                value={selectedMockups[mockup.id]?.description || ''}
                                onChange={(e) => handleDescriptionChange(mockup.id, e.target.value)}
                                className="border rounded w-full p-2"
                                placeholder="Enter description"
                                />
                            </div>
                            </>
                        )}
                        </div>
                    ))}
                    </div>

                    {/* Reward 썸네일 업로드 */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Reward Thumbnail Upload</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbUpload}
                            className="border rounded w-full p-2"
                        />
                        {newReward.thumb && (
                            <img src={newReward.thumb} alt="Reward Thumbnail" className="mt-2 w-32 h-32 object-cover" />
                        )}
                    </div>

                    {/* 4. 프로모션 문구 입력 */}
                    <div>
                        <label className="block text-sm font-medium mb-1">프로모션 문구 입력</label>
                        <input
                            type="text"
                            value={newReward.promotion}
                            onChange={(e) => handleInputChange('promotion', e.target.value)}
                            className="border rounded w-full p-2"
                            placeholder="Enter promotion text"
                        />
                    </div>
                </div>

                {/* Add Reward 버튼 */}
                <button
                    onClick={handleAddReward}
                    className={`bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 ${
                        isEditing ? 'mr-2' : ''
                    }`}
                >
                    {isEditing ? 'Update Reward' : 'Add Reward'}
                </button>

                {isEditing && (
                    <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white rounded px-4 py-2 hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </section>
    );

};

export default RewardsManager;