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
  const particleCount = 100 ;
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
      {lights.map((light, index) => (
        <FloatingLight key={light.id} index={index} randomX={randomRange(0, 100)} randomY={randomRange(0, 100)} />
      ))}

      {/* 작은 입자 */}
      {particles.map((p, index) => (
        <FloatingParticle key={p.id} index={index} randomX={randomRange(0, 100)} randomY={randomRange(0, 100)} />
      ))}

      <div className="absolute top-0 w-full h-full bg-[rgba(0,0,0,0.05)] backdrop-blur-xs" />
    </div>
  );
}

// ─────────────────────────────
// 큰 빛 컴포넌트
// ─────────────────────────────
function FloatingLight({ index, randomX, randomY }) {
  const controls = useAnimation();

  // Provide a unique fallback based on index (for SSR)
  const [initialState, setInitialState] = useState(() => ({
    x: `${randomX}vw`,
    y: `${randomY}vh`,
    scale: 1,
    opacity: 0.8,
  }));

  useEffect(() => {
    // After mount, randomize position for the client
    setInitialState({
      x: `${randomRange(0, 100)}vw`,
      y: `${randomRange(0, 100)}vh`,
      scale: randomRange(0.7, 1.4),
      opacity: randomRange(0.6, 1.0),
    });
  }, []);

  useEffect(() => {
    // Infinite animation cycle
    async function moveOneCycle() {
      const nextX = `${randomRange(-10, 110)}vw`;
      const nextY = `${randomRange(-10, 110)}vh`;
      const nextScale = randomRange(0.4, 2.2);
      const nextOpacity = randomRange(0.3, 1.0);
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

      moveOneCycle(); // Recur
    }

    moveOneCycle();
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

// ─────────────────────────────
// 작은 입자(먼지) 컴포넌트
// ─────────────────────────────
function FloatingParticle({ index, randomX, randomY }) {
  const controls = useAnimation();

  // Unique fallback for SSR, offset by index
  const [initialState, setInitialState] = useState(() => ({
    x: `${randomX}vw`,
    y: `${randomY}vh`,
    scale: 0.1,
    opacity: 0.7,
  }));

  useEffect(() => {
    // Randomize after mount
    setInitialState({
      x: `${randomRange(0, 100)}vw`,
      y: `${randomRange(0, 100)}vh`,
      scale: randomRange(0.1, 0.2),
      opacity: 0.7,
    });
  }, []);

  useEffect(() => {
    async function moveOneCycle() {
      const nextX = `${randomRange(-10, 110)}vw`;
      const nextY = `${randomRange(-10, 110)}vh`;
      const nextScale = randomRange(0.1, 0.2);
      const nextOpacity = randomRange(0.1, 1.0);
      const duration = randomRange(80, 140);

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

      moveOneCycle(); // Recur
    }

    moveOneCycle();
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