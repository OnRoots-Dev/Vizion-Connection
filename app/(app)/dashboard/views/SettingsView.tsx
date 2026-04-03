"use client";

import type { ProfileData } from "@/features/profile/types";
import type { ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";

export function SettingsView({ profile, t, roleColor, onBack, onLogout }: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
    onBack: () => void;
    onLogout: () => void;
}) {
    const ROLE_LABEL: Record<string, string> = { Athlete: "Athlete", Trainer: "Trainer", Members: "Members", Business: "Business" };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Settings" sub="アカウント設定" onBack={onBack} t={t} roleColor={roleColor} />
            <SectionCard t={t}>
                <SLabel text="アカウント情報" />
                {[
                    { k: "表示名", v: profile.displayName },
                    { k: "ID", v: `@${profile.slug}`, mono: true },
                    { k: "Role", v: ROLE_LABEL[profile.role], color: roleColor },
                    { k: "メール", v: profile.email },
                    { k: "認証", v: profile.verified ? "✓ 認証済み" : "未認証", color: profile.verified ? "#32D278" : "#FF5050" },
                    { k: "登録日", v: new Date(profile.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" }) },
                ].map(({ k, v, mono, color }) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ fontSize: 10, color: t.sub, opacity: 0.5, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</span>
                        <span style={{ fontSize: 11, fontFamily: mono ? "monospace" : "inherit", color: color ?? t.text, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right", fontWeight: color ? 700 : 400 }}>{v}</span>
                    </div>
                ))}
            </SectionCard>
            <button onClick={onLogout} className="vz-btn" style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#FF5050", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                ログアウト
            </button>
        </div>
    );
}
