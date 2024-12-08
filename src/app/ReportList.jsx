// src/app/components/ReportList.jsx
'use client';

import Link from 'next/link';
import ReportCard from './ReportCard';
import { useReports } from '../context/ReportsData';

const ReportList = () => {
    const reports = useReports();

    return (
        <div className="w-full flex flex-col gap-6 p-4 bg-[var(--background)] min-h-screen">
            {reports.map(report => (
                <Link 
                    key={report.docId} 
                    href={`/${report.artist_id}`}
                >
                    <ReportCard
                        artistId={report.artist_id}
                        image={report.image_alpha}
                        title={report.title}
                        artistEng={report.artist_eng}
                        artistKor={report.artist_kor}
                    />
                </Link>
            ))}
        </div>
    );
};

export default ReportList;