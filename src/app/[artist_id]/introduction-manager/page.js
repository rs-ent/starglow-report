import IntroductionManager from "./IntroductionManager";

export default async function Page({params}) {
    const {artist_id} = await params;
    return <IntroductionManager artist_id = {artist_id} />
}