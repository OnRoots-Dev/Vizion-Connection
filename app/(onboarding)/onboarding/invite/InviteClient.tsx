"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { OnboardingStepBar } from "../OnboardingStepBar";
import { OnboardingPageTransition } from "../OnboardingPageTransition";
import { LottieAnim } from "@/components/ui/LottieAnim";
import { springDefault } from "@/lib/motion/apple-springs";

const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z";

export default function InviteClient({ slug, referralUrl }: { slug: string; referralUrl: string }) {
    const [copied, setCopied] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        fetch("/api/onboarding/complete", { method: "POST", credentials: "include" })
            .then(async (r) => {
                const json = (await r.json().catch(() => ({}))) as { success?: boolean };
                if (r.ok && json.success) setCompleted(true);
            })
            .catch(() => { });
    }, []);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(referralUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // ignore
        }
    }

    async function ensureOnboardingComplete() {
        const res = await fetch("/api/onboarding/complete", {
            method: "POST",
            credentials: "include",
            keepalive: true,
        });
        const json = (await res.json().catch(() => ({}))) as { success?: boolean };
        if (res.ok && json.success) {
            setCompleted(true);
            return true;
        }
        return false;
    }

    async function handleGoDashboard() {
        if (completing) return;
        setCompleting(true);
        try {
            if (!completed) {
                await ensureOnboardingComplete();
            }
            // welcome=1 でdashboard側の初回ウェルカム演出を起動する
            window.location.assign("/dashboard?welcome=1");
        } finally {
            setCompleting(false);
        }
    }

    const tweetText = encodeURIComponent(
        `Vizion Connectionに参加しました。あなたも登録してみてください。`
    );
    const tweetUrl = encodeURIComponent(referralUrl);
    const tweetHref = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}&hashtags=VizionConnection`;

    return (
        <OnboardingPageTransition stepKey="invite">
        <div
            style={{ minHeight: "100vh", background: "var(--surface-1)", paddingBottom: 40 }}
        >
            <div style={{ padding: "16px 24px 0" }}>
                <OnboardingStepBar current={4} />
            </div>

            <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px 0", textAlign: "center" }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={springDefault}
                >
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                        <LottieAnim src="/lottie/success-check.json" className="h-24 w-24" />
                    </div>
                    <p style={{ margin: "0 0 8px", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--electric)", opacity: 0.8 }}>
                        ONBOARDING COMPLETE
                    </p>
                    <h1 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 900, color: "var(--foreground)", lineHeight: 1.3 }}>
                        仲間のPulseを呼ぼう
                    </h1>
                    <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.9 }}>
                        あなたの紹介で参加した人には<br />
                        初期メンバー特典が付与されます
                    </p>
                    <a
                        href="/dashboard?view=roadmap"
                        style={{
                            display: "inline-block",
                            marginBottom: 28,
                            padding: "8px 20px",
                            borderRadius: 20,
                            border: "1px solid var(--border)",
                            background: "transparent",
                            color: "var(--muted-foreground)",
                            fontSize: 12,
                            fontWeight: 700,
                            textDecoration: "none",
                            transition: "all 0.2s ease",
                        }}
                    >
                        RoadMapを見る →
                    </a>
                    <p style={{ margin: "0 0 32px", fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.9 }}>
                        Vizion Connectionを一緒に広げましょう。<br />
                        あなたの招待リンクをシェアしてください。
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                    <div style={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface-3)", padding: "12px 16px" }}>
                        <p style={{ margin: "0 0 8px", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--electric)" }}>
                            あなたの招待リンク
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <p style={{ margin: 0, flex: 1, fontSize: 12, color: "var(--foreground)", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {referralUrl}
                            </p>
                            <button
                                type="button"
                                onClick={() => void handleCopy()}
                                style={{
                                    flexShrink: 0, padding: "7px 12px", borderRadius: 10,
                                    border: "1px solid var(--border)", background: copied ? "var(--electric)" : "transparent",
                                    color: copied ? "#0a0a0a" : "var(--electric)",
                                    fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease",
                                }}
                            >
                                {copied ? "コピーしました ✓" : "リンクをコピー"}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <a
                            href={tweetHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                padding: "12px 16px", borderRadius: 14,
                                border: "1px solid var(--border)", background: "transparent",
                                color: "var(--foreground)", textDecoration: "none", fontSize: 12, fontWeight: 700,
                                transition: "all 0.2s ease",
                            }}
                        >
                            <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor"><path d={X_PATH} /></svg>
                            Xでシェア
                        </a>
                        <button
                            type="button"
                            onClick={() => void handleCopy()}
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                padding: "12px 16px", borderRadius: 14,
                                border: "1px solid var(--border)", background: "transparent",
                                color: "var(--foreground)", fontSize: 12, fontWeight: 700, cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {copied ? "コピーしました ✓" : "リンクをコピー"}
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => void handleGoDashboard()}
                        disabled={completing}
                        style={{
                            width: "100%", padding: "14px 20px", borderRadius: 14, border: "none",
                            background: "var(--electric)", color: "#0a0a0a",
                            fontSize: 14, fontWeight: 900, cursor: completing ? "wait" : "pointer",
                            opacity: completing ? 0.75 : 1,
                            boxShadow: "0 0 24px rgba(0,194,255,0.35)",
                            marginTop: 4, transition: "all 0.2s ease",
                        }}
                    >
                        {completing ? "処理中..." : "後にする"}
                    </button>
                </motion.div>

                {!completed && (
                    <p style={{ marginTop: 12, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                        オンボーディングを完了中…
                    </p>
                )}
            </div>
        </div>
        </OnboardingPageTransition>
    );
}
