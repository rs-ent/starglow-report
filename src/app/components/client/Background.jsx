"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Background() {
  const lightCount = 4;     // 임시로 1개만 두어 테스트
  const [lights] = useState(() => Array.from({ length: lightCount }, (_, i) => ({ id: `big-${i}` })));

  const particleCount = 100;  // 임시로 5개만 두어 테스트
  const [particles] = useState(() => Array.from({ length: particleCount }, (_, i) => ({ id: `small-${i}` })));

  return (
    <div className="fixed top-0 left-0 z-0 pointer-events-none inset-0 overflow-hidden bg-gradient-to-br from-black via-[#120012] to-black">
      {/* 큰 빛 */}
      {lights.map((light) => (
        <SingleLight key={light.id} />
      ))}
      {/* 작은 입자 */}
      {particles.map((p) => (
        <SingleParticle key={p.id} />
      ))}
      <div className="absolute top-0 w-full h-full bg-[rgba(0,0,0,0.05)] backdrop-blur-xs" />
    </div>
  );
}

function SingleLight() {
  const controls = useAnimation();

  // 초기 상태
  const [initialState] = useState(() => ({
    x: `${randomRange(0, 100)}vw`,
    y: `${randomRange(0, 100)}vh`,
    scale: randomRange(0.7, 1.4),
    opacity: randomRange(0.6, 1.0),
  }));

  useEffect(() => {
    // 단 1회만 애니메이션 실행
    controls.start({
      x: `${randomRange(-10, 110)}vw`,
      y: `${randomRange(-10, 110)}vh`,
      scale: randomRange(0.4, 2.2),
      opacity: randomRange(0.3, 1.0),
      transition: {
        duration: 10,
        ease: "easeInOut",
      },
    });
  }, [controls]);

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: "25vw",
        height: "25vw",
        background: "radial-gradient(circle, rgba(157,78,221,1), transparent 60%)",
        filter: "blur(80px)",
      }}
      initial={initialState}
      animate={controls}
    />
  );
}

function SingleParticle() {
  const controls = useAnimation();

  // 초기 상태
  const [initialState] = useState(() => ({
    x: `${randomRange(0, 100)}vw`,
    y: `${randomRange(0, 100)}vh`,
    scale: randomRange(0.1, 0.2),
    opacity: 0.7,
  }));

  useEffect(() => {
    // 단 1회만 애니메이션 실행
    controls.start({
      x: `${randomRange(-10, 110)}vw`,
      y: `${randomRange(-10, 110)}vh`,
      scale: randomRange(0.1, 0.2),
      opacity: randomRange(0.1, 1.0),
      transition: {
        duration: 10,
        ease: "linear",
      },
    });
  }, [controls]);

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: "1.2vw",
        height: "1.2vw",
        background: "rgba(255, 255, 255, 0.55)",
      }}
      initial={initialState}
      animate={controls}
    />
  );
}