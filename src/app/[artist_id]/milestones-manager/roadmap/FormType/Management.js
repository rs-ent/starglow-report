'use client';

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';

const ManagementForm = forwardRef(({ date, category = { label: '관리', value: 'management' } }, ref) => {
    const [formData, setFormData] = useState({
        title: category.label + ' 출연 예정', // 기본 활동명
        startDate: date || '', // 활동 시작월
        endDate: date || '',
        platform: '', // 플랫폼 또는 채널
        description: '', // 상세 설명
        occurrences: 1, // 횟수
        category: category.label, // 선택된 카테고리 정보
        dist: 'management',
        mrv: 0,
        form: category.value || 'management'
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
                {/* 활동명 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">활동명</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="활동명을 입력하세요"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 활동 시작월 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">활동 시작월</label>
                    <input
                        type="month"
                        value={formData.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 활동 종료월 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">활동 종료월</label>
                    <input
                        type="month"
                        value={formData.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
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

                {/* 플랫폼 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">플랫폼/채널</label>
                    <input
                        type="text"
                        value={formData.platform}
                        onChange={(e) => handleChange('platform', e.target.value)}
                        placeholder="플랫폼을 입력하세요 (예: Netflix, YouTube)"
                        className="w-full p-2 border border-gray-300 rounded"
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

export default ManagementForm;