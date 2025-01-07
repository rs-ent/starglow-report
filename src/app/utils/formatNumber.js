// 숫자 포맷팅 (영어권 기준 Short Scale: K, M, B, T)
export const formatNumber = (number, suffix = '', fixedValue = 2) => {
    if (typeof number !== 'number') return number;
    
    // 1조(1,000,000,000,000) 이상 -> Trillion
    if (number >= 1_000_000_000_000) {
        return `${(number / 1_000_000_000_000).toFixed(fixedValue)}T${suffix}`;
    // 10억(1,000,000,000) 이상 -> Billion
    } else if (number >= 1_000_000_000) {
        return `${(number / 1_000_000_000).toFixed(fixedValue)}B${suffix}`;
    // 100만(1,000,000) 이상 -> Million
    } else if (number >= 1_000_000) {
        return `${(number / 1_000_000).toFixed(fixedValue)}M${suffix}`;
    // 1천(1,000) 이상 -> Thousand
    } else if (number >= 1_000) {
        return `${(number / 1_000).toFixed(fixedValue)}K${suffix}`;
    }

    // 1천 미만은 그대로 표시
    return `${number.toFixed(fixedValue)}${suffix}`;
};