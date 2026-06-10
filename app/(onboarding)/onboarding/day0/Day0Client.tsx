"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { ProfileData } from "@/features/profile/types";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import { OnboardingStepBar } from "../OnboardingStepBar";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Crew: "#FFC81E", Business: "#3C8CFF", Admin: "var(--electric)",
};

const DARK_THEME = {
    bg: "var(--surface-1)", surface: "var(--surface-2)", border: "var(--border)",
    text: "var(--foreground)", sub: "var(--muted-foreground)",
};

export default function Day0Client({ profile }: { profile: ProfileData }) {
    const router = useRouter();
    const roleColor = ROLE_COLOR[profile.role] ?? "var(--electric)";
    const [reason, setReason] = useState("");
    const [isPressing, setIsPressing] = useState(false);

    function handleStartJourney() {
        setIsPressing(true);
        window.setTimeout(() => router.push("/onboarding/journey"), 200);
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ minHeight: "100vh", background: "var(--surface-1)", paddingBottom: 40 }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px 0" }}>
                <OnboardingStepBar current={2} />
                <button
                    type="button"
                    onClick={() => window.location.assign("/dashboard")}
                    style={{ background: "none", border: "none", color: "var(--muted-foreground)", fontSize: 12, cursor: "pointer", padding: "4px 8px", whiteSpace: "nowrap", flexShrink: 0 }}
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
                    <p style={{ margin: "0 0 8px", fontSize: "4rem", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--electric)", lineHeight: 1, textShadow: "0 0 24px rgba(0,194,255,0.45)" }}>
                        DAY 0
                    </p>
                    <h1 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 900, color: "var(--foreground)", lineHeight: 1.3 }}>
                        挑戦の原点を刻む
                    </h1>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.7 }}>
                        あなたがこの挑戦を始めた理由を<br />一言で残してください
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
                    <textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="私は___を目指して、今日から始める。"
                        rows={3}
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            margin: "0 0 20px",
                            padding: "12px 16px",
                            borderRadius: 14,
                            border: "1px solid var(--border)",
                            background: "var(--surface-2)",
                            color: "var(--foreground)",
                            fontSize: 13,
                            lineHeight: 1.7,
                            resize: "none",
                            outline: "none",
                        }}
                    />
                    <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.7, fontWeight: 700 }}>
                        最初のJourneyへ進みましょう。
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, margin: "0 auto" }}>
                        <motion.button
                            type="button"
                            animate={{ scale: isPressing ? 1.05 : 1 }}
                            transition={{ duration: 0.2 }}
                            onClick={handleStartJourney}
                            style={{
                                width: "100%", padding: "14px 20px",
                                borderRadius: 14, border: "none",
                                background: "var(--electric)", color: "#0a0a0a",
                                fontSize: 14, fontWeight: 900, cursor: "pointer",
                                boxShadow: "0 0 24px rgba(0,194,255,0.35)",
                                transition: "all 0.2s ease",
                            }}
                        >
                            DAY 0 を刻む
                        </motion.button>
                        <button
                            type="button"
                            onClick={() => window.location.assign("/dashboard")}
                            style={{
                                width: "100%", padding: "12px 20px",
                                borderRadius: 14, border: "1px solid var(--border)",
                                background: "transparent", color: "var(--muted-foreground)",
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
