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
    <header className="fixed bottom-0 w-full max-w-[480px] px-4 drop-shadow-md z-50 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm py-2">
      <div className="flex justify-end">
        {/* 언어 선택 버튼: 누르면 드롭다운 열림/닫힘 */}
        <button
          onClick={toggle}
          className="hover:text-[rgba(255,255,255,1)] transition-colors text-xs text-[rgba(255,255,255,0.6)]"
        >
          {locale.toUpperCase()} ▲
        </button>

        {/* 드롭다운 메뉴 */}
        {open && (
          <div className="absolute right-0 bottom-5 w-20 border border-[var(--border-mid)] border-opacity-20 rounded-md bg-black bg-opacity-85 backdrop-blur-md shadow-md flex flex-col text-xs z-50">
            <Link
              href={makePath("en")}
              className={`${
                locale === "EN" ? "font-bold" : "font-normal"
              } py-2 px-4 hover:bg-gray-700 text-left font-heading`}
            >
              EN
            </Link>
            <Link
              href={makePath("ko")}
              className={`${
                locale === "KO" ? "font-bold" : "font-normal"
              } py-2 px-4 hover:bg-gray-700 text-left font-heading`}
            >
              KO
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
