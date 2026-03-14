"use client";

import { useState } from "react";

interface Props {
    profileUrl: string;
    referralUrl: string;
    displayName: string;
    roleColor: string;
}

type CopiedKey = "profile" | "referral" | null;

export default function ShareButtonClient({ profileUrl, referralUrl, displayName, roleColor }: Props) {
    const [copied, setCopied] = useState<CopiedKey>(null);

    async function handleCopy(key: CopiedKey, text: string) {
        try { await navigator.clipboard.writeText(text); }
        catch {
            const el = document.createElement("textarea");
            el.value = text;
            document.body.appendChild(el); el.select();
            document.execCommand("copy"); document.body.removeChild(el);
        }
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    }

    async function handleNativeShare() {
        if (typeof navigator.share !== "undefined") {
            try {
                await navigator.share({
                    title: `${displayName} | Vizion Connection`,
                    text: `${displayName} さんがVizion Connectionに参加中！\nスポーツの新しいつながりを、ここから。`,
                    url: profileUrl,
                });
                await fetch("/api/share/complete", { method: "POST" });
            } catch { /* キャンセル無視 */ }
        } else {
            handleCopy("profile", profileUrl);
            await fetch("/api/share/complete", { method: "POST" });
        }
    }

    const rowStyle = {
        display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px",
    };
    const urlBoxStyle = {
        flex: 1, padding: "9px 12px", borderRadius: "9px",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
    };

    return (
        <div>
            {/* Profile URL */}
            <div style={rowStyle}>
                <div style={urlBoxStyle}>
                    <p style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
                        {profileUrl}
                    </p>
                </div>
                <button onClick={() => handleCopy("profile", profileUrl)}
                    style={{
                        flexShrink: 0, padding: "9px 14px", borderRadius: "9px",
                        border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700,
                        transition: "all 0.2s",
                        ...(copied === "profile"
                            ? { background: "rgba(50,210,120,0.1)", color: "#32D278", outline: "1px solid rgba(50,210,120,0.25)" }
                            : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }),
                    }}>
                    {copied === "profile" ? "✓" : "コピー"}
                </button>
            </div>

            {/* Referral URL */}
            <div style={rowStyle}>
                <div style={{ ...urlBoxStyle, background: `${roleColor}06`, border: `1px solid ${roleColor}20` }}>
                    <p style={{ fontSize: "11px", fontFamily: "monospace", color: `${roleColor}80`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
                        {referralUrl}
                    </p>
                </div>
                <button onClick={() => handleCopy("referral", `${displayName} さんの紹介でVizion Connectionに先行登録できます！\n${referralUrl}`)}
                    style={{
                        flexShrink: 0, padding: "9px 14px", borderRadius: "9px",
                        border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700,
                        transition: "all 0.2s",
                        ...(copied === "referral"
                            ? { background: "rgba(50,210,120,0.1)", color: "#32D278", outline: "1px solid rgba(50,210,120,0.25)" }
                            : { background: `${roleColor}15`, color: roleColor }),
                    }}>
                    {copied === "referral" ? "✓" : "紹介リンク"}
                </button>
            </div>

            {/* Native share */}
            <button onClick={handleNativeShare}
                style={{
                    width: "100%", padding: "10px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 600,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                    transition: "all 0.15s",
                }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                シェアする
            </button>
        </div>
    );
}