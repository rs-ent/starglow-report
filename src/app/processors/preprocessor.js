import { fetchArtist, fetchValuation, fetchInvestmentPoints, fetchMilestones } from '../firebase/fetch';
import { setTimeline } from '../processors/valuation';
import { computeKPIs } from '../processors/computeKPI';
import { processMilestones } from '../processors/milestone';
import { parseISO, isValid, format } from 'date-fns';

export const Preprocessor = async (artist_id) => {
    const valuationDataRaw = await fetchValuation(artist_id);
    console.log(valuationDataRaw);
    if (!valuationDataRaw) {
        throw new Error("데이터를 불러오는 데 실패했습니다.");
    }

    if (!valuationDataRaw) {
        return (
            <div className="text-center text-red-500">데이터를 불러오는 데 실패했습니다.</div>
        );
    }

    console.log('ValuationDataRaw.WEIGHT', valuationDataRaw.WEIGHT);
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
        mcv_instagram_data: valuationDataRaw.MCV_instagram,
        mcv_twitter_data: valuationDataRaw.MCV_twitter,
        mds_data: valuationDataRaw.MDS,
        mrv_data: valuationDataRaw.MRV,
        importedWeights: valuationDataRaw.WEIGHT,
    }, null, 0.001);

    const sortedData = timelineData.timeline.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const currentDate = valuationDataRaw.timestamp; 
    /*console.log(currentDate);
    // currentDate가 {seconds, nanoseconds} 형태라면 Date로 변환
    if (currentDate && typeof currentDate === 'object' && 'seconds' in currentDate && 'nanoseconds' in currentDate) {
        const millis = currentDate.seconds * 1000 + currentDate.nanoseconds / 1000000;
        currentDateObj = new Date(millis);
    } else {
        // 혹시 string 형태면 parseISO 등으로 처리 가능
        // 여기서는 Firestore Timestamp만 온다고 가정
        throw new Error("currentDate 형식이 지원되지 않습니다.");
    }*/
   
    // currentDateObj를 'yyyy-MM' 형식으로 변환
    const currentYearMonth = format(currentDate, 'yyyy-MM');

    // sortedData 내 날짜를 년-월 비교
    let currentIndex = sortedData.findIndex(data => {
        const dataDateObj = new Date(data.date);
        const dataYearMonth = format(dataDateObj, 'yyyy-MM');
        return dataYearMonth === currentYearMonth;
    });

    if (currentIndex === -1) {
        currentIndex = sortedData.length - 1; // 해당 연월 없으면 마지막 인덱스
    }

    const currentData = sortedData[currentIndex];
    const kpiData = computeKPIs(valuationDataRaw, timelineData.timeline, currentIndex, currentData);
    const investmentData = await fetchInvestmentPoints(artist_id, "All");

    const initialMilestones = processMilestones(kpiData.sortedData);
    const modifiedMilestones = await fetchMilestones(artist_id);
    let milestones = initialMilestones;
    if (modifiedMilestones) {
        milestones = modifiedMilestones;
    }

    return {
        valuation: valuationDataRaw,
        timelineData: sortedData,
        kpiData,
        milestones,
        investmentData,
    };
}