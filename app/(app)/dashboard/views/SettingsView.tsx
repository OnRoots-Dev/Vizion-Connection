"use client";

import { useEffect, useState } from "react";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";

const MARKETING_HOME_URL = "https://vizion-connection.jp/";

export function SettingsView({ profile, t, roleColor, onBack, setView, onProfilePatch }: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
    onBack: () => void;
    setView: (view: DashboardView) => void;
    onProfilePatch: (patch: Partial<ProfileData>) => void;
}) {
    const ROLE_LABEL: Record<string, string> = { Athlete: "Athlete", Trainer: "Trainer", Crew: "Crew", Business: "Business", Admin: "Admin" };
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
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        setIsPublic(profile.isPublic !== false);
    }, [profile.isPublic]);

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
            window.location.assign(MARKETING_HOME_URL);
        } catch (error) {
            setDeleteMsg(error instanceof Error ? error.message : "通信エラーが発生しました");
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {deleteModalOpen ? (
                <>
                    <button
                        type="button"
                        aria-label="退会確認を閉じる"
                        onClick={() => setDeleteModalOpen(false)}
                        disabled={deleteLoading}
                        style={{ position: "fixed", inset: 0, zIndex: 90, border: "none", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", cursor: "pointer" }}
                    />
                    <div style={{ position: "fixed", inset: 0, zIndex: 91, display: "grid", placeItems: "center", padding: 16 }}>
                        <div style={{ width: "100%", maxWidth: 420, borderRadius: 16, border: `1px solid ${t.border}`, background: t.bg, padding: 16, boxShadow: "0 18px 60px rgba(0,0,0,0.55)" }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: t.text }}>本当に退会しますか？</p>
                            <p style={{ margin: "6px 0 0", fontSize: 11, color: t.sub, lineHeight: 1.7 }}>
                                退会するとプロフィールが非公開になり、復元できません。
                            </p>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    onClick={() => setDeleteModalOpen(false)}
                                    disabled={deleteLoading}
                                    style={{ borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.sub, fontWeight: 900, fontSize: 12, padding: "10px 12px", cursor: deleteLoading ? "wait" : "pointer" }}
                                >
                                    キャンセル
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleDeleteAccount()}
                                    disabled={deleteLoading}
                                    style={{ borderRadius: 12, border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.14)", color: "#FF5050", fontWeight: 900, fontSize: 12, padding: "10px 12px", cursor: deleteLoading ? "wait" : "pointer", opacity: deleteLoading ? 0.75 : 1 }}
                                >
                                    {deleteLoading ? "処理中..." : "退会する"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}

            <ViewHeader title="Settings" sub="アカウント設定" onBack={onBack} t={t} roleColor={roleColor} />

            <SectionCard t={t}>
                <SLabel text="アカウント情報" />
                {[
                    { k: "表示名", v: profile.displayName },
                    { k: "ID", v: `@${profile.slug}`, mono: true },
                    { k: "Role", v: ROLE_LABEL[profile.role], color: roleColor },
                    { k: "メール", v: profile.email ?? "" },
                    { k: "認証", v: profile.verified ? "✓ 認証済み" : "未認証", color: profile.verified ? "#32D278" : "#FF5050" },
                    { k: "登録日", v: new Date(profile.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" }) },
                ].map(({ k, v, mono, color }) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.18em" }}>{k}</span>
                        <span style={{ fontSize: 11, fontFamily: mono ? "monospace" : "inherit", color: color ?? "#f0f0f5", maxWidth: "62%", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right", fontWeight: color ? 700 : 400 }}>{v}</span>
                    </div>
                ))}
            </SectionCard>

            <SectionCard t={t} accentColor="#C8E800">
                <SLabel text="サポート" />
                <button
                    type="button"
                    onClick={() => setView("contact")}
                    style={{
                        width: "100%",
                        padding: "12px 12px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${t.border}`,
                        color: t.text,
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                        textAlign: "left",
                    }}
                >
                    問い合わせ
                </button>
                <p style={{ margin: "8px 0 0", fontSize: 11, color: t.sub, lineHeight: 1.7 }}>
                    不具合報告・機能要望・取材などはこちらから送信できます。
                </p>
                {/* Action History disabled
                <button
                    type="button"
                    onClick={() => setView("action_history")}
                    style={{
                        width: "100%",
                        padding: "12px 12px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${t.border}`,
                        color: t.text,
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                        textAlign: "left",
                    }}
                >
                    アクション履歴
                </button>
                <p style={{ margin: "8px 0 0", fontSize: 11, color: t.sub, lineHeight: 1.7 }}>
                    このアカウントに紐づく通知や進行履歴を、SPA画面でまとめて確認できます。
                </p>
                */}
            </SectionCard>

            <SectionCard t={t} accentColor="#C8E800">
                <SLabel text="メールアドレス変更" />
                <div style={{ display: "grid", gap: 8 }}>
                    <input
                        type="email"
                        placeholder="新しいメールアドレス"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        style={{ height: 42, width: "100%", maxWidth: "100%", boxSizing: "border-box", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, padding: "0 12px", outline: "none" }}
                    />
                    <button
                        type="button"
                        onClick={() => void handleEmailChange()}
                        disabled={emailLoading || !newEmail.trim()}
                        style={{ width: "100%", padding: "11px 0", borderRadius: 8, background: "#C8E800", border: "none", color: "#000", fontSize: 13, fontWeight: 700, cursor: emailLoading ? "wait" : "pointer", opacity: emailLoading || !newEmail.trim() ? 0.6 : 1, boxShadow: "0 0 20px rgba(200,232,0,0.3)" }}
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
                        style={{ height: 42, width: "100%", maxWidth: "100%", boxSizing: "border-box", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#111118", color: "#f0f0f5", padding: "0 16px", outline: "none" }}
                    />
                    <input
                        type="password"
                        placeholder="新しいパスワード（8文字以上）"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ height: 42, width: "100%", maxWidth: "100%", boxSizing: "border-box", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#111118", color: "#f0f0f5", padding: "0 16px", outline: "none" }}
                    />
                    <button
                        type="button"
                        onClick={() => void handlePasswordChange()}
                        disabled={passwordLoading || !currentPassword || !newPassword}
                        style={{ width: "100%", padding: "11px 0", borderRadius: 8, background: "#C8E800", border: "none", color: "#000", fontSize: 13, fontWeight: 700, cursor: passwordLoading ? "wait" : "pointer", opacity: passwordLoading || !currentPassword || !newPassword ? 0.6 : 1, boxShadow: "0 0 20px rgba(200,232,0,0.3)" }}
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
            <SectionCard t={t} accentColor="#C8E800">
                <SLabel text="アカウント公開設定" />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f5" }}>アカウント公開設定</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                            {isPublic ? "現在公開中。プロフィールページとカードページを閲覧できます。" : "現在非公開。外部からはプロフィールを見られません。"}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => void handleVisibilityToggle()}
                        disabled={savingVisibility}
                        aria-label="アカウント公開設定"
                        style={{ position: "relative", width: 52, height: 30, borderRadius: 999, background: isPublic ? "#C8E800" : "rgba(255,255,255,0.08)", border: "none", cursor: savingVisibility ? "wait" : "pointer", transition: "background 0.2s", flexShrink: 0, padding: 0, opacity: savingVisibility ? 0.7 : 1 }}
                    >
                        <span style={{ position: "absolute", top: 3, left: isPublic ? 25 : 3, width: 24, height: 24, borderRadius: "50%", background: "#f0f0f5", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }} />
                    </button>
                </div>
                <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: isPublic ? "rgba(200,232,0,0.08)" : "rgba(255,160,80,0.08)", border: `1px solid ${isPublic ? "rgba(200,232,0,0.2)" : "rgba(255,160,80,0.2)"}`, fontSize: 11, color: isPublic ? "rgba(255,255,255,0.55)" : "#ffb07a", lineHeight: 1.7 }}>
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
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                    退会するとプロフィールが非公開になり、復元できません。確認のため、あなたのID（<span style={{ color: "#f0f0f5", fontFamily: "monospace" }}>@{profile.slug}</span>）を入力してください。
                </p>
                <input
                    type="text"
                    placeholder={`${profile.slug} と入力`}
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    style={{ height: 42, width: "100%", maxWidth: "100%", boxSizing: "border-box", borderRadius: 8, border: "1px solid rgba(255,80,80,0.25)", background: "#111118", color: "#f0f0f5", padding: "0 16px", outline: "none" }}
                />
                <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    disabled={deleteLoading || deleteConfirm !== profile.slug}
                    style={{ width: "100%", padding: "10px 0", borderRadius: 8, background: "rgba(255,59,48,0.12)", border: "1px solid rgba(255,59,48,0.3)", color: "#ff3b30", fontSize: 13, fontWeight: 500, cursor: deleteLoading ? "wait" : deleteConfirm === profile.slug ? "pointer" : "not-allowed", opacity: deleteLoading ? 0.7 : 1 }}
                >
                    {deleteLoading ? "処理中..." : "退会する"}
                </button>
                {deleteMsg ? (
                    <p style={{ margin: 0, fontSize: 11, color: "#ff9b9b" }}>
                        {deleteMsg}
                    </p>
                ) : null}
            </SectionCard>

        </div>
    );
}
