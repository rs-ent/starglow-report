// 숫자 포맷팅
export const formatNumber = (number, suffix = '', fixedValue = 2) => {
    if (typeof number !== 'number') return number;
    if (number >= 100_000_000) {
        return `${(number / 100_000_000).toFixed(fixedValue)}억${suffix}`; // 억 단위
    } else if (number >= 10_000_000) {
        return `${(number / 10_000_000).toFixed(fixedValue)}천만${suffix}`; // 천만 단위
    } else if (number >= 1_000_000) {
        return `${(number / 1_000_000).toFixed(fixedValue)}백만${suffix}`; // 백만 단위
    } else if (number >= 10_000) {
        return `${(number / 10_000).toFixed(fixedValue)}만${suffix}`; // 만 단위
    } else if (number >= 1_000){
        return `${(number / 1_000).toFixed(fixedValue)}천${suffix}`; // 천 단위
    }
    return `${number.toFixed(fixedValue)}${suffix}`; // 천 이하 숫자는 그대로 표시
};