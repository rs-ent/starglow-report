// src/app/report-manager/create/page.js
import React, { Suspense } from 'react';
import CreateReportPage from './CreateReportPage';

export default function Create() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateReportPage />
        </Suspense>
    );
}