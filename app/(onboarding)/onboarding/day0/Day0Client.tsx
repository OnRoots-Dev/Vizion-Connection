"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { ProfileData } from "@/features/profile/types";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import { OnboardingStepBar } from "../OnboardingStepBar";
import { OnboardingPageTransition } from "../OnboardingPageTransition";
import { LottieAnim } from "@/components/ui/LottieAnim";
import { springDefault } from "@/lib/motion/apple-springs";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#30de1d", Crew: "#FFC81E", Business: "#3C8CFF", Admin: "var(--electric)",
};

const DARK_THEME = {
    bg: "var(--surface-1)", surface: "var(--surface-2)", border: "var(--border)",
    text: "var(--foreground)", sub: "var(--muted-foreground)",
};

export default function Day0Client({ profile }: { profile: ProfileData }) {
    const router = useRouter();
    const roleColor = ROLE_COLOR[profile.role] ?? "var(--electric)";
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showBurst, setShowBurst] = useState(false);
    const [error, setError] = useState("");

    async function handleStartJourney() {
        if (submitting || showBurst) return;
        setSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/onboarding/day0", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ declaration: reason.trim() || undefined }),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.error ?? "保存に失敗しました");
                return;
            }
            // カウントダウン→脈動バーストの演出後にJourneyへ
            setShowBurst(true);
            setTimeout(() => router.push("/onboarding/journey"), 2100);
        } catch {
            setError("通信エラーが発生しました");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <OnboardingPageTransition stepKey="day0">
        <div
            style={{ minHeight: "100vh", background: "var(--surface-1)", paddingBottom: 40 }}
        >
            <AnimatePresence>
                {showBurst && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "fixed", inset: 0, zIndex: 9999,
                            background: "rgba(5,5,8,0.92)", backdropFilter: "blur(8px)",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
                        }}
                    >
                        <LottieAnim src="/lottie/day0-burst.json" className="h-52 w-52" />
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                            style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "var(--foreground)", letterSpacing: "0.04em" }}
                        >
                            DAY 0 を刻みました
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

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
                    <p style={{ margin: "0 0 8px", fontSize: "4rem", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--electric)", lineHeight: 1, textShadow: "0 0 24px var(--electric-glow)" }}>
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
                        onChange={(event) => setReason(event.target.value.slice(0, 200))}
                        placeholder="私は___を目指して、今日から始める。"
                        rows={3}
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            margin: "0 0 6px",
                            padding: "12px 16px",
                            borderRadius: 14,
                            border: "1px solid var(--border)",
                            background: "var(--surface-2)",
                            color: "var(--foreground)",
                            caretColor: "var(--electric)",
                            fontSize: 13,
                            lineHeight: 1.7,
                            resize: "none",
                            outline: "none",
                        }}
                    />
                    <p style={{ margin: "0 0 14px", fontSize: 10, color: "var(--muted-foreground)", textAlign: "right" }}>
                        {reason.length} / 200
                    </p>

                    {error && (
                        <div style={{
                            margin: "0 0 16px", padding: "12px 16px", borderRadius: 12, textAlign: "left",
                            border: "1px solid rgba(255,107,0,0.35)", background: "rgba(255,107,0,0.08)",
                            color: "var(--flame)", fontSize: 13, fontWeight: 500,
                        }}>
                            {error}
                        </div>
                    )}

                    <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.7, fontWeight: 700 }}>
                        この宣言が、DAYカウントの原点になります。
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, margin: "0 auto" }}>
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={() => void handleStartJourney()}
                            style={{
                                width: "100%", padding: "14px 20px",
                                borderRadius: 14, border: "none",
                                background: "var(--electric)", color: "#000",
                                fontSize: 14, fontWeight: 900, cursor: submitting ? "wait" : "pointer",
                                boxShadow: "0 0 24px var(--electric-glow)",
                                opacity: submitting ? 0.7 : 1,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                transition: "all 0.2s ease",
                            }}
                        >
                            {submitting && <LottieAnim src="/lottie/loading-pulse.json" loop className="h-5 w-5" />}
                            {submitting ? "刻んでいます..." : "DAY 0 を刻む"}
                        </button>
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
        </div>
        </OnboardingPageTransition>
    );
}
