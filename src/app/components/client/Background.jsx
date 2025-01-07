"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

/** 무작위 숫자 뽑는 유틸 (범위 [min, max]) */
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Background() {
  // 큰 빛 개수
  const lightCount = 4;
  const [lights] = useState(() => {
    const temp = [];
    for (let i = 0; i < lightCount; i++) {
      temp.push({ id: `big-${i}` });
    }
    return temp;
  });

  // 작은 입자 개수
  const particleCount = 75;
  const [particles] = useState(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      temp.push({ id: `small-${i}` });
    }
    return temp;
  });

  return (
    <div className="fixed top-0 left-0 z-0 pointer-events-none inset-0 overflow-hidden bg-gradient-to-br from-black via-[#120012] to-black">
      {/* 큰 빛 */}
      {lights.map((light) => (
        <FloatingLight key={light.id} />
      ))}

      {/* 작은 입자 */}
      {particles.map((p) => (
        <FloatingParticle key={p.id} />
      ))}
    </div>
  );
}

// ─────────────────────────────
// 큰 빛 컴포넌트
// ─────────────────────────────
function FloatingLight() {
  const controls = useAnimation();

  useEffect(() => {
    // 컴포넌트가 마운트된 이후에 moveOneCycle 함수가 정의됨
    async function moveOneCycle() {
      const nextX = `${randomRange(-10, 110)}vw`;
      const nextY = `${randomRange(-10, 110)}vh`;
      const nextScale = randomRange(0.7, 1.5);
      const nextOpacity = randomRange(0.6, 1.0);
      const duration = randomRange(25, 60);

      await controls.start({
        x: nextX,
        y: nextY,
        scale: nextScale,
        opacity: nextOpacity,
        transition: {
          duration,
          ease: "easeInOut",
        },
      });
      // 완료 후 재귀 호출
      moveOneCycle();
    }

    // 최초 호출
    moveOneCycle();
  }, [controls]);

  // 초기값 설정
  const initialScale = randomRange(0.5, 1.0);
  const initialX = `${randomRange(0, 100)}vw`;
  const initialY = `${randomRange(0, 100)}vh`;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: "25vw",
        height: "25vw",
        background: "radial-gradient(circle, rgba(157,78,221,1), transparent 60%)",
        filter: "blur(180px)",
      }}
      initial={{
        x: initialX,
        y: initialY,
        scale: initialScale,
        opacity: 0.9,
      }}
      animate={controls}
    />
  );
}

// ─────────────────────────────
// 작은 입자(먼지) 컴포넌트
// ─────────────────────────────
function FloatingParticle() {
  const controls = useAnimation();

  // 작은 입자도 같은 방식
  useEffect(() => {
    // 컴포넌트가 마운트된 이후에 moveOneCycle 함수가 정의됨
    async function moveOneCycle() {
      const nextX = `${randomRange(-10, 110)}vw`;
      const nextY = `${randomRange(-10, 110)}vh`;
      const nextScale = randomRange(0.1, 0.2);
      const nextOpacity = randomRange(0.2, 0.7);
      const duration = randomRange(50, 70);

      await controls.start({
        x: nextX,
        y: nextY,
        scale: nextScale,
        opacity: nextOpacity,
        transition: {
          duration,
          ease: "linear",
        },
      });
      // 완료 후 재귀 호출
      moveOneCycle();
    }

    // 최초 호출
    moveOneCycle();
  }, [controls]);

  // 초기 위치
  const initialScale = 0.2;
  const initialX = `${randomRange(0, 100)}vw`;
  const initialY = `${randomRange(0, 100)}vh`;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: "1.2vw",
        height: "1.2vw",
        background: "rgba(255, 255, 255, 0.5)",
        filter: "blur(1px)",
      }}
      initial={{
        x: initialX,
        y: initialY,
        scale: initialScale,
        opacity: 0.3,
      }}
      animate={controls}
    />
  );
}