// src/app/processors/valuation.js

import { WEIGHT } from "@/app/utils/constants";
import { 
    parse, 
    parseISO,
    isValid,
    formatISO,
    addMonths, 
    lastDayOfMonth, 
    isAfter 
} from "date-fns";

/**
 * 월말 날짜를 반환하는 헬퍼 함수
 * @param {Date} date - 변환할 날짜
 * @returns {Date} - 해당 월의 마지막 날
 */
const getMonthEndDate = (date) => {
    return lastDayOfMonth(date);
};

const convertToISO = (dateStr) => {
    if (!dateStr) {
        throw new Error("Invalid date: null or undefined");
    }

    let date;

    // 이미 Date 객체인 경우
    if (dateStr instanceof Date) {
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
                mds_t: 0,
                mrv_t: 0,
                discography: [],
                production: {
                    events: [],
                    media: {
                        twitter: [],
                        youtube: [],
                    },
                },
                management: [],
            };
        }

        const weight = WEIGHT[key] || 1; // 기본값 1 설정
        timelineMap[isoMonthEnd][key] += value * weight;
    }
};

/**
 * 가치를 시간에 따라 분배하는 함수 (일반 가치)
 * @param {number} value - 초기 가치
 * @param {string} startDate - 시작 날짜 (ISO 문자열)
 * @param {string} endDate - 종료 날짜 (ISO 문자열)
 * @param {number} decayRate - 감쇠율
 * @param {number} residualRate - 잔존율
 * @param {string} keyStr - 값의 종류 (예: 'sv_t')
 * @returns {Array<Object>} - 날짜별 분배된 가치 배열
 */
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

/**
 * 음반 판매 가치를 시간에 따라 분배하는 함수 (분할 감쇠율 적용)
 * @param {number} rv - 초기 가치
 * @param {string} startDate - 시작 날짜 (ISO 문자열)
 * @param {string} endDate - 종료 날짜 (ISO 문자열)
 * @returns {Array<Object>} - 날짜별 분배된 가치 배열
 */
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
        rv_t: rv * decayRates[index] * (WEIGHT['rv_t'] || 1)
    }));

    return rvValues;
};

/**
 * PFV 데이터 통합 함수 (감쇠 계산 포함)
 * @param {Object} timeline - 날짜별 집계 객체
 * @param {Object} pfvData - PFV 데이터 객체
 * @param {string} endDate - 시계열 종료 날짜 (ISO 문자열)
 * @param {number} decayRate - 감쇠율
 * @param {number} residualRate - 잔존율
 * @returns {Object} - 통합된 시계열 데이터 객체
 */
const integratePFVData = (timeline, pfvData, endDate, decayRate = null, residualRate = 0.001, sv_data, rv_data, apv_data) => {
    const albums = pfvData?.av_a?.metrics || [];
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

        const svAlbum = sv_data.albums.find(a => a.release_date === album.release_date);
        const rvAlbum = rv_data.sales_data.find(a => a.discounted_revenue.toFixed(2) === album.rv_a.toFixed(2));
        const apvAlbum = apv_data.albums.find(a => a.album_id === album.spotify_album_id);

        // 최근 6개월 내의 관련 앨범을 discography에 추가
        Object.keys(timeline).forEach(date => {
            const currentMonth = new Date(date);
            const sixMonthsAgo = new Date(currentMonth);
            sixMonthsAgo.setMonth(currentMonth.getMonth() - 6);

            if (releaseDate <= currentMonth && releaseDate > sixMonthsAgo) {
                if (!timeline[date].discography) {
                    timeline[date].discography = [];
                }
                timeline[date].discography.push({
                    album_title: album.album_title,
                    release_date: album.release_date,
                    sv: album.sv || 0, // 스트리밍 가치
                    rv: album.rv || 0, // 음반 판매 가치
                    apv: album.apv || 0, // 인기도 가치
                    av: album.av || 0, // 총 가치
                    album_image: svAlbum?.img_url || album.album_image || "", // 이미지 URL
                    melon_album_id: svAlbum?.melon_album_id || "", // 멜론 ID
                    spotify_album_id: album.spotify_album_id || "", // Spotify ID
                    total_tracks: svAlbum?.total_songs || album.tracks?.length || 0, // 총 트랙 수
                    udi: album.udi || 0, // UDI 지표
                    popularity: apvAlbum?.popularity || 0, // 인기도 점수
                    discounted_revenue: album.discounted_revenue || 0, // 할인된 수익
                    total_sales: rvAlbum?.total_sales || 0, // 총 판매량
                    tracks: svAlbum.tracks?.map((track, idx) => ({
                        track_name: track.track_name || '',
                        track_name_eng: apvAlbum?.tracks[idx].track_name || '',
                        duration_ms: apvAlbum?.tracks[idx].duration_ms || 0,
                        popularity: apvAlbum?.tracks[idx].popularity || 0,
                        melon_likes: track.melon_likes || 0,
                        melon_streams: track.melon_streams || 0,
                        melon_revenue: track.melon_revenue || 0,
                        representative: track.representative === "TRUE" ? true : false,
                        mv: track.mv === "TRUE" ? true : false,
                    })) || [] // 트랙 리스트
                });
            }
        });
    });

    return timeline;
};

