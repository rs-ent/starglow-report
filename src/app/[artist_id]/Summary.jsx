'use client';

import React, {useState} from 'react';
import { useReport } from '../../context/GlobalData';

const Summary = () => {

    const [isExpanded, setIsExpanded] = useState(false);
    const reportData = useReport();

    const nft_price = reportData.nft_price || 0;
    const ratio = reportData.investors_share_ratio || 0.4;

    const project_launch_date = reportData.project_launch_date || "2025-12-31";
    const launchDate = new Date(project_launch_date);
    const launchDateString = (launchDate.getFullYear()) + '-' + (launchDate.getMonth() + 1 < 10 ? '0' + (launchDate.getMonth() + 1) : launchDate.getMonth() + 1) + '-' + (launchDate.getDate() < 10 ? '0' + launchDate.getDate() : launchDate.getDate());
    const project_deadline_date = reportData.project_deadline_date || "2025-12-31";
    const deadline = new Date(project_deadline_date);
    const deadlineDateString = (deadline.getFullYear()) + '-' + (deadline.getMonth() + 1 < 10 ? '0' + (deadline.getMonth() + 1) : deadline.getMonth() + 1) + '-' + (deadline.getDate() < 10 ? '0' + deadline.getDate() : deadline.getDate());

    const data = [
        { label: "Project Launch", value: launchDateString },
        { label: "Project Deadline", value: deadlineDateString },
        { label: "Investment Terms", value: "12 Months"},
        { label: "Duration", value: "Lump Sum" },
        { label: "Distribution", value: `${ratio} of the Term’s Revenue`,},
        { label: "Scheduled Settlement", value: "2027.04.02" },
    ];

    return (
        <div>
            {/* 기본 투자 정보 섹션 */}
            <section>
                <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 border-b border-b-[var(--background-muted)]">
                    <h4 className="text-[var(--primary)] text-xs">
                        NFT Price
                    </h4>
                    <p className="text-xs font-semibold text-right">
                        ₩{nft_price.toLocaleString()}
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 border-b border-b-[var(--background-muted)]">
                    <h4 className="text-[var(--primary)] text-xs">
                        Period
                    </h4>
                    <p className="text-xs font-semibold text-right">
                        {launchDateString} ~ {deadlineDateString}
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 border-b border-b-[var(--background-muted)]">
                    <h4 className="text-[var(--primary)] text-xs">
                        Maturity Date
                    </h4>
                    <p className="text-xs font-semibold text-right">
                        2027.04.02
                    </p>
                </div>
            </section>

            {isExpanded && (
                <>
                {/* 투자 구조 섹션 */}
                <section>
                    <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 ">
                        <h4 className="text-[var(--primary)] text-xs">
                            Investment Structure
                        </h4>
                    </div>
                    <div className="px-6">
                        <table className="min-w-full border-collapse border border-gray-400 text-center text-xs text-[var(--text-primary)]">
                            <tbody>
                                {data.map((row, index) => (
                                    <tr key={index}>
                                        <td className={index === data.length - 1 ? "text-xs py-2 px-4 bg-[rgba(255,255,255,0.1)]" : "text-xs py-2 px-4 border-b border-b-[var(--background-muted)] bg-[rgba(255,255,255,0.1)]"}>
                                            {row.label}
                                        </td>
                                        <td className={index === data.length - 1 ? "text-xs py-2 px-4" : "text-xs py-2 px-4 border-b border-b-[var(--background-muted)]"}>
                                            {row.value}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
                </>
            )}
            {/* 더보기 버튼 */}
            <button
            className="expand-button mt-6"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            >
            {isExpanded ? 'Collapse' : 'Expand'}
            </button>
        </div>
    );
};

export default Summary;