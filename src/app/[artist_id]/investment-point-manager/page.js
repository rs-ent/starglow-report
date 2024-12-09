import InvestmentPointManager from './InvestmentPointManager';

export default async function Page({params}) {
  const {artist_id} = await params;
  return <InvestmentPointManager artist_id={artist_id} />;
}