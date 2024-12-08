// src/app/report-manager/page.js
import Link from 'next/link';
import ReportList from './ReportList';

export default async function Home() {
    return (
        <div className="p-4">
            <div className="mt-4 mb-16 w-full mx-auto">
                <Link href="/report-manager/create">
                    <button className="w-full h-20 mx-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        CREATE REPORT
                    </button>
                </Link>
            </div>

            <div className="mb-4">
                <ReportList />
            </div>
        </div>
    );
}