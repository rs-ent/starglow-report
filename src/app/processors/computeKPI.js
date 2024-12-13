const calculateExpectedAnnualRevenue = (activeRevenueAvg, activityFrequency, decayRate) => {
    // 감소율에 따른 활동 기간 계산
    const calculateDynamicMonths = (decayRate, minMonths = 1, maxMonths = 3) => {
        if (decayRate <= 0) return maxMonths; // 감소율이 없는 경우 최대 기간 반환
        if (decayRate > 1) decayRate = 1; // 감소율은 최대 1로 제한

        // 활동 기간 계산
        const dynamicMonths = maxMonths - (decayRate * (maxMonths - minMonths));
        return Math.max(minMonths, Math.min(dynamicMonths, maxMonths));
    };

    const dynamicMonths = calculateDynamicMonths(decayRate);

    // 누적 매출 계산 함수
    const calculateCumulativeRevenue = (initialRevenue, decayRate, months) => {
        if (decayRate === 0) return initialRevenue * months; // 감소율이 0일 경우 일정 매출
        return (initialRevenue / decayRate) * (1 - Math.exp(-decayRate * months));
    };

    // 누적 매출 계산
    const cumulativeRevenue = calculateCumulativeRevenue(activeRevenueAvg, decayRate, dynamicMonths);

    // 1년간 예상 매출 계산
    const finalExpectedAnnualRevenue = () => {
        return activityFrequency * cumulativeRevenue;
    };

    const expectedAnnualRevenue = finalExpectedAnnualRevenue();
    return expectedAnnualRevenue;
}

function calculateHistoricalSpectrum(activityRevenueMap, revenueAvg, albums = []) {

    // 값 추출
    const values = Object.values(activityRevenueMap); // 연간 수익 배열
    values.sort((a, b) => a - b);

    // 기본 통계
    const n = values.length;
    const mean = values.reduce((sum,v) => sum+v, 0) / n;
    const variance = values.reduce((sum,v) => sum + Math.pow(v-mean,2),0) / n;
    const std = Math.sqrt(variance);
    const min = values[0];
    const max = values[n-1];

    // 분위수 계산 함수
    function quantile(arr, q) {
        const pos = (arr.length - 1)*q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if ((arr[base+1]!==undefined)) {
            return arr[base] + rest*(arr[base+1]-arr[base]);
        } else {
            return arr[base];
        }
    }

    // 분위수 예: Q1(25%), Q2(50%, median), Q3(75%)
    const q1 = quantile(values, 0.25);
    const median = quantile(values, 0.5);
    const q3 = quantile(values, 0.75);

    // 스펙트럼 정의 (예시):
    // 여기서는 단순히 '과거 데이터 범위'와 '분위수 기반 범위'를 스펙트럼으로 제시.
    // min ~ max: 과거 관측치 전체 범위
    // q1 ~ q3: 중간 50% 범위
    // mean ± std: 평균 ± 표준편차 범위

    const mov_spectrum = std / mean;

    // 앨범 가치(AV) 변동성 계산
    let album_av_values = [];
    if (albums && albums.length > 0) {
        album_av_values = albums.map(a => a.av);
    }

    let album_spectrum = 0;
    if (album_av_values.length > 0) {
        const albumCount = album_av_values.length;
        const albumMean = album_av_values.reduce((s,v)=>s+v,0) / albumCount;
        const albumVar = album_av_values.reduce((s,v)=> s + Math.pow(v - albumMean, 2), 0) / albumCount;
        const albumStd = Math.sqrt(albumVar);
        album_spectrum = albumStd / albumMean; 
    }

    // album_spectrum을 20% 정도만 반영
    let combined_spectrum = mov_spectrum + (0.2 * album_spectrum);

    const spectrum = combined_spectrum;
    const spectrumMin = mean * (1 - spectrum);
    const spectrumMax = mean * (1 + spectrum);

    return {
        min,
        max,
        mean,
        std,
        q1,
        median,
        q3,
        interquartileRange: q3 - q1,
        oneStdRange: [mean - std, mean + std],
        twoStdRange: [mean - 2*std, mean + 2*std],
        spectrum,
        spectrumMin,
        spectrumMax,
        mov_spectrum,
        album_spectrum,
    };
}

const calculateActivityFrequency = (releaseDates) => {
    
    const releasesByYear = {};
    let activeYearsCount = 0;
    releaseDates.forEach(function (releaseDate) {
        const year = releaseDate.getFullYear() + '';
        if (releasesByYear[year]) {
            releasesByYear[year] += 1;
        } else {
            releasesByYear[year] = 1;
            activeYearsCount += 1;
        }
    });
    const activityFrequency = releaseDates.length > 0 ? releaseDates.length / activeYearsCount : 1;
    return {
        'totalReleases': releaseDates.length,
        'releasesByYear': releasesByYear,
        'activeYearsCount': activeYearsCount,
        'activityFrequency': activityFrequency,
    };
};

