const calculateExpectedAnnualRevenue = (activeRevenueAvg, activityFrequency, combinedVolatility, startYearMonth = null) => {
    // 월 평균 매출 & 연평균 앨범 발매 빈도 & 수익 변동성 지표
    const decayRate = combinedVolatility;

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

const calculateExpectedRevenueSpectrum = (activeRevenueAvg, revenueVolatilityStd, albumData) => {
    const totalAV = albumData.av;
    const metrics = albumData.metrics || albumData.sub_data;
    const avgAV = totalAV / metrics.length;
    
    let maxAV = -1;
    let minAV = Infinity;

    // AV 값 수집
    const avValues = metrics.map((album) => {
        if (album.av > maxAV) maxAV = album.av;
        if (album.av < minAV) minAV = album.av;
        return album.av;
    });

    // 표준 편차 계산 (원래 데이터 기준)
    const avVariance = avValues.reduce((acc, value) => acc + Math.pow(value - avgAV, 2), 0) / avValues.length;
    const avStdDev = Math.sqrt(avVariance);

    // 정규화된 AV 값 계산
    const normalizedAVs = avValues.map((value) => {
        if (maxAV === minAV) return 0.5; // 최대값과 최소값이 같다면 0.5로 처리
        return (value - minAV) / (maxAV - minAV);
    });

    // 정규화된 데이터의 평균
    const normalizedAvgAV = normalizedAVs.reduce((acc, value) => acc + value, 0) / normalizedAVs.length;

    // 정규화된 데이터의 표준 편차
    const normalizedVariance = normalizedAVs.reduce((acc, value) => acc + Math.pow(value - normalizedAvgAV, 2), 0) / normalizedAVs.length;
    const normalizedStdDev = Math.sqrt(normalizedVariance);

    const revenueSpectrum = revenueVolatilityStd / activeRevenueAvg;

    const combinedVolatility = 0.8 * revenueSpectrum + 0.2 * normalizedStdDev;

    // 최소값과 최대값 계산
    const minRevenue = activeRevenueAvg * (1 - combinedVolatility);
    const maxRevenue = activeRevenueAvg * (1 + combinedVolatility);

    // 수익률 스펙트럼 계산
    const spectrumMax = activeRevenueAvg / maxRevenue;
    const spectrumMin = minRevenue / activeRevenueAvg;

    return {
        spectrumMax: 1 - spectrumMax,
        spectrumMin: 1 - spectrumMin,
        maxRevenue: maxRevenue,
        minRevenue: minRevenue,
        combinedVolatility: combinedVolatility,
    };
}

// 이동 평균값 계산 함수
const calculateMovingAverage = (data, windowSize) => {
    const ma = [];
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
        sum += data[i].MOV ?? 0; // 현재 값을 합산
        if (i >= windowSize) {
            sum -= data[i - windowSize].MOV ?? 0; // 윈도우 밖의 값을 제거
        }
        ma.push(i >= windowSize - 1 ? sum / windowSize : null);
    }

    return ma;
};

// 수익 변동성 계산 함수
const calculateRevenueVolatility = (data, startYear = '') => {
    if (!data || data.length === 0) return 0;
    
    if (startYear) {
        const startYearInt = startYear instanceof Date ? startYear.getFullYear() : parseInt(startYear, 10);
        data = data.filter(item => {
            const itemYear = new Date(item.date).getFullYear();
            return itemYear >= startYearInt; // startYear 이후 데이터만 남김
        });
    }

    if (data.length === 0) return 0;

    let sum = 0, sumOfSquares = 0;
    const movValues = data.map(item => item.MOV ?? 0);

    for (const value of movValues) {
        sum += value;
    }
    const meanMOV = sum / movValues.length;

    for (const value of movValues) {
        sumOfSquares += Math.pow(value - meanMOV, 2);
    }
    const variance = sumOfSquares / movValues.length;
    return Math.sqrt(variance);
};