/**
 * CEV 이벤트를 통합하는 함수 (감쇠 계산 포함)
 * @param {Object} timeline - 날짜별 집계 객체
 * @param {Array} cevEvents - CEV 이벤트 배열
 * @param {number} decayRate - 감쇠율
 * @param {number} baseInfluenceMonths - 기본 영향 기간
 * @param {number} maxInfluenceMonths - 최대 영향 기간
 * @param {number} minInfluenceMonths - 최소 영향 기간
 * @returns {Object} - 통합된 시계열 데이터 객체
 */
const integrateCEVEvents = (timeline, cevEvents, decayRate = 0.1, baseInfluenceMonths = 2, maxInfluenceMonths = 12, minInfluenceMonths = 1) => {
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
                const monthEnd = getMonthEndDate(date);
                const isoMonth = formatISO(monthEnd);

                // Validate date
                if (isNaN(monthEndDate.getTime())) {
                    console.warn(`Invalid date after adding months: ${date}`);
                    continue; // Skip invalid dates
                }

                const decayFactor = exponentialDecay(cer, decayRate, i);
                addToTimeline(timeline, isoMonthEnd, 'cev_t', decayFactor);

                if (i === 0 && timeline[isoMonth]) {
                    timeline[isoMonth].production.events.push({
                        title: event.title || "Untitled Event",
                        start_period: event.start_period,
                        end_period: event.end_period || null,
                        cer,
                        revenue: event.revenue || 0,
                        location: event.location || "Unknown",
                        concert_url: event.concert_url || null,
                        image_url: event.image_url || null,
                        artist_name_kor: event.artist_name_kor || null,
                        artist_name_eng: event.artist_name_eng || null,
                    });
                }
            }
        } catch (error) {
            console.error('Error processing CEV event:', error, 'Event data:', event);
        }
    });

    return timeline;
};

/**
 * MCV 이벤트를 통합하는 함수 (감쇠 계산 포함)
 * @param {Object} timeline - 날짜별 집계 객체
 * @param {Object} mcvTwitter - 트위터 MCV 데이터 객체
 * @param {Object} mcvYoutube - 유튜브 MCV 데이터 객체
 * @returns {Object} - 통합된 시계열 데이터 객체
 */
