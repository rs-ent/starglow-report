'use client';

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';

const VideoContentForm = forwardRef(({ date, category = { label: '영상콘텐츠', value: 'video_content' } }, ref) => {
    const [formData, setFormData] = useState({
        title: category.label + ' 제작 예정', // 콘텐츠명
        publishDate: date || '', // 업로드월
        type: '단편', // 유형: 단편 또는 시리즈
        plannedVideos: 1, // 공개 예정 영상 수
        platform: '유튜브', // 플랫폼
        averageLength: 1, // 평균 영상 길이
        category: category.label, // 카테고리 정보
        description: '', // 추가 설명
        dist: 'production',
        mcv: 0,
        form: category.value || 'video_content'
    });

    // date prop이 변경될 때 formData 업데이트
    useEffect(() => {
        if (date) {
            setFormData((prev) => ({
                ...prev,
                publishDate: date,
            }));
        }
    }, [date]);

    // 상태 업데이트 핸들러
    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // 부모에서 데이터를 가져갈 수 있도록 useImperativeHandle 사용
    useImperativeHandle(ref, () => ({
        getFormData: () => formData, // 현재 폼 데이터를 반환
    }));

    return (
        <div className="p-4 bg-white shadow rounded">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 콘텐츠명 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">콘텐츠명</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="콘텐츠명을 입력하세요"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 업로드월 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">업로드월</label>
                    <input
                        type="month"
                        value={formData.publishDate}
                        onChange={(e) => handleChange('publishDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 유형 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">유형</label>
                    <div className="flex gap-2">
                        {['단편', '시리즈'].map((type) => (
                            <button
                                key={type}
                                className={`px-4 py-2 rounded ${
                                    formData.type === type
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-800'
                                }`}
                                onClick={() => handleChange('type', type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 공개 예정 영상 수 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">공개 예정 영상 수</label>
                    <input
                        type="number"
                        value={formData.plannedVideos}
                        onChange={(e) => handleChange('plannedVideos', Math.max(1, Number(e.target.value)))}
                        placeholder="공개 예정 영상 수를 입력하세요"
                        className="w-full p-2 border border-gray-300 rounded"
                        min={1}
                    />
                </div>

                {/* 플랫폼 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">플랫폼</label>
                    <input
                        type="text"
                        value={formData.platform}
                        onChange={(e) => handleChange('platform', e.target.value)}
                        placeholder="플랫폼을 입력하세요 (예: 유튜브, 틱톡)"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 평균 영상 길이 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">예상되는 평균 영상 길이 (분)</label>
                    <input
                        type="number"
                        value={formData.averageLength}
                        onChange={(e) => handleChange('averageLength', Math.max(1, Number(e.target.value)))}
                        placeholder="평균 영상 길이를 입력하세요 (분)"
                        className="w-full p-2 border border-gray-300 rounded"
                        min={1}
                    />
                </div>

                {/* 추가 설명 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">추가 설명</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="추가적인 정보를 입력하세요 (선택 사항)."
                        className="w-full p-2 border border-gray-300 rounded"
                        rows={4}
                    />
                </div>
            </div>
        </div>
    );
});

export default VideoContentForm;