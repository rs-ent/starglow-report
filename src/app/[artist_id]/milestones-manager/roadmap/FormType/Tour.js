'use client';

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';

const TourForm = forwardRef(({ date, category = { label: '투어', value: 'tour' } }, ref) => {
    const [formData, setFormData] = useState({
        title: category.label, // 투어명
        startDate: date || '', // 시작월
        endDate: date || '', // 종료월
        location: '', // 장소 (선택)
        country: '대한민국', // 국가
        occurrences: 1, // 횟수
        description: '', // 추가 설명
        category: category.label, // 카테고리 정보
        dist: 'production',
        cer: 0,
        form: category.value || 'tour'
    });

    // date prop이 변경될 때 formData 업데이트
    useEffect(() => {
        if (date) {
            setFormData((prev) => ({
                ...prev,
                startDate: date,
                endDate: date,
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
                {/* 투어명 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">투어명</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="투어명 입력"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 투어 시작월 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">투어 시작월</label>
                    <input
                        type="month"
                        value={formData.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 투어 종료월 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">투어 종료월</label>
                    <input
                        type="month"
                        value={formData.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 국가 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">국가</label>
                    <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        placeholder="국가 입력"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 장소 (선택) */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">장소 (선택)</label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="장소 입력"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 횟수 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">횟수</label>
                    <input
                        type="number"
                        value={formData.occurrences}
                        onChange={(e) =>
                            handleChange('occurrences', Math.max(1, Number(e.target.value)))
                        }
                        placeholder="횟수 입력 (숫자)"
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

export default TourForm;