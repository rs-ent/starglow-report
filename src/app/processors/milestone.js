export const processMilestones = (sortedData) => {
    if (!Array.isArray(sortedData) || sortedData.length === 0) {
        throw new Error('Invalid sortedData: Must be a non-empty array.');
    }

    const groupedByYear = {};

    // Group data by year
    sortedData.forEach((entry) => {
        const year = new Date(entry.date).getFullYear();
        if (!groupedByYear[year]) {
            groupedByYear[year] = [];
        }
        groupedByYear[year].push(entry);
    });

    const result = {};

    // Process each year
    Object.keys(groupedByYear).forEach((year) => {
        const data = groupedByYear[year];
        const aggregated = {};

        // Process statistics
        const statistics = {};
        Object.keys(data[0]).forEach((key) => {
            if (typeof data[0][key] === 'number') {
                const values = data.map((d) => d[key]);
                statistics[translateKey(key)] = {
                    total: values.reduce((sum, value) => sum + value, 0),
                    average: values.reduce((sum, value) => sum + value, 0) / values.length,
                    min: Math.min(...values),
                    minMonth: data[values.indexOf(Math.min(...values))]?.date || null,
                    max: Math.max(...values),
                    maxMonth: data[values.indexOf(Math.max(...values))]?.date || null,
                };
            }
        });
        aggregated.statistics = statistics;

        // Process discography
        const uniqueAlbums = {};
        data.forEach((entry) => {
            entry.discography?.forEach((album) => {
                const albumYear = new Date(album.release_date).getFullYear();
                const entryYear = new Date(entry.date).getFullYear();

                // 같은 연도인지 확인
                if (albumYear === entryYear) {
                    if (!uniqueAlbums[album.spotify_album_id]) {
                        uniqueAlbums[album.spotify_album_id] = {
                            albumName: album.album_title,
                            totalTracks: album.total_tracks,
                            releaseDate: album.release_date,
                            albumValue: album.av,        // 기존 av -> albumValue
                            popularityValue: album.apv, // 기존 apv -> popularityValue
                            streamingValue: album.sv,   // 기존 sv -> streamingValue
                            retailValue: album.rv,      // 기존 rv -> retailValue
                        };
                    }
                }
            });
        });
        aggregated.discography = Object.values(uniqueAlbums);

        // Process production
        const production = [];

        const eventData = [];
        data.forEach((entry) => {
            entry.production?.events?.forEach((event) => {
                eventData.push({
                    title: event.title,
                    startDate: event.start_period,
                    endDate: event.end_period,
                    estimatedValue: event.cer, // 유지
                    type: 'event',
                });
            });
        });
        const topEvents = eventData
            .sort((a, b) => b.estimatedValue - a.estimatedValue) // cer 기준 내림차순 정렬
            .slice(0, 3); // 상위 3개 추출
        production.push(...topEvents);

        // Twitter: 상위 3개 추출
        const twitterData = [];
        data.forEach((entry) => {
            entry.production?.media?.twitter?.forEach((tweet) => {
                twitterData.push({
                    title: tweet.text.slice(0, 50),
                    date: tweet.created_at,
                    engagementValue: tweet.engagement_value,
                    type: 'twitter',
                });
            });
        });
        const topTweets = twitterData
            .sort((a, b) => b.engagementValue - a.engagementValue) // engagementValue 기준 내림차순 정렬
            .slice(0, 3); // 상위 3개 추출
        production.push(...topTweets);

        // YouTube: 상위 3개 추출
        const youtubeData = [];
        data.forEach((entry) => {
            entry.production?.media?.youtube?.forEach((video) => {
                youtubeData.push({
                    title: video.id,
                    publishDate: video.published_at,
                    mediaValue: video.mcv, // 유지
                    type: 'youtube',
                });
            });
        });
        const topVideos = youtubeData
            .sort((a, b) => b.mediaValue - a.mediaValue) // mcv 기준 내림차순 정렬
            .slice(0, 3); // 상위 3개 추출
        production.push(...topVideos);

        aggregated.production = production;

        // Process management
        const managementData = [];

        // 모든 management 데이터를 수집
        data.forEach((entry) => {
            entry.management?.forEach((event) => {
                managementData.push({
                    title: event.title,
                    category: event.category,
                    startDate: event.start_period,
                    endDate: event.end_period,
                    managementValue: event.BF_event, // 기존 bfEvent -> managementValue
                });
            });
        });

        // managementValue 기준 상위 3개 추출
        const topManagement = managementData
            .sort((a, b) => b.managementValue - a.managementValue) // managementValue 내림차순 정렬
            .slice(0, 3); // 상위 3개 선택

        aggregated.management = topManagement;

        result[year] = aggregated;
    });

    return result;
};

// 키를 직관적인 이름으로 변환하는 함수
const translateKey = (key) => {
    const translations = {
        av: 'albumValue',          // 총앨범가치
        apv: 'popularityValue',    // 인기기반가치
        sv: 'streamingValue',      // 스트리밍가치
        rv: 'retailValue',         // 음반판매가치
        bfEvent: 'managementValue' // 매니지먼트가치
    };
    return translations[key] || key;
};