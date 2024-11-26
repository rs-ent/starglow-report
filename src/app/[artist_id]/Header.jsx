// src/app/components/client/Header.js
'use client'; // 클라이언트 전용 컴포넌트

import React, { useEffect, useState } from 'react';

export default function Header() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // 다크 모드 초기화
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        }
    }, []);

    // 다크 모드 토글
    const toggleDarkMode = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setIsDarkMode(!isDarkMode);
    };

    return (
        <header className="sticky top-0 z-50 bg-[var(--background)] shadow-md backdrop-blur-lg">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <h1 className="text-[var(--primary)] font-[var(--font-heading)] text-xl">
                    투자 리포트
                </h1>
                <nav className="flex space-x-4 items-center">
                    <button
                        onClick={toggleDarkMode}
                        className="ml-4 px-3 py-1 rounded-lg border border-[var(--foreground)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all"
                    >
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </nav>
            </div>
        </header>
    );
}