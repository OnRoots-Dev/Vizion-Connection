"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ConditionScorePicker } from "@/components/DailyLog/ConditionScorePicker";
import { JOURNEY_MAX_CHARS } from "@/components/DailyLog/journey";
import { OnboardingStepBar } from "../OnboardingStepBar";
import { LottieAnim } from "@/components/ui/LottieAnim";

const T = {
    bg: "var(--surface-1)", surface: "var(--surface-2)", border: "var(--border)",
    text: "var(--foreground)", sub: "var(--muted-foreground)",
};

export default function JourneyOnboardingClient({ role, roleColor }: { role: string; roleColor: string }) {
    const router = useRouter();
    const [content, setContent] = useState("");
    const [conditionScore, setConditionScore] = useState<number | null>(null);
    const [done, setDone] = useState(false);
    const [isRouting, setIsRouting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit = content.trim().length >= 10 && conditionScore !== null && !isSubmitting && !isRouting;

    async function handleSubmit() {
        if (!canSubmit) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/journey", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content.trim(),
                    condition_score: conditionScore ?? undefined,
                }),
            });

            if (res.status === 409) {
                router.push("/onboarding/invite");
                return;
            }

            if (!res.ok) {
                const data = await res.json() as { error?: string };
                setError(data.error ?? "投稿に失敗しました");
                return;
            }

            setDone(true);
            setIsRouting(true);
            // パルスLottieを見せてから次のステップへ
            setTimeout(() => router.push("/onboarding/invite"), 1400);

        } catch {
            setError("通信エラーが発生しました");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ minHeight: "100vh", background: "var(--surface-1)", paddingBottom: 40 }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px 0" }}>
                <OnboardingStepBar current={3} />
                <button
                    type="button"
                    onClick={() => router.push("/onboarding/invite")}
                    style={{ background: "none", border: "none", color: "var(--muted-foreground)", fontSize: 12, cursor: "pointer", padding: "4px 8px", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                    後にする
                </button>
            </div>

            <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 0" }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ marginBottom: 24, textAlign: "center" }}
                >
                    <p style={{ margin: "0 0 8px", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--electric)", opacity: 0.8 }}>
                        JOURNEY · {role.toUpperCase()}
                    </p>
                    <h1 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 900, color: "var(--foreground)", lineHeight: 1.3 }}>
                        最初のJourneyを刻もう
                    </h1>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.7 }}>
                        今日、何をしましたか？<br />どんな小さなことでも、Pulseになる。
                    </p>
                </motion.div>

                {done ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: "center", padding: "32px 20px", borderRadius: 24, border: "1px solid var(--border)", background: "var(--surface-2)", boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}
                    >
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                            <LottieAnim src="/lottie/pulse-line.json" className="h-20 w-52" />
                        </div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--foreground)" }}>Pulseを刻みました</p>
                        <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--muted-foreground)" }}>次のステップへ移動中…</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px", borderRadius: 24, border: "1px solid var(--border)", background: "var(--surface-2)", boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}
                    >
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value.slice(0, JOURNEY_MAX_CHARS))}
                            placeholder="今日の活動・感情・気づきを書いてください"
                            rows={5}
                            style={{
                                width: "100%", boxSizing: "border-box", borderRadius: 14,
                                border: "1px solid var(--border)", background: "var(--surface-3)",
                                color: T.text, caretColor: "var(--electric)",
                                padding: "12px 14px", fontSize: 13, lineHeight: 1.7,
                                resize: "none", outline: "none", fontFamily: "inherit",
                            }}
                        />
                        <p style={{ margin: 0, fontSize: 10, color: "var(--muted-foreground)", textAlign: "right" }}>
                            {content.length} / {JOURNEY_MAX_CHARS}
                        </p>

                        {error && (
                            <p style={{ margin: 0, fontSize: 13, color: "var(--destructive)" }}>{error}</p>
                        )}

                        <div>
                            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: T.sub }}>今日のコンディション</p>
                            <ConditionScorePicker
                                value={conditionScore}
                                onChange={setConditionScore}
                                t={{ bg: T.bg, surface: T.surface, border: T.border, text: T.text, sub: T.sub }}
                                roleColor={roleColor}
                                compact
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => void handleSubmit()}
                            disabled={!canSubmit}
                            style={{
                                width: "100%", padding: "13px 0", borderRadius: 14, border: "none",
                                background: canSubmit || isSubmitting ? "var(--electric)" : "var(--surface-3)",
                                color: canSubmit || isSubmitting ? "#000" : "var(--muted-foreground)",
                                fontSize: 13, fontWeight: 800,
                                cursor: canSubmit ? "pointer" : "not-allowed",
                                transition: "all 0.2s ease",
                                boxShadow: canSubmit ? "0 0 24px rgba(200,232,0,0.35)" : "none",
                                opacity: isSubmitting ? 0.7 : 1,
                            }}
                        >
                            {isSubmitting || isRouting ? "Pulseを刻んでいます..." : "Journeyを刻む"}
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