// KPI 계산 함수
export const computeKPIs = (valuationData, timeline, currentIndex, currentData) => {   
    
    let peakData = { value: -Infinity, date: '' };

    const revenueTotals = {
        sv_t: 0,
        rv_t: 0,
        cev_t: 0,
        mcv_youtube: 0,
        mds_t: 0,
        mrv_t: 0,
    };

    const revenueStreams = ['sv_t', 'rv_t', 'apv_t', 'cev_t', 'mcv_youtube', 'mds_t','mrv_t'];
    const revenueLabels = {
        sv_t: '스트리밍',
        rv_t: '앨범 판매',
        cev_t: '공연/행사',
        mcv_youtube: '유튜브 조회수',
        mds_t: '굿즈/상품 판매',
        mrv_t: '방송 출연'
    };

    let expectedAnnualRevenueCalculationStartDate = '';
    if (valuationData.expected_revenue_calculation_start_date){
        expectedAnnualRevenueCalculationStartDate = new Date(valuationData.expected_revenue_calculation_start_date);
    }
    

    let maxCoreRevenueValue = -Infinity;
    let maxCoreRevenueLabel = '';

    let totalMOV = 0;
    let activityRevenueSum = 0; // 활동기 매출 합계
    let activityCount = 0;
    let activityRevenueMap = {};
    const albums = valuationData.PFV?.av_a?.metrics || valuationData.PFV?.sub_data || [];
    const albumReleaseDates = albums
                .map(album => new Date(album.release_date))
                .filter(albumDate => 
                    !expectedAnnualRevenueCalculationStartDate || 
                    albumDate >= expectedAnnualRevenueCalculationStartDate
                )
                .sort((a, b) => a - b);

    let previousMOV = 0;
    for (let i = 0; i <= currentIndex; i++) {
        const data = timeline[i];
        const currentDate = new Date(data.date);
        const currentYear = currentDate.getFullYear() + '';

        // 최고점 가치 및 날짜 업데이트
        if (data.MOV > peakData.value) {
            peakData = { value: data.MOV, date: data.date };
        }

        // 수익 합계 계산
        revenueStreams.forEach(key => {
            const value = data[key] !== undefined && !isNaN(data[key]) ? data[key] : 0;
            if (key === 'apv_t') {
                revenueTotals['sv_t'] += value;
            } else {
                revenueTotals[key] += value;
            }
        });

        Object.entries(revenueTotals).forEach(([key, total]) => {
            if (total > maxCoreRevenueValue) {
                maxCoreRevenueValue = total;
                maxCoreRevenueLabel = revenueLabels[key]; // 해당 키의 레이블을 가져옴
            }
        });

        // 누적 MOV 계산
        totalMOV += data.MOV ?? 0;

        // 앨범 발매에 따른 활동기 확인
        const isActivity = albumReleaseDates.some(albumDate => {
            const threeMonthsLater = new Date(albumDate);
            threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

            return currentDate >= albumDate && currentDate <= threeMonthsLater;
        });

        // 활동기 매출 합산
        if (isActivity) {
            activityRevenueSum += data.MOV;
            activityCount ++;

            if (activityRevenueMap[currentYear] && activityRevenueMap[currentYear] > 0) {
                activityRevenueMap[currentYear] += data.MOV;
            } else {
                activityRevenueMap[currentYear] = data.MOV;
            }
        }

        previousMOV = data.MOV;
    }

    // 활동기 매출 평균 및 성장률 평균 계산
    const activityRevenueAvg = activityCount > 0 ? activityRevenueSum / activityCount : 0;

    // 연평균 활동 빈도 (totalReleases: 총 발매횟수 / activeYearsCount: 활동 연도 수 / activityFrequency: 활동 빈도)
    const activityFrequency = calculateActivityFrequency(albumReleaseDates);  

    const expectedRevenueSpectrum = calculateHistoricalSpectrum(activityRevenueMap, activityRevenueAvg, albums);
    const volatilityPercent = expectedRevenueSpectrum.spectrum;
    const expectedAnnualRevenue = calculateExpectedAnnualRevenue(
                                    activityRevenueAvg, 
                                    activityFrequency.activityFrequency, 
                                    volatilityPercent);

    // 수익 다양성 지표
    const revenueProportions = {}; // 각 수익원의 비율
    let diversityIndex = 0; // Shannon Diversity Index
    let maxDiversityIndex = 0; // 최대 다각화 지수 (ln(N))
    let normalizedDiversityIndex = 0;
    if ( totalMOV > 0 ) {
        Object.entries(revenueTotals).forEach(([key, value]) => {
            if (value > 0) {
                const proportion = value / totalMOV;
                revenueProportions[key] = proportion;
                diversityIndex -= proportion * Math.log(proportion); // Shannon Index 계산
            }
        });
    
        const categoryCount = Object.keys(revenueProportions).length;
        maxDiversityIndex = Math.log(categoryCount);
    
        normalizedDiversityIndex = maxDiversityIndex > 0 ? diversityIndex / maxDiversityIndex : 0;
    }

    return {    
        peakValue: peakData.value,
        peakDate: peakData.date ? peakData.date.slice(0, 7) : 'N/A',
        currentValue: currentData ? currentData.MOV : 0,
        maxCoreRevenueLabel,
        maxCoreRevenueValue,
        totalMOV,
        normalizedDiversityIndex,
        currentData,
        activityFrequency,
        expectedAnnualRevenue,
        expectedRevenueSpectrum,
        timeline,
    };
};