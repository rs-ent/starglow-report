// src/app/components/ReportList.jsx
import Link from 'next/link';
import ReportCard from './ReportCard';

const ReportList = ({ reports }) => {
    return (
        <div className="w-full flex flex-col gap-6 p-4 bg-[var(--background)] min-h-screen">
            {reports.map(report => (
                <Link 
                    key={report.id} 
                    href={`/report/${report.artist_id}`}
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