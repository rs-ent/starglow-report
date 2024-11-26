'use client'

import React, { useState, useEffect } from 'react';

import { useKPI, useMilestones } from '../../../context/GlobalData';

import './SummaryManager.css';

const SummaryManager = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const kpiData = useKPI();
    const milestones = useMilestones();
    console.log(milestones);
    const artistName = "크나큰";

    const fetchSummary = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/summaryContext', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ artistName, kpiData }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            setSummary(data.summary);
        } catch (err) {
            console.error('Error fetching summary:', err);
            setError('Failed to load summary. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="summary-manager">
            <h1>{artistName} Summary</h1>

            {/* 버튼 추가 */}
            <button onClick={fetchSummary} disabled={loading}>
                {loading ? 'Loading...' : 'Summary With OpenAI'}
            </button>

            {/* 요약 상태 표시 */}
            {error && <div className="error">{error}</div>}
            {summary ? (
                <pre className="summary-output">{summary}</pre>
            ) : (
                <p>No summary available. Please click the button to generate one.</p>
            )}
        </div>
    );
};

export default SummaryManager;