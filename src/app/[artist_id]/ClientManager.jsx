// src/app/components/client/ClientManager.jsx

'use client';

import React, { useState, useContext } from 'react';
import KPI from './KPI';
import InvestmentPoints from './InvestmentPointsAndRisks/InvestmentPoints';
import History from './History';
import HistoryModal from './HistoryModal';
import Outline from './Outline';
import Introduction from './Introduction';
import RiskLevel from './RiskLevel';
import Rewards from './Rewards';
import Summary from './Summary';
import RoadMap from './RoadMap';

const ClientManager = ({artist_id}) => {
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [modalContents, setModalContents] = useState([]); // Modal에 전달할 데이터

  const openHistoryModal = (contents) => {
    setModalContents(contents); // 선택된 contents를 저장
    setHistoryModalOpen(true);  // 모달 열기
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false); // 모달 닫기
    setModalContents([]);       // 데이터 초기화
  };
  
  return (
    <div className="relative flex flex-col gap-4 pb-3">

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

      {/* 투자요약 섹션 */}
      <section className="section-base">
        <h2 className="section-title">Summary</h2>
        <Summary />
      </section>

      {/* 리워드 섹션 */}
      <section className="section-base">
        <h2 className="section-title">Rewards</h2>
        <Rewards />
      </section>
      
      {/* 투자 포인트 */}
      <section className="section-base">
        <h2 className="section-title">Investment Points</h2>
        <InvestmentPoints type="Investment Point" />
      </section>

      {/* 히스토리 */}
      <section className="section-base">
          <h2 className="section-title">History</h2>
          <History openModal={openHistoryModal} />
      </section>
      
      {/* History Modal */}
      {isHistoryModalOpen && (
        <HistoryModal onClose={closeHistoryModal} contents={modalContents} />
      )}
      
      {/* 리스크 */}
      <section className="section-base">
        <h2 className="section-title">Risks</h2>
        <InvestmentPoints type="Risk" />
      </section>

      {/* 로드맵 */}
      <section className="section-base">
        <h2 className="section-title">Roadmap</h2>
        <RoadMap />
      </section>

      {/* 위험도 */}
      <section className="section-base">
        <h2 className="section-title">Risk Level Analysis</h2>
        <RiskLevel />
      </section>

    </div>
  );
};
  
export default ClientManager;