import DefaultLayout from '../../components/server/DefaultLayout';
import ClientManager from './ClientManager'; // 새로 생성할 클라이언트 컴포넌트

export default async function Page({params}) {
    const { artist_id } = await params;
    return (
        <DefaultLayout>
            <ClientManager artist_id={artist_id}/>
        </DefaultLayout>
    );
}