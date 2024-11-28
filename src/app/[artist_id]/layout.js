// [src/app/[artist_id]/layout.js]
import { Preprocessor } from '../processors/preprocessor';
import { DataProvider } from '../../context/GlobalData';
import { fetchData } from '../firebase/fetch';

export default async function ArtistLayout({ children, params }) {
    const { artist_id } = await params;
    console.log(artist_id);
    const data = await Preprocessor(artist_id);
    const introduction = await fetchData('Introduction', { comp: 'docId', sign: '==', val: artist_id }, false);

    return (
        <DataProvider 
            valuation={data.valuation}
            timelineData={data.timelineData} 
            kpiData={data.kpiData} 
            investmentData={data.investmentData} 
            milestones={data.milestones}
            artist_id={artist_id}
            introduction={introduction}
        >
            {children}
        </DataProvider>
    );
}