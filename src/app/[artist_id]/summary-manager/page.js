'use client';

import dynamic from 'next/dynamic';

const SummaryManager = dynamic(() => import('./SummaryManager'), { ssr: false });

export default function Page() {
  return <SummaryManager />;
}