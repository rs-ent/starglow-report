// src/app/components/client/KPISection.js

'use client';

import React from 'react';

const KPISection = ({ selectedKPIs }) => {
  return (
    <div className="kpi-section">
      {selectedKPIs.map((kpi, index) => (
        <div key={index} className="kpi-item">
          <h3 className="kpi-label">{kpi.label}</h3>
          <p className="kpi-value">{kpi.value}</p>
        </div>
      ))}
    </div>
  );
};

export default KPISection;