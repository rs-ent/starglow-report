import React, { useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatNumber } from "../utils/formatNumber";

const ChartModal = ({ isModalOpen, setIsModalOpen, timelineData }) => {
    // date 제외한 숫자 키 추출
    const numericKeys = timelineData.length > 0 
        ? Object.keys(timelineData[0]).filter(key => key !== 'date') 
        : [];

    // 동적으로 색상 생성 (HSL 사용)
    const getColor = (index) => {
        const hue = (index * 50) % 360;
        return `hsl(${hue}, 70%, 50%)`;
    };

    // 날짜 포맷 함수
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const yy = String(date.getFullYear()).slice(-2);
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yy}.${mm}.${dd}`;
    };

    return (
        isModalOpen && timelineData.length > 0 && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded p-4 relative w-full h-full flex flex-col">
                    {/* 닫기 버튼 */}
                    <button 
                        className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => setIsModalOpen(false)}
                    >
                        Close
                    </button>
                    <h3 className="text-lg font-semibold mb-2">Valuation Timeline</h3>
                    <div className="flex-1 flex justify-center items-center">
                        <LineChart width={1200} height={600} data={timelineData} >
                            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={formatDate}
                            />
                            <YAxis />
                            <Tooltip 
                                labelFormatter={formatDate}
                                formatter={(value) => `${formatNumber(value,'원',4)}`} 
                            />
                            <Legend 
                                align='center'
                                verticalAlign='bottom'
                                layout='horizontal'
                            />
                            {numericKeys.map((key, index) => (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={getColor(index)}
                                    dot={false}
                                    activeDot={{ r: 8 }}
                                />
                            ))}
                        </LineChart>
                    </div>
                </div>
            </div>
        )
    );
};

export default ChartModal;