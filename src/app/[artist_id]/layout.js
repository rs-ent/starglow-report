// [src/app/[artist_id]/layout.js]
import { DataProvider } from '../../context/GlobalData';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function ArtistLayout({ children, params }) {
    const { artist_id } = await params;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/report-data?artistId=${artist_id}`, {
        next: { revalidate: 3600 },
    });
    const data = await res.json();

    return (
        <main>
            <DataProvider 
                valuation={data.valuation}
                timeline={data.timeline} 
                kpiData={data.kpiData} 
                investmentPoints={data.investmentPoints} 
                introduction={data.introduction}
                rewards={data.rewards}
                history={data.history}
                roadmap={data.roadmap}
                artist_id={artist_id}
            >
                {children}
            </DataProvider>
        </main>
    );
}