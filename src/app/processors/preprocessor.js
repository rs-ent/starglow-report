import { fetchArtist, fetchValuation, fetchInvestmentPoints, fetchMilestones } from '../firebase/fetch';
import { setTimeline } from '../processors/valuation';
import { computeKPIs } from '../processors/computeKPI';
import { processMilestones } from '../processors/milestone';

export const Preprocessor = async (artist_id) => {
    const valuationDataRaw = await fetchValuation(artist_id);
    if (!valuationDataRaw) {
        throw new Error("데이터를 불러오는 데 실패했습니다.");
    }

    if (!valuationDataRaw) {
        return (
            <div className="text-center text-red-500">데이터를 불러오는 데 실패했습니다.</div>
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

    const sortedData = timelineData.timeline.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const currentDate = valuationDataRaw.timestamp;
    const currentIndex =
        sortedData.findIndex(data => data.date.startsWith(currentDate.slice(0, 7))) 
        ?? sortedData.length - 1;

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