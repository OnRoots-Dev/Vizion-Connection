"use client";

import type { ProfileData } from "@/features/profile/types";
import type { ThemeColors } from "../DashboardClient";

const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE",
    Trainer: "TRAINER",
    Members: "MEMBERS",
    Business: "BUSINESS",
};

export function DashboardProfileView({
    profile,
    t,
    roleColor,
    onBack,
}: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
    onBack: () => void;
}) {
    const joinedAt = new Date(profile.createdAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const snsLinks = [
        { label: "X", href: profile.xUrl },
        { label: "Instagram", href: profile.instagram },
        { label: "TikTok", href: profile.tiktok },
    ].filter((s) => s.href);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <button
                    onClick={onBack}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 12px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${t.border}`,
                        color: t.text,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                    }}
                >
                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    戻る
                </button>

                <a
                    href={`/u/${profile.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "8px 12px",
                        borderRadius: 10,
                        background: `${roleColor}12`,
                        border: `1px solid ${roleColor}35`,
                        color: roleColor,
                        textDecoration: "none",
                        fontSize: 12,
                        fontWeight: 800,
                    }}
                >
                    公開プロフィールを開く
                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                </a>
            </div>

            <div
                style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `1px solid ${t.border}`,
                    background: t.surface,
                }}
            >
                <div
                    style={{
                        padding: "18px 18px 16px",
                        background: `radial-gradient(ellipse 70% 55% at 50% 0%, ${roleColor}18 0%, transparent 70%)`,
                        borderBottom: `1px solid ${t.border}`,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 58,
                                height: 58,
                                borderRadius: "50%",
                                background: `${roleColor}18`,
                                border: `2px solid ${roleColor}55`,
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                fontSize: 18,
                                fontWeight: 900,
                                color: roleColor,
                            }}
                        >
                            {profile.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                profile.displayName.slice(0, 1).toUpperCase()
                            )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: t.text, letterSpacing: "-0.02em" }}>
                                    {profile.displayName}
                                </h2>
                                <span
                                    style={{
                                        fontSize: 10,
                                        fontFamily: "monospace",
                                        padding: "3px 8px",
                                        borderRadius: 99,
                                        background: `${roleColor}15`,
                                        border: `1px solid ${roleColor}35`,
                                        color: roleColor,
                                        fontWeight: 900,
                                        letterSpacing: "0.12em",
                                    }}
                                >
                                    {ROLE_LABEL[profile.role] ?? profile.role}
                                </span>
                            </div>
                            <p style={{ margin: "4px 0 0", fontSize: 11, color: t.sub, opacity: 0.75, fontFamily: "monospace" }}>
                                @{profile.slug}{profile.sport ? ` · ${profile.sport}` : ""}{profile.region ? ` · ${profile.region}` : ""}
                            </p>
                        </div>

                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                            <p style={{ margin: 0, fontSize: 9, color: t.sub, opacity: 0.5, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace" }}>
                                Joined
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 800 }}>
                                {joinedAt}
                            </p>
                        </div>
                    </div>

                    {profile.bio && (
                        <p style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.62)" }}>
                            {profile.bio}
                        </p>
                    )}
                </div>

                <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                        {[
                            { label: "Cheer", value: (profile.cheerCount ?? 0).toLocaleString(), color: "#FFD600" },
                            { label: "Sport / Job", value: profile.sport ?? "—", color: undefined },
                            { label: "Area", value: profile.region ?? "—", color: undefined },
                            { label: "Pref", value: profile.prefecture ?? "—", color: undefined },
                        ].map(({ label, value, color }) => (
                            <div
                                key={label}
                                style={{
                                    padding: "12px 12px",
                                    borderRadius: 12,
                                    background: "rgba(255,255,255,0.03)",
                                    border: `1px solid ${t.border}`,
                                    overflow: "hidden",
                                }}
                            >
                                <p
                                    style={{
                                        margin: "0 0 6px",
                                        fontSize: 8,
                                        fontFamily: "monospace",
                                        letterSpacing: "0.18em",
                                        textTransform: "uppercase",
                                        color: "rgba(255,255,255,0.25)",
                                    }}
                                >
                                    {label}
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 13,
                                        fontWeight: 900,
                                        color: color ?? "rgba(255,255,255,0.7)",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                    }}
                                >
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {snsLinks.length > 0 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                            {snsLinks.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 7,
                                        padding: "9px 14px",
                                        borderRadius: 12,
                                        background: `${roleColor}10`,
                                        border: `1px solid ${roleColor}25`,
                                        color: roleColor,
                                        fontWeight: 800,
                                        fontSize: 12,
                                        textDecoration: "none",
                                    }}
                                >
                                    {s.label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

