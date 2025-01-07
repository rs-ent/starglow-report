"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="fixed top-0 w-full flex justify-between items-center px-4 text-white z-50">
      <Link 
        href="/" 
        className="flex items-center space-x-0.5 hover:text-gray-300 transition-colors"
        aria-label="Go Back"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* 왼쪽 화살표 (→ SVG 경로를 원하는 다른 아이콘으로 교체 가능) */}
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
    </header>
  );
}