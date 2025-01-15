"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Background() {
  return (
    <div className="fixed top-0 left-0 z-0 pointer-events-none inset-0 overflow-hidden bg-gradient-to-br from-black via-[#120012] to-black">
      <SingleLight />
      <div className="absolute top-0 w-full h-full bg-[rgba(0,0,0,0.05)] backdrop-blur-xs" />
    </div>
  );
}

function SingleLight() {
  // 랜덤 초기 상태 생성 (초기 위치, 크기, 불투명도)
  const [initialState] = useState({
    x: `${randomRange(0, 100)}vw`,
    y: `${randomRange(0, 100)}vh`,
    scale: randomRange(0.7, 1.4),
    opacity: randomRange(0.6, 1.0),
  });

  // 목표 상태를 배열로 정의 → Framer Motion이 “연속적”으로 이동
  // 예시: 두 지점 사이를 계속 왔다갔다 혹은 여러 지점을 순회
  const [animationTargets] = useState({
    x: [
      initialState.x,
      `${randomRange(-10, 110)}vw`,
      `${randomRange(-10, 110)}vw`,
    ],
    y: [
      initialState.y,
      `${randomRange(-10, 110)}vh`,
      `${randomRange(-10, 110)}vh`,
    ],
    scale: [
      initialState.scale,
      randomRange(0.4, 2.2),
      randomRange(0.4, 2.2),
    ],
    opacity: [
      initialState.opacity,
      randomRange(0.3, 1.0),
      randomRange(0.3, 1.0),
    ],
  });

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: "25vw",
        height: "25vw",
        background: "radial-gradient(circle, rgba(157,78,221,1), transparent 60%)",
        filter: "blur(80px)",
      }}
      initial={{
        x: initialState.x,
        y: initialState.y,
        scale: initialState.scale,
        opacity: initialState.opacity,
      }}
      animate={{
        x: animationTargets.x,
        y: animationTargets.y,
        scale: animationTargets.scale,
        opacity: animationTargets.opacity,
      }}
      transition={{
        duration: 30,
        ease: "easeInOut",
        repeat: Infinity,   // 무한 반복
        repeatType: "reverse", 
        // repeatType: "mirror" 혹은 "loop" 등도 가능
      }}
    />
  );
}