import DefaultLayout from '../../components/server/DefaultLayout';
import ClientManager from './ClientManager';
import { krw_usd } from '../../../script/exchange';

export default async function Page({params}) {
    const { artist_id, locale } = await params;
    const exchangeRate = locale === 'ko' ? 1 : await krw_usd();

    return (
        <DefaultLayout>
            <ClientManager artist_id={artist_id} locale={locale} exchangeRate={exchangeRate}/>
        </DefaultLayout>
    );
}