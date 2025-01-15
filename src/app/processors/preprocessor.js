import { fetchValuation } from '../firebase/fetch';
import { setTimeline } from '../processors/valuation';
import { computeKPIs } from '../processors/computeKPI';
import { format } from 'date-fns';

export const TimelineData = async (artist_id) => {
    const valuationDataRaw = await fetchValuation(artist_id);
    if (!valuationDataRaw) {
        throw new Error("데이터를 불러오는 데 실패했습니다.");
    }

    const timelineData = setTimeline(valuationDataRaw);

    return {
        valuationData: valuationDataRaw,
        timelineData,
    }
}

export const Preprocessor = async (artist_id) => {

    const { valuationData, timelineData } = await TimelineData(artist_id);
    const timeline = timelineData.timeline;
   
    // 2) 현재 연월(yyyy-MM)을 구해, 타임라인에서 해당 인덱스를 찾음
    const currentDate = valuationData.timestamp;
    const currentYearMonth = format(currentDate, 'yyyy-MM');

    let currentIndex = timeline.findIndex((item) => {
        const dataDateObj = new Date(item.date);
        const dataYearMonth = format(dataDateObj, 'yyyy-MM');
        return dataYearMonth === currentYearMonth;
    });

    if (currentIndex === -1) {
        currentIndex = timeline.length - 1;
    }

    const currentData = timeline[currentIndex];
    const kpiData = computeKPIs(valuationData, timeline, currentIndex, currentData);

    return {
        valuation: valuationData,
        timeline: timeline,
        kpiData,
    };
}