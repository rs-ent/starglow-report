'use client';

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';

const ConcertForm = forwardRef(({ date, category = { label: '콘서트', value: 'concert' } }, ref) => {
    // 초기 상태
    const [formData, setFormData] = useState({
        title: category.label || '', // 공연명
        startDate: date || '', // 시작월
        endDate: date || '', // 종료월
        location: '서울', // 장소
        occurrences: 1, // 횟수
        description: '', // 추가 설명
        category: category.label, // 카테고리 정보
        dist: 'production',
        cer: 0,
        form: category.value || 'concert'
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

    // 부모가 데이터를 가져올 수 있도록 `useImperativeHandle` 사용
    useImperativeHandle(ref, () => ({
        getFormData: () => formData, // 현재 폼 데이터를 반환
    }));

    // 제출 핸들러 (현재 폼 상태를 onComplete로 전달)
    const handleSubmit = () => {
        if (formData.title && formData.location && formData.occurrences > 0) {
            onComplete(formData);
        } else {
            alert('모든 필드를 올바르게 입력해주세요.');
        }
    };

    return (
        <div className="p-4 bg-white shadow rounded">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 공연명 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">{category.label}명</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="공연명 입력"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 공연 시작월 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">시작월</label>
                    <input
                        type="month"
                        value={formData.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 공연 종료월 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">종료월</label>
                    <input
                        type="month"
                        value={formData.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 장소 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">장소</label>
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

export default ConcertForm;