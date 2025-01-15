"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function Loading() {
  // 로딩 바 진행 상태
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 로딩 진행도
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 5;
      });
    }, 350);

    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center 
                overflow-hidden backdrop-blur-md 
                bg-black bg-opacity-80
                [background-blend-mode:overlay]" 
      style={{
        backgroundImage: 'url("/flow.png")',
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* 로고 */}
      <Image 
        src="/sgt_logo.png" 
        alt="Loading Logo" 
        width={256} 
        height={256} 
        className="mb-8 z-10"
      />

      {/* 로딩 바 */}
      <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden z-10">
        <div
          className="h-full bg-white transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 퍼센트 텍스트 */}
      <div className="mt-3 text-white font-semibold z-10">
        {progress}%
      </div>
    </div>
  );
}