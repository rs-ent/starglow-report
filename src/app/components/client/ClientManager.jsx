// src/app/components/client/ClientManager.jsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import KPI from './KPI';
import InvestmentPoints from './InvestmentPointsAndRisks/InvestmentPoints';
import Timeline from './Timeline';

const ClientManager = () => {
  const [selectedData, setSelectedData] = useState(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  
  return (
    <div className="flex flex-col gap-4 pb-3">
      
      {/* KPI 섹션 */}
      <section className="section-base">
        <h2 className="section-title">Key Performance Indicators</h2>
        <KPI />
      </section>
      
      {/* 투자 포인트 */}
      <section className="section-base">
        <h2 className="section-title">Investment Points</h2>
        <InvestmentPoints type="Investment Point" />
      </section>
      
      {/* 리스크 */}
      <section className="section-base">
        <h2 className="section-title">Risks</h2>
        <InvestmentPoints type="Risk" />
      </section>

      {/* 타임라인 */}
      <section className="section-base">
        <h2 className="section-title">Timeline</h2>
        <Timeline />
      </section>

    </div>
  );
};
  
export default ClientManager;