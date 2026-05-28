"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { OnboardingStepBar } from "../OnboardingStepBar";

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
            window.location.assign("/dashboard");
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ minHeight: "100vh", background: "#0B0B0F", paddingBottom: 40 }}
        >
            <div style={{ padding: "16px 24px 0" }}>
                <OnboardingStepBar current={5} />
            </div>

            <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px 0", textAlign: "center" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    <p style={{ margin: "0 0 8px", fontSize: 32 }}>🎉</p>
                    <p style={{ margin: "0 0 8px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.3em", textTransform: "uppercase", color: "#a78bfa", opacity: 0.8 }}>
                        ONBOARDING COMPLETE
                    </p>
                    <h1 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>
                        今日からよろしくお願いします！
                    </h1>
                    <p style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.9 }}>
                        Vizion Connectionは、まだ始まったばかりです。<br />
                        これからの進化に期待してください！
                    </p>
                    <a
                        href="/roadmap"
                        style={{
                            display: "inline-block",
                            marginBottom: 28,
                            padding: "8px 20px",
                            borderRadius: 20,
                            border: "1px solid rgba(167,139,250,0.35)",
                            background: "rgba(167,139,250,0.1)",
                            color: "#c4b5fd",
                            fontSize: 12,
                            fontWeight: 700,
                            textDecoration: "none",
                            transition: "all 0.2s ease",
                        }}
                    >
                        RoadMapを見る →
                    </a>
                    <p style={{ margin: "0 0 32px", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.9 }}>
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
                    <div style={{ borderRadius: 16, border: "1px solid rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.06)", padding: "14px 16px" }}>
                        <p style={{ margin: "0 0 8px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(167,139,250,0.7)" }}>
                            招待URL
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <p style={{ margin: 0, flex: 1, fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {referralUrl}
                            </p>
                            <button
                                type="button"
                                onClick={() => void handleCopy()}
                                style={{
                                    flexShrink: 0, padding: "7px 12px", borderRadius: 10,
                                    border: "1px solid rgba(167,139,250,0.3)", background: copied ? "rgba(167,139,250,0.25)" : "rgba(167,139,250,0.1)",
                                    color: copied ? "#c4b5fd" : "rgba(167,139,250,0.8)",
                                    fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease",
                                }}
                            >
                                {copied ? "コピー済み ✓" : "コピー"}
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
                                border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)",
                                color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700,
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
                                border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)",
                                color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {copied ? "コピー済み ✓" : "URLをコピー"}
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => void handleGoDashboard()}
                        disabled={completing}
                        style={{
                            width: "100%", padding: "14px 20px", borderRadius: 14, border: "none",
                            background: "#a78bfa", color: "#050508",
                            fontSize: 14, fontWeight: 900, cursor: completing ? "wait" : "pointer",
                            opacity: completing ? 0.75 : 1,
                            boxShadow: "0 0 24px rgba(167,139,250,0.35)",
                            marginTop: 4, transition: "all 0.2s ease",
                        }}
                    >
                        {completing ? "処理中..." : "ダッシュボードへ →"}
                    </button>
                </motion.div>

                {!completed && (
                    <p style={{ marginTop: 12, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                        オンボーディングを完了中…
                    </p>
                )}
            </div>
        </motion.div>
    );
}
