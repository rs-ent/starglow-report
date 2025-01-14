'use client';

import React, {useState} from 'react';
import { useReport } from '../../../context/GlobalData';

import { useParams } from "next/navigation";
import { translations } from '../../../lib/translations';

import dayjs from 'dayjs';
function getMonthDayDiff(startDate, endDate) {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    
    const totalDays = end.diff(start, 'day') + 1;
  
    const en = `${totalDays.toLocaleString()} Days`;
    const ko = `${totalDays.toLocaleString()}일`;
  
    return { en, ko };
}

const Summary = () => {
    const { locale } = useParams(); 
    const t = translations[locale] || translations.en;

    const [isExpanded, setIsExpanded] = useState(false);
    const reportData = useReport();

    const nft_price = reportData.nft_price || 0;
    const ratio = reportData.investors_share_ratio || 0.4;

    const nft_sales_start = reportData.nft_sales_start || "2025-01-31";
    const nftSalesStart = new Date(nft_sales_start);
    const nftSalesStartString = {
        'en': (nftSalesStart.getMonth() + 1 < 10 ? '0' + (nftSalesStart.getMonth() + 1) : nftSalesStart.getMonth() + 1) + '.' + (nftSalesStart.getDate() < 10 ? '0' + nftSalesStart.getDate() : nftSalesStart.getDate()) + '.' + (nftSalesStart.getFullYear()),
        'ko': (nftSalesStart.getFullYear()) + '.' + (nftSalesStart.getMonth() + 1 < 10 ? '0' + (nftSalesStart.getMonth() + 1) : nftSalesStart.getMonth() + 1) + '.' + (nftSalesStart.getDate() < 10 ? '0' + nftSalesStart.getDate() : nftSalesStart.getDate()),
    };
    const nft_sales_end = reportData.nft_sales_end || "2025-05-31";
    const nftSalesEnd = new Date(nft_sales_end);
    const nftSalesEndString = {
        'en': (nftSalesEnd.getMonth() + 1 < 10 ? '0' + (nftSalesEnd.getMonth() + 1) : nftSalesEnd.getMonth() + 1) + '.' + (nftSalesEnd.getDate() < 10 ? '0' + nftSalesEnd.getDate() : nftSalesEnd.getDate()) + '.' + (nftSalesEnd.getFullYear()),
        'ko': (nftSalesEnd.getFullYear()) + '.' + (nftSalesEnd.getMonth() + 1 < 10 ? '0' + (nftSalesEnd.getMonth() + 1) : nftSalesEnd.getMonth() + 1) + '.' + (nftSalesEnd.getDate() < 10 ? '0' + nftSalesEnd.getDate() : nftSalesEnd.getDate()),
    };

    const glow_start = reportData.glow_start || "2026-01-01";
    const glowStart = new Date(glow_start);
    const glowStartString = {
        'en': (glowStart.getMonth() + 1 < 10 ? '0' + (glowStart.getMonth() + 1) : glowStart.getMonth() + 1) + '.' + (glowStart.getDate() < 10 ? '0' + glowStart.getDate() : glowStart.getDate()) + '.' + (glowStart.getFullYear()),
        'ko': (glowStart.getFullYear()) + '.' + (glowStart.getMonth() + 1 < 10 ? '0' + (glowStart.getMonth() + 1) : glowStart.getMonth() + 1) + '.' + (glowStart.getDate() < 10 ? '0' + glowStart.getDate() : glowStart.getDate()),
    };
    const glow_end = reportData.glow_end || "2026-12-31";
    const glowEnd = new Date(glow_end);
    const glowEndString = {
        'en': (glowEnd.getMonth() + 1 < 10 ? '0' + (glowEnd.getMonth() + 1) : glowEnd.getMonth() + 1) + '.' + (glowEnd.getDate() < 10 ? '0' + glowEnd.getDate() : glowEnd.getDate()) + '.' + (glowEnd.getFullYear()),
        'ko': (glowEnd.getFullYear()) + '.' + (glowEnd.getMonth() + 1 < 10 ? '0' + (glowEnd.getMonth() + 1) : glowEnd.getMonth() + 1) + '.' + (glowEnd.getDate() < 10 ? '0' + glowEnd.getDate() : glowEnd.getDate()),
    };

    const settlement_date = reportData.settlement_date || "2027-12-31";
    const settlementDate = new Date(settlement_date);
    const settlementDateString = {
        'en': (settlementDate.getMonth() + 1 < 10 ? '0' + (settlementDate.getMonth() + 1) : settlementDate.getMonth() + 1) + '.' + (settlementDate.getDate() < 10 ? '0' + settlementDate.getDate() : settlementDate.getDate()) + '.' + (settlementDate.getFullYear()),
        'ko': (settlementDate.getFullYear()) + '.' + (settlementDate.getMonth() + 1 < 10 ? '0' + (settlementDate.getMonth() + 1) : settlementDate.getMonth() + 1) + '.' + (settlementDate.getDate() < 10 ? '0' + settlementDate.getDate() : settlementDate.getDate()),
    };

    const terms = getMonthDayDiff(glow_start, glow_end);

    const data = [
        {
          label: {
            en: "NFT Sales Start",
            ko: "NFT 판매 시작",
          },
          value: {
            en: nftSalesStartString.en,
            ko: nftSalesStartString.ko, 
          }
        },
        {
          label: {
            en: "NFT Sales End",
            ko: "NFT 판매 마감",
          },
          value: {
            en: nftSalesEndString.en,
            ko: nftSalesEndString.ko,
          }
        },
        {
        label: {
            en: "GLOW Start Date",
            ko: "GLOW 시작일",
          },
          value: {
            en: glowStartString.en,
            ko: glowStartString.ko, 
          }
        },
        {
          label: {
            en: "GLOW End Date",
            ko: "GLOW 종료일",
          },
          value: {
            en: glowEndString.en,
            ko: glowEndString.ko,
          }
        },
        {
          label: {
            en: "GLOW Terms",
            ko: "GLOW 기간",
          },
          value: {
            en: terms.en,
            ko: terms.ko,
          }
        },
        {
          label: {
            en: "Duration",
            ko: "상환 방법",
          },
          value: {
            en: "Lump Sum",
            ko: "만기일시상환",
          }
        },
        {
          label: {
            en: "Distribution",
            ko: "분배 비율",
          },
          value: {
            en: `${ratio*100}% of the Term’s Revenue`,
            ko: `GLOW 기간 중 발생한 매출의 ${ratio*100}% 분배`,
          }
        },
        {
          label: {
            en: "Scheduled Settlement",
            ko: "정산 예정일",
          },
          value: {
            en: settlementDateString.en,
            ko: settlementDateString.ko,
          }
        },
    ];

    return (
        <div>
            {/* 기본 투자 정보 섹션 */}
            <section>
                <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 border-b border-b-[var(--background-muted)]">
                <h4 className="text-gradient text-xs">
                        {t.nftPrice}
                    </h4>
                    <p className="text-xs font-semibold text-right purple-text-glow-5">
                        $ {nft_price.toFixed(2)}
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 border-b border-b-[var(--background-muted)]">
                <h4 className="text-gradient text-xs">
                        {t.period}
                    </h4>
                    <p className="text-xs font-semibold text-right purple-text-glow-5">
                        {nftSalesStartString[locale]} ~ {nftSalesEndString[locale]}
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 border-b border-b-[var(--background-muted)]">
                <h4 className="text-gradient text-xs">
                        {t.maturityDate}
                    </h4>
                    <p className="text-xs font-semibold text-right purple-text-glow-5">
                        {glowEndString[locale]}
                    </p>
                </div>
            </section>

            {isExpanded && (
                <>
                {/* 투자 구조 섹션 */}
                <section>
                    <div className="relative z-10 grid grid-cols-2 items-center justify-center text-left py-3 px-6 ">
                        <h4 className="text-gradient text-xs">
                            {t.investmentStructure}
                        </h4>
                    </div>
                    <div className="px-6">
                        <table className="min-w-full border-collapse border border-gray-400 text-center text-xs text-[var(--text-primary)]">
                            <tbody>
                                {data.map((row, index) => (
                                    <tr key={index}>
                                        <td className={index === data.length - 1 ? "text-xs py-2 px-4 bg-[rgba(255,255,255,0.1)]" : "text-xs py-2 px-4 border-b border-b-[var(--background-muted)] bg-[rgba(255,255,255,0.1)]"}>
                                            {row.label[locale]}
                                        </td>
                                        <td className={index === data.length - 1 ? "text-xs py-2 px-4" : "text-xs py-2 px-4 border-b border-b-[var(--background-muted)]"}>
                                            {row.value[locale]}
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