"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { ProfileData } from "@/features/profile/types";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import { OnboardingStepBar } from "../OnboardingStepBar";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Crew: "#FFC81E", Business: "#3C8CFF", Admin: "#a78bfa",
};

const DARK_THEME = {
    bg: "#0B0B0F", surface: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)",
    text: "#F0F0F5", sub: "rgba(255,255,255,0.45)",
};

export default function Day0Client({ profile }: { profile: ProfileData }) {
    const router = useRouter();
    const roleColor = ROLE_COLOR[profile.role] ?? "#a78bfa";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ minHeight: "100vh", background: "#0B0B0F", paddingBottom: 40 }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px 0" }}>
                <OnboardingStepBar current={2} />
                <button
                    type="button"
                    onClick={() => window.location.assign("/dashboard")}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer", padding: "4px 8px", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                    後にする
                </button>
            </div>

            <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 0" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{ textAlign: "center", marginBottom: 32 }}
                >
                    <p style={{ margin: "0 0 8px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.3em", textTransform: "uppercase", color: roleColor, opacity: 0.8 }}>
                        DAY 0
                    </p>
                    <h1 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>
                        プロフィールカードを発行しました！
                    </h1>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                        これがあなたのVizionプロフィールカードです。<br />あなたの存在が、ここに刻まれました。
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <ProfileCardSection
                        profile={profile}
                        t={DARK_THEME}
                        roleColor={roleColor}
                        introAnimation
                        mode="full"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    style={{ marginTop: 32, textAlign: "center" }}
                >
                    <p style={{ margin: "0 0 20px", fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, fontWeight: 700 }}>
                        あなたの今日のJourneyを記録しましょう。
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, margin: "0 auto" }}>
                        <button
                            type="button"
                            onClick={() => router.push("/onboarding/journey")}
                            style={{
                                width: "100%", padding: "14px 20px",
                                borderRadius: 14, border: "none",
                                background: roleColor, color: "#050508",
                                fontSize: 14, fontWeight: 900, cursor: "pointer",
                                boxShadow: `0 0 20px ${roleColor}44`,
                                transition: "all 0.2s ease",
                            }}
                        >
                            Journeyを記録する
                        </button>
                        <button
                            type="button"
                            onClick={() => window.location.assign("/dashboard")}
                            style={{
                                width: "100%", padding: "12px 20px",
                                borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)",
                                background: "transparent", color: "rgba(255,255,255,0.4)",
                                fontSize: 13, fontWeight: 600, cursor: "pointer",
                            }}
                        >
                            後にする
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
