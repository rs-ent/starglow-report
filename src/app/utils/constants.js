// src/app/utils/constants.js

export const WEIGHT = {
    fv_t: 1,          // 팬덤 지표에 따른 추정 가치
    sv_t: 1.5,          // 음원 스트리밍 횟수에 따른 추정 가치
    apv_t: 3.5,         // 음원 인기도 값(0~100)에 따른 추정 가치
    rv_t: 1,          // 음반 판매량에 따른 추정 가치
    cev_t: 0.5,         // 콘서트&행사 수익에 따른 추정 가치
    mcv_twitter: 1,   // 트위터 계정 추정 가치
    mcv_youtube: 3,   // 유튜브 계정 추정 가치
    mds_t: 0.3,         // 굿즈&MD판매 수익에 따른 추정 가치
    mrv_t: 0.15,         // 매니지먼트(출연료/초상권/상표권) 가치
    MOV: 9            // 총합
};

export const MRV_WEIGHT = {
    '영화':120,
    '드라마':100,
    '예능':30,
    '음악방송':5,
    '기타':10
}

export const MockupList = [
    {
      id: 'photoCard',
      name: '포토카드',
      description: 'A beautiful photo card to cherish memories.',
      // Add other relevant properties if needed
    },
    {
      id: 'album',
      name: '앨범',
      description: 'A premium album to store your favorite photos.',
    },
    {
      id: 'videoCall',
      name: '영상통화',
      description: 'Enjoy video calls with your loved ones.',
    },
    {
      id: 'invitation',
      name: '초대장',
      description: 'Elegant invitations for your special events.',
    },
    {
      id: 'goods',
      name: '상품',
      description: 'Exclusive merchandise just for you.',
    },
  ];