// src/app/components/client/ChartDisplay.js

'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
} from 'recharts';
import { formatNumber } from '../../utils/formatNumber';

const calculateYAxisDomain = (data, chartConfig) => {
  if (!data || !chartConfig) {
    console.warn("Data or chartConfig is missing. Defaulting to [0, 1]");
    return [0, 1]; // 기본값
  }

  // 데이터의 최대값 계산
  const fieldValues = chartConfig.selectedFields.flatMap(field =>
    data.map(d => d[field.label || field.field] || 0)
  );

  // 마커의 최대값 계산
  const markerValues = chartConfig.markers?.map(marker => marker.yMax || 0) || [];

  // 데이터와 마커 값 중 최대값 찾기
  const maxY = Math.max(...fieldValues, ...markerValues);

  // 최대값에 10%~20% 여유 추가
  const paddingFactor = 0.1; // 여유 비율 (10%~20% 범위에서 조정 가능)
  const paddedMaxY = maxY + maxY * paddingFactor;

  return [0, paddedMaxY]; // Y축 도메인 반환
};

const ChartDisplay = ({ chartConfig, chartTitle, sortedData }) => { // sortedData 추가
  const data = processChartData(chartConfig, sortedData); // sortedData 전달

  return (
    <div className="chart-display">
      {/* 차트 제목 */}
      {chartTitle && <h2 className="pb-4 text-xs font-light text-center text-[var(--foreground-muted)]">{chartTitle}</h2>}

  
      <ResponsiveContainer width="100%" height={250}>
        <LineChart 
          data={data}
          margin={{ top: 0, right: 20, left: -15, bottom: 0 }}
        >
          {/* 격자 배경 */}
          <CartesianGrid strokeDasharray="8 8" stroke="var(--secondary)" opacity={0.15} />
  
          {/* 축 */}
          <XAxis
            dataKey="date"
            tick={{ fontSize: 8, fill: 'var(--foreground-muted)' }}
          />
          <YAxis
            domain={calculateYAxisDomain(data, chartConfig)}
            tick={{ fontSize: 8, fill: 'var(--foreground-muted)' }}
            tickFormatter={(value) => formatNumber(value, '', 1)}
            label={{
              angle: -90,
              position: 'insideLeft',
              fontSize: 10,
              fill: 'var(--foreground-muted)',
            }}
          />
  
          {/* 툴팁 
          <Tooltip
            formatter={(value, name) => [formatNumber(value, '', 2), name]}
            contentStyle={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--secondary)',
              borderRadius: '8px',
              color: 'var(--foreground)',
              fontSize: 10,
            }}
            itemStyle={{ color: 'var(--foreground)' }}
            wrapperStyle={{
              padding: '2px', // 필요하면 내부 여백 조정
            }}
          />*/}
  
          {/* 범례 */}
          <Legend wrapperStyle={{ position: 'relative', top: -30, fontSize: 12, color: 'var(--foreground-muted)' }} />

  
          {/* 선택된 필드의 선 그리기 */}
          {chartConfig.selectedFields.map((field, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={field.label || field.field}
              stroke={getLineColor(index)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          ))}
  
          {/* 마커 렌더링 */}
          {chartConfig.markers &&
            chartConfig.markers.map((marker, index) =>
              renderMarker(marker, index, sortedData)
            )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Y축의 최대값을 마커의 yMax 중 최댓값으로 설정
const getMarkerMaxY = (markers) => {
  if (!markers) return [];
  return markers.map(marker => marker.yMax || 0);
};

const processChartData = (chartConfig, sortedData) => {
  if (!chartConfig || !chartConfig.dateRange) {
    console.error('Invalid chartConfig or missing dateRange');
    return [];
  }

  const { start, end } = chartConfig.dateRange;

  // 필터링: dateRange에 해당하는 데이터만 처리
  const filteredData = sortedData.filter((item) => {
    const itemDate = new Date(item.date); // item.date는 ISO 8601 형식으로 가정
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    return (
      (!startDate || itemDate >= startDate) && 
      (!endDate || itemDate <= endDate)
    );
  });

  // 데이터 매핑: 선택된 필드를 기준으로 데이터 처리
  return filteredData.map((item) => {
    const dataPoint = { date: formatDate(item.date) };
    chartConfig.selectedFields.forEach((field) => {
      dataPoint[field.label || field.field] = item[field.field];
    });
    return dataPoint;
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  // 원하는 날짜 형식으로 포맷 (예: YYYY-MM-DD)
  return date.toISOString().split('T')[0];
};

const getLineColor = (index) => {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#387908'];
  return colors[index % colors.length];
};

const renderMarker = (marker, index, sortedData) => {
  if(marker.type === 'box' && marker.xMax - marker.xMin <= 2) {
    marker.type = 'line';
    const xValue = Math.ceil((marker.xMax + marker.xMin) / 2);
    marker.xValue = xValue;
  }
    
  switch (marker.type) {
    case 'box':
      if (marker.xMin < 0 || marker.xMin >= sortedData.length || marker.xMax < 0 || marker.xMax >= sortedData.length) {
        console.warn(`Marker ${index} has xMin or xMax out of bounds`);
        return null;
      }

      const x1 = sortedData[marker.xMin]?.date;
      const x2 = sortedData[marker.xMax]?.date;
      if (marker.yMin < 0) marker.yMin = 0;
      if (marker.yMax < 0) marker.yMax = 0;

      if (!x1 || !x2) {
        console.warn(`Marker ${index} has invalid xMin or xMax`);
        return null;
      }

      return (
        <ReferenceArea
          key={index}
          x1={formatDate(x1)}
          x2={formatDate(x2)}
          y1={marker.yMin}
          y2={marker.yMax}
          label={marker.description}
          fill={marker.color}
          fillOpacity={marker.alpha}
        />
      );
      case 'point': {
        return (
          <ReferenceDot
            key={index}
            x={formatDate(sortedData[marker.xValue].date)}
            y={marker.yValue}
            r={8}
            fill="var(--accent)"
            stroke="var(--foreground)"
            strokeWidth={2}
            label={{
              position: 'top',
              value: marker.description,
              fill: 'var(--accent)',
              fontSize: 9,
            }}
          />
        );
      }
    case 'line':
      return (
        <ReferenceLine
          key={index}
          x={formatDate(sortedData[marker.xValue].date)}
          stroke={marker.color}
          strokeDasharray="4 4"
          label={{
            position: 'right',
            value: marker.description,
            fill: marker.color,
            fontSize: 12,
            fontWeight: 'bold',
          }}
        />
      );
    default:
      return null;
  }
};

export default ChartDisplay;