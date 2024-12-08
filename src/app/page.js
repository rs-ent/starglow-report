//src/app/page.js

import DefaultLayout from '../app/components/server/DefaultLayout';
import ReportList from './ReportList';
import { useReports } from '../context/ReportsData';

export default async function Home() {
    const reports = useReports()
    return (
        <DefaultLayout>
            <ReportList reports={reports}/>
        </DefaultLayout>
    );
}