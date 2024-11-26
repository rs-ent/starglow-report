import { DataProvider } from '../context/GlobalData';
import DefaultLayout from '../app/components/server/DefaultLayout';
import { fetchValuation, fetchInvestmentPoints } from '../app/firebase/fetch';
import { setTimeline } from '../app/processors/valuation';
import { computeKPIs } from '../app/processors/computeKPI';
import { processMilestones } from './processors/milestone';

import "./globals.css";

export const metadata = {
  title: "투자 리포트",
};
export default async function RootLayout({ children }) {
  const valuationDataRaw = await fetchValuation();
  
  if (!valuationDataRaw) {
      return (
          <DefaultLayout>
              <div className="text-center text-red-500">데이터를 불러오는 데 실패했습니다.</div>
          </DefaultLayout>
      );
  }

  const timelineData = setTimeline({
      fv_t_data: valuationDataRaw.FV_t,
      pfv_data: valuationDataRaw.PFV,
      av_data: valuationDataRaw.AV,
      sv_data: valuationDataRaw.SV,
      rv_data: valuationDataRaw.RV,
      apv_data: valuationDataRaw.APV,
      pcv_data: valuationDataRaw.PCV,
      cev_data: valuationDataRaw.CEV,
      mcv_youtube_data: valuationDataRaw.MCV_youtube,
      mcv_twitter_data: valuationDataRaw.MCV_twitter,
      mds_data: valuationDataRaw.MDS,
      mrv_data: valuationDataRaw.MRV,
  }, null, 0.001);

  const sortedData = timelineData.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

  const currentDate = valuationDataRaw.timestamp;
  const currentIndex = sortedData.findIndex(data => data.date.startsWith(currentDate.slice(0, 7))) || sortedData.length - 1;
  const currentData = sortedData[currentIndex];
  const kpiData = computeKPIs(timelineData.timeline, currentIndex, currentData);
  const milestones = processMilestones(kpiData.sortedData);
  const investmentData = await fetchInvestmentPoints("knk_20160303", "All");
  
  return (
    <html lang="en">
      <body>
        <DefaultLayout>
          <DataProvider 
            timelineData={timelineData.timeline} 
            kpiData={kpiData} 
            investmentData={investmentData} 
            milestones={milestones}
          >
            {children}
          </DataProvider>
        </DefaultLayout>
      </body>
    </html>
  );
}