const integrateMCVEvents = (timeline, mcvTwitter, mcvYoutube) => {
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
    const twitterEvents = mcvTwitter.tweets || [];
    twitterEvents.forEach(event => {
        try {
            const createdAt = convertToISO(event.created_at);
            const eventDate = new Date(createdAt);
            const monthEndDate = getMonthEndDate(eventDate);

            const mcvValue = parseFloat(event.mcv) || 0;
            const weightedMcv = mcvValue * (WEIGHT['mcv_twitter'] || 1);

            for (let i = 0; i < 12; i++) { // 12개월 영향
                const date = addMonths(monthEndDate, i);
                const isoMonth = formatISO(getMonthEndDate(date));

                const decayFactor = computeFractionDecayFactor(i);
                addToTimeline(timeline, isoMonth, 'mcv_twitter', weightedMcv * decayFactor);

                if (i === 0 && timeline[isoMonth]) {
                    timeline[isoMonth].production.media.twitter.push({
                        created_at: event.created_at,
                        id: event.id,
                        text: event.text,
                        mcv: event.mcv || 0,
                        ev: event.ev || 0,
                        like_count: event.like_count || 0,
                        retweet_count: event.retweet_count || 0,
                        reply_count: event.reply_count || 0,
                        quote_count: event.quote_count || 0,
                        engagement_value: event.engagement_value || 0,
                        user_id: event.user_id || null,
                        entities: event.entities || {},
                        is_retweet: event.is_retweet || false,
                        lang: event.lang || null,
                        source: event.source || null,
                    });
                }
            }
        } catch (error) {
            console.error('Error processing Twitter MCV event:', error, 'Event data:', event);
        }
    });

    // 유튜브 이벤트 통합
    const youtubeEvents = mcvYoutube.details || [];
    youtubeEvents.forEach(event => {
        try {
            const publishedAt = convertToISO(event.publishedAt);
            const eventDate = new Date(publishedAt);
            const monthEndDate = getMonthEndDate(eventDate);

            const mcvValue = parseFloat(event.MCV) || 0;
            const weightedMcv = mcvValue * (WEIGHT['mcv_youtube'] || 1);

            for (let i = 0; i < 12; i++) { // 12개월 영향
                const date = addMonths(monthEndDate, i);
                const isoMonth = formatISO(getMonthEndDate(date));

                const decayFactor = computeFractionDecayFactor(i);
                addToTimeline(timeline, isoMonth, 'mcv_youtube', weightedMcv * decayFactor);
                
                if (i === 0 && timeline[isoMonth]) {
                    timeline[isoMonth].production.media.youtube.push({
                        published_at: event.publishedAt,
                        id: event.id,
                        view_count: event.viewCount || 0,
                        like_count: event.likeCount || 0,
                        comment_count: event.commentCount || 0,
                        duration_seconds: event.duration_seconds || 0,
                        engagement_ratio: event.engagement_ratio || 0,
                        efficiency_ratio: event.efficiency_ratio || 0,
                        discounted_ratio: event.discounted_ratio || 0,
                        mcv: event.MCV || 0,
                    });
                }
            }
        } catch (error) {
            console.error('Error processing YouTube MCV event:', error, 'Event data:', event);
        }
    });

    return timeline;
};

/**
 * MDS 레코드를 통합하는 함수
 * @param {Object} timeline - 날짜별 집계 객체
 * @param {Array} mdsRecords - MDS 레코드 배열
 * @returns {Object} - 통합된 시계열 데이터 객체
 */
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

/**
 * MRV 이벤트를 통합하는 함수 (감쇠 계산 포함)
 * @param {Object} timeline - 날짜별 집계 객체
 * @param {Array} mrvEvents - MRV 이벤트 배열
 * @param {number} decayRate - 감쇠율
 * @param {number} baseInfluenceMonths - 기본 영향 기간
 * @param {number} maxInfluenceMonths - 최대 영향 기간
 * @param {number} minInfluenceMonths - 최소 영향 기간
 * @returns {Object} - 통합된 시계열 데이터 객체
 */
