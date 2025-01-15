//src/app/page.js

import DefaultLayout from '../app/components/server/DefaultLayout';
import ReportList from './ReportList';

export default function Home() {
    return (
        <DefaultLayout>
            <ReportList/>
        </DefaultLayout>
    );
}