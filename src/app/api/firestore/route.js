import { NextResponse } from 'next/server';
import { fetchData } from '../../firebase/fetch';

export async function POST(request){
    try {
        const { method, args } = await request.json();
        const result = await fetchData(args.collectionName, args.queryObj, args.fetchMultiples);

        return NextResponse.json(result, {
            headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate=599' },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}