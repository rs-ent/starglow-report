'use client';

import { useReports } from "../../context/ReportsData"
import Link from 'next/link';
import React from 'react';

export default function ReportList() {
    const reports = useReports();

    console.log(reports);
    return (
        <>
            <h2 className="text-2xl font-bold mb-4">Report List</h2>
                
            {reports.length === 0 ? (
                <p>No reports found.</p>
            ) : (
                <ul className="space-y-4">
                    {reports.map((report) => (
                        <li key={report.docId} className="border p-4 rounded flex gap-4 items-center">
                            {/* 이미지가 있을 경우 표시, 없으면 대체 텍스트 */}
                            <div className="w-24 h-24 bg-gray-100 flex justify-center items-center rounded overflow-hidden">
                                {report.image_alpha ? (
                                    <img src={report.image_alpha} alt={report.title} className="object-cover w-full h-full" />
                                ) : (
                                    <span className="text-gray-500 text-sm">No Image</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">{report.title}</h3>
                                <p className="text-sm text-gray-600">{report.artist_kor || report.artist_eng || report.artist_id}</p>
                            </div>
                            <div>
                                <Link href={`/report-manager/create?docId=${report.docId}`}>
                                    <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                                        Edit
                                    </button>
                                </Link>
                            </div>
                            {/* 추가 버튼들 - artist_id 경로로 이동하는 예시 */}
                            {report.artist_id && (
                                <>
                                    <Link href={`/${report.artist_id}/introduction-manager`}>
                                        <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                            Introduction
                                        </button>
                                    </Link>
                                    <Link href={`/${report.artist_id}/investment-point-manager`}>
                                        <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                            Investment Points
                                        </button>
                                    </Link>
                                    <Link href={`/${report.artist_id}/analysis-manager`}>
                                        <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                            Analysis
                                        </button>
                                    </Link>
                                    <Link href={`/${report.artist_id}/rewards-manager`}>
                                        <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                            Rewards
                                        </button>
                                    </Link>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}