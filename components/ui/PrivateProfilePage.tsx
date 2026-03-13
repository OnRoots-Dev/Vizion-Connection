// components/ui/PrivateProfilePage.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
    displayName?: string;
}

export default function PrivateProfilePage({ displayName }: Props) {
    return (
        <div style={{ minHeight: "100vh", background: "#07070e", color: "#fff", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 24px" }}>
                <Link href="/dashboard">
                    <img
                        src="/images/Vizion_Connection_logo-wt.png"
                        alt="Vizion Connection"
                        style={{ height: "28px", width: "auto" }}
                    />
                </Link>
            </header>

            {/* Main */}
            <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center" }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", maxWidth: "360px" }}
                >
                    {/* Lock icon */}
                    <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>
                            {displayName ? `${displayName} のプロフィールは非公開です` : "このプロフィールは非公開です"}
                        </h1>
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.6 }}>
                            このプロフィールは現在非公開に設定されています。
                        </p>
                    </div>

                    <Link
                        href="/dashboard"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
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
