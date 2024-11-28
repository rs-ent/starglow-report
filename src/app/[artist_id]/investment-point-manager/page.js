'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

// InvestmentPointManager를 동적으로 로드하며, SSR 비활성화
const InvestmentPointManager = dynamic(() => import('./InvestmentPointManager'), { ssr: false });

export default function Page() {
  const { artist_id } = useParams();
  return <InvestmentPointManager artist_id={artist_id} />;
}