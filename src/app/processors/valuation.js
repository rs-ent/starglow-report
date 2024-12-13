// src/app/processors/valuation.js

import { WEIGHT } from "../utils/constants";
let weights = WEIGHT;
import { 
    parse, 
    parseISO,
    isValid,
    formatISO,
    addMonths, 
    lastDayOfMonth, 
    isAfter 
} from "date-fns";

const getMonthEndDate = (date) => {
    return lastDayOfMonth(date);
};

const convertToISO = (dateStr) => {
    if (!dateStr) {
        throw new Error("Invalid date: null or undefined");
    }

    let date;
    if (dateStr && typeof dateStr === 'object' && 'seconds' in dateStr && 'nanoseconds' in dateStr) {
        const millis = dateStr.seconds * 1000 + dateStr.nanoseconds / 1000000;
        date = new Date(millis);
    } else if (dateStr instanceof Date) {
        date = dateStr;
    } else if (typeof dateStr === "string") {
        // parseISO를 사용하여 ISO 형식 파싱
        date = parseISO(dateStr);
        if (!isValid(date)) {
            // parseISO로 파싱이 실패하면 'yyyy.MM.dd' 형식으로 시도
            const cleanedDateStr = dateStr.replace(/[\.\s]+$/, '');
            date = parse(cleanedDateStr, "yyyy.MM.dd", new Date());
        }
    } else {
        throw new Error(`Unsupported date format: ${dateStr}`);
    }

    if (!isValid(date)) {
        throw new Error(`Invalid date value after parsing: ${dateStr}`);
    }

    return formatISO(date);
};

/**
 * 선형 간격을 생성하는 함수
 * @param {number} start - 시작 값
 * @param {number} end - 끝 값
 * @param {number} num - 생성할 값의 개수
 * @returns {Array<number>} - 선형 간격 배열
 */
const linspace = (start, end, num) => {
    if (num === 1) return [start];
    const step = (end - start) / (num - 1);
    return Array.from({ length: num }, (_, i) => start + step * i);
};

/**
 * 지수 감쇠 값을 계산하는 함수
 * @param {number} value - 초기 가치
 * @param {number} decayRate - 감쇠율
 * @param {number} t - 시간(월)
 * @returns {number} - 감쇠된 가치
 */
const exponentialDecay = (value, decayRate, t) => {
    return value * Math.exp(-decayRate * t);
};

const addToTimeline = (timelineMap, date, key, value) => {
    if (value > 0) {
        let dateObj = new Date(date);
        let monthEndDate = getMonthEndDate(dateObj);
        let isoMonthEnd = formatISO(monthEndDate);

        if (!timelineMap[isoMonthEnd]) {
            timelineMap[isoMonthEnd] = {
                fv_t: 0,
                sv_t: 0,
                apv_t: 0,
                rv_t: 0,
                cev_t: 0,
                mcv_twitter: 0,
                mcv_youtube: 0,
                mcv_instagram: 0,
                mds_t: 0,
                mrv_t: 0,
            };
        }

        const weight = weights[key] || 1;
        timelineMap[isoMonthEnd][key] += value * weight;
    }
};

const distributeValueOverTime = (value, startDate, endDate, decayRate = null, residualRate = 0.001, keyStr = 'sv_t') => {
    const start = getMonthEndDate(new Date(startDate));
    const end = new Date(endDate);
    const dateRange = [];
    let current = new Date(start);

    // 시계열을 월 단위로 생성
    while (current <= end) {
        dateRange.push(new Date(current));
        current = getMonthEndDate(addMonths(current, 1)); // 다음 월말로 설정
    }

    const tValues = Array.from({ length: dateRange.length }, (_, index) => index);
    const totalPeriods = 70 * 12;
    if (decayRate === null) {
        decayRate = -Math.log(residualRate) / totalPeriods;
    }

    const valueTValues = tValues.map(t => exponentialDecay(value, decayRate, t));
    const totalValueT = valueTValues.reduce((sum, val) => sum + val, 0);

    let normalizedValues;
    if (totalValueT === 0 || isNaN(totalValueT)) {
        normalizedValues = valueTValues.map(() => 0);
    } else {
        normalizedValues = valueTValues.map(val => val * (value / totalValueT));
    }

    return dateRange.map((date, index) => ({ date: date.toISOString(), [keyStr]: normalizedValues[index] }));
};

