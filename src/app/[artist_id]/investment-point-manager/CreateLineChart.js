'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { safeLangValue } from '../../../script/convertLang';

// Tailwind 기반 스타일 적용
const CreateLineChart = ({ sortedData, onClose, onSave, locale = 'ko' }) => {
  const [selectedFields, setSelectedFields] = useState(['MOV']);
  const [dateRange, setDateRange] = useState({
    start:
      sortedData.length > 0
        ? new Date(sortedData[0].date).toISOString().split('T')[0]
        : '',
    end:
      sortedData.length > 0
        ? new Date(sortedData[sortedData.length - 1].date)
            .toISOString()
            .split('T')[0]
        : '',
  });

  const [markers, setMarkers] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const chartRef = useRef(null);

  const defaultLabels = {
    fv_t: { ko: '팬덤 가치', en: 'Fandom Value' },
    sv_t: { ko: '국내 스트리밍', en: 'Domestic Streams' },
    apv_t: { ko: '해외 스트리밍', en: 'Overseas Streams' },
    rv_t: { ko: '음반판매', en: 'Album Sales' },
    cev_t: { ko: '공연/행사', en: 'Concert/Events' },
    mcv_twitter: { ko: 'X (트위터)', en: 'X (Twitter)' },
    mcv_instagram: { ko: '인스타그램', en: 'Instagram' },
    mcv_youtube: { ko: '영상콘텐츠', en: 'Youtube Content' },
    mds_t: { ko: '굿즈/상품', en: 'Merchandise' },
    mrv_t: { ko: '매니지먼트', en: 'Management' },
    MOV: { ko: '종합 가치', en: 'Overall Value' },
  };

  const [customLabels, setCustomLabels] = useState(defaultLabels);

  // 데이터 중 숫자 필드만 추출
  const allFields = Object.keys(sortedData[0] || {}).filter(
    (key) => typeof sortedData[0][key] === 'number'
  );

  // 날짜 범위로 필터링된 데이터
  const filteredData = useMemo(() => {
    const { start, end } = dateRange;
    return sortedData.filter((data) => {
      const date = new Date(data.date);
      return (
        (!start || date >= new Date(start)) &&
        (!end || date <= new Date(end))
      );
    });
  }, [sortedData, dateRange]);

  // 차트용 데이터 구성
  const chartData = useMemo(() => {
    const labels = filteredData.map((data) =>
      new Date(data.date).toLocaleDateString()
    );

    const datasets = selectedFields.map((field) => {
      const labelObj = customLabels[field] || defaultLabels[field];
      const localizedLabel = safeLangValue(labelObj, locale);

      return {
        label: localizedLabel,
        data: filteredData.map((item) => item[field]),
        borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        tension: 0.4,
      };
    });

    return { labels, datasets };
  }, [filteredData, selectedFields, customLabels, locale]);

  // 차트 옵션
  const chartOptions = useMemo(() => {
    return {
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
                backgroundColor: marker.color || 'rgba(255, 99, 132, 0.3)',
                radius: marker.radius || 6,
                label: {
                    content: marker.description 
                    ? safeLangValue(marker.description, locale) 
                    : safeLangValue({ ko: '', en: '' }, locale),
                  enabled: !!safeLangValue(marker.description, locale),
                  position: 'center',
                  backgroundColor: '#333',
                  color: '#fff',
                  font: { size: 12 },
                  padding: 4,
                },
              };
            } else if (marker.type === 'box') {
              acc[`marker_${index}`] = {
                type: 'box',
                xMin: marker.xMin,
                xMax: marker.xMax,
                yMin: marker.yMin,
                yMax: marker.yMax,
                backgroundColor: 'rgba(100,100,100,0.1)',
                borderColor: '#666',
                borderWidth: 1,
                label: {
                    content: marker.description 
                    ? safeLangValue(marker.description, locale) 
                    : safeLangValue({ ko: '', en: '' }, locale),
                  enabled: !!safeLangValue(marker.description, locale),
                  position: 'start',
                  backgroundColor: '#333',
                  color: '#fff',
                  font: { size: 12 },
                  padding: 4,
                },
              };
            }
            return acc;
          }, {}),
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',
          },
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: 'x',
          },
        },
      },
    };
  }, [markers]);

  // 마우스 드래그 이벤트 (포인트/박스 마커)
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const handleMouseDown = (event) => {
      if (!chart.scales) return;
      const xScale = chart.scales['x'];
      const yScale = chart.scales['y'];

      const rect = chart.canvas.getBoundingClientRect();
      const xPixel = event.clientX - rect.left;
      const yPixel = event.clientY - rect.top;

      const xValue = xScale.getValueForPixel(xPixel);
      const yValue = yScale.getValueForPixel(yPixel);

      setIsDragging(true);
      setDragStart({ xValue, yValue, xPixel, yPixel });
    };

    const handleMouseUp = (event) => {
      if (!chart.scales || !isDragging || !dragStart) return;

      const xScale = chart.scales['x'];
      const yScale = chart.scales['y'];

      const rect = chart.canvas.getBoundingClientRect();
      const xPixel = event.clientX - rect.left;
      const yPixel = event.clientY - rect.top;

      const xValue = xScale.getValueForPixel(xPixel);
      const yValue = yScale.getValueForPixel(yPixel);

      const deltaX = Math.abs(xPixel - dragStart.xPixel);
      const deltaY = Math.abs(yPixel - dragStart.yPixel);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      const CLICK_THRESHOLD = 5;
      if (distance < CLICK_THRESHOLD) {
        // 클릭 → point 마커
        setMarkers((prev) => [
          ...prev,
          {
            type: 'point',
            xValue,
            yValue,
            color: '#FF6384',
            radius: 8,
            alpha: 0.8,
            description: { ko: '', en: '' },
          },
        ]);
      } else {
        // 드래그 → box 마커
        setMarkers((prev) => [
          ...prev,
          {
            type: 'box',
            xMin: Math.min(dragStart.xValue, xValue),
            xMax: Math.max(dragStart.xValue, xValue),
            yMin: Math.min(dragStart.yValue, yValue),
            yMax: Math.max(dragStart.yValue, yValue),
            color: '#4BC0C0',
            alpha: 0.3,
            description: { ko: '', en: '' },
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

  // 라벨 값 변경 (다국어)
  const handleLabelChange = (field, value) => {
    setCustomLabels((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [locale]: value,
      },
    }));
  };

  // 마커 CRUD
  const addMarker = () => {
    setMarkers((prev) => [
      ...prev,
      { type: 'point', xValue: '', yValue: '', color: '', radius: 8, description: { ko: '', en: '' }, },
    ]);
  };
  const updateMarker = (index, key, value) => {
    setMarkers((prev) =>
      prev.map((marker, i) => (i === index ? { ...marker, [key]: value } : marker))
    );
  };
  const removeMarker = (index) => {
    setMarkers((prev) => prev.filter((_, i) => i !== index));
  };

  // 최종 저장
  const handleSave = () => {
    const filtered = sortedData.filter((data) => {
      const date = new Date(data.date);
      return (
        (!dateRange.start || date >= new Date(dateRange.start)) &&
        (!dateRange.end || date <= new Date(dateRange.end))
      );
    });

    const chartData = {
      selectedFields: selectedFields.map((field) => ({
        field,
        label: customLabels[field] || field,
        data: filtered.map((dt) => dt[field]),
      })),
      dateRange,
      markers,
    };

    onSave(chartData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur-sm">
      {/* 모달 박스 */}
      <div className="bg-[rgba(25,25,25,1)] w-[90vw] h-[90vh] rounded-lg shadow-lg p-6 relative overflow-y-scroll">
        <h2 className="text-2xl font-bold mb-4">
          {locale === 'ko' ? '라인 차트 생성' : 'Create Line Chart'}
        </h2>
        {/* 닫기 버튼 */}
        <button
          className="fixed top-10 right-24 text-gray-500 hover:text-gray-700 text-4xl"
          onClick={onClose}
        >
          &times;
        </button>

        {/* 날짜 범위 */}
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <label className="flex flex-col text-sm font-medium">
            {locale === 'ko' ? '시작 날짜' : 'Start Date'}
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="mt-1 p-2 border rounded text-sm bg-transparent"
            />
          </label>

          <label className="flex flex-col text-sm font-medium">
            {locale === 'ko' ? '종료 날짜' : 'End Date'}
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="mt-1 p-2 border rounded text-sm bg-transparent"
            />
          </label>
        </div>

        {/* 데이터 필드 선택 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">
            {locale === 'ko' ? '데이터 필드 선택' : 'Select Data Fields'}
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {allFields.map((field) => {
              const labelObj = customLabels[field] || defaultLabels[field];
              const labelText = safeLangValue(labelObj, locale);

              return (
                <div key={field} className="grid grid-cols-1 items-center gap-2">
                  <label className="flex items-center gap-1 text-sm">
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
                      className="cursor-pointer"
                    />
                    <span>{labelText}</span>
                  </label>

                  {/* 커스텀 라벨 입력 (선택된 경우) */}
                  {selectedFields.includes(field) && (
                    <div className='flex gap-4 mb-3'>
                        <label className="flex items-center gap-1 text-sm">
                            <span>한국어</span>
                            <input
                                type="text"
                                placeholder={
                                    locale === 'ko' ? '커스텀 라벨' : 'Custom Label'
                                }
                                value={labelObj['ko'] || ''}
                                onChange={(e) => handleLabelChange(field, e.target.value)}
                                className="p-1 border rounded text-sm bg-transparent"
                            />
                        </label>
                        <label className="flex items-center gap-1 text-sm">
                            <span>English</span>
                            <input
                                type="text"
                                placeholder={
                                    locale === 'ko' ? '커스텀 라벨' : 'Custom Label'
                                }
                                value={labelObj['en'] || ''}
                                onChange={(e) => handleLabelChange(field, e.target.value)}
                                className="p-1 border rounded text-sm bg-transparent"
                            />
                        </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 차트 미리보기 */}
        <div className="w-full mb-4">
          <div className="w-full h-[80vh]">
            <Line ref={chartRef} data={chartData} options={chartOptions} />
          </div>
        </div>
        
        {/* 마커 설정 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">
            {locale === 'ko' ? '마커' : 'Markers'}
          </h3>
          <button
            onClick={addMarker}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            {locale === 'ko' ? '마커 추가' : 'Add Marker'}
          </button>

          {/* 마커 목록 */}
          <div className="mt-2 space-y-2">
            {markers.map((marker, index) => (
              <div
                key={index}
                className="p-3 border rounded bg-transparent grid grid-cols-1 gap-2"
              >
                <div>
                    <span>Type: </span>
                    <select
                        value={marker.type}
                        onChange={(e) => updateMarker(index, 'type', e.target.value)}
                        className="p-1 border rounded text-sm bg-transparent w-32 mb-4"
                    >
                        <option value="point">Point</option>
                        <option value="box">Range</option>
                    </select>
                </div>

                {marker.type === 'point' && (
                    <div>
                        <div className="flex justify-between">
                            <div className='grid grid-cols-2 gap-1'>
                                <span>X Value: </span>
                                <input
                                    type="text"
                                    placeholder="X Value"
                                    value={marker.xValue}
                                    onChange={(e) =>
                                        updateMarker(index, 'xValue', e.target.value)
                                    }
                                    className="p-1 border rounded text-sm w-auto bg-transparent"
                                />

                                <span>Y Value: </span>
                                <input
                                    type="text"
                                    placeholder="Y Value"
                                    value={marker.yValue}
                                    onChange={(e) =>
                                    updateMarker(index, 'yValue', e.target.value)
                                    }
                                    className="p-1 border rounded text-sm w-auto bg-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {marker.type === 'box' && (
                    <div>
                        <div className="flex justify-between">
                            <div className='grid grid-cols-2 gap-1'>
                                <span>X Min: </span>
                                <input
                                    type="text"
                                    placeholder="X Min"
                                    value={marker.xMin || ''}
                                    onChange={(e) =>
                                        updateMarker(index, 'xMin', e.target.value)
                                    }
                                    className="p-1 border rounded text-sm w-auto bg-transparent"
                                />
                                <span>X Max: </span>
                                <input
                                    type="text"
                                    placeholder="X Max"
                                    value={marker.xMax || ''}
                                    onChange={(e) =>
                                        updateMarker(index, 'xMax', e.target.value)
                                    }
                                    className="p-1 border rounded text-sm w-auto bg-transparent"
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-1'>
                                <span>Y Min: </span>
                                <input
                                type="text"
                                placeholder="Y Min"
                                value={marker.yMin || ''}
                                onChange={(e) =>
                                    updateMarker(index, 'yMin', e.target.value)
                                }
                                className="p-1 border rounded text-sm w-auto bg-transparent"
                                />
                                <p>Y Max: </p>
                                <input
                                type="text"
                                placeholder="Y Max"
                                value={marker.yMax || ''}
                                onChange={(e) =>
                                    updateMarker(index, 'yMax', e.target.value)
                                }
                                className="p-1 border rounded text-sm w-auto bg-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className='grid grid-cols-2 gap-8 mt-4'>
                    <div>
                    <span>Color: </span>
                    <input
                        type="color"
                        value={marker.color || '#4bc0c0'}
                        onChange={(e) =>
                            updateMarker(index, 'color', e.target.value)
                        }
                        className="h-8 w-[85%] border-none mr-4"
                    />
                    </div>
                    <div>
                    <span>Color Alpha: </span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={marker.alpha || 0.3}
                        onChange={(e) =>
                        updateMarker(index, 'alpha', parseFloat(e.target.value))
                        }
                    />
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-8 mt-4'>
                    <div>
                        <p>설명 (ko)</p>
                        <input
                        type="text"
                        placeholder="설명"
                        value={marker.description?.ko || ''}
                        onChange={(e) =>
                            updateMarker(index, 'description', {
                            ...marker.description,
                            ko: e.target.value,
                            })
                        }
                        className="p-1 border rounded text-sm w-full bg-transparent mt-2"
                        />
                    </div>
                        <div>
                            <p>Description (en)</p>
                            <input
                            type="text"
                            placeholder="Description"
                            value={marker.description?.en || ''}
                            onChange={(e) =>
                                updateMarker(index, 'description', {
                                ...marker.description,
                                en: e.target.value,
                                })
                            }
                            className="p-1 border rounded text-sm w-full bg-transparent mt-2"
                            />
                        </div>
                </div>

                <button
                  onClick={() => removeMarker(index)}
                  className="px-2 py-1 bg-red-400 text-white rounded text-xs hover:bg-red-500 self-start md:self-center"
                >
                  {locale === 'ko' ? '삭제' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
            onClick={handleSave}
          >
            {locale === 'ko' ? '차트 저장' : 'Save Chart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateLineChart;