import { fetchValuation, fetchInvestmentPoints, fetchMilestones } from '../firebase/fetch';
import { setTimeline } from '../processors/valuation';
import { computeKPIs } from '../processors/computeKPI';
import { processMilestones } from '../processors/milestone';
import { format } from 'date-fns';

export const TimelineData = async (artist_id) => {
    const valuationDataRaw = await fetchValuation(artist_id);
    if (!valuationDataRaw) {
        throw new Error("데이터를 불러오는 데 실패했습니다.");
    }

    if (!valuationDataRaw) {
        return (
            <div className="text-center text-red-500">데이터를 불러오는 데 실패했습니다.</div>
        );
    }

    const timelineData = setTimeline(valuationDataRaw);

    return {
        'valuationData': valuationDataRaw,
        'timelineData': timelineData,
    }
}

export const Preprocessor = async (artist_id) => {

    const data = await TimelineData(artist_id);
    const valuationDataRaw = data.valuationData;
    const timelineData = data.timelineData;
    const timeline = timelineData.timeline;

    const currentDate = valuationDataRaw.timestamp; 
   
    // currentDateObj를 'yyyy-MM' 형식으로 변환
    const currentYearMonth = format(currentDate, 'yyyy-MM');

    // sortedData 내 날짜를 년-월 비교
    let currentIndex = timeline.findIndex(data => {
        const dataDateObj = new Date(data.date);
        const dataYearMonth = format(dataDateObj, 'yyyy-MM');
        return dataYearMonth === currentYearMonth;
    });

    if (currentIndex === -1) {
        currentIndex = timeline.length - 1; // 해당 연월 없으면 마지막 인덱스
    }

    const currentData = timeline[currentIndex];
    const kpiData = computeKPIs(valuationDataRaw, timeline, currentIndex, currentData);

    const investmentData = await fetchInvestmentPoints(artist_id, "All");

    return {
        valuation: valuationDataRaw,
        timelineData: timeline,
        kpiData,
        investmentData,
    };
}