"use client";

import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";

export function RightPanel({ profile, referralCount, t, roleColor, setView }: {
    profile: ProfileData;
    referralCount: number;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
}) {
    const REFERRAL_LIMIT = 30;
    const POINTS_PER_REFERRAL = 500;
    const maxPoints = REFERRAL_LIMIT * POINTS_PER_REFERRAL;
    const ptPct = Math.min((profile.points / maxPoints) * 100, 100);

    const MISSIONS = [
        { label: "先行登録完了", done: true },
        { label: "メール認証完了", done: profile.verified },
        { label: "SNSで共有", done: profile.hasShared ?? false },
        { label: "3人招待する", done: referralCount >= 3 },
        { label: "プロフィール編集", done: !!(profile.bio || profile.sport || profile.region) },
    ];

    const completedCount = MISSIONS.filter((m) => m.done).length;
    const allDone = completedCount === MISSIONS.length;

    return (
        <div className="flex flex-col gap-3 px-3 py-4">
            <div>
                <p className="mb-[10px] mt-0 font-mono text-[8px] font-black uppercase tracking-[0.25em] opacity-45" style={{ color: t.sub }}>Vizion Points</p>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="rounded-[14px] border bg-[rgba(255,255,255,0.025)] p-4"
                    style={{ borderColor: `${roleColor}20` }}
                >
                    <div className="mb-[3px] flex items-baseline gap-[5px]">
                        <span className="font-mono text-[30px] font-black leading-none" style={{ color: roleColor }}>{profile.points.toLocaleString()}</span>
                        <span className="text-[11px]" style={{ color: t.sub }}>pt</span>
                    </div>
                    <p className="mb-[10px] mt-0 font-mono text-[9px] opacity-45" style={{ color: t.sub }}>/ {maxPoints.toLocaleString()} pt MAX</p>
                    <div className="h-1 overflow-hidden rounded-[99px] bg-white/6">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ptPct}%` }}
                            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${roleColor},${roleColor}88)`, boxShadow: `0 0 8px ${roleColor}60` }}
                        />
                    </div>
                </motion.div>
            </div>

            <div>
                <div className="mb-[10px] flex items-center justify-between">
                    <p className="m-0 font-mono text-[8px] font-black uppercase tracking-[0.25em] opacity-45" style={{ color: t.sub }}>Missions</p>
                    <span className="rounded-[99px] border px-[7px] py-[2px] font-mono text-[9px] font-black" style={{ color: allDone ? "#FFD600" : t.sub, background: allDone ? "rgba(255,214,0,0.1)" : "rgba(255,255,255,0.04)", borderColor: allDone ? "rgba(255,214,0,0.25)" : "rgba(255,255,255,0.07)" }}>
                        {completedCount} / {MISSIONS.length}
                    </span>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    className="rounded-[14px] border border-white/6 bg-[rgba(255,255,255,0.02)] px-[14px] py-3"
                >
                    <div className="mb-3 h-[3px] overflow-hidden rounded-[99px] bg-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedCount / MISSIONS.length) * 100}%` }}
                            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            style={{ height: "100%", borderRadius: 99, background: allDone ? "linear-gradient(90deg,#FFD600,#FFD60088)" : "linear-gradient(90deg,rgba(255,255,255,0.3),rgba(255,255,255,0.1))" }}
                        />
                    </div>
                    {MISSIONS.map(({ label, done }, i) => (
                        <div key={label} className={`flex items-center gap-2 ${i < MISSIONS.length - 1 ? "mb-[7px]" : ""}`}>
                            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px]" style={{ background: done ? `${roleColor}20` : "rgba(255,255,255,0.04)", borderColor: done ? roleColor : "rgba(255,255,255,0.1)" }}>
                                {done && <svg width={8} height={8} fill="none" viewBox="0 0 24 24" stroke={roleColor} strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className="flex-1 text-[11px]" style={{ color: done ? t.sub : t.text, opacity: done ? 0.45 : 1, textDecoration: done ? "line-through" : "none" }}>{label}</span>
                        </div>
                    ))}
                    {allDone && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-[10px] flex items-center gap-[7px] rounded-[9px] border border-[rgba(255,214,0,0.2)] bg-[rgba(255,214,0,0.07)] px-[10px] py-2"
                        >
                            <span className="text-[13px]">🏆</span>
                            <div>
                                <p className="m-0 text-[10px] font-extrabold text-[#FFD600]">全完了！</p>
                                <p className="mb-0 mt-px text-[9px] opacity-50" style={{ color: t.sub }}>+500pt ボーナス</p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            <button
                onClick={() => setView("missions")}
                className="flex w-full items-center justify-center gap-[6px] rounded-[10px] border px-[14px] py-[9px] text-[11px] font-bold"
                style={{ background: `${roleColor}10`, borderColor: `${roleColor}22`, color: roleColor, cursor: "pointer" }}
            >
                <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ミッション詳細
            </button>

            {profile.role === "Business" && profile.plan !== "paid" && (
                <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setView("hub")}
                    className="relative w-full overflow-hidden rounded-[14px] border border-[rgba(60,140,255,0.3)] bg-[linear-gradient(135deg,rgba(60,140,255,0.12),rgba(60,140,255,0.04))] p-[14px] text-left"
                    style={{ cursor: "pointer" }}
                >
                    <div className="pointer-events-none absolute -right-[10px] -top-[10px] h-[60px] w-[60px] rounded-full bg-[radial-gradient(circle,rgba(60,140,255,0.2),transparent_70%)]" />
                    <p className="mb-[5px] mt-0 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-[#3C8CFF]">Upgrade Plan</p>
                    <p className="mb-1 mt-0 text-[11px] font-bold text-white">有料プランで機能を解放</p>
                    <p className="m-0 text-[9px] leading-[1.5] text-white/35">広告掲載・効果測定・<br />アスリートマッチングを利用</p>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-[6px] bg-[#3C8CFF] px-[10px] py-1 text-[10px] font-extrabold text-black">詳細を見る →</div>
                </motion.button>
            )}
        </div>
    );
}
