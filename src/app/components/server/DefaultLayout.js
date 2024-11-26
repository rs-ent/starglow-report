// src/app/components/server/DefaultLayout.js
import React from 'react';

export default function DefaultLayout({ children }) {
    return (
        <div className="bg-[var(--background-second)] text-[var(--foreground)] font-[var(--font-body)] transition-all">
            
            {/* 메인 콘텐츠 */}
            <main className="flex-grow max-w-[480px] mx-auto">
                {children}
            </main>

        </div>
    );
}