const integrateMRVEvents = (timeline, mrvEvents, decayRate = 0.1, baseInfluenceMonths = 2, maxInfluenceMonths = 12, minInfluenceMonths = 1) => {
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
            const isoMonthEnd = formatISO(monthEndDate);

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

                if (i === 0 && timeline[isoMonth]) {
                    timeline[isoMonth].management.push({
                        title: event.title || "Untitled Event",
                        start_period: event.start_period || null,
                        end_period: event.end_period || null,
                        category: event.category || "Unknown",
                        channels: event.channels || null,
                        BF_event: mrv,
                        revenue: event.revenue || null,
                        event_url: event.event_url || null,
                        image_url: event.image_url || null,
                        artist_name_kor: event.artist_name_kor || null,
                        artist_name_eng: event.artist_name_eng || null,
                        id: event.id || null,
                    });
                }
            }
        } catch (error) {
            console.error('Error processing MRV event:', error, 'Event data:', event);
        }
    });

    return timeline;
};

/**
 * FV_t 데이터 분배 함수 (감쇠 계산 포함)
 * @param {Array} fvTData - fv_t 데이터 배열
 * @param {string} endDate - 시계열 종료 날짜 (ISO 문자열)
 * @param {number} decayRate - 감쇠율
 * @param {number} residualRate - 잔존율
 * @returns {Array<Object>} - 분배된 fv_t 데이터 배열
 */
const distributeValueOverTimeFV = (fvTData, endDate, decayRate, residualRate) => {
    let fvValues = [];

    fvTData.forEach(entry => {
        try {
            const isoDate = convertToISO(entry.date);
            const date = new Date(isoDate);
            const fv = parseFloat(entry.FV_t);

            if (isNaN(fv)) {
                console.warn('Invalid fv_t value:', entry.FV_t, 'Entry data:', entry);
                return;
            }

            if (fv > 0) {
                const fvDecay = distributeValueOverTime(fv, date, endDate, decayRate, residualRate, 'fv_t');
                fvValues.push(...fvDecay);
            }
        } catch (error) {
            console.error('Error processing FV_t entry:', error, 'Entry data:', entry);
        }
    });

    return fvValues;
};

/**
 * 시계열 데이터 설정 함수
 * @param {Object} valuationData - Valuation 데이터 객체
 * @param {number} decayRate - 감쇠율 (기본값: null)
 * @param {number} residualRate - 잔존율 (기본값: 0.001)
 * @returns {Array<Object>} - 최종 시계열 데이터 배열
 */
export const setTimeline = (valuationData, decayRate = null, residualRate = 0.01) => {
    let timeline = {};
    const { fv_t_data = [], 
            pfv_data = {}, 
            av_data = {},
            sv_data = {},
            rv_data = {},
            apv_data = {},
            pcv_data = {},
            cev_data = {}, 
            mcv_youtube_data = {}, 
            mcv_twitter_data = {}, 
            mds_data = {},
            mrv_data = {} } = valuationData;
    const endDate = fv_t_data.length > 0 ? new Date(convertToISO(fv_t_data[fv_t_data.length - 1].date)) : new Date();
    
    // PFV 데이터 통합
    timeline = integratePFVData(timeline, pfv_data, endDate.toISOString(), decayRate, residualRate, sv_data, rv_data, apv_data);

    // PCV 데이터 통합
    timeline = integrateCEVEvents(timeline, pcv_data.cev_events || [], 0.1, 2, 12, 1);
    timeline = integrateMCVEvents(timeline, mcv_twitter_data || {}, mcv_youtube_data || {});
    timeline = integrateMDSRecords(timeline, pcv_data.mds_record || []);
    timeline = integrateMRVEvents(timeline, mrv_data.record || [], 0.1, 2, 12, 1);

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

    const timelineArray = Object.keys(timeline).map(key => {
        const obj = timeline[key];
        obj.date = key; // 키 값(key)을 객체의 date 필드로 추가
        obj.MOV = (obj.fv_t || 0) +
                  (obj.sv_t || 0) +
                  (obj.apv_t || 0) +
                  (obj.rv_t || 0) +
                  (obj.cev_t || 0) +
                  (obj.mcv_twitter || 0) +
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