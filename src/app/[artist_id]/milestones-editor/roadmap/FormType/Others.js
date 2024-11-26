'use client';

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';

const OthersForm = forwardRef(({ date, category = { label: '기타 이벤트', value: 'others' } }, ref) => {
    const [formData, setFormData] = useState({
        title: '',
        date: date || '',
        sentiment: 0, // 기본값 Neutral (0)
        priority: 1,
        factor: 'Internal',
        description: '',
        category: 'others',
        dist: 'etc',
        form: category.value || 'others'
    });

    // date prop이 변경될 때 formData 업데이트
    useEffect(() => {
        if (date) {
            setFormData((prev) => ({
                ...prev,
                date: date,
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

    // 부모가 데이터를 가져갈 수 있도록 useImperativeHandle 사용
    useImperativeHandle(ref, () => ({
        getFormData: () => formData, // 현재 폼 데이터를 반환
    }));

    return (
        <div className="p-4 bg-white shadow rounded">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 제목 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">이벤트 제목</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="이벤트 제목 입력"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* 날짜 */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">이벤트 날짜 (월까지만 입력)</label>
                    <input
                        type="month"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* Sentiment */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">Sentiment</label>
                    <div className="flex gap-2">
                        {[
                            { label: 'Positive', value: 1 },
                            { label: 'Neutral', value: 0 },
                            { label: 'Negative', value: -1 },
                        ].map(({ label, value }) => (
                            <button
                                key={value}
                                className={`px-4 py-2 rounded ${
                                    formData.sentiment === value
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-800'
                                }`}
                                onClick={() => handleChange('sentiment', value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">Priority (1~5)</label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={formData.priority}
                        onChange={(e) => handleChange('priority', Number(e.target.value))}
                        className="w-full"
                    />
                    <div className="text-center text-gray-700 mt-2">
                        Priority Level: {formData.priority}
                    </div>
                </div>

                {/* Factor */}
                <div className="mb-1">
                    <label className="block text-gray-700 mb-2">Factor</label>
                    <div className="flex gap-2">
                        {['Internal', 'External', 'Hybrid'].map((factor) => (
                            <button
                                key={factor}
                                className={`px-4 py-2 rounded ${
                                    formData.factor === factor
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-200 text-gray-800'
                                }`}
                                onClick={() => handleChange('factor', factor)}
                            >
                                {factor}
                            </button>
                        ))}
                    </div>
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

export default OthersForm;