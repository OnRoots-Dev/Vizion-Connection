// app/u/[slug]/components/StatusBar.tsx
// ① ステータスバー — 最終活動日時・アクティブ表示。
// 15分以内の活動なら「オンライン中」（ネオンドット脈動）、
// それ以外は「最終活動：3時間前」のように丸めた粒度で表示する
// （プライバシー配慮のため分/時間/日単位より細かくしない）。
"use client";

import { useEffect, useState } from "react";
import { VP, VP_MONO_FONT } from "../profile-theme";

const ONLINE_WINDOW_MS = 15 * 60 * 1000;

function formatLastActive(lastActiveAt: string | null, now: number): { online: boolean; label: string } {
    if (!lastActiveAt) return { online: false, label: "最終活動：—" };
    const diff = now - new Date(lastActiveAt).getTime();
    if (diff < ONLINE_WINDOW_MS) return { online: true, label: "オンライン中" };
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return { online: false, label: `最終活動：${minutes}分前` };
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return { online: false, label: `最終活動：${hours}時間前` };
    const days = Math.floor(hours / 24);
    return { online: false, label: `最終活動：${days}日前` };
}

export default function StatusBar({
    lastActiveAt,
    joinedLabel,
}: {
    lastActiveAt: string | null;
    joinedLabel: string;
}) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 60_000);
        return () => window.clearInterval(id);
    }, []);

    const { online, label } = formatLastActive(lastActiveAt, now);
    const dotColor = online ? VP.neon : "rgba(255,255,255,0.28)";

    return (
        <div
            role="status"
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "9px 16px",
                borderRadius: 12,
                border: `1px solid ${online ? VP.neonBorder : VP.border}`,
                background: online ? VP.neonFaint : "rgba(255,255,255,0.02)",
            }}
        >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                <span style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }} aria-hidden>
                    <span
                        style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            background: dotColor,
                            boxShadow: online ? VP.glowStrong : "none",
                        }}
                    />
                    {online ? (
                        <span
                            className="vp-status-ping"
                            style={{
                                position: "absolute",
                                inset: -3,
                                borderRadius: "50%",
                                border: `1px solid ${VP.neon}`,
                            }}
                        />
                    ) : null}
                </span>
                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.12em",
                        color: online ? VP.neonSoft : VP.sub,
                        fontFamily: VP_MONO_FONT,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {label}
                </span>
            </span>
            <span
                style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: VP.faint,
                    fontFamily: VP_MONO_FONT,
                    whiteSpace: "nowrap",
                }}
            >
                SINCE {joinedLabel}
            </span>
            <style>{`
                @keyframes vpStatusPing { 0%{transform:scale(1);opacity:.8} 80%,100%{transform:scale(2.4);opacity:0} }
                .vp-status-ping{ animation: vpStatusPing 2s cubic-bezier(0,0,.2,1) infinite; }
                @media (prefers-reduced-motion: reduce){ .vp-status-ping{ animation: none; opacity: 0; } }
            `}</style>
        </div>
    );
}