const calculateActivityFrequency = (valuationData, startYear = null) => {
    // 데이터에서 albums 배열 추출
    const albums = valuationData.AV.albums || valuationData.AV.sub_data || valuationData.SV.albums || [];

    // 연도별 발매 횟수 집계
    const releaseData = {};
    albums.forEach(album => {
        const releaseYear = parseInt(album.release_date.split(".")[0], 10); // '2019.01.07' -> 2019
        releaseData[releaseYear] = (releaseData[releaseYear] || 0) + 1; // 연도별 발매 횟수 누적
    });

    // 최소 연도와 최대 연도 계산
    const years = albums.map(album => parseInt(album.release_date.split(".")[0], 10));
    let minYear = Math.min(...years);
    if (startYear && startYear instanceof Date) {
        minYear = startYear.getFullYear().toString();
    }
    const currentYear = new Date().getFullYear(); // 현재 연도
    const maxYear = Math.max(currentYear, ...years);

    // 모든 연도 초기화 (발매 기록이 없는 연도는 0으로 설정)
    const releasesByYear = [];
    for (let year = minYear; year <= maxYear; year++) {
        releasesByYear.push(releaseData[year] || 0); // 발매 기록이 없는 연도는 0
    }

    // 발매 빈도 계산
    let totalReleases = 0; // 총 발매 횟수
    let activeYearsCount = 0; // 활동 연도 수
    let lastActiveYear = minYear; // 마지막 활동 연도

    releasesByYear.forEach((releases, yearIndex) => {
        // 발매가 있는 연도 또는 직전 연도가 활동 연도일 경우
        if (releases > 0 || yearIndex + minYear === lastActiveYear || yearIndex + minYear === lastActiveYear + 1) {
            activeYearsCount++;
            totalReleases += releases; // 발매 횟수 누적
            if(releases > 0) lastActiveYear = yearIndex + minYear; // 마지막 활동 연도 갱신
        }
    });

    const activityFrequency = activeYearsCount > 0 ? totalReleases / activeYearsCount : 0;
    return {
        totalReleases,
        releasesByYear,
        activeYearsCount,
        activityFrequency,
    };
};

