import Background from '../client/Background';

export default function DefaultLayout({ children }) {
    return (
        <div className="bg-animated-glow text-[var(--foreground)] font-[var(--font-body)] transition-all">
            {/* 메인 콘텐츠 */}
            <main className="flex-grow max-w-[480px] mx-auto min-h-dvh overflow-x-hidden">
                {children}
            </main>

        </div>
    );
}