const distributeRVOverTime = (rv, startDate, endDate) => {
    const start = getMonthEndDate(new Date(startDate));
    const end = new Date(endDate);
    const dateRange = [];
    let current = new Date(start);

    while (current <= end) {
        dateRange.push(new Date(current));
        current = getMonthEndDate(addMonths(current, 1)); // 다음 월말로 설정
    }

    const numMonths = dateRange.length;

    // 감쇠율 정의 (초기 3개월, 중간 6개월, 장기 이후)
    let decayRates = [];
    if (numMonths > 12) {
        const initialDecay = linspace(0.6, 0.4, 3);
        const midDecay = linspace(0.4, 0.3, 6);
        const longDecay = Array.from({ length: numMonths - 9 }, (_, i) => 0.3 * Math.pow(0.9, i / 3));
        decayRates = [...initialDecay, ...midDecay, ...longDecay];
    } else {
        const initialDecay = linspace(0.6, 0.4, Math.min(3, numMonths));
        const midDecay = linspace(0.4, 0.3, Math.max(numMonths - 3, 0));
        decayRates = [...initialDecay, ...midDecay];
    }

    // 가치 분배 및 감쇠 적용
    const rvValues = dateRange.map((date, index) => ({
        date: date.toISOString(),
        rv_t: rv * decayRates[index] * (weights['rv_t'] || 1)
    }));

    return rvValues;
};

const integratePFVData = (timeline, pfvData, endDate, decayRate = null, residualRate = 0.001) => {
    const albums = pfvData?.av_a?.metrics || pfvData.sub_data || [];
    const totalPeriods = 70 * 12;
    
    if (decayRate === null) {
        decayRate = -Math.log(residualRate) / totalPeriods;
    }

    albums.forEach(album => {
        const releaseDate = new Date(album.release_date);
        const sv = parseFloat(album.sv) || 0;
        const apv = parseFloat(album.apv) || 0;
        const rv = parseFloat(album.rv) || 0;

        // 스트리밍 가치 분배 (sv_t)
        if (sv > 0) {
            const svEntries = distributeValueOverTime(sv, releaseDate, endDate, decayRate, residualRate, 'sv_t');
            svEntries.forEach(entry => addToTimeline(timeline, entry.date, 'sv_t', entry.sv_t));
        }

        // 인기도 가치 분배 (apv_t)
        if (apv > 0) {
            const apvEntries = distributeValueOverTime(apv, releaseDate, endDate, decayRate, residualRate, 'apv_t');
            apvEntries.forEach(entry => addToTimeline(timeline, entry.date, 'apv_t', entry.apv_t));
        }

        // 음반 판매 가치 분배 (rv_t)
        if (rv > 0) {
            const rvEntries = distributeRVOverTime(rv, releaseDate, endDate);
            rvEntries.forEach(entry => addToTimeline(timeline, entry.date, 'rv_t', entry.rv_t));
        }
    });

    return timeline;
};

const integrateCEVEvents = (timeline, cevEvents, decayRate = 1, baseInfluenceMonths = 3, maxInfluenceMonths = 12, minInfluenceMonths = 1) => {
    let maxCER = 0;
    cevEvents.forEach(event => {
        const cer = parseFloat(event.cer) || 0;
        if (cer > maxCER) maxCER = cer;
    });

    cevEvents.forEach(event => {
        const cer = parseFloat(event.cer) || 0;
        const startPeriod = event.start_period;
        if (!startPeriod) {
            console.warn('CEV event missing start_period:', event);
            return;
        }

        try {
            // 날짜 변환
            const isoStartDate = convertToISO(startPeriod);
            const eventDate = new Date(isoStartDate);
            const monthEndDate = getMonthEndDate(eventDate);
            const isoMonthEnd = formatISO(monthEndDate);

            // Validate eventDate
            if (isNaN(eventDate.getTime())) {
                throw new Error(`Invalid eventDate after setting date: ${eventDate}`);
            }

            const influenceMonths = Math.min(
                Math.max(
                    Math.round(baseInfluenceMonths + (cer / maxCER) * (maxInfluenceMonths - baseInfluenceMonths)),
                    minInfluenceMonths
                ),
                maxInfluenceMonths
            );

            for (let i = 0; i < influenceMonths; i++) {
                const date = addMonths(eventDate, i);
                const decayFactor = exponentialDecay(cer, decayRate, i);
                addToTimeline(timeline, date, 'cev_t', decayFactor);
            }

        } catch (error) {
            console.error('Error processing CEV event:', error, 'Event data:', event);
        }
    });

    return timeline;
};

