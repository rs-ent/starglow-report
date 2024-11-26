"use client"

import React, { createContext, useContext } from 'react';

// Context 생성
const DataContext = createContext(null);

// Provider 컴포넌트
export const DataProvider = ({ timelineData, kpiData, investmentData, milestones, children }) => {
    const contextValue = {
        timelineData,
        kpiData,
        investmentData,
        milestones,
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

// 커스텀 훅: Timeline 데이터 가져오기
export const useTimeline = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useTimeline must be used within a DataProvider');
    }
    return context.timelineData;
};


// 커스텀 훅: KPI 데이터 가져오기
export const useKPI = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useKPI must be used within a DataProvider');
    }
    return context.kpiData;
};

// 커스텀 훅: 마일스톤 가져오기
export const useMilestones = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useKPI must be used within a DataProvider');
    }
    return context.milestones;
}

// 커스텀 훅: 투자포인트 & 리스크 데이터 가져오기
export const useInvestmentPoints = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useInvestmentPoints must be used within a DataProvider');
    }
    return context.investmentData;
}