// src/app/components/client/InvestmentPointItem.js
'use client';

import React from 'react';
import MediaDisplay from './MediaDisplay';
import ChartDisplay from './ChartDisplay';
import KPISection from './KPISection';

const InvestmentPointItem = ({ data, sortedData }) => { // sortedData 추가
  const {
    title,
    type,
    media,
    mediaTitles,
    chartConfig,
    chartTitle,
    context,
    selectedKPIs,
  } = data;

  return (
    <section
    className="investment-point-item bg-[var(--background)] rounded-lg p-4 space-y-4 transition-transform duration-300 max-h-[60dvh] overflow-y-scroll"
    aria-label={`Investment Point: ${title}`}
    >
  
      {/* Media Display */}
      {media && media.length > 0 && <MediaDisplay media={media} mediaTitles={mediaTitles} />}
  
      {/* Chart Display */}
      {chartConfig && (
        <ChartDisplay
          chartConfig={chartConfig}
          chartTitle={chartTitle}
          sortedData={sortedData}
        />
      )}

      {/* KPI Section */}
      {selectedKPIs && <KPISection selectedKPIs={selectedKPIs} />}
  
      {/* Context Section */}
      <div className="pt-2">
        {/* Line Breaker */}
        <hr className="border-t border-[var(--background-second)] py-2" />
        {context && (
          <div
            className="context-section text-[var(--foreground)] text-sm leading-relaxed"
            role="region"
            aria-label="Context Section"
          >
            {context.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
      
    </section>
  );
};

export default InvestmentPointItem;