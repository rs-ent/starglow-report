"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

/** 랜덤 범위 [min, max) */
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Background() {
  const lightCount = 4;       // 큰 빛(큰 광원)의 개수
  const particleCount = 90;   // 작은 입자의 개수

  // 큰 빛 목록
  const [lights] = useState(() =>
    Array.from({ length: lightCount }, (_, i) => ({ id: `big-${i}` }))
  );

  // 작은 입자 목록
  const [particles] = useState(() =>
    Array.from({ length: particleCount }, (_, i) => ({ id: `small-${i}` }))
  );

  return (
    <div className="fixed top-0 left-0 z-0 pointer-events-none inset-0 overflow-hidden bg-gradient-to-br from-black via-[#120012] to-black">
      {/* 큰 빛들 */}
      {lights.map((light) => (
        <FloatingLight key={light.id} />
      ))}

      {/* 작은 입자들 */}
      {particles.map((p) => (
        <FloatingParticle key={p.id} />
      ))}

      {/* 약간의 반투명 + 블러 */}
      <div className="absolute top-0 w-full h-full bg-[rgba(0,0,0,0.05)] backdrop-blur-xs" />
    </div>
  );
}

/** 큰 빛(FloatingLight) — 무작위 새 목적지 */
function FloatingLight() {
  const controls = useAnimation();

  // 초기 상태 (초기 위치, 크기, 투명도)
  const [init] = useState(() => ({
    x: `${randomRange(0, 100)}vw`,
    y: `${randomRange(0, 100)}vh`,
    scale: randomRange(0.7, 1.4),
    opacity: randomRange(0.6, 1.0),
  }));

  // 현재 타겟(목표 지점)을 state로 관리
  const [target, setTarget] = useState(() => getRandomTarget(init));

  // 애니메이션 시작 or target 변경 시 다시 controls.start
  useEffect(() => {
    controls.start({
      x: target.x,
      y: target.y,
      scale: target.scale,
      opacity: target.opacity,
      transition: {
        duration: target.duration,
        ease: "easeInOut",
      },
    });
  }, [target, controls]);

  // 애니메이션이 끝나면 새로운 타겟을 설정
  async function handleComplete() {
    setTarget(getRandomTarget(target));
  }

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: "25vw",
        height: "25vw",
        background:
          "radial-gradient(circle, rgba(157,78,221,1), transparent 60%)",
        filter: "blur(80px)",
      }}
      initial={init}
      animate={controls}
      onAnimationComplete={handleComplete}
    />
  );
}

/** 작은 입자(FloatingParticle) — 무작위 새 목적지 */
function FloatingParticle() {
  const controls = useAnimation();

  const [init] = useState(() => ({
    x: `${randomRange(0, 100)}vw`,
    y: `${randomRange(0, 100)}vh`,
    scale: randomRange(0.1, 0.2),
    opacity: 0.7,
  }));

  const [target, setTarget] = useState(() => getRandomParticleTarget(init));

  useEffect(() => {
    controls.start({
      x: target.x,
      y: target.y,
      scale: target.scale,
      opacity: target.opacity,
      transition: {
        duration: target.duration,
        ease: "linear",
      },
    });
  }, [target, controls]);

  function handleComplete() {
    setTarget(getRandomParticleTarget(target));
  }

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: "1.2vw",
        height: "1.2vw",
        background: "rgba(255, 255, 255, 0.6)",
      }}
      initial={init}
      animate={controls}
      onAnimationComplete={handleComplete}
    />
  );
}

/** 큰 빛용 랜덤 타겟 생성 */
function getRandomTarget(prev) {
  return {
    x: `${randomRange(-10, 110)}vw`,
    y: `${randomRange(-10, 110)}vh`,
    scale: randomRange(0.35, 2),
    opacity: randomRange(0.3, 1.0),
    duration: randomRange(60, 90),
  };
}

/** 작은 입자용 랜덤 타겟 생성 */
function getRandomParticleTarget(prev) {
  return {
    x: `${randomRange(-10, 110)}vw`,
    y: `${randomRange(-10, 110)}vh`,
    scale: randomRange(0.1, 0.2),
    opacity: randomRange(0.1, 1.0),
    duration: randomRange(75, 200),
  };
}