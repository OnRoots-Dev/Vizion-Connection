"use client";

import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import { DailyLogCard } from "@/components/DailyLog/DailyLogCard";

export function HomeView({ profile, referralUrl, referralCount, t, roleColor, setView }: {
    profile: ProfileData;
    referralUrl: string;
    referralCount: number;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
}) {
    // 挨拶は現在時刻依存のため意図的にrender時算出（SSR/CSRで時刻が変わるケースのみ再計算される）
    // eslint-disable-next-line react-hooks/purity
    const jstHour = new Date(Date.now() + 9 * 60 * 60 * 1000).getUTCHours();
    const greeting = jstHour < 11 ? "おはよう" : jstHour < 18 ? "こんにちは" : "こんばんは";
    const heroName = profile.displayName?.trim() || profile.slug;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative", overflow: "hidden", paddingBottom: 8 }}>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: "0 0 6px", fontFamily: "'Space Mono', monospace" }}>
                    {profile.role} · Pulse Base
                </motion.p>
                <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }} className="font-display" style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 800, color: "#f0f0f5", margin: 0, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
                    {greeting}、<span style={{ color: roleColor }}>{heroName}</span>。
                </motion.h1>
            </div>

            {/* NOTE: DAILY CIRCUIT / PULSE SCORE カードは依存API(/api/daily-circuit,
                /api/pulse/score)がMVPスコープ外で封印中のため非表示。
                機能復活時は config/mvp-scope.ts を参照。 */}

            <ProfileCardSection profile={profile} t={t} roleColor={roleColor} setView={setView} referralUrl={referralUrl} referralCount={referralCount} />

            <DailyLogCard t={t} roleColor={roleColor} role={profile.role} />
        </div>
    );
}
