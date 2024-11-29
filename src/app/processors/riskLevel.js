// 위험 수준 계산 함수
export const calculateRiskLevelPercentage = (goalFund, expectedRevenue) => {

    const riskLevels = [
        {
            min: 0,
            max: 20,
            borderColor: 'border-blue-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-600',
            riskText: '초저위험',
            description: '수익이 보장됩니다.',
        },
        {
            min: 20,
            max: 40,
            borderColor: 'border-green-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-600',
            riskText: '저위험',
            description: '수익이 어느 정도 보장됩니다.',
        },
        {
            min: 40,
            max: 60,
            borderColor: 'border-yellow-500',
            textColor: 'text-yellow-600',
            bgColor: 'bg-yellow-600',
            riskText: '중위험',
            description: '리스크 수용 자세가 필요합니다.',
        },
        {
            min: 60,
            max: 80,
            borderColor: 'border-orange-500',
            textColor: 'text-orange-600',
            bgColor: 'bg-orange-600',
            riskText: '고위험',
            description: '주의가 필요합니다.',
        },
        {
            min: 80,
            max: Infinity,
            borderColor: 'border-red-500',
            textColor: 'text-red-600',
            bgColor: 'bg-red-600',
            riskText: '초고위험',
            description: '신중한 투자 결정이 필요합니다.',
        },
    ];

    const difference = Math.abs(expectedRevenue - goalFund);
    const differencePercentage = (difference / goalFund) * 100;

    // 현재 리스크 수준 찾기
    let currentRiskLevel =
        riskLevels.find(
            (level) => differencePercentage >= level.min && differencePercentage < level.max
        ) || riskLevels[riskLevels.length - 1];

    currentRiskLevel.difference = difference;
    currentRiskLevel.differencePercentage = differencePercentage;

    return currentRiskLevel;
};