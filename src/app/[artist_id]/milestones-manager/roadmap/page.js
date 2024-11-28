'use client';

import dynamic from 'next/dynamic';

// InvestmentPointManager를 동적으로 로드하며, SSR 비활성화
const Roadmap = dynamic(() => import('./Roadmap'), { ssr: false });

export default function Page() {
  return <Roadmap />;
}