'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './CreateLineChart.css'

const CreateLineChart = ({ sortedData, onClose, onSave }) => {
    const [selectedFields, setSelectedFields] = useState(['MOV']);
    const [dateRange, setDateRange] = useState({
        start: sortedData.length > 0 ? new Date(sortedData[0].date).toISOString().split('T')[0] : '',
        end: sortedData.length > 0 ? new Date(sortedData[sortedData.length - 1].date).toISOString().split('T')[0] : '',
    });
    const [selectedChartData, setSelectedChartData] = useState([]); // 선택한 데이터를 저장
    const [markers, setMarkers] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const [dragEnd, setDragEnd] = useState(null);
    const chartRef = useRef(null); // 차트 참조
    const defaultLabels = {
        fv_t: '팬덤 가치',
        sv_t: '국내 스트리밍',
        apv_t: '해외 스트리밍',
        rv_t: '음반판매',
        cev_t: '공연/행사',
        mcv_youtube: '영상콘텐츠',
        mds_t: '굿즈/상품',
        mrv_t: '매니지먼트',
        MOV: '종합 가치',
    };
    
    const [customLabels, setCustomLabels] = useState(defaultLabels);   

    const allFields = Object.keys(sortedData[0] || {}).filter((key) => typeof sortedData[0][key] === 'number');

    const filteredData = useMemo(() => {
        const { start, end } = dateRange;
        return sortedData.filter((data) => {
            const date = new Date(data.date);
            return (!start || date >= new Date(start)) && (!end || date <= new Date(end));
        });
    }, [sortedData, dateRange]);

    const chartData = useMemo(() => {
        const labels = filteredData.map((data) => new Date(data.date).toLocaleDateString());
        const datasets = selectedFields.map((field) => ({
            label: customLabels[field] || defaultLabels[field],
            data: filteredData.map((data) => data[field]),
            borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            tension: 0.4,
        }));

        return { labels, datasets };
    }, [filteredData, selectedFields, customLabels]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        plugins: {
            legend: { display: true },
            annotation: {
                annotations: markers.reduce((acc, marker, index) => {
                    if (marker.type === 'point') {
                        acc[`marker_${index}`] = {
                            type: 'point',
                            xValue: marker.xValue,
                            yValue: marker.yValue,
                            backgroundColor: `rgba(${parseInt(marker.color.slice(1, 3), 16)}, ${parseInt(
                                marker.color.slice(3, 5),
                                16
                            )}, ${parseInt(marker.color.slice(5, 7), 16)}, ${marker.alpha})`,
                            radius: marker.radius || 8,
                            label: {
                                content: marker.description || '',
                                enabled: !!marker.description,
                                position: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                color: '#fff',
                                font: {
                                    size: 12,
                                },
                                padding: 4,
                            },
                        };
                    } else if (marker.type === 'box') {
                        if (
                            marker.xMin !== undefined &&
                            marker.xMax !== undefined &&
                            marker.yMin !== undefined &&
                            marker.yMax !== undefined
                        ) {
                            acc[`marker_${index}`] = {
                                type: 'box',
                                xMin: marker.xMin,
                                xMax: marker.xMax,
                                yMin: marker.yMin,
                                yMax: marker.yMax,
                                backgroundColor: `rgba(${parseInt(marker.color.slice(1, 3), 16)}, ${parseInt(
                                    marker.color.slice(3, 5),
                                    16
                                )}, ${parseInt(marker.color.slice(5, 7), 16)}, ${marker.alpha})`,
                                borderColor: marker.borderColor || 'rgba(75, 192, 192, 1)',
                                borderWidth: 1,
                                label: {
                                    content: marker.description || '',
                                    enabled: !!marker.description,
                                    position: 'start',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    color: '#fff',
                                    font: {
                                        size: 12,
                                    },
                                    padding: 4,
                                },
                            };
                        }
                    }
                    return acc;
                }, {}),
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x', // x축 이동 가능
                },
                zoom: {
                    wheel: {
                        enabled: true, // 휠 줌 활성화
                    },
                    pinch: {
                        enabled: true, // 핀치 줌(터치) 활성화
                    },
                    mode: 'x', // x축 기준 확대/축소
                },
            },
        },
    }), [markers, isDragging, dragStart]);

    useEffect(() => {
        const chart = chartRef.current;
    
        if (!chart) return;
    
        const handleMouseDown = (event) => {
            console.log('On Mouse Down');
            if (!chart.scales) return;
    
            const xScale = chart.scales['x'];
            const yScale = chart.scales['y'];
    
            const rect = chart.canvas.getBoundingClientRect();
            const xPixel = event.clientX - rect.left;
            const yPixel = event.clientY - rect.top;
    
            const xValue = xScale.getValueForPixel(xPixel);
            const yValue = yScale.getValueForPixel(yPixel);
    
            setIsDragging(true);
            setDragStart({ xValue, yValue, xPixel, yPixel }); // 추가: 초기 픽셀 위치 저장
        };
    
        const handleMouseUp = (event) => {
            console.log('On Mouse Up');
            if (!chart.scales || !isDragging || !dragStart) return;

            const xScale = chart.scales['x'];
            const yScale = chart.scales['y'];

            const rect = chart.canvas.getBoundingClientRect();
            const xPixel = event.clientX - rect.left;
            const yPixel = event.clientY - rect.top;

            const xValue = xScale.getValueForPixel(xPixel);
            const yValue = yScale.getValueForPixel(yPixel);

            // 마우스 이동 거리 계산
            const deltaX = Math.abs(xPixel - dragStart.xPixel);
            const deltaY = Math.abs(yPixel - dragStart.yPixel);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            const CLICK_THRESHOLD = 5; // 픽셀 단위 임계값

            if (distance < CLICK_THRESHOLD) {
                // 클릭으로 간주하여 Point 마커 추가
                setMarkers((prev) => [
                    ...prev,
                    {
                        type: 'point',
                        xValue: xValue,
                        yValue: yValue,
                        color: '#FF6384', // 기본 색상
                        radius: 8,
                        alpha: 0.8, // 불투명도
                        description: '', // 필요 시 설명 추가
                    },
                ]);
            } else {
                // 드래그로 간주하여 Box 마커 추가
                setMarkers((prev) => [
                    ...prev,
                    {
                        type: 'box',
                        xMin: Math.min(dragStart.xValue, xValue),
                        xMax: Math.max(dragStart.xValue, xValue),
                        yMin: Math.min(dragStart.yValue, yValue),
                        yMax: Math.max(dragStart.yValue, yValue),
                        color: '#4BC0C0',
                        alpha: 0.3, // 기본 불투명도
                        description: '', // 필요 시 설명 추가
                    },
                ]);
            }

            setIsDragging(false);
            setDragStart(null);
        };
    
        chart.canvas.addEventListener('mousedown', handleMouseDown);
        chart.canvas.addEventListener('mouseup', handleMouseUp);
    
        return () => {
            chart.canvas.removeEventListener('mousedown', handleMouseDown);
            chart.canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, [chartRef, isDragging, dragStart]);

    const addMarker = () => {
        setMarkers((prev) => [...prev, { type: 'point', xValue: '', yValue: '', color: '', radius: 8 }]);
    };

    const updateMarker = (index, key, value) => {
        setMarkers((prev) =>
            prev.map((marker, i) => (i === index ? { ...marker, [key]: value } : marker))
        );
    };

    const removeMarker = (index) => {
        setMarkers((prev) => prev.filter((_, i) => i !== index)); // 해당 인덱스 마커 삭제
    };

    const handleLabelChange = (field, value) => {
        setCustomLabels((prev) => ({ ...prev, [field]: value || defaultLabels[field] }));
    };

    const handleSave = () => {
        const filteredData = sortedData.filter((data) => {
            const date = new Date(data.date);
            return (!dateRange.start || date >= new Date(dateRange.start)) &&
                   (!dateRange.end || date <= new Date(dateRange.end));
        });

        const chartData = {
            selectedFields: selectedFields.map((field) => ({
                field,
                label: customLabels[field] || field,
                data: filteredData.map((data) => data[field]),
            })),
            dateRange,
            markers,
        };

        setSelectedChartData(chartData); // 상태 업데이트
        onSave(chartData); // 부모 컴포넌트로 전달
        console.log('Saved Chart Data:', chartData); // 디버깅 용
        onClose();
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Create Line Chart</h2>
                <button className="close-button" onClick={onClose}>
                    Close
                </button>

                <div>
                    <label>
                        Start Date:
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                        />
                    </label>
                    <label>
                        End Date:
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                        />
                    </label>
                </div>

                <div>
                    <h3>Select Data Fields</h3>
                    {allFields.map((field) => (
                        <div key={field}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedFields.includes(field)}
                                    onChange={() =>
                                        setSelectedFields((prev) =>
                                            prev.includes(field)
                                                ? prev.filter((f) => f !== field)
                                                : [...prev, field]
                                        )
                                    }
                                />
                                {defaultLabels[field]} ({field})
                            </label>
                            {selectedFields.includes(field) && (
                                <input
                                    type="text"
                                    placeholder="Custom Label"
                                    value={customLabels[field] || defaultLabels[field]}
                                    onChange={(e) => handleLabelChange(field, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div>
                    <h3>Markers</h3>
                    <button onClick={addMarker}>Add Marker</button>
                    {markers.map((marker, index) => (
                        <div key={index}>
                            <select
                                value={marker.type}
                                onChange={(e) => updateMarker(index, 'type', e.target.value)}
                            >
                                <option value="point">Point</option>
                                <option value="box">Range</option>
                            </select>
                            {marker.type === 'point' && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="X Value"
                                        value={marker.xValue}
                                        onChange={(e) => updateMarker(index, 'xValue', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Y Value"
                                        value={marker.yValue}
                                        onChange={(e) => updateMarker(index, 'yValue', e.target.value)}
                                    />
                                    <input
                                        type="color"
                                        value={marker.color || '#ff6384'}
                                        onChange={(e) => updateMarker(index, 'color', e.target.value)}
                                    />
                                    <label>
                                        Alpha:
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={marker.alpha || 0.3}
                                            onChange={(e) => updateMarker(index, 'alpha', parseFloat(e.target.value))}
                                        />
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={marker.description || ''}
                                        onChange={(e) => updateMarker(index, 'description', e.target.value)}
                                    />
                                </>
                            )}

                            {marker.type === 'box' && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="X Min"
                                        value={marker.xMin || ''}
                                        onChange={(e) => updateMarker(index, 'xMin', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="X Max"
                                        value={marker.xMax || ''}
                                        onChange={(e) => updateMarker(index, 'xMax', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Y Min"
                                        value={marker.yMin || ''}
                                        onChange={(e) => updateMarker(index, 'yMin', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Y Max"
                                        value={marker.yMax || ''}
                                        onChange={(e) => updateMarker(index, 'yMax', e.target.value)}
                                    />
                                    <input
                                        type="color"
                                        value={marker.color || '#4bc0c0'}
                                        onChange={(e) => updateMarker(index, 'color', e.target.value)}
                                    />
                                    <label>
                                        Alpha:
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={marker.alpha || 0.3}
                                            onChange={(e) => updateMarker(index, 'alpha', parseFloat(e.target.value))}
                                        />
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={marker.description || ''}
                                        onChange={(e) => updateMarker(index, 'description', e.target.value)}
                                    />
                                </>
                            )}
                            <button onClick={() => removeMarker(index)}>Remove Marker</button>
                        </div>
                    ))}
                </div>

                <div style={{ width: '70vw', height: '70vh', margin: '0 auto' }}>
                    <Line ref={chartRef} data={chartData} options={chartOptions} />
                </div>

                <button className="save-button" onClick={handleSave}>
                    Save Chart
                </button>
            </div>
        </div>
    );
};

export default CreateLineChart;