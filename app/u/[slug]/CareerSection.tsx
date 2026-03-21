"use client";

import { useState } from "react";

type Tab = "profile" | "career";

interface Props {
    roleColor: string;
    bio?: string;
    sport?: string;
    region?: string;
    prefecture?: string;
    joinedAt: string;
    roleLabel: string;
    cheerCount: number;
    isPublic?: boolean;
    slug: string;
}

export default function CareerSection({ roleColor, bio, sport, region, prefecture, joinedAt, roleLabel, cheerCount, isPublic: initialIsPublic, slug }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("profile");
    const [isPublic, setIsPublic] = useState<boolean>(initialIsPublic !== false);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");
    const rl = roleColor;

    async function handleTogglePublic() {
        const next = !isPublic;
        setIsPublic(next);
        setSaving(true);
        setSaveMsg("");
        try {
            const res = await fetch("/api/profile/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublic: next }),
            });
            if (!res.ok) throw new Error();
            setSaveMsg(next ? "公開に変更しました" : "非公開に変更しました");
        } catch {
            setIsPublic(!next);
            setSaveMsg("保存に失敗しました");
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(""), 2500);
        }
    }

    return (
        <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>

            {/* タブナビ */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {([
                    { key: "profile", label: "プロフィール詳細" },
                    { key: "career", label: "キャリア（近日公開）" },
                ] as { key: Tab; label: string }[]).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => tab.key !== "career" && setActiveTab(tab.key)}
                        style={{
                            flex: 1, padding: "13px 10px", border: "none",
                            background: "none", fontSize: 12, fontWeight: 800,
                            cursor: tab.key === "career" ? "default" : "pointer",
                            color: activeTab === tab.key ? rl : "rgba(255,255,255,0.28)",
                            borderBottom: `2px solid ${activeTab === tab.key ? rl : "transparent"}`,
                            transition: "color 0.2s, border-color 0.2s",
                            opacity: tab.key === "career" ? 0.5 : 1,
                            letterSpacing: "0.01em",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: 16 }}>

                {activeTab === "profile" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                        {bio && (
                            <div style={{ position: "relative", padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                <div style={{ position: "absolute", left: 0, top: "18%", bottom: "18%", width: 3, borderRadius: "0 2px 2px 0", background: `linear-gradient(to bottom, transparent, ${rl}, transparent)` }} />
                                <p style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.62)", margin: 0, paddingLeft: 4 }}>{bio}</p>
                            </div>
                        )}

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                            {[
                                { label: "Role", value: roleLabel, color: rl },
                                { label: "Cheer", value: cheerCount.toLocaleString(), color: "#FFD600" },
                                { label: "参加日", value: joinedAt },
                                { label: "Sport / Job", value: sport ?? "—" },
                                { label: "Area", value: region ?? "—" },
                                { label: "Prefecture", value: prefecture ?? "—" },
                            ].map(({ label, value, color }) => (
                                <div key={label} style={{ padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                    <p style={{ margin: "0 0 5px", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>{label}</p>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: color ?? "rgba(255,255,255,0.7)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* 公開設定トグル — EditProfileClientと同じ実装 */}
                        <div style={{ borderRadius: 12, padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 10 }}>
                            <p style={{ margin: 0, fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
                                Privacy
                            </p>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>プロフィールを公開する</span>
                                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                                        {isPublic ? "現在公開中 — 誰でも閲覧できます" : "現在非公開 — 自分のみ確認できます"}
                                    </span>
                                </div>
                                <button
                                    onClick={handleTogglePublic}
                                    disabled={saving}
                                    aria-label="プロフィール公開設定"
                                    style={{
                                        position: "relative", width: 48, height: 28, borderRadius: 14,
                                        background: isPublic ? rl : "rgba(255,255,255,0.1)",
                                        border: "none", cursor: saving ? "wait" : "pointer",
                                        transition: "background 0.2s", flexShrink: 0, padding: 0,
                                        opacity: saving ? 0.6 : 1,
                                    }}
                                >
                                    <span style={{
                                        position: "absolute", top: 3,
                                        left: isPublic ? 23 : 3,
                                        width: 22, height: 22, borderRadius: "50%",
                                        background: "#fff", transition: "left 0.2s",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                                    }} />
                                </button>
                            </div>
                            {!isPublic && (
                                <div style={{ padding: "10px 12px", borderRadius: 9, background: "rgba(255,200,30,0.06)", border: "1px solid rgba(255,200,30,0.15)", fontSize: 11, color: "rgba(255,200,30,0.7)", lineHeight: 1.6 }}>
                                    ⚠ 非公開中はプロフィールページとカードページが閲覧不可になります。紹介リンクも機能しません。
                                </div>
                            )}
                            {saveMsg && (
                                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: saving ? "rgba(255,255,255,0.3)" : (isPublic ? rl : "rgba(255,255,255,0.4)"), textAlign: "right" }}>
                                    {saveMsg}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "career" && (
                    <div style={{ padding: "36px 16px", textAlign: "center" }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${rl}15`, border: `1px solid ${rl}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke={rl} strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 800, color: rl, margin: "0 0 8px" }}>キャリアページ</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.8, margin: 0 }}>
                            実績・経歴・スキルタグなど<br />プロフィールに追加できるようになります
                        </p>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", margin: "12px 0 0", fontFamily: "monospace", letterSpacing: "0.1em" }}>β版にて公開予定</p>
                    </div>
                )}
            </div>
        </div>
    );
}