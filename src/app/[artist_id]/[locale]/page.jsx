import DefaultLayout from '../../components/server/DefaultLayout';
import ClientManager from './ClientManager';

export default async function Page({params}) {
    const { artist_id } = await params;
    return (
        <DefaultLayout>
            <ClientManager artist_id={artist_id}/>
        </DefaultLayout>
    );
}