// KPI 계산 함수
export const computeKPIs = (valuationData, sortedData, currentIndex, currentData) => {
    const currentDate = sortedData[currentIndex].date;
    
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

    let cumulativeMOV = 0;
    let valuePerFanSum = 0;

    let albumReleaseDate;
    let activityEndDate;

    let activityRevenueSum = 0; // 활동기 매출 합계
    let activityRevenueSumForExpectedAnnualRevenue = 0;
    let activityRevenueDateCount = 0;
    let expectedAnnualRevenueCalculationStartDate = '';
    if (valuationData.expected_revenue_calculation_start_date){
        expectedAnnualRevenueCalculationStartDate = new Date(valuationData.expected_revenue_calculation_start_date);
    }
    let activityGrowthRatesSum = 0; // 활동기 성장률 합계
    let activityMonthsCount = 0; // 활동기 데이터 수 (1~3개월 기준)
    let previousActivityMonthMOV = null;

    let maxCoreRevenueValue = -Infinity;
    let maxCoreRevenueLabel = '';

    for (let i = 0; i <= currentIndex; i++) {
        const data = sortedData[i];
        const currentDate = new Date(data.date);
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

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
        cumulativeMOV += data.MOV ?? 0;
        
        if(data.MOV && data.MOV > 0 && data.fv_t && data.fv_t > 0) {
            valuePerFanSum += (data.MOV / data.fv_t);
        }

        // 앨범 발매일 및 활동기 설정
        if (data.discography && data.discography.length > 0) {
            data.discography.forEach(album => {
                const releaseDate = new Date(album.release_date);
                if (!albumReleaseDate || releaseDate > albumReleaseDate) {
                    albumReleaseDate = releaseDate;
                    activityEndDate = new Date(albumReleaseDate);
                    activityEndDate.setMonth(albumReleaseDate.getMonth() + 3); // 발매 후 3개월
                }
            });
        }

        if (albumReleaseDate && activityEndDate && currentDate >= albumReleaseDate && currentDate <= activityEndDate) {
            activityRevenueSum += data.MOV ?? 0; // 활동기 매출 합산
            if (expectedAnnualRevenueCalculationStartDate && expectedAnnualRevenueCalculationStartDate <= currentDate) {
                activityRevenueSumForExpectedAnnualRevenue += data.MOV;
                activityRevenueDateCount ++;
            }
            activityMonthsCount++; // 활동기 데이터 카운트
    
            // 활동기 성장률 계산
            if (previousActivityMonthMOV !== null) {
                const growthRate = previousActivityMonthMOV !== 0
                    ? (data.MOV - previousActivityMonthMOV) / previousActivityMonthMOV
                    : 0;
                activityGrowthRatesSum += growthRate;
            }
            previousActivityMonthMOV = data.MOV; // 현재 MOV를 저장
        }
    }

    // 활동기 매출 평균 및 성장률 평균 계산
    const activeRevenueAvg = activityMonthsCount > 0 ? activityRevenueSum / activityMonthsCount : 0;
    const activityRevenueAvgForExpectedAnnualRevenue = activityRevenueDateCount > 0 ? activityRevenueSumForExpectedAnnualRevenue / activityRevenueDateCount : activeRevenueAvg;
    const activeGrowthRatesAvg = activityMonthsCount > 1 ? activityGrowthRatesSum / (activityMonthsCount - 1) : 0;

    // 연평균 활동 빈도 (totalReleases: 총 발매횟수 / activeYearsCount: 활동 연도 수 / activityFrequency: 활동 빈도)
    const activityFrequency = calculateActivityFrequency(valuationData, expectedAnnualRevenueCalculationStartDate);

    const movingAverage6 = sortedData.length >= 6 
        ? calculateMovingAverage(sortedData.slice(0, currentIndex + 1), 6) 
        : Array(currentIndex + 1).fill(null);
    const ma6Current = movingAverage6[movingAverage6.length - 1];

    const movingAverage3 = sortedData.length >= 3 
        ? calculateMovingAverage(sortedData.slice(0, currentIndex + 1), 3) 
        : Array(currentIndex + 1).fill(null);
    const ma3Current = movingAverage3[movingAverage3.length - 1];

    

    // 수익 변동성 계산
    const revenueVolatilityStd = calculateRevenueVolatility(sortedData.slice(0, currentIndex + 1), expectedAnnualRevenueCalculationStartDate);

    const halfIndex = Math.floor(currentIndex / 2);
    const initialPeriodData = sortedData.slice(0, halfIndex + 1);
    const finalPeriodData = sortedData.slice(halfIndex, currentIndex + 1);

    const initialMOVAvg = initialPeriodData.length
        ? initialPeriodData.reduce((sum, data) => sum + (data.MOV ?? 0), 0) / initialPeriodData.length
        : 0;

    const finalMOVAvg = finalPeriodData.length
        ? finalPeriodData.reduce((sum, data) => sum + (data.MOV ?? 0), 0) / finalPeriodData.length
        : 0;

    const startDate = sortedData[0]?.date ? new Date(sortedData[0].date) : null;
    const endDate = currentData?.date ? new Date(currentData.date) : null;

    if (!startDate || !endDate) {
        throw new Error('Invalid date range');
    }

    const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    const totalYears = totalMonths / 12;

    const CAGR = (totalYears > 0 && initialMOVAvg > 0)
        ? Math.pow(finalMOVAvg / initialMOVAvg, 1 / totalYears) - 1
        : 0;

    // 수익 다양성 지수 계산 (예시: Shannon Diversity Index)
    const totalSum = Object.values(revenueTotals).reduce((a, b) => a + b, 0);
    const categoryCount = Object.values(revenueTotals).length;

    const revenueDiversityIndex = Object.values(revenueTotals).reduce((sum, val) => {
        const proportion = val / totalSum;
        return sum - (proportion > 0 ? proportion * Math.log(proportion) : 0);
    }, 0);

    const maxDiversityIndex = Math.log(categoryCount); // H_max = ln(N)
    const normalizedDiversityIndex = revenueDiversityIndex / maxDiversityIndex;

    const valuePerFan = (currentData.MOV / currentData.fv_t) * 10000;
    const valuePerFanAvg = (valuePerFanSum / currentIndex) * 10000;

    const expectedRevenueSpectrum = calculateExpectedRevenueSpectrum(activityRevenueAvgForExpectedAnnualRevenue, revenueVolatilityStd, valuationData.AV);
    const expectedAnnualRevenue = calculateExpectedAnnualRevenue(
                                    activityRevenueAvgForExpectedAnnualRevenue, 
                                    activityFrequency.activityFrequency, 
                                    expectedRevenueSpectrum.combinedVolatility);

    return {    
        peakValue: peakData.value,
        peakDate: peakData.date ? peakData.date.slice(0, 7) : 'N/A',
        totalValue: currentData ? currentData.MOV : 0,
        activityRevenueAvgForExpectedAnnualRevenue,
        activeGrowthRatesAvg,
        ma6Current,
        ma3Current,
        revenueVolatilityStd,
        maxCoreRevenueLabel,
        maxCoreRevenueValue,
        CAGR,
        cumulativeMOV,
        valuePerFan,
        valuePerFanAvg,
        revenueDiversityIndex,
        normalizedDiversityIndex,
        sortedData,
        currentDate,
        currentData,
        activityFrequency,
        expectedAnnualRevenue,
        expectedRevenueSpectrum
    };
};