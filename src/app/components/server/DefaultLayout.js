// src/app/components/server/DefaultLayout.js
import React from 'react';
import Background from '../client/Background';

export default function DefaultLayout({ children }) {
    return (
        <div className="bg-animated-glow text-[var(--foreground)] font-[var(--font-body)] transition-all">
            <Background />
            {/* 메인 콘텐츠 */}
            <main className="flex-grow max-w-[480px] mx-auto min-h-dvh">
                {children}
            </main>

        </div>
    );
}