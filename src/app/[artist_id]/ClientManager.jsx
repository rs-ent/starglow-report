// src/app/components/client/ClientManager.jsx

'use client';

import React, { useState, useContext } from 'react';
import KPI from './KPI';
import InvestmentPoints from './InvestmentPointsAndRisks/InvestmentPoints';
import Timeline from './Timeline';
import Outline from './Outline';
import Introduction from './Introduction';

const ClientManager = ({artist_id}) => {
  
  return (
    <div className="flex flex-col gap-4 pb-3">

      {/* 개요 */}
      <section>
        <Outline />
      </section>

      {/* 소개 */}
      <section className="section-base">
        <Introduction />
      </section>
      
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