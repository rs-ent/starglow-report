// 위험 수준 계산 함수
export const calculateRiskLevelPercentage = (goalFund, shareRatio, minRevenue, spectrum) => {

    const riskLevels = [
        {
          min: 0,
          max: 20,
          borderColor: 'border-blue-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-600',
          riskText: 'Ultra-Low Risk',
          description: 'Returns are guaranteed.',
        },
        {
          min: 20,
          max: 40,
          borderColor: 'border-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-600',
          riskText: 'Low Risk',
          description: 'Returns are somewhat assured.',
        },
        {
          min: 40,
          max: 60,
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-600',
          riskText: 'Moderate Risk',
          description: 'A willingness to accept risk is required.',
        },
        {
          min: 60,
          max: 80,
          borderColor: 'border-orange-500',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-600',
          riskText: 'High Risk',
          description: 'Caution is advised.',
        },
        {
          min: 80,
          max: Infinity,
          borderColor: 'border-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-600',
          riskText: 'Ultra-High Risk',
          description: 'Prudent investment decisions are required.',
        },
    ];

    // 손익분기점 계산
    const breakEven = goalFund / shareRatio;
    
    // minRevenue와 breakEven 비교
    const difference = breakEven - minRevenue;
    const percentage = difference > 0 ? ((difference / breakEven) + (spectrum * 0.2)) * 100 : spectrum * 0.3 * 100;

    // 현재 리스크 수준 찾기
    let currentRiskLevel =
        riskLevels.find(
            (level) => percentage >= level.min && percentage < level.max
        ) || riskLevels[riskLevels.length - 1];

    currentRiskLevel.difference = difference;
    currentRiskLevel.differencePercentage = percentage;

    return currentRiskLevel;
};