"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { ProfileData } from "@/features/profile/types";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};
const ROLE_LABEL: Record<string, string> = {
    Athlete: "Athlete", Trainer: "Trainer", Members: "Members", Business: "Business",
};

interface ThemeColors { bg: string; surface: string; border: string; text: string; sub: string; }

const REFERRAL_LIMIT = 30;
const POINTS_PER_REFERRAL = 500;

interface Props {
    profile: ProfileData;
    referralCount: number;
    onLogout: () => void;
    t: ThemeColors;
    onEditProfile?: () => void;
}

export function RightPanel({ profile, referralCount, onLogout, t, onEditProfile }: Props) {
    const roleColor = ROLE_COLOR[profile.role] ?? "#a78bfa";
    const maxPoints = REFERRAL_LIMIT * POINTS_PER_REFERRAL;
    const ptPct = Math.min((profile.points / maxPoints) * 100, 100);

    const MISSIONS = [
        { label: "先行登録完了", done: true },
        { label: "メール認証完了", done: profile.verified },
        { label: "友人を1人招待", done: referralCount >= 1 },
        { label: "3人招待する", done: referralCount >= 3 },
        { label: "プロフィール編集", done: !!(profile.bio || profile.sport || profile.region) },
    ];

    const allDone = MISSIONS.every(m => m.done);
    const [bonusGiven, setBonusGiven] = useState(false);

    useEffect(() => {
        if (allDone && !bonusGiven) {
            setBonusGiven(true);
            fetch("/api/missions/complete", { method: "POST" });
        }
    }, [allDone, bonusGiven]);

    const card = (children: React.ReactNode, delay = 0) => (
        <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
            style={{ borderRadius: "14px", padding: "16px", background: t.surface, border: `1px solid ${t.border}`, marginBottom: "12px" }}
        >
            {children}
        </motion.div>
    );

    const sLabel = (text: string) => (
        <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: t.sub, margin: "0 0 12px", opacity: 0.55 }}>{text}</p>
    );

    return (
        <div style={{ padding: "16px 12px" }}>

            {/* Points */}
            {card(<>
                {sLabel("Points")}
                <p style={{ fontSize: "26px", fontWeight: 900, color: roleColor, margin: "0 0 3px", lineHeight: 1 }}>
                    {profile.points.toLocaleString()}
                    <span style={{ fontSize: "11px", fontWeight: 400, color: t.sub, marginLeft: "5px" }}>pt</span>
                </p>
                <p style={{ fontSize: "10px", color: t.sub, margin: "0 0 10px", opacity: 0.6 }}>最大 {maxPoints.toLocaleString()}pt</p>
                <div style={{ height: "4px", borderRadius: "99px", background: `rgba(255,255,255,0.07)`, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: "99px", width: `${ptPct}%`, background: roleColor, transition: "width 1s" }} />
                </div>
            </>, 0.1)}

            {/* Missions */}
            {card(<>
                {sLabel("Missions")}
                {MISSIONS.map(({ label, done }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "8px" }}>
                        <div style={{ width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0, background: done ? `${roleColor}20` : `rgba(255,255,255,0.05)`, border: `1.5px solid ${done ? roleColor : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {done && <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke={roleColor} strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span style={{ fontSize: "11px", color: done ? t.sub : t.text, opacity: done ? 0.5 : 1, textDecoration: done ? "line-through" : "none" }}>{label}</span>
                    </div>
                ))}
            </>, 0.18)}

            {/* Account */}
            {card(<>
                {sLabel("Account")}
                {[
                    { k: "表示名", v: profile.displayName },
                    { k: "ID", v: `@${profile.slug}`, mono: true },
                    { k: "Role", v: ROLE_LABEL[profile.role], color: roleColor },
                    { k: "Mail", v: profile.email },
                    { k: "登録日", v: new Date(profile.createdAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }) },
                ].map(({ k, v, mono, color }) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
                        <span style={{ fontSize: "10px", color: t.sub, opacity: 0.6 }}>{k}</span>
                        <span style={{ fontSize: "10px", fontFamily: mono ? "monospace" : "inherit", color: color ?? t.text, maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{v}</span>
                    </div>
                ))}
            </>, 0.26)}

        </div>
    );
}