const integrateMCVEvents = (timeline, mcvTwitter, mcvYoutube, mcvInstagram) => {
    const computeFractionDecayFactor = (t, peakMonth = 6, initialDecayRate = 0.001, decayIncrement = 0.0005, maxDecayRate = 0.1, maxFactor = 0.01) => {
        if (t <= peakMonth) {
            return (t / peakMonth) * maxFactor;
        } else {
            let currentDecayRate = initialDecayRate + (t - peakMonth) * decayIncrement;
            currentDecayRate = Math.min(currentDecayRate, maxDecayRate);
            let decay = maxFactor - (t - peakMonth) * currentDecayRate;
            return Math.max(decay, 0.0);
        }
    };

    // 트위터 이벤트 통합
    const twitterEvents = mcvTwitter.tweets || mcvTwitter.sub_data || [];
    twitterEvents.forEach(event => {
        try {
            const eventDate = new Date(convertToISO(event.created_at));
            const monthEndDate = getMonthEndDate(eventDate);

            const mcvValue = parseFloat(event.mcv) || 0;
            const weightedMcv = mcvValue * (weights['mcv_twitter'] || 1);

            for (let i = 0; i < 4; i++) {
                const date = addMonths(monthEndDate, i);
                const decayFactor = computeFractionDecayFactor(i);
                addToTimeline(timeline, date, 'mcv_twitter', weightedMcv * decayFactor);
            }
        } catch (error) {
            console.error('Error processing Twitter MCV event:', error, 'Event data:', event);
        }
    });

    // 유튜브 이벤트 통합
    const youtubeEvents = mcvYoutube.details || mcvYoutube.sub_data || [];
    youtubeEvents.forEach(event => {
        try {
            const eventDate = new Date(convertToISO(event.publishedAt));
            const monthEndDate = getMonthEndDate(eventDate);

            const mcvValue = parseFloat(event.MCV) || 0;
            const weightedMcv = mcvValue * (weights['mcv_youtube'] || 1);

            for (let i = 0; i < 4; i++) { // 4개월 영향
                const date = addMonths(monthEndDate, i);
                const decayFactor = computeFractionDecayFactor(i);
                addToTimeline(timeline, date, 'mcv_youtube', weightedMcv * decayFactor);
            }
        } catch (error) {
            console.error('Error processing YouTube MCV event:', error, 'Event data:', event);
        }
    });

    // 인스타그램 이벤트 통합 (추가)
    const instagramEvents = mcvInstagram.details || mcvInstagram.sub_data || [];
    instagramEvents.forEach(event => {
        try {
            const eventDate = new Date(convertToISO(event.date));
            const monthEndDate = getMonthEndDate(eventDate);

            const mcvValue = parseFloat(event.mcv) || 0;
            const weightedMcv = mcvValue * (weights['mcv_instagram'] || 1);

            for (let i = 0; i < 4; i++) { // 4개월 영향
                const date = addMonths(monthEndDate, i);
                const decayFactor = computeFractionDecayFactor(i);
                addToTimeline(timeline, date, 'mcv_instagram', weightedMcv * decayFactor);
            }
        } catch (error) {
            console.error('Error processing Instagram MCV event:', error, 'Event data:', event);
        }
    });

    return timeline;
};

const integrateMDSRecords = (timeline, mdsRecords) => {
    mdsRecords.forEach(record => {
        try {
            const mds = parseFloat(record.MDS_t);
            if (isNaN(mds)) {
                console.warn('Invalid MDS_t value:', record.MDS_t, 'Record data:', record);
                return;
            }
            const isoDate = convertToISO(record.date);
            const monthEndDate = getMonthEndDate(new Date(isoDate));
            const isoMonthEnd = formatISO(monthEndDate);
            addToTimeline(timeline, isoMonthEnd, 'mds_t', mds);
        } catch (error) {
            console.error('Error processing MDS record:', error, 'Record data:', record);
        }
    });

    return timeline;
};


