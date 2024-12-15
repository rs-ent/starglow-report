//Reference : https://funderful.kr/investdetail/project/132/project
//Mobile First + Simple is the Best + Professionalism
/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.05)', // 심플하고 가벼운 느낌
        'strong': '0 4px 12px rgba(0, 0, 0, 0.1)', // 강조 요소에 적합
      },
      borderRadius: {
        'lg': '12px',  // 둥근 모서리
        'xl': '20px',
      },
      blur: {
        'xs': '0.5px', // 사용자 정의 블러 효과
      },
      spacing: {
        '72': '18rem', // 추가 간격
        '84': '21rem',
        '96': '24rem',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite', // 느린 회전
        'fade-in': 'fadeIn 0.5s ease-in-out', // 페이드 인 효과
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      colors: {
        background: {
          light: "#ffffff", // 기본 배경색
          neutral: "#f8f9fa", // 대비용 연한 회색
        },
        text: {
          primary: "#212529", // 본문 텍스트
          secondary: "#6c757d", // 부드러운 텍스트
        },
        brand: {
          primary: '#0d6efd', // 메인 블루
          accent: '#ffc107', // 골드 포인트
        },
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'], // 본문 폰트
        heading: ['Poppins', 'sans-serif'], // 제목 폰트
        display: ['Roboto', 'sans-serif'], // 강조 폰트
      },
      perspective: {
        '1000': '1000px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // 기본 폼 스타일
    require('@tailwindcss/typography'), // 본문 스타일 강화
    require('@tailwindcss/aspect-ratio'), // 미디어 콘텐츠 지원
  ],
};

