"use client";

import React, { useEffect, useState } from "react";

export default function Loading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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
                bg-black bg-opacity-80 [background-blend-mode:overlay]"
      style={{
        backgroundImage: 'url("/flow.png")',
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* 마스크 컨테이너 */}
      <div 
        className="relative w-[200px] h-[200px]" 
        style={{
          // 배경색(파란색 등)으로 "물" 표현
          backgroundColor: "#00bfff",
          // 세로 길이를 progress 비율로 조절 → 아래서부터 채워짐
          height: `${2 * progress}px`, 
          transition: "height 0.3s ease",

          // 마스크 설정 (WebKit/Safari 호환 위해 -webkit- 접두사도)
          WebkitMaskImage: "url('/logo_water_mask.png')",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          WebkitMaskSize: "contain",

          maskImage: "url('/logo_water_mask.png')",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          maskSize: "contain",
        }}
      />

      {/* 프로그레스 텍스트 */}
      <div className="mt-4 text-white font-semibold z-10">
        {progress}%
      </div>
    </div>
  );
}