const integrateMRVEvents = (timeline, mrvEvents, decayRate = 0.1, baseInfluenceMonths = 2, maxInfluenceMonths = 6, minInfluenceMonths = 1) => {
    let maxMRV = 0;
    // 최대 MRV 값 찾기
    mrvEvents.forEach(event => {
        const mrv = parseFloat(event.BF_event) || 0;
        if (mrv > maxMRV) maxMRV = mrv;
    });

    mrvEvents.forEach(event => {
        const mrv = parseFloat(event.BF_event) || 0;
        const startPeriod = event.start_period;
        if (!startPeriod) {
            console.warn('MRV event missing start_period:', event);
            return;
        }

        try {
            // 날짜 변환
            const isoStartDate = convertToISO(startPeriod);
            let eventDate = new Date(isoStartDate);
            const monthEndDate = getMonthEndDate(eventDate);

            const influenceMonths = Math.min(
                Math.max(
                    Math.round(baseInfluenceMonths + (mrv / maxMRV) * (maxInfluenceMonths - baseInfluenceMonths)),
                    minInfluenceMonths
                ),
                maxInfluenceMonths
            );

            for (let i = 0; i < influenceMonths; i++) {
                const date = addMonths(eventDate, i);
                const monthEnd = getMonthEndDate(date);
                const isoMonth = formatISO(monthEnd);

                const decayFactor = exponentialDecay(mrv, decayRate, i);
                addToTimeline(timeline, isoMonth, 'mrv_t', decayFactor);
            }
        } catch (error) {
            console.error('Error processing MRV event:', error, 'Event data:', event);
        }
    });

    return timeline;
};


export const setTimeline = (valuationData) => {
    let timeline = {};

    const fv_t_data_raw = valuationData.FV_t;
    const pfv_data = valuationData.PFV;
    const av_data = valuationData.AV;
    const sv_data = valuationData.SV;
    const rv_data = valuationData.RV;
    const apv_data = valuationData.APV;
    const pcv_data = valuationData.PCV;
    const cev_data = valuationData.CEV;
    const mcv_youtube_data = valuationData.MCV_youtube;
    const mcv_instagram_data = valuationData.MCV_instagram;
    const mcv_twitter_data = valuationData.MCV_twitter;
    const mds_data = valuationData.MDS;
    const mrv_data = valuationData.MRV;
    const importedWeights = valuationData.WEIGHT;

    const fv_t_data = Array.isArray(fv_t_data_raw) 
        ? fv_t_data_raw 
        : fv_t_data_raw?.sub_data || [];

    weights = (importedWeights && Object.keys(importedWeights).length) > 0 ? importedWeights : WEIGHT;

    fv_t_data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const endDate = fv_t_data.length > 0 ? new Date(convertToISO(fv_t_data[fv_t_data.length - 1].date)) : new Date();

    fv_t_data.forEach(entry => {
        try {
            const isoDate = convertToISO(entry.date);
            const date = new Date(isoDate);
            const monthEndDate = getMonthEndDate(date);
            const isoMonthEnd = formatISO(monthEndDate);
            const fv = parseFloat(entry.FV_t) || 0;

            addToTimeline(timeline, isoMonthEnd, 'fv_t', fv);
        } catch (error) {
            console.error('Error processing FV_t entry:', error, 'Entry data:', entry);
        }
    });

    // PFV 데이터 통합
    timeline = integratePFVData(timeline, pfv_data, endDate.toISOString(), 0.6, 1.2, sv_data, rv_data, apv_data);

    // PCV 데이터 통합
    timeline = integrateCEVEvents(timeline, pcv_data.cev_events || cev_data.sub_data || [], 1.2, 2, 6, 1);
    timeline = integrateMCVEvents(timeline, mcv_twitter_data || {}, mcv_youtube_data || {}, mcv_instagram_data || {});
    timeline = integrateMDSRecords(timeline, pcv_data.mds_record || mds_data.sub_data || []);
    timeline = integrateMRVEvents(timeline, mrv_data.record || mrv_data.sub_data || [], 1.2, 2, 12, 1);

    const timelineArray = Object.keys(timeline).map(key => {
        const obj = timeline[key];
        obj.date = key; // 키 값(key)을 객체의 date 필드로 추가
        obj.MOV = (obj.fv_t || 0) +
                  (obj.sv_t || 0) +
                  (obj.apv_t || 0) +
                  (obj.rv_t || 0) +
                  (obj.cev_t || 0) +
                  (obj.mcv_twitter || 0) +
                  (obj.mcv_instagram || 0) +
                  (obj.mcv_youtube || 0) +
                  (obj.mds_t || 0) +
                  (obj.mrv_t || 0);
        return obj;
    });

    const result = {
        timeline : timelineArray,
        initialEndDate : endDate,
    }
    return result;
};

export const groupTimelineData = (data) => {
    const groupedData = {};

    data.forEach(item => {
        const date = new Date(item.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 월은 0부터 시작하므로 1을 더함

        if (!groupedData[year]) {
            groupedData[year] = {};
        }

        if (!groupedData[year][month]) {
            groupedData[year][month] = [];
        }

        groupedData[year][month].push(item);
    });

    return groupedData;
};