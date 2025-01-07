"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Background from './components/client/Background';

export default function Loading() {
  // 로딩 바 진행 상태
  const [progress, setProgress] = useState(0);

  // 마우스 좌표 추적
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 빛 정보 배열
  const [lights, setLights] = useState([]);
  const timeoutsRef = useRef([]);

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

  // 마우스 움직임 추적
  useEffect(() => {
    const handleMouseMove = (e) => {
      // 화면 전체에 걸쳐 마우스 좌표 추적
      // (프레임워크/디자인에 따라 clientX, pageX 등 조정)
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // 빛 생성 함수
  const spawnLight = () => {
    // 1~4개의 빛을 한 번에 생성(취향에 맞게 조절 가능)
    const randomLightCount = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < randomLightCount; i++) {
      const randomDuration = 7 + Math.random() * 24; // 애니메이션 시간
      const endDuration = randomDuration * 1000 * 1.2; // 빛이 사라지는 시점

      const newLight = {
        id: Date.now() + i,
        // 마우스 근처에 생성 (약간 랜덤 오프셋 추가)
        x: mousePos.x + (Math.random() * 40 - 20),
        y: mousePos.y + (Math.random() * 40 - 20),
        size: 500 + Math.random() * 300,
        duration: randomDuration,
      };

      setLights((prev) => [...prev, newLight]);

      // endDuration 후에 배열에서 제거
      const timerId = setTimeout(() => {
        setLights((prev) => prev.filter((light) => light.id !== newLight.id));
      }, endDuration);
      timeoutsRef.current.push(timerId);
    }
  };

  // 1초 간격으로 빛 생성
  useEffect(() => {
    const intervalId = setInterval(() => {
      spawnLight();
    }, 1000);

    return () => {
      clearInterval(intervalId);
      timeoutsRef.current.forEach((id) => clearTimeout(id));
    };
  }, [mousePos]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
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