'use client';

import React, { useState, useEffect } from 'react';

const categories = [
    {
        label: 'Discography',
        value: 'discography',
        subcategories: [
            { label: '신규 앨범 발매', value: 'new_album' },
        ],
    },
    {
        label: 'Production',
        value: 'production',
        subcategories: [
            { 
                label: '공연/행사', 
                value: 'events',
                subcategories: [
                    { label: '콘서트', value: 'concert' },
                    { label: '투어', value: 'tour' },
                    { label: '외부행사', value: 'performance' },
                    { label: '팬미팅', value: 'fan_meeting' },
                    { label: '팬캠프', value: 'fan_camp' },
                    { label: '사인회', value: 'sign_meeting' },
                ],
            },
            { label: '영상콘텐츠', value: 'video_content' },
        ],
    },
    {
        label: 'Management',
        value: 'management',
        subcategories: [
            { label: '드라마', value: 'drama' },
            { label: '예능', value: 'variety' },
            { label: '음악방송', value: 'music_show'},
        ],
    },
    {
        label: 'Others',
        value: 'others',
        subcategories: [],
    },
];

const SelectionButtonGroup = ({ options, selectedValue, onSelect, color }) => (
    <div className="flex gap-2 flex-wrap">
        {options.map((option) => (
            <button
                key={option.value}
                className={`px-4 py-2 rounded ${
                    selectedValue?.value === option.value
                        ? `${color} text-white`
                        : 'bg-gray-200 text-gray-800'
                }`}
                onClick={() => onSelect(option)}
            >
                {option.label}
            </button>
        ))}
    </div>
);

const CategorySelector = ({ onComplete }) => {
    const [selectedCategory, setSelectedCategory] = useState('others');
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [selectedEventDetail, setSelectedEventDetail] = useState(null);

    const handleSelect = (level, value) => {
        if (level === 'category') {
            setSelectedCategory(value);
            setSelectedSubcategory(null);
            setSelectedEventDetail(null);
            // 'category'가 더 이상 하위 분류가 없다면 즉시 onComplete 호출
            if (!value.subcategories || value.subcategories.length === 0) {
                onComplete(value);
            }
        } else if (level === 'subcategory') {
            setSelectedSubcategory(value);
            setSelectedEventDetail(null);
            // 'subcategory'가 더 이상 하위 분류가 없다면 즉시 onComplete 호출
            if (!value.subcategories || value.subcategories.length === 0) {
                onComplete(value);
            }
        } else if (level === 'eventDetail') {
            setSelectedEventDetail(value);
            // 'eventDetail'을 선택했으므로 즉시 onComplete 호출
            onComplete(value);
        }
    };
    
    return (
        <div className="p-4 bg-white shadow rounded">
            <h3 className="text-lg font-semibold mb-4 text-slate-600">Select Category</h3>

            {/* 대분류 선택 */}
            <SelectionButtonGroup
                options={categories}
                selectedValue={selectedCategory}
                onSelect={(value) => handleSelect('category', value)}
                color="bg-blue-500"
            />

            {/* 하위 분류 선택 */}
            {selectedCategory?.subcategories?.length > 0 && (
                <>
                    <h4 className="text-md font-semibold text-gray-700 mt-4">하위 분류</h4>
                    <SelectionButtonGroup
                        options={selectedCategory.subcategories}
                        selectedValue={selectedSubcategory}
                        onSelect={(value) => handleSelect('subcategory', value)}
                        color="bg-green-500"
                    />
                </>
            )}

            {/* 세부 분류 선택 */}
            {selectedSubcategory?.subcategories?.length > 0 && (
                <>
                    <h4 className="text-md font-semibold text-gray-700 mt-4">세부 분류</h4>
                    <SelectionButtonGroup
                        options={selectedSubcategory.subcategories}
                        selectedValue={selectedEventDetail}
                        onSelect={(value) => handleSelect('eventDetail', value)}
                        color="bg-purple-500"
                    />
                </>
            )}
        </div>
    );
};

export default CategorySelector;