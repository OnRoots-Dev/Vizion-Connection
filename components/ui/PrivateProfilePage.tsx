// components/ui/PrivateProfilePage.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
    displayName?: string;
}

export default function PrivateProfilePage({ displayName }: Props) {
    return (
        <div className="flex min-h-screen flex-col bg-[#07070e] text-white">
            {/* Header */}
            <header className="border-b border-white/6 px-6 py-[14px]">
                <Link href="/dashboard">
                    <img
                        src="/images/Vizion_Connection_logo-wt.png"
                        alt="Vizion Connection"
                        className="h-7 w-auto"
                    />
                </Link>
            </header>

            {/* Main */}
            <main className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex max-w-[360px] flex-col items-center gap-5"
                >
                    {/* Lock icon */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/8 bg-white/5">
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h1 className="m-0 text-[20px] font-extrabold leading-[1.2] text-white">
                            {displayName ? `${displayName} のプロフィールは非公開です` : "このプロフィールは非公開です"}
                        </h1>
                        <p className="m-0 text-[13px] leading-relaxed text-white/35">
                            このプロフィールは現在非公開に設定されています。
                        </p>
                    </div>

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/6 px-5 py-2.5 text-[13px] font-semibold text-white/60 no-underline"
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        ダッシュボードへ戻る
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}
