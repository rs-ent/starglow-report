// src/app/[artist_id]/Introduction.jsx

'use client';

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { useReport, useIntroduction, useKPI } from '../../context/GlobalData';
import { formatNumber } from '../utils/formatNumber';
import Image from 'next/image';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FaCoins } from 'react-icons/fa';
import { FaChartLine } from 'react-icons/fa';
import { MdOutlineEmojiPeople } from 'react-icons/md';
import { AiOutlineFundProjectionScreen } from 'react-icons/ai';
import 'react-circular-progressbar/dist/styles.css';
import { format } from 'date-fns';
import ApplyButton from './Outline.ApplyButton';

function getProjectStatus(launchDate, deadlineDate, currentDate) {
    if (!launchDate || !deadlineDate) {
      return "Unknown"; // 날짜가 하나라도 없으면 상태 판단 불가
    }
  
    const ld = new Date(launchDate);
    const dd = new Date(deadlineDate);
  
    if (isNaN(ld.getTime()) || isNaN(dd.getTime())) {
      return "Unknown";
    }
  
    if (currentDate < ld) {
      return "Scheduled";
    } else if (currentDate >= ld && currentDate <= dd) {
      return "Ongoing";
    } else if (currentDate > dd) {
      return "Ended";
    }
  
    return "Unknown";
}

const Outline = () => {
    const reportData = useReport();
    const kpiData = useKPI();
    const data = useIntroduction();

    const goal_fund = reportData.goal_fund;
    const investor_count = reportData.investor_count || 0;
    const pre_applier_count = reportData.pre_applier_count || 0;
    const minted_nft = reportData.minted_nft || 100000;
    const nft_price = reportData.nft_price || 50;

    const avgRevenue = kpiData.expectedAnnualRevenue;
    const investorsShareRatio = reportData.investors_share_ratio;
    const investorsAvgRevenue = avgRevenue * investorsShareRatio;
    
    const project_launch_date = reportData.project_launch_date || "2025-12-31";
    const launchDate = new Date(project_launch_date);
    const launchDateString = (launchDate.getFullYear() % 100) + '-' + (launchDate.getMonth() + 1 < 10 ? '0' + (launchDate.getMonth() + 1) : launchDate.getMonth() + 1) + '-' + (launchDate.getDate() < 10 ? '0' + launchDate.getDate() : launchDate.getDate());
    const project_deadline_date = reportData.project_deadline_date || "2025-12-31";
    const deadline = new Date(project_deadline_date);
    const deadlineDateString = (deadline.getFullYear() % 100) + '-' + (deadline.getMonth() + 1 < 10 ? '0' + (deadline.getMonth() + 1) : deadline.getMonth() + 1) + '-' + (deadline.getDate() < 10 ? '0' + deadline.getDate() : deadline.getDate());
    const today = new Date();

    const projectStatus = getProjectStatus(project_launch_date, project_deadline_date, today);
    const [isPre, setIsPre] = useState(true);

    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {

        let targetDate;
        if (today < launchDate) {
            targetDate = launchDate;
            setIsPre(true);
        } else {
            targetDate = deadline;
            setIsPre(false);
        }
        
        const interval = setInterval(() => {
          const now = new Date();
          const diffInSeconds = Math.floor((targetDate - now) / 1000);
          if (diffInSeconds > 0) {
            const d = Math.floor(diffInSeconds / (3600 * 24));
            const h = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
            const m = Math.floor((diffInSeconds % 3600) / 60);
            const s = diffInSeconds % 60;
      
            setDays(d);
            setHours(h);
            setMinutes(m);
            setSeconds(s);
          } else {
            // 이미 마감 시간을 지난 경우
            setDays(0);
            setHours(0);
            setMinutes(0);
            setSeconds(0);
          }
        }, 1000);
      
        return () => clearInterval(interval);

    }, [project_deadline_date]);

    const {
        profilePicture = null,
    } = data || {};

    return (
        <div>
            <section className="section-base-without-py6-px3">
                {/* 로고 및 프로필 사진 */}
                <div className="w-full aspect-w-16 aspect-h-9 shadow-soft overflow-hidden purple-glow-5">
                    <div className="w-full h-full">
                        <Image
                            src={profilePicture}
                            alt="프로필 사진"
                            fill
                            quality={100}
                            sizes="(max-width: 768px) 100vw, 80vw"
                            className="object-cover"
                            loading="lazy"
                        />
                    </div>
                </div>
                
                <div className='flex justify-between items-baseline border-gradient-b'>
                    <div className="pt-6 pb-3 px-3 flex gap-2 items-baseline">
                        {/* 태그 */}
                        <div className="inline-block bg-transparent border border-[var(--border-mid)] text-[var(--text-secondary)] text-xs font-extralight px-2 py-0.5 rounded-md self-center">
                            {reportData.type}
                        </div>
                        
                        {/* Artist Korean Name */}
                        <h1 className="text-gradient text-4xl font-bold leading-none tracking-wide text-glow">
                            {reportData.artist_eng}
                        </h1>
                    </div>
                    <h4 className='text-gradient text-sm text-left w-36 purple-text-glow-5'>
                        {days + hours + minutes + seconds > 0
                            ? `D-${days}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                            : 'Ended'
                        }
                    </h4>
                </div>
            </section>

            <section className="grid pb-4 items-center">
                <div className="grid grid-cols-2">
                    <div className="text-left border-b border-b-[var(--border-mid)] border-r border-r-[var(--border-mid)]">
                        <p className="text-sm text-[var(--text-secondary)] ml-6 mt-3">Glow Chance</p>
                        <h2 className="text-glow text-lg ml-6 mb-3">{projectStatus}</h2>
                    </div>

                    <div className="text-left border-b border-b-[var(--border-mid)]">
                        <p className="text-sm text-[var(--text-secondary)] ml-6 mt-3">Period</p>
                        <h2 className="text-glow text-base ml-6 mb-3">
                            {launchDateString} ~ {deadlineDateString}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-2">
                    <div className="text-left border-b border-b-[var(--border-mid)] border-r border-r-[var(--border-mid)]">
                        <p className="text-sm text-[var(--text-secondary)] ml-6 mt-3">Price</p>
                        <h2 className="text-glow text-lg ml-6 mb-3">$ {nft_price.toFixed(2)}</h2>
                    </div>

                    <div className="text-left border-b border-b-[var(--border-mid)]">
                        <p className="text-sm text-[var(--text-secondary)] ml-6 mt-3">{isPre ? 'Awaiters' : 'Holders'}</p>
                        <h2 className="text-glow text-lg ml-6 mb-3">{isPre ? pre_applier_count : investor_count}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-2">
                    <div className="text-left border-b border-b-[var(--border-mid)] border-r border-r-[var(--border-mid)]">
                        <p className="text-sm text-[var(--text-secondary)] ml-6 mt-3">Amount</p>
                        <h2 className="text-glow text-lg ml-6 mb-3">{minted_nft.toLocaleString()}</h2>
                    </div>

                    <div className="text-left border-b border-b-[var(--border-mid)]">
                        <p className="text-sm text-[var(--text-secondary)] ml-6 mt-3">Estimated ROI</p>
                        <h2 className="text-glow text-lg ml-6 mb-3">{(((investorsAvgRevenue - goal_fund) / goal_fund) * 100).toFixed(0)}%</h2>
                    </div>
                </div>

                <ApplyButton isPre={isPre} />
            </section>
        </div>
    );
};

export default Outline;