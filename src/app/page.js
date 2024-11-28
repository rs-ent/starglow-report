//src/app/page.js

import DefaultLayout from '../app/components/server/DefaultLayout';
import ReportList from './ReportList';
import { fetchReports } from './firebase/fetch';

export default async function Home() {
    const reports = await fetchReports();
    console.log(reports);
    return (
        <DefaultLayout>
            <ReportList reports={reports}/>
        </DefaultLayout>
    );
}