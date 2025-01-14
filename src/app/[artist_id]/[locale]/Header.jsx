"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Header() {
  const { artist_id, locale } = useParams(); 

  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);
  const makePath = (newLocale) => `/${artist_id}/${newLocale}`;

  return (
    <header className="fixed top-0 w-full max-w-[480px] px-4 drop-shadow-md z-50 bg-[rgba(0,0,0,0.1)]">
      <div className="flex justify-between">
      <Link 
        href="/" 
        aria-label="Go Back"
      >
        <svg
          className="w-6 h-6 drop-shadow-md"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
      
      {/* 언어 선택 버튼: 누르면 드롭다운 열림/닫힘 */}
      <button
          onClick={toggle}
          className="hover:text-[var(--primary)] transition-colors text-xs text-[var(--text-primary)]"
        >
          {locale.toUpperCase()} ▼
        </button>

        {/* 드롭다운 메뉴 */}
        {open && (
          <div className="absolute right-0 top-5 w-20 border border-[var(--border-mid)] border-opacity-20 rounded-md bg-black bg-opacity-85 backdrop-blur-md shadow-md flex flex-col text-xs z-50">
            <Link
              href={makePath("en")}
              className={`${
                locale === "EN" ? "font-bold" : "font-normal"
              } py-2 px-4 hover:bg-gray-700 text-left font-heading`}
            >
              EN
            </Link>
            <Link
              href={makePath("kr")}
              className={`${
                locale === "KR" ? "font-bold" : "font-normal"
              } py-2 px-4 hover:bg-gray-700 text-left font-heading`}
            >
              KR
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}