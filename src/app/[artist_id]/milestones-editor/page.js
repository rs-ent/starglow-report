'use client';

import dynamic from 'next/dynamic';

// InvestmentPointManager를 동적으로 로드하며, SSR 비활성화
const MilestonesEditor = dynamic(() => import('./MilestonesEditor'), { ssr: false });

export default function Page() {
  return <MilestonesEditor />;
}