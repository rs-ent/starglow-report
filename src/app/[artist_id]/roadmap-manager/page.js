import RoadmapManager from './RoadmapManager';

export default async function Page( {params} ) {
    const {artist_id} = await params;
    return <RoadmapManager artistId={artist_id} />;
}