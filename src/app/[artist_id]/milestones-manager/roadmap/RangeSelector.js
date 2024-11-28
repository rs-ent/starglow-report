'use client';

import React, { useState, useEffect } from 'react';

const RangeSelector = ({ onComplete, initialStart }) => {
    console.log('Initial Start: ', initialStart);
    const [range, setRange] = useState({ start: '', end: '' });

    useEffect(() => {
        // 시작 날짜가 변경되었을 때, 종료 날짜보다 미래일 경우 종료 날짜를 시작 날짜로 설정
        if (range.start && range.end && new Date(range.start) > new Date(range.end)) {
            setRange((prev) => ({ ...prev, end: range.start }));
        }
    }, [range.start, range.end]);

    const handleRangeSelect = () => {
        if (range.start && range.end) {
            onComplete(range); // 상위 컴포넌트로 범위 전달
        }
    };

    return (
        <div className="p-4 bg-white shadow rounded">
            <h3 className="text-lg font-semibold mb-4 text-slate-600">Select Roadmap Range</h3>
            <div className="mb-4">
                <label className="block text-gray-700">Start Date</label>
                <input
                    type="month"
                    value={range.start}
                    onChange={(e) => setRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                        // 종료 날짜를 시작 날짜로 초기화
                        end: !prev.end || new Date(e.target.value) > new Date(prev.end) ? e.target.value : prev.end,
                    }))}
                    className="w-full p-2 border border-gray-300 rounded text-gray-700"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">End Date</label>
                <input
                    type="month"
                    value={range.end}
                    onChange={(e) => setRange((prev) => ({ ...prev, end: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded text-gray-700"
                />
            </div>
            <button
                onClick={handleRangeSelect}
                disabled={!range.start || !range.end}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
                Confirm Range
            </button>
        </div>
    );
};

export default RangeSelector;