// 위험 수준 계산 함수
export const calculateRiskLevelPercentage = (goalFund, shareRatio, minRevenue, spectrum) => {

    const riskLevels = [
        {
          min: 0,
          max: 20,
          borderColor: 'border-blue-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-600',
          riskText: {
            en: 'Ultra-Low Risk',
            ko: '초저위험',
          },
          description: {
            en: 'An extremely stable investment with minimal risk.',
            ko: '매우 안정적인 투자이며, 위험이 극도로 낮습니다.',
          },
        },
        {
          min: 20,
          max: 40,
          borderColor: 'border-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-600',
          riskText: {
            en: 'Low Risk',
            ko: '저위험',
          },
          description: {
            en: 'A relatively stable investment with low risk.',
            ko: '비교적 안정적이며, 위험이 낮은 투자입니다.',
          },
        },
        {
          min: 40,
          max: 60,
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-600',
          riskText: {
            en: 'Moderate Risk',
            ko: '중간 위험',
          },
          description: {
            en: 'An investment with the potential for both profits and losses.',
            ko: '이익과 손실이 모두 발생할 가능성이 있는 투자입니다.',
          },
        },
        {
          min: 60,
          max: 80,
          borderColor: 'border-orange-500',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-600',
          riskText: {
            en: 'High Risk',
            ko: '고위험',
          },
          description: {
            en: 'A high-risk investment requiring careful consideration.',
            ko: '주의 깊은 검토가 필요한 고위험 투자입니다.',
          },
        },
        {
          min: 80,
          max: Infinity,
          borderColor: 'border-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-600',
          riskText: {
            en: 'Ultra-High Risk',
            ko: '초고위험',
          },
          description: {
            en: 'An extremely high-risk investment demanding great caution.',
            ko: '매우 주의가 필요한 극도로 높은 위험의 투자입니다.',
          },
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