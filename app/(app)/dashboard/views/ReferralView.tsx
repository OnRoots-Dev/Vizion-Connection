"use client";

// dashboard/views/ReferralView.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";

const REFERRAL_LIMIT = 30;
const POINTS_PER_REFERRAL = 500;

export function ReferralView({ referralUrl, referralCount, t, roleColor, setView }: {
    profile: ProfileData; referralUrl: string; referralCount: number;
    t: ThemeColors; roleColor: string; setView: (v: DashboardView) => void;
}) {
    const progress = Math.min((referralCount / REFERRAL_LIMIT) * 100, 100);
    const [copied, setCopied] = useState(false);
    const [clicks, setClicks] = useState<number | null>(null);
    const [igHint, setIgHint] = useState(false);

    useEffect(() => {
        let active = true;
        fetch("/api/referral/clicks", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => { if (active) setClicks(Number(d?.clicks) || 0); })
            .catch(() => { if (active) setClicks(0); });
        return () => { active = false; };
    }, []);

    const shareText = `Vizion Connectionに登録しました\n#VizionConnection\n${referralUrl}`;
    const shareXUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    const shareLineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(referralUrl)}`;

    async function copyToClipboard(text: string): Promise<boolean> {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch {
            // フォールバックへ
        }
        try {
            const el = document.createElement("textarea");
            el.value = text;
            el.style.position = "fixed";
            el.style.opacity = "0";
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            return true;
        } catch {
            return false;
        }
    }

    async function handleInstagramShare() {
        const ok = await copyToClipboard(referralUrl);
        void markShared();
        // モバイルではネイティブ共有シート（Instagram を選択可能）を優先
        if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
            try {
                await navigator.share({ text: shareText, url: referralUrl });
                return;
            } catch {
                // キャンセル・非対応時は Instagram を開くフォールバックへ
            }
        }
        // フォールバック: Instagram を開き、コピー済みリンクを貼り付けてもらう
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
        if (ok) {
            setIgHint(true);
            setTimeout(() => setIgHint(false), 4000);
        }
    }

    async function handleCopy() {
        await copyToClipboard(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        try {
            await fetch("/api/member-hub/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventType: "referral_link_copied", label: "Referral画面で紹介リンクをコピー" }),
            });
        } catch {
            // noop
        }
    }

    async function markShared() {
        try {
            await fetch("/api/share/complete", { method: "POST" });
            await fetch("/api/member-hub/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventType: "referral_link_shared", label: "Referral画面で紹介リンクを共有" }),
            });
        } catch {
            // noop
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Referral" sub="招待で特典ゲット" onBack={() => setView("home")} t={t} roleColor={roleColor} />

            <SectionCard accentColor="#FFD600" t={t}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                            <span className="font-display" style={{ fontSize: 64, color: "#FFD600", lineHeight: 1, letterSpacing: "-0.02em" }}>{referralCount}</span>
                            <span style={{ fontSize: 14, color: t.sub }}>/ {REFERRAL_LIMIT} 人</span>
                        </div>
                        <p style={{ fontSize: 11, color: t.sub, margin: "4px 0 0", opacity: 0.55 }}>招待済みメンバー</p>
                        <p style={{ fontSize: 11, color: t.sub, margin: "6px 0 0" }}>
                            リンク訪問数 <span style={{ color: t.text, fontWeight: 800 }}>{clicks === null ? "…" : clicks.toLocaleString()}</span>
                        </p>
                    </div>
                    <div style={{ textAlign: "right", paddingBottom: 6 }}>
                        <p style={{ fontSize: 8, fontFamily: "monospace", color: t.sub, opacity: 0.4, margin: "0 0 2px" }}>獲得ポイント</p>
                        <span className="font-display" style={{ fontSize: 28, color: "#FFD600" }}>+{(referralCount * POINTS_PER_REFERRAL).toLocaleString()}</span>
                        <span style={{ fontSize: 11, color: t.sub }}>pt</span>
                    </div>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: t.border, overflow: "hidden", marginBottom: 6 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#FFD600,#FFD60066)", boxShadow: "0 0 10px rgba(255,214,0,0.4)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,214,0,0.4)", letterSpacing: "0.08em" }}>0人</span>
                    <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,214,0,0.4)", letterSpacing: "0.08em" }}>{REFERRAL_LIMIT}人上限</span>
                </div>
            </SectionCard>

            <SectionCard t={t}>
                <SLabel text="招待リンク" />
                <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: t.sub, opacity: 0.75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{referralUrl}</span>
                    <button
                        onClick={handleCopy}
                        className="vz-btn"
                        style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: 12,
                            background: copied ? "rgba(200,232,0,0.85)" : "#C8E800",
                            border: "1px solid rgba(200,232,0,0.55)",
                            color: "#000",
                            fontSize: 12,
                            fontWeight: 900,
                            cursor: "pointer",
                            boxShadow: "0 0 20px rgba(200,232,0,0.25)",
                        }}
                    >
                        {copied ? "✓ リンクをコピーしました" : "リンクをコピー"}
                    </button>
                </div>
                <p style={{ fontSize: 10, color: t.sub, opacity: 0.4, margin: 0, fontFamily: "monospace" }}>1人招待ごとに {POINTS_PER_REFERRAL}pt 付与 · 上限 {REFERRAL_LIMIT}人</p>
            </SectionCard>

            <SectionCard t={t}>
                <SLabel text="SNSでシェアする" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* Instagram */}
                    <button type="button" onClick={() => { void handleInstagramShare(); }}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, background: "rgba(225,48,108,0.07)", border: "1px solid rgba(225,48,108,0.28)", textDecoration: "none", color: t.text, cursor: "pointer", textAlign: "left", width: "100%" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg viewBox="0 0 24 24" width={16} height={16} fill="#fff"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm8.25 2h-8a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-8a4 4 0 0 0-4-4zm-4 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zm4.75-2.38a1.12 1.12 0 1 1-1.12 1.12 1.12 1.12 0 0 1 1.12-1.12z" /></svg>
                        </div>
                        <div style={{ minWidth: 0 }}><p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Instagram</p><p style={{ fontSize: 10, color: t.sub, margin: "1px 0 0", opacity: 0.55 }}>{igHint ? "リンクをコピーしました。ストーリーやプロフィールに貼り付けてください" : "ストーリーでシェアする"}</p></div>
                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth={2} style={{ marginLeft: "auto", flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                    {/* X */}
                    <a href={shareXUrl} target="_blank" rel="noopener noreferrer" onClick={() => { void markShared(); }}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, background: "rgba(0,0,0,0.55)", border: `1px solid ${t.border}`, textDecoration: "none", color: t.text }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#000", border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg viewBox="0 0 24 24" width={16} height={16} fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </div>
                        <div><p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>X (Twitter)</p><p style={{ fontSize: 10, color: t.sub, margin: "1px 0 0", opacity: 0.55 }}>ツイートして招待する</p></div>
                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth={2} style={{ marginLeft: "auto" }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </a>
                    {/* LINE */}
                    <a href={shareLineUrl} target="_blank" rel="noopener noreferrer" onClick={() => { void markShared(); }}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, background: "rgba(6,199,85,0.07)", border: "1px solid rgba(6,199,85,0.22)", textDecoration: "none", color: t.text }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#06C755", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg viewBox="0 0 24 24" width={16} height={16} fill="#fff"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
                        </div>
                        <div><p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>LINE</p><p style={{ fontSize: 10, color: t.sub, margin: "1px 0 0", opacity: 0.55 }}>友達にシェアする</p></div>
                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth={2} style={{ marginLeft: "auto" }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </a>
                </div>
            </SectionCard>
        </div>
    );
}
