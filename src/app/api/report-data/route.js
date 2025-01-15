import { NextResponse } from 'next/server';
import { fetchData } from '../../firebase/fetch';
import { Preprocessor } from '../../processors/preprocessor';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const artistId = searchParams.get('artistId');
        if (!artistId) {
            return NextResponse.json({ error: 'artistId is required' }, { status: 400 });
        }

        const data = await Preprocessor(artistId);
        const introduction = await fetchData('Introduction', { comp: 'docId', sign: '==', val: artistId }, false);
        const investmentPoints = await fetchData('InvestmentPoint', { comp: 'artist_id', sign: '==', val: artistId }, true);
        const rewards = await fetchData('Rewards', { comp: 'docId', sign: '==', val: artistId }, false);
        const history = await fetchData('history', { comp: 'docId', sign: '==', val: artistId }, false);
        const roadmap = await fetchData('Roadmap', { comp: 'docId', sign: '==', val: artistId }, false);

        const result = {
            valuation: data.valuation,
            timelineData: data.timelineData,
            kpiData: data.kpiData,
            investmentPoints,
            introduction,
            rewards,
            history,
            roadmap,
        };

        return NextResponse.json(result, {
            headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=3599' },
        });
    } catch (error) {
        console.error('Error in GET /api/artist:', error);
        return NextResponse.json({ error: 'Failed to fetch artist data' }, { status: 500 });
    }
}