"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function Loading() {
  // 임시로 "가짜 로딩 진행도"를 상태로 관리
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 예시: 0.5초마다 5%씩 증가 → 20초 후 100% 도달
    // 실제로는 fetch 진행도 등에 따라 제어 가능
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 5;
      });
    }, 450);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 via-gray-800 to-black">
      {/* 로고 */}
      <Image 
        src="/sgt_logo.png" 
        alt="Loading Logo" 
        width={256} 
        height={256} 
        className="mb-8"
      />

      {/* 로딩 바 */}
      <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 퍼센트 텍스트(선택) */}
      <div className="mt-3 text-white font-semibold">
        {progress}%
      </div>
    </div>
  );
}