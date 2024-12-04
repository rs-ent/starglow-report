'use client';

import React, {useState} from 'react';

const Summary = () => {

    const [isExpanded, setIsExpanded] = useState(false);



    return (
        <div>
            {/* 기본 투자 정보 섹션 */}
            <section>
                <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 border-b border-b-gray-200">
                    <h4 className="text-[var(--primary)] text-sm">
                        최소 투자 금액
                    </h4>
                    <p className="text-sm font-semibold text-right">
                        ₩500,000
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 border-b border-b-gray-200">
                    <h4 className="text-[var(--primary)] text-sm">
                        모집 기간
                    </h4>
                    <p className="text-sm font-semibold text-right">
                        24.12.15 ~ 24.12.31
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 border-b border-b-gray-200">
                    <h4 className="text-[var(--primary)] text-sm">
                        증권만기일
                    </h4>
                    <p className="text-sm font-semibold text-right">
                        25.04.02
                    </p>
                </div>
            </section>

            {isExpanded && (
                <>
                {/* 투자 구조 섹션 */}
                <section>
                    <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 ">
                        <h4 className="text-[var(--primary)] text-sm">
                            투자구조
                        </h4>
                    </div>
                    <div className="px-6">
                        <table className="min-w-full border-collapse border border-gray-300 text-center text-xs text-[var(--text-primary)]">
                            <tbody>
                                {[
                                    { label: "증권종류", value: "NFT" },
                                    { label: "1 구좌 가격", value: "₩100,000" },
                                    { label: "최소 투자 금액", value: "₩500,000" },
                                    { label: "목표 모집 금액", value: "₩50,000,000" },
                                    { label: "모집 시작일", value: "2024.12.15" },
                                    { label: "모집 종료일", value: "2024.12.31" },
                                    { label: "증권 발행일", value: "2025.01.02" },
                                    { label: "증권 만기일", value: "2026.01.02" },
                                    { label: "투자 기간", value: "12개월"},
                                    { label: "상환 방법", value: "만기일시상환" },
                                    { label: "손익 배당", value: "투자 기간 발생 총 매출의 35%" },
                                    { label: "만기 정산 예정일", value: "2026.04.02" },
                                ].map((row, index) => (
                                    <tr key={index}>
                                        <td className={row.type && row.type === "bold" ? "py-2 px-4 border border-gray-300 font-bold bg-gray-100" : "py-2 px-4 border border-gray-300 font-medium bg-gray-100"}>
                                            {row.label}
                                        </td>
                                        <td className={row.type && row.type === "bold" ? "py-2 px-4 border font-bold" : "py-2 px-4 border"}>
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
            className="expand-button mt-2"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            >
            {isExpanded ? 'Collapse' : 'Expand'}
            </button>
        </div>
    );
};

export default Summary;