"use client";

import { useState } from "react";
import type { ProfileData } from "@/features/profile/types";
import type { ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";

export function SettingsView({ profile, t, roleColor, onBack, onLogout, onProfilePatch }: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
    onBack: () => void;
    onLogout: () => void;
    onProfilePatch: (patch: Partial<ProfileData>) => void;
}) {
    const ROLE_LABEL: Record<string, string> = { Athlete: "Athlete", Trainer: "Trainer", Members: "Members", Business: "Business" };
    const [isPublic, setIsPublic] = useState(profile.isPublic !== false);
    const [savingVisibility, setSavingVisibility] = useState(false);
    const [visibilityMessage, setVisibilityMessage] = useState<string | null>(null);

    const [newEmail, setNewEmail] = useState("");
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailMsg, setEmailMsg] = useState<string | null>(null);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

    async function handleVisibilityToggle() {
        const nextValue = !isPublic;
        setSavingVisibility(true);
        setVisibilityMessage(null);
        try {
            const response = await fetch("/api/profile/visibility", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublic: nextValue }),
            });
            const json = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(typeof json?.error === "string" ? json.error : "公開設定の更新に失敗しました");
            }
            setIsPublic(nextValue);
            onProfilePatch({ isPublic: nextValue });
            setVisibilityMessage(nextValue ? "プロフィールを公開に切り替えました" : "プロフィールを非公開に切り替えました");
        } catch (error) {
            setVisibilityMessage(error instanceof Error ? error.message : "公開設定の更新に失敗しました");
        } finally {
            setSavingVisibility(false);
        }
    }

    async function handleEmailChange() {
        if (!newEmail.trim()) return;
        setEmailLoading(true);
        setEmailMsg(null);
        try {
            const res = await fetch("/api/account/change-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newEmail: newEmail.trim() }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.ok) {
                throw new Error(typeof data?.error === "string" ? data.error : "エラーが発生しました");
            }
            setEmailMsg("確認メールを送信しました");
            setNewEmail("");
        } catch (error) {
            setEmailMsg(error instanceof Error ? error.message : "通信エラーが発生しました");
        } finally {
            setEmailLoading(false);
        }
    }

    async function handlePasswordChange() {
        if (!currentPassword || !newPassword) return;
        setPasswordLoading(true);
        setPasswordMsg(null);
        try {
            const res = await fetch("/api/account/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.ok) {
                throw new Error(typeof data?.error === "string" ? data.error : "エラーが発生しました");
            }
            setPasswordMsg("パスワードを変更しました");
            setCurrentPassword("");
            setNewPassword("");
        } catch (error) {
            setPasswordMsg(error instanceof Error ? error.message : "通信エラーが発生しました");
        } finally {
            setPasswordLoading(false);
        }
    }

    async function handleDeleteAccount() {
        if (deleteConfirm !== profile.slug) return;
        setDeleteLoading(true);
        setDeleteMsg(null);
        try {
            const res = await fetch("/api/account/delete", { method: "POST" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.ok) {
                throw new Error(typeof data?.error === "string" ? data.error : "エラーが発生しました");
            }

            await fetch("/api/logout", { method: "POST" });
            window.location.href = "/";
        } catch (error) {
            setDeleteMsg(error instanceof Error ? error.message : "通信エラーが発生しました");
        } finally {
            setDeleteLoading(false);
        }
    }

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
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${t.border}` }}>
                        <span style={{ fontSize: 10, color: t.sub, opacity: 0.5, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</span>
                        <span style={{ fontSize: 11, fontFamily: mono ? "monospace" : "inherit", color: color ?? t.text, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right", fontWeight: color ? 700 : 400 }}>{v}</span>
                    </div>
                ))}
            </SectionCard>

            <SectionCard t={t} accentColor={roleColor}>
                <SLabel text="メールアドレス変更" color={roleColor} />
                <div style={{ display: "grid", gap: 8 }}>
                    <input
                        type="email"
                        placeholder="新しいメールアドレス"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        style={{ height: 42, borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, padding: "0 12px", outline: "none" }}
                    />
                    <button
                        type="button"
                        onClick={() => void handleEmailChange()}
                        disabled={emailLoading || !newEmail.trim()}
                        style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: `${roleColor}18`, border: `1px solid ${roleColor}35`, color: roleColor, fontSize: 13, fontWeight: 800, cursor: emailLoading ? "wait" : "pointer", opacity: emailLoading || !newEmail.trim() ? 0.6 : 1 }}
                    >
                        {emailLoading ? "送信中..." : "確認メールを送信"}
                    </button>
                    {emailMsg ? (
                        <p style={{ margin: 0, fontSize: 11, color: emailMsg.includes("送信") ? t.sub : "#ff9b9b" }}>
                            {emailMsg}
                        </p>
                    ) : null}
                </div>
            </SectionCard>

            <SectionCard t={t}>
                <SLabel text="パスワード変更" />
                <div style={{ display: "grid", gap: 8 }}>
                    <input
                        type="password"
                        placeholder="現在のパスワード"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        style={{ height: 42, borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, padding: "0 12px", outline: "none" }}
                    />
                    <input
                        type="password"
                        placeholder="新しいパスワード（8文字以上）"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ height: 42, borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, padding: "0 12px", outline: "none" }}
                    />
                    <button
                        type="button"
                        onClick={() => void handlePasswordChange()}
                        disabled={passwordLoading || !currentPassword || !newPassword}
                        style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: `${roleColor}18`, border: `1px solid ${roleColor}35`, color: roleColor, fontSize: 13, fontWeight: 800, cursor: passwordLoading ? "wait" : "pointer", opacity: passwordLoading || !currentPassword || !newPassword ? 0.6 : 1 }}
                    >
                        {passwordLoading ? "変更中..." : "パスワードを変更"}
                    </button>
                    {passwordMsg ? (
                        <p style={{ margin: 0, fontSize: 11, color: passwordMsg.includes("変更") ? t.sub : "#ff9b9b" }}>
                            {passwordMsg}
                        </p>
                    ) : null}
                </div>
            </SectionCard>
            <SectionCard t={t} accentColor={roleColor}>
                <SLabel text="Visibility" color={roleColor} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>公開プロフィール設定</span>
                        <span style={{ fontSize: 11, color: t.sub }}>
                            {isPublic ? "現在公開中。プロフィールページとカードページを閲覧できます。" : "現在非公開。外部からはプロフィールを見られません。"}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => void handleVisibilityToggle()}
                        disabled={savingVisibility}
                        aria-label="プロフィール公開設定"
                        style={{ position: "relative", width: 52, height: 30, borderRadius: 999, background: isPublic ? roleColor : t.border, border: "none", cursor: savingVisibility ? "wait" : "pointer", transition: "background 0.2s", flexShrink: 0, padding: 0, opacity: savingVisibility ? 0.7 : 1 }}
                    >
                        <span style={{ position: "absolute", top: 3, left: isPublic ? 25 : 3, width: 24, height: 24, borderRadius: "50%", background: t.text, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }} />
                    </button>
                </div>
                <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: isPublic ? `${roleColor}10` : "rgba(255,160,80,0.08)", border: `1px solid ${isPublic ? `${roleColor}24` : "rgba(255,160,80,0.2)"}`, fontSize: 11, color: isPublic ? t.sub : "#ffb07a", lineHeight: 1.7 }}>
                    非公開中は公開プロフィール、カードページ、紹介リンクの閲覧導線が停止します。
                </div>
                {visibilityMessage ? (
                    <p style={{ margin: "10px 0 0", fontSize: 11, color: visibilityMessage.includes("失敗") ? "#ff9b9b" : t.sub }}>
                        {visibilityMessage}
                    </p>
                ) : null}
            </SectionCard>

            <SectionCard t={t}>
                <SLabel text="退会" color="#FF5050" />
                <p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>
                    退会するとプロフィールが非公開になり、復元できません。確認のため、あなたのID（<span style={{ color: t.text, fontFamily: "monospace" }}>@{profile.slug}</span>）を入力してください。
                </p>
                <input
                    type="text"
                    placeholder={`${profile.slug} と入力`}
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    style={{ height: 42, borderRadius: 12, border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,255,255,0.03)", color: t.text, padding: "0 12px", outline: "none" }}
                />
                <button
                    type="button"
                    onClick={() => void handleDeleteAccount()}
                    disabled={deleteLoading || deleteConfirm !== profile.slug}
                    style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "rgba(255,80,80,0.10)", border: "1px solid rgba(255,80,80,0.25)", color: "#FF5050", fontSize: 13, fontWeight: 800, cursor: deleteLoading ? "wait" : deleteConfirm === profile.slug ? "pointer" : "not-allowed", opacity: deleteLoading ? 0.7 : 1 }}
                >
                    {deleteLoading ? "処理中..." : "退会する"}
                </button>
                {deleteMsg ? (
                    <p style={{ margin: 0, fontSize: 11, color: "#ff9b9b" }}>
                        {deleteMsg}
                    </p>
                ) : null}
            </SectionCard>

            <button onClick={onLogout} className="vz-btn" style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#FF5050", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                ログアウト
            </button>
        </div>
    );
}
