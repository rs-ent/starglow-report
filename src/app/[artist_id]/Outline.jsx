// src/app/[artist_id]/Introduction.jsx

'use client';

import React, { useState } from 'react';
import { useReport, useIntroduction } from '../../context/GlobalData';
import { formatNumber } from '../utils/formatNumber';
import Image from 'next/image';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FaCoins } from 'react-icons/fa';
import { FaChartLine } from 'react-icons/fa';
import { MdOutlineEmojiPeople } from 'react-icons/md';
import { AiOutlineFundProjectionScreen } from 'react-icons/ai';
import 'react-circular-progressbar/dist/styles.css';
import { format } from 'date-fns';

const Outline = () => {
    const reportData = useReport();
    const data = useIntroduction();

    const goal_fund = reportData.goal_fund;
    const current_fund = reportData.current_fund;
    const investor_count = reportData.investor_count;
    const progress = (current_fund / goal_fund) * 100;
    
    const project_status = reportData.project_status;
    const statusColors = {
        "모집예정": "bg-gray-300 text-gray-800",
        "모집중": "bg-green-300 text-green-800",
        "모집완료": "bg-blue-300 text-blue-800",
        "프로젝트 종료": "bg-red-300 text-red-800",
    };

    const {
        catchPhrase,
        subCatchPhrase,
        introduction,
        additionalData,
        logo,
        profilePicture,
        members,
        galleryImages,
    } = data;

    return (
        <div>
            <section className="section-base-without-py6-px3 pb-2">
                {/* 로고 및 프로필 사진 */}
                <div className="w-full aspect-w-16 aspect-h-9 shadow-soft">
                    <Image 
                        src={profilePicture} 
                        alt="프로필 사진" 
                        layout="fill" 
                        objectFit="cover"
                    />
                </div>

                <div className="pt-6 pb-3 px-3 flex gap-2 items-baseline border-b border-b-[var(--background-muted)]">
                    {/* 태그 */}
                    <div className="inline-block bg-[var(--background)] border border-[var(--background-muted)] text-[var(--text-secondary)] text-xs font-extralight px-2 py-0.5 rounded-md self-center">
                        {reportData.type}
                    </div>
                    
                    {/* Artist Korean Name */}
                    <p className="text-3xl font-bold text-[var(--text-primary)] leading-none tracking-wide">
                        {reportData.artist_kor}
                    </p>
                    
                    {/* Artist English Name */}
                    <p className="text-base font-light text-[var(--text-secondary)] leading-none tracking-wide">
                        | {reportData.artist_eng}
                    </p>
                </div>
            </section>

            <section className="section-base grid gap-3 pb-4">
                {/* 현재 모금액 */}
                <div className="p-6 rounded-lg border border-[var(--background-muted)] flex items-center gap-4 h-28">
                    <div className="p-3 bg-green-200 rounded-full">
                        <FaCoins className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                        <h2 className="text-base text-[var(--text-secondary)]">현재 모금액</h2>
                        <p className="text-2xl font-extrabold text-green-500 mt-0.5">
                            ₩ {current_fund.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* 달성률 및 목표 모금액 */}
                <div className="px-6 rounded-lg border border-[var(--background-muted)] flex items-center gap-4 h-24">
                    {/* 아이콘 */}
                    <div className="p-3 bg-orange-100 rounded-full flex items-center justify-center">
                        <FaChartLine className="h-6 w-6 text-orange-400" />
                    </div>

                    {/* Progress Bar and Text */}
                    <div className="flex-1">
                        {/* Text Information */}
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-base text-[var(--text-secondary)]">
                                {`달성률: ${(current_fund / goal_fund * 100).toFixed(1)}%`}
                            </p>
                            <p className="text-sm font-base text-[var(--text-secondary)]">
                                목표: ₩{formatNumber(goal_fund, '원', 1).toLocaleString()}
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="absolute top-0 left-0 h-full bg-orange-400 transition-all duration-300 ease-in-out"
                                style={{ width: `${(current_fund / goal_fund) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    {/* 투자자 수 */}
                    <div className="p-6 flex-1 rounded-lg border border-[var(--background-muted)] flex items-center gap-4 h-24">
                        <div className="flex items-center mt-2">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <MdOutlineEmojiPeople className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-[var(--text-secondary)] text-sm text-center">투자자 수</p>
                                <h4 className="text-blue-600 font-bold text-xl text-center">{investor_count}</h4>
                            </div>
                        </div>
                    </div>

                    {/* 프로젝트 상태 */}
                    <div className="p-6 flex-1 rounded-lg border border-[var(--background-muted)] flex items-center gap-4 h-24">
                        <div className="p-3 bg-red-100 rounded-full">
                            <AiOutlineFundProjectionScreen className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-[var(--text-secondary)] text-sm text-center">프로젝트 상태</p>
                            <p className={`min-w-28 px-3 py-1 rounded-full font-extrabold text-base text-center ${statusColors[project_status]}`}>
                                {project_status}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Outline;