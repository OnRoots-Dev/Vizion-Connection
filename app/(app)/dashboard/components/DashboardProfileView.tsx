"use client";

import { useState } from "react";
import type { ProfileData } from "@/features/profile/types";
import type { ThemeColors } from "../DashboardClient";
import { FoundingMemberBadge, EarlyPartnerBadge } from "@/components/ui/FoundingMemberBadge";

const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
};
const ROLE_GRADIENT: Record<string, string> = {
    Athlete: "#2D0000", Trainer: "#001A0A", Members: "#1A0F00", Business: "#000A24",
};
const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const IG_PATH = "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z";
const TK_PATH = "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z";

type Tab = "profile" | "career";

export function DashboardProfileView({
    profile, t, roleColor, onBack,
}: {
    profile: ProfileData; t: ThemeColors; roleColor: string; onBack: () => void;
}) {
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    const joinedAt = new Date(profile.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
    const bg1 = ROLE_GRADIENT[profile.role] ?? "#1a1a2e";
    const initials = profile.displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const serialDisplay = profile.serialId ? `#${String(profile.serialId).padStart(4, "0")}` : null;
    const snsLinks = [
        { label: "X", href: profile.xUrl, path: X_PATH },
        { label: "Instagram", href: profile.instagram, path: IG_PATH },
        { label: "TikTok", href: profile.tiktok, path: TK_PATH },
    ].filter(s => s.href);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 0, borderRadius: 16, overflow: "hidden", border: `1px solid ${t.border}`, background: t.surface }}>

            {/* ── HERO ── */}
            <div style={{ position: "relative", minHeight: 260, overflow: "hidden" }}>
                {profile.profileImageUrl ? (
                    <img src={profile.profileImageUrl} alt=""
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 0.45 }} />
                ) : (
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(145deg, ${bg1} 0%, #050505 100%)` }}>
                        <div style={{ position: "absolute", top: "-30%", right: "-10%", width: "300px", height: "300px", background: `radial-gradient(circle, ${roleColor}28, transparent 65%)` }} />
                    </div>
                )}
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, #07070e 0%, rgba(7,7,14,0.5) 45%, rgba(7,7,14,0.1) 100%)` }} />
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, rgba(7,7,14,0.7) 0%, transparent 55%)` }} />
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(145deg, ${bg1}50 0%, transparent 60%)` }} />

                {/* ナビ */}
                <div style={{ position: "relative", zIndex: 10, padding: "14px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 10, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: 11, fontWeight: 700, backdropFilter: "blur(8px)" }}>
                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        戻る
                    </button>
                    <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, background: `${roleColor}20`, border: `1px solid ${roleColor}45`, color: roleColor, fontSize: 11, fontWeight: 800, textDecoration: "none", backdropFilter: "blur(8px)" }}>
                        公開ページを開く
                        <svg width={11} height={11} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </a>
                </div>

                {/* コンテンツ */}
                <div style={{ position: "relative", zIndex: 2, padding: "16px 20px 20px" }}>
                    <div style={{ display: "inline-flex", marginBottom: 12 }}>
                        {profile.isFoundingMember ? <FoundingMemberBadge /> : <EarlyPartnerBadge />}
                    </div>
                    {serialDisplay && <span style={{ marginLeft: 8, fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>{serialDisplay}</span>}

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ display: "block", width: 20, height: 3, borderRadius: 2, background: roleColor, flexShrink: 0 }} />
                        <span style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", color: `${roleColor}cc` }}>
                            {ROLE_LABEL[profile.role] ?? profile.role}{profile.sport ? ` · ${profile.sport}` : ""}
                        </span>
                    </div>

                    <h2 style={{ fontSize: "clamp(28px, 6vw, 40px)", fontWeight: 900, color: "#fff", margin: "0 0 4px", lineHeight: 1, letterSpacing: "-0.03em", textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>
                        {profile.displayName}
                    </h2>
                    <p style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", margin: "0 0 16px" }}>
                        @{profile.slug}{profile.region ? ` · ${profile.region}` : ""}
                    </p>

                    {/* アバター + Cheer + SNS */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", border: `2.5px solid ${roleColor}90`, background: `linear-gradient(145deg, ${bg1}, #111)`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 16px ${roleColor}40` }}>
                            {profile.avatarUrl
                                ? <img src={profile.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <span style={{ fontSize: "16px", fontWeight: 900, color: `${roleColor}cc`, fontFamily: "monospace" }}>{initials}</span>
                            }
                        </div>
                        <div>
                            <span style={{ fontSize: 8, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,210,0,0.5)", display: "block", marginBottom: 1 }}>CHEER</span>
                            <span style={{ fontSize: 30, fontWeight: 900, color: "#FFD600", fontFamily: "monospace", lineHeight: 1, letterSpacing: "-0.02em" }}>
                                {(profile.cheerCount ?? 0).toLocaleString()}
                            </span>
                        </div>
                        {snsLinks.length > 0 && (
                            <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                                {snsLinks.map(s => (
                                    <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer"
                                        style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `${roleColor}15`, border: `1px solid ${roleColor}30`, color: roleColor, textDecoration: "none" }}>
                                        <svg viewBox="0 0 24 24" width={11} height={11} fill="currentColor"><path d={s.path} /></svg>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── タブナビ ── */}
            <div style={{ display: "flex", borderBottom: `1px solid ${t.border}`, background: "rgba(0,0,0,0.2)" }}>
                {([
                    { key: "profile", label: "プロフィール" },
                    { key: "career", label: "キャリア（近日公開）" },
                ] as { key: Tab; label: string }[]).map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1, padding: "13px 16px", border: "none", background: "none",
                            fontSize: 12, fontWeight: 800, cursor: tab.key === "career" ? "default" : "pointer",
                            color: activeTab === tab.key ? roleColor : "rgba(255,255,255,0.3)",
                            borderBottom: `2px solid ${activeTab === tab.key ? roleColor : "transparent"}`,
                            transition: "color 0.2s, border-color 0.2s",
                            opacity: tab.key === "career" ? 0.5 : 1,
                        }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── タブコンテンツ ── */}
            <div style={{ padding: 16 }}>

                {activeTab === "profile" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                        {/* Bio */}
                        {profile.bio && (
                            <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${t.border}`, position: "relative", overflow: "hidden" }}>
                                <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: "0 2px 2px 0", background: `linear-gradient(to bottom, transparent, ${roleColor}, transparent)` }} />
                                <p style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.62)", margin: 0, paddingLeft: 4 }}>{profile.bio}</p>
                            </div>
                        )}

                        {/* Stats グリッド */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                            {[
                                { label: "Role", value: ROLE_LABEL[profile.role] ?? profile.role, color: roleColor },
                                { label: "Cheer", value: (profile.cheerCount ?? 0).toLocaleString(), color: "#FFD600" },
                                { label: "参加日", value: joinedAt },
                                { label: "Sport / Job", value: profile.sport ?? "—" },
                                { label: "Area", value: profile.region ?? "—" },
                                { label: "Prefecture", value: profile.prefecture ?? "—" },
                            ].map(({ label, value, color }) => (
                                <div key={label} style={{ padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${t.border}` }}>
                                    <p style={{ margin: "0 0 5px", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>{label}</p>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: color ?? "rgba(255,255,255,0.7)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* SNS一覧 */}
                        {snsLinks.length > 0 && (
                            <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${t.border}` }}>
                                <p style={{ margin: "0 0 10px", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>SNS</p>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {snsLinks.map(s => (
                                        <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer"
                                            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 10, background: `${roleColor}10`, border: `1px solid ${roleColor}25`, color: roleColor, fontWeight: 800, fontSize: 12, textDecoration: "none" }}>
                                            <svg viewBox="0 0 24 24" width={11} height={11} fill="currentColor"><path d={s.path} /></svg>
                                            {s.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 公開設定確認 */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, background: profile.isPublic ? `${roleColor}08` : "rgba(255,80,80,0.06)", border: `1px solid ${profile.isPublic ? roleColor + "20" : "rgba(255,80,80,0.2)"}` }}>
                            <div>
                                <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: profile.isPublic ? roleColor : "#ff5050" }}>
                                    {profile.isPublic ? "✓ 公開中" : "非公開"}
                                </p>
                                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>プロフィールの公開設定</p>
                            </div>
                            <a href="/dashboard/setting" style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                                設定を変更
                            </a>
                        </div>
                    </div>
                )}

                {activeTab === "career" && (
                    <div style={{ padding: "40px 20px", textAlign: "center" }}>
                        <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${roleColor}15`, border: `1px solid ${roleColor}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke={roleColor} strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 800, color: roleColor, margin: "0 0 8px" }}>キャリアページ</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>
                            実績・経歴・スキルタグを<br />プロフィールに追加できます。<br />
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 8, display: "block" }}>β版にて公開予定</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}