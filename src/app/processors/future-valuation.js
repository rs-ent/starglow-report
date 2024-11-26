import { MRV_WEIGHT } from "../utils/constants";

let model;

export const processFutureValuation = (newEvent, kpiData) => {
    console.log(kpiData);
    if (!kpiData || !kpiData.sortedData || !newEvent || !newEvent.dist) {
        throw new Error("Invalid input data: Ensure kpiData and newEvent are provided.");
    }

    const { revenueVolatilityStd, activeRevenueAvg } = kpiData;
    const volatilityFactor = revenueVolatilityStd / activeRevenueAvg;

    let newEventPrediction = 0;
    if (newEvent.dist === 'discography') {
        // Extract data for training
        const uniqueAlbums = extractUniqueAlbums(kpiData.sortedData);

        // Prepare features and targets
        const features = uniqueAlbums.map((album) => [album.total_tracks]); // 2D array for total_tracks
        const targets = uniqueAlbums.map((album) => album.av);

        console.log("Features:", features);
        console.log("Targets:", targets);

        // Train the model if not already trained
        if (!model || typeof model.fit !== "function") {
            trainModel(features, targets);
        }

        newEventPrediction = predictAlbumValue(newEvent.total_tracks);
    } else if (newEvent.dist === 'production') {
        console.log(newEvent , newEvent.cer);
        if (newEvent.cer > -1) {
            const cerData = extractCERData(kpiData.sortedData); // CEV 데이터 추출
            const medianCER = calculateMedian(cerData);
            newEventPrediction = medianCER * newEvent.occurrences;
        } else if (newEvent.mcv > -1) {
            const mcvData = extractMCVData(kpiData.sortedData); // MCV 데이터 추출
            const medianMCV = calculateMedian(mcvData);
            newEventPrediction = medianMCV * newEvent.plannedVideos;
        } else {
            console.error("Error: No CER or MCV");
            return null;
        }
    } else if (newEvent.dist === 'management') {
        if (newEvent.mrv > -1) {
            const mrvData = extractMRVData(kpiData.sortedData); // MRV 데이터 추출
            const features = mrvData.map((item) => oneHotEncodeCategory(item.category));
            const targets = mrvData.map((item) => item.bf);

            console.log("MRV Features:", features);
            console.log("MRV Targets:", targets);

            // Train the model
            if (!model || typeof model.fit !== "function") {
                trainModel(features, targets);
            }

            // Predict MRV for the new event
            const newCategoryFeature = oneHotEncodeCategory(newEvent.category);
            const predictedBF = predictMRV(newCategoryFeature);

            // Adjust by occurrences
            newEventPrediction = (predictedBF * (MRV_WEIGHT[newEvent.category] / 50)) * newEvent.occurrences;
        }
    }

    const maxExpectedRevenue = newEventPrediction * (1 + volatilityFactor);
    const minExpectedRevenue = newEventPrediction * (1 - volatilityFactor);

    console.log("Predicted Album Value:", newEventPrediction);
    console.log("Max Expected Revenue:", maxExpectedRevenue);
    console.log("Min Expected Revenue:", minExpectedRevenue);

    return {
        predictedValue: newEventPrediction,
        maxExpectedRevenue,
        minExpectedRevenue,
    };
};

const trainModel = (features, targets) => {
    console.log("Training model...");
    const RandomForest = require("ml-random-forest").RandomForestRegression;

    const modelOptions = {
        seed: 3,
        maxFeatures: 1.0, // Use all features (just total_tracks here)
        replacement: true,
        nEstimators: 100,
    };

    model = new RandomForest(modelOptions);
    model.train(features, targets);
    console.log("Model trained successfully!");
};

const extractUniqueAlbums = (sortedData) => {
    const uniqueAlbums = new Map();

    for (const dataPoint of sortedData) {
        if (dataPoint.discography && Array.isArray(dataPoint.discography)) {
            for (const album of dataPoint.discography) {
                if (!uniqueAlbums.has(album.spotify_album_id)) {
                    uniqueAlbums.set(album.spotify_album_id, {
                        ...album,
                    });
                }
            }
        }
    }

    return Array.from(uniqueAlbums.values());
};

const predictAlbumValue = (totalTracks) => {
    if (!model || !model.predict) {
        throw new Error("Model is not trained or available.");
    }

    if (typeof totalTracks !== "number" || totalTracks <= 0) {
        throw new Error("Invalid total_tracks: Ensure it's a positive number.");
    }

    const prediction = model.predict([[totalTracks]]); // Predict using the total_tracks as input
    return prediction[0]; // Return the predicted value
};

const extractCERData = (sortedData) => {
    const cerValues = sortedData.flatMap((dataPoint) => {
        if (dataPoint.production?.events?.length) {
            return dataPoint.production.events
                .map((event) => parseFloat(event.cer)) // cer 값을 숫자로 변환
                .filter((value) => !isNaN(value) && value > 0); // 유효한 cer 값만 포함
        }
        return [];
    });

    return cerValues;
};

const extractMCVData = (sortedData) => {
    const mcvValues = sortedData.flatMap((dataPoint) => {
        if (dataPoint.production?.media?.youtube) {
            return dataPoint.production.media.youtube
                .map((item) => parseFloat(item.mcv)) // `mcv_youtube`를 숫자로 변환
                .filter((value) => !isNaN(value) && value > 0); // 유효한 값만 포함
        }
        return [];
    });

    return mcvValues;
};

const calculateMedian = (data) => {
    if (!data.length) return 0;
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % 2 !== 0
        ? sorted[mid] // 홀수 길이: 중간값
        : (sorted[mid - 1] + sorted[mid]) / 2; // 짝수 길이: 중간 두 값의 평균
};

const extractMRVData = (sortedData) => {
    // 관리 이벤트(`management`) 데이터에서 BF_event와 category 추출
    return sortedData.flatMap((dataPoint) => {
        if (dataPoint.management?.length) {
            return dataPoint.management
                .map((item) => ({
                    bf: parseFloat(item.BF_event), // BF_event를 숫자로 변환
                    category: item.category,     // category 값을 그대로 사용
                }))
                .filter(
                    (item) => !isNaN(item.bf) && item.category // 유효한 값만 반환
                );
        }
        return [];
    });
};

const oneHotEncodeCategory = (category) => {
    const categories = Object.keys(MRV_WEIGHT);
    return categories.map((cat) => (cat === category ? 1 : 0));
};

const predictMRV = (categoryFeature) => {
    if (!model || !model.predict) {
        throw new Error("Model is not trained or available.");
    }

    if (!Array.isArray(categoryFeature)) {
        throw new Error("Invalid category feature: Ensure it's an array.");
    }

    const prediction = model.predict([categoryFeature]);
    return prediction[0]; // Return the predicted value
};