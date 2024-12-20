'use client';
import { useReports } from './ReportsData';
import React, { createContext, useContext } from 'react';

// Context 생성
const DataContext = createContext(null);

// Provider 컴포넌트
export const DataProvider = ({ valuation, timelineData, kpiData, investmentData, milestones, artist_id, introduction, rewards, history, roadmap, children }) => {
    const reports = useReports();
    const report = reports.find(a => a.artist_id === artist_id);
    
    const contextValue = {
        valuation,
        timelineData,
        kpiData,
        investmentData,
        milestones,
        artist_id,
        report,
        introduction,
        rewards,
        history,
        roadmap,
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

// 커스텀 훅: Valuation 데이터 가져오기
export const useValuation = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useTimeline must be used within a DataProvider');
    }
    return context.valuation;
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

export const useReport = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useReport must be used within a DataProvider');
    }
    return context.report;
}

export const useIntroduction = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useIntroduction must be used within a DataProvider');
    }
    return context.introduction;
}

export const useRewards = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useIntroduction must be used within a DataProvider');
    }
    return context.rewards;
}


export const useHistory = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useIntroduction must be used within a DataProvider');
    }
    return context.history;
}

export const useRoadmap = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useIntroduction must be used within a DataProvider');
    }
    return context.roadmap;
}
