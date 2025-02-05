import EstimationManager from './EstimationManager';

export default async function Page( {params} ) {
    const {artist_id} = await params;
    return <EstimationManager artistId={artist_id} />;
}