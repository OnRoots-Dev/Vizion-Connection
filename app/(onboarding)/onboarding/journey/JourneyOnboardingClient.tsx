"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDailyLogStore } from "@/hooks/useDailyLogStore";
import { ConditionScorePicker } from "@/components/DailyLog/ConditionScorePicker";
import { JOURNEY_MAX_CHARS } from "@/components/DailyLog/journey";
import { OnboardingStepBar } from "../OnboardingStepBar";

const T = {
    bg: "#0B0B0F", surface: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)",
    text: "#F0F0F5", sub: "rgba(255,255,255,0.45)",
};

export default function JourneyOnboardingClient({ role, roleColor }: { role: string; roleColor: string }) {
    const router = useRouter();
    const { isSubmitting, submitLog } = useDailyLogStore();
    const [content, setContent] = useState("");
    const [conditionScore, setConditionScore] = useState<number | null>(null);
    const [done, setDone] = useState(false);

    const canSubmit = content.trim().length >= 10 && conditionScore !== null && !isSubmitting;

    async function handleSubmit() {
        if (!canSubmit) return;
        const ok = await submitLog({ content: content.trim(), conditionScore: conditionScore! });
        if (ok) {
            setDone(true);
            setTimeout(() => router.push("/onboarding/cheer"), 1200);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ minHeight: "100vh", background: "#0B0B0F", paddingBottom: 40 }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px 0" }}>
                <OnboardingStepBar current={3} />
                <button
                    type="button"
                    onClick={() => router.push("/onboarding/cheer")}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer", padding: "4px 8px", whiteSpace: "nowrap", flexShrink: 0 }}
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
                    <p style={{ margin: "0 0 8px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.3em", textTransform: "uppercase", color: roleColor, opacity: 0.8 }}>
                        JOURNEY · {role.toUpperCase()}
                    </p>
                    <h1 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>
                        今日の記録を残しましょう。
                    </h1>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                        毎日の積み上げが、あなたのポートフォリオになります。
                    </p>
                </motion.div>

                {done ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: "center", padding: "32px 20px", borderRadius: 20, border: `1px solid ${roleColor}30`, background: `${roleColor}10` }}
                    >
                        <p style={{ margin: "0 0 8px", fontSize: 28 }}>✦</p>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#fff" }}>記録が完了しました。</p>
                        <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>次のステップへ移動中…</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px", borderRadius: 20, border: `1px solid ${T.border}`, background: T.surface }}
                    >
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value.slice(0, JOURNEY_MAX_CHARS))}
                            placeholder="今日の練習・活動・気づきを書いてみましょう（10文字以上）"
                            rows={5}
                            style={{
                                width: "100%", boxSizing: "border-box", borderRadius: 14,
                                border: `1px solid ${T.border}`, background: "rgba(255,255,255,0.03)",
                                color: T.text, padding: "12px 14px", fontSize: 13, lineHeight: 1.7,
                                resize: "none", outline: "none", fontFamily: "inherit",
                            }}
                        />
                        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "right" }}>
                            {content.length} / {JOURNEY_MAX_CHARS}
                        </p>

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
                                background: canSubmit ? roleColor : "rgba(255,255,255,0.08)",
                                color: canSubmit ? "#050508" : "rgba(255,255,255,0.35)",
                                fontSize: 13, fontWeight: 800,
                                cursor: canSubmit ? "pointer" : "not-allowed",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {isSubmitting ? "記録中..." : "Journeyを記録する"}
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
