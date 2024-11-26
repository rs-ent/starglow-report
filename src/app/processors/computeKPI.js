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
const calculateRevenueVolatility = (data) => {
    if (!data || data.length === 0) return 0;

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

// KPI 계산 함수
export const computeKPIs = (sortedData, currentIndex, currentData) => {
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
    const activeGrowthRatesAvg = activityMonthsCount > 1 ? activityGrowthRatesSum / (activityMonthsCount - 1) : 0;

    const movingAverage6 = sortedData.length >= 6 
        ? calculateMovingAverage(sortedData.slice(0, currentIndex + 1), 6) 
        : Array(currentIndex + 1).fill(null);
    const ma6Current = movingAverage6[movingAverage6.length - 1];

    const movingAverage3 = sortedData.length >= 3 
        ? calculateMovingAverage(sortedData.slice(0, currentIndex + 1), 3) 
        : Array(currentIndex + 1).fill(null);
    const ma3Current = movingAverage3[movingAverage3.length - 1];

    // 수익 변동성 계산
    const revenueVolatilityStd = calculateRevenueVolatility(sortedData.slice(0, currentIndex + 1));

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

    return {    
        peakValue: peakData.value,
        peakDate: peakData.date ? peakData.date.slice(0, 7) : 'N/A',
        totalValue: currentData ? currentData.MOV : 0,
        activeRevenueAvg,
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
    };
};