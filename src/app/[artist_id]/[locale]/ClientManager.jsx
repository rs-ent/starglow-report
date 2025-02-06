// src/app/components/client/ClientManager.jsx

'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';
import KPI from './KPI';
import InvestmentPoints from './InvestmentPoints';
import History from './History';
import HistoryModal from './HistoryModal';
import Outline from './Outline';
import Introduction from './Introduction';
import RiskLevel from './RiskLevel';
import Summary from './Summary';
import Rewards from './Rewards';
import Estimation from './Estimation';

const ClientManager = ({artist_id, locale, exchangeRate = 1}) => {
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [modalContents, setModalContents] = useState([]);

  useEffect(() => {
    // 클라이언트 사이드에서 최상위 <html> 태그의 lang 속성 업데이트
    document.documentElement.lang = locale;
  }, [locale]);

  const openHistoryModal = (contents) => {
    setModalContents(contents); // 선택된 contents를 저장
    setHistoryModalOpen(true);  // 모달 열기
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false); // 모달 닫기
    setModalContents([]);       // 데이터 초기화
  };
  
  return (
    <>
      {/* 헤더 */}
      <Header />

      <div className="relative flex flex-col gap-4 pb-3">
        {/* 개요 */}
        <section>
          <Outline locale={locale} />
        </section>

        {/* 소개 */}
        <section className="section-base">
          <Introduction locale={locale} />
        </section>
        
        {/* KPI 섹션 */}
        <section className="section-base">
          <h2 className="section-title">Key Performance Indicators</h2>
          <KPI locale={locale} exchangeRate={exchangeRate} />
        </section>

        {/* 투자요약 섹션 */}
        <section className="section-base">
          <h2 className="section-title">Investment Details</h2>
          <Summary locale={locale} />
        </section>

        {/* 리워드 섹션 */}
        <Rewards locale={locale} />
        
        {/* 투자 포인트 */}
        <InvestmentPoints type="Investment Point" locale={locale} />

        {/* 히스토리 */}
        <section className="section-base">
            <h2 className="section-title">History Analysis</h2>
            <History openModal={openHistoryModal} locale={locale} />
        </section>
        
        {/* History Modal */}
        {isHistoryModalOpen && (
          <HistoryModal onClose={closeHistoryModal} contents={modalContents} locale={locale} />
        )}
        
        {/* 리스크 */}
        <InvestmentPoints type="Risk" locale={locale} />

        {/* Estimation */}
        <section className="section-base">
          <h2 className="section-title">Estimation</h2>
          <Estimation locale={locale} exchangeRate={exchangeRate}/>
        </section>

        {/* 위험도 */}
        <section className="section-base">
          <h2 className="section-title">Risk Level Analysis</h2>
          <RiskLevel />
        </section>

      </div>
    </>
  );
};
  
export default ClientManager;