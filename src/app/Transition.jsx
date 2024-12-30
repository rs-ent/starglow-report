"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function Transition({ children }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        style={{
          // 3D 효과를 주려면 perspective 설정 (반드시 부모에 perspective가 있어야 더 실감남)
          perspective: 1000,
        }}
      >
        <motion.div
          initial={{
            rotateY: 90, // 오른쪽에서 왼쪽으로 들어오는 느낌
            opacity: 0,
          }}
          animate={{
            rotateY: 0,
            opacity: 1,
          }}
          exit={{
            rotateY: -90, // 다시 왼쪽으로 회전해서 사라짐
            opacity: 0,
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          style={{
            transformOrigin: "center", // 회전축 중앙
            backfaceVisibility: "hidden", // 뒤집혔을 때가 보이지 않도록
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}