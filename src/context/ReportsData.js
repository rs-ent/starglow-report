'use client';

import { createContext, useContext } from 'react';

// Context 생성
const ReportsContext = createContext(null);

// Custom Hook for using ReportsContext
export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
};

// Provider 생성
export const ReportsProvider = ({ children, reports }) => {
  return (
    <ReportsContext.Provider value={reports}>
      {children}
    </ReportsContext.Provider>
  );
};