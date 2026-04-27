"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { UserRecord } from "@/features/auth/types";

const MARKETING_HOME_URL = "https://vizion-connection.jp/";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};

const t = {
    bg: "#07070e", surface: "#0d0d1a",
    border: "rgba(255,255,255,0.07)", text: "#fff", sub: "rgba(255,255,255,0.45)",
};

export default function SettingsClient({ user, onBack }: { user: UserRecord; onBack?: () => void }) {
    const router = useRouter();
    const rl = ROLE_COLOR[user.role] ?? "#a78bfa";

    // メール変更
    const [newEmail, setNewEmail] = useState("");
    const [emailMsg, setEmailMsg] = useState("");
    const [emailLoading, setEmailLoading] = useState(false);

    // パスワード変更
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    // 退会
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteMsg, setDeleteMsg] = useState("");

    async function handleEmailChange() {
        if (!newEmail) return;
        setEmailLoading(true);
        setEmailMsg("");
        try {
            const res = await fetch("/api/account/change-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newEmail }),
            });
            const data = await res.json();
            setEmailMsg(data.ok ? "確認メールを送信しました" : data.error ?? "エラーが発生しました");
        } catch {
            setEmailMsg("通信エラーが発生しました");
        } finally {
            setEmailLoading(false);
        }
    }

    async function handlePasswordChange() {
        if (!currentPassword || !newPassword) return;
        setPasswordLoading(true);
        setPasswordMsg("");
        try {
            const res = await fetch("/api/account/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            setPasswordMsg(data.ok ? "パスワードを変更しました" : data.error ?? "エラーが発生しました");
            if (data.ok) { setCurrentPassword(""); setNewPassword(""); }
        } catch {
            setPasswordMsg("通信エラーが発生しました");
        } finally {
            setPasswordLoading(false);
        }
    }

    async function handleDelete() {
        if (deleteConfirm !== user.slug) return;
        setDeleteLoading(true);
        setDeleteMsg("");
        try {
            const res = await fetch("/api/account/delete", { method: "POST" });
            const data = await res.json();
            if (data.ok) {
                await fetch("/api/logout", { method: "POST" });
                window.location.assign(MARKETING_HOME_URL);
            } else {
                setDeleteMsg(data.error ?? "エラーが発生しました");
            }
        } catch {
            setDeleteMsg("通信エラーが発生しました");
        } finally {
            setDeleteLoading(false);
        }
    }

    const card = (children: React.ReactNode) => (
        <div style={{ borderRadius: "16px", padding: "20px", background: t.surface, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: "14px" }}>
            {children}
        </div>
    );

    const sectionTitle = (text: string) => (
        <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub, margin: 0, opacity: 0.55 }}>{text}</p>
    );

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 12px", borderRadius: "10px",
        background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`,
        color: t.text, fontSize: "13px", outline: "none",
    };

    const msgStyle = (ok: boolean): React.CSSProperties => ({
        fontSize: "12px", padding: "10px 14px", borderRadius: "9px",
        background: ok ? "rgba(50,210,120,0.08)" : "rgba(255,80,80,0.08)",
        border: `1px solid ${ok ? "rgba(50,210,120,0.2)" : "rgba(255,80,80,0.2)"}`,
        color: ok ? "#32D278" : "#ff5050",
    });

    return (
        <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>

            {/* Header */}
            <div style={{ position: "sticky", top: 0, zIndex: 30, padding: "14px 20px", background: "rgba(7,7,14,0.95)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
                <button onClick={() => onBack ? onBack() : router.push("/dashboard")} title="戻る"
                    style={{ padding: "7px", borderRadius: "9px", background: "rgba(255,255,255,0.06)", border: `1px solid ${t.border}`, cursor: "pointer", display: "flex" }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <h1 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>アカウント設定</h1>
                <span style={{ marginLeft: "auto", fontSize: "9px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", background: `${rl}15`, color: rl, border: `1px solid ${rl}30` }}>
                    {user.role.toUpperCase()}
                </span>
            </div>

            <div style={{ maxWidth: "640px", margin: "0 auto", padding: "28px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* アカウント情報 */}
                {card(<>
                    {sectionTitle("Account Info")}
                    {[
                        { label: "表示名", value: user.displayName },
                        { label: "ID", value: `@${user.slug}` },
                        { label: "メールアドレス", value: user.email },
                        { label: "ロール", value: user.role },
                        { label: "登録日", value: new Date(user.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" }) },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.border}` }}>
                            <span style={{ fontSize: "11px", color: t.sub }}>{label}</span>
                            <span style={{ fontSize: "11px", color: t.text, maxWidth: "60%", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
                        </div>
                    ))}
                </>)}

                {/* メールアドレス変更 */}
                {card(<>
                    {sectionTitle("メールアドレス変更")}
                    <input
                        type="email"
                        placeholder="新しいメールアドレス"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        style={inputStyle}
                    />
                    {emailMsg && <p style={msgStyle(emailMsg.includes("送信"))}>{emailMsg}</p>}
                    <motion.button onClick={handleEmailChange} disabled={emailLoading || !newEmail} whileTap={{ scale: 0.97 }}
                        style={{ padding: "11px", borderRadius: "10px", background: rl, color: "#000", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer", opacity: emailLoading || !newEmail ? 0.5 : 1 }}>
                        {emailLoading ? "送信中..." : "確認メールを送信"}
                    </motion.button>
                </>)}

                {/* パスワード変更 */}
                {card(<>
                    {sectionTitle("パスワード変更")}
                    <input
                        type="password"
                        placeholder="現在のパスワード"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        placeholder="新しいパスワード（8文字以上）"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={inputStyle}
                    />
                    {passwordMsg && <p style={msgStyle(passwordMsg.includes("変更しました"))}>{passwordMsg}</p>}
                    <motion.button onClick={handlePasswordChange} disabled={passwordLoading || !currentPassword || !newPassword} whileTap={{ scale: 0.97 }}
                        style={{ padding: "11px", borderRadius: "10px", background: rl, color: "#000", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer", opacity: passwordLoading || !currentPassword || !newPassword ? 0.5 : 1 }}>
                        {passwordLoading ? "変更中..." : "パスワードを変更"}
                    </motion.button>
                </>)}

                {/* 退会 */}
                {card(<>
                    {sectionTitle("退会")}
                    <p style={{ fontSize: "12px", color: t.sub, lineHeight: 1.7, margin: 0 }}>
                        退会するとプロフィールが非公開になり、復元できません。確認のため、あなたのID（<span style={{ color: t.text, fontFamily: "monospace" }}>{user.slug}</span>）を入力してください。
                    </p>
                    <input
                        type="text"
                        placeholder={`${user.slug} と入力`}
                        value={deleteConfirm}
                        onChange={e => setDeleteConfirm(e.target.value)}
                        style={{ ...inputStyle, border: "1px solid rgba(255,80,80,0.2)" }}
                    />
                    {deleteMsg && <p style={msgStyle(false)}>{deleteMsg}</p>}
                    <motion.button
                        onClick={handleDelete}
                        disabled={deleteConfirm !== user.slug || deleteLoading}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            padding: "11px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, border: "1px solid rgba(255,80,80,0.3)",
                            background: deleteConfirm === user.slug ? "rgba(255,80,80,0.12)" : "rgba(255,255,255,0.03)",
                            color: deleteConfirm === user.slug ? "#ff5050" : t.sub,
                            cursor: deleteConfirm === user.slug ? "pointer" : "not-allowed",
                            transition: "all 0.2s",
                        }}>
                        {deleteLoading ? "処理中..." : "退会する"}
                    </motion.button>
                </>)}

                <div style={{ height: "40px" }} />
            </div>
        </div>
    );
}
