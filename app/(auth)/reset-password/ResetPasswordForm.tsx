"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [isError, setIsError] = useState(false);
    const [done, setDone] = useState(false);

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "12px 16px", borderRadius: "12px",
        background: "#111118", border: "1.5px solid #1e1e2a",
        color: "#fff", fontSize: "14px", outline: "none",
    };

    async function handleRequest() {
        if (!email) return;
        setLoading(true); setMsg(""); setIsError(false);
        try {
            const res = await fetch("/api/account/reset-password/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.ok) {
                setMsg("パスワードリセット用のメールを送信しました。メールをご確認ください。");
                setDone(true);
            } else {
                setIsError(true);
                setMsg(data.error ?? "エラーが発生しました");
            }
        } catch {
            setIsError(true); setMsg("通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    }

    async function handleConfirm() {
        if (!token || !newPassword) return;
        setLoading(true); setMsg(""); setIsError(false);
        try {
            const res = await fetch("/api/account/reset-password/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();
            if (data.ok) {
                setMsg("パスワードを変更しました。ログインページへ移動します...");
                setDone(true);
                setTimeout(() => router.push("/login"), 2000);
            } else {
                setIsError(true);
                setMsg(data.error ?? "エラーが発生しました");
            }
        } catch {
            setIsError(true); setMsg("通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: "100vh", background: "#07070e", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
            <Link href="/login" style={{ marginBottom: "40px" }}>
                <img src="/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" style={{ height: "3vw", width: "auto", opacity: 0.8 }} />
            </Link>
            <div style={{ width: "100%", maxWidth: "400px", background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "36px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                    <h1 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 6px" }}>
                        {token ? "新しいパスワードを設定" : "パスワードをリセット"}
                    </h1>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
                        {token ? "8文字以上の新しいパスワードを入力してください" : "登録済みのメールアドレスを入力してください"}
                    </p>
                </div>
                {!token ? (
                    <>
                        <input type="email" placeholder="you@example.com" value={email}
                            onChange={e => setEmail(e.target.value)} style={inputStyle} disabled={done} />
                        <button onClick={handleRequest} disabled={loading || !email || done}
                            style={{ padding: "13px", borderRadius: "12px", background: done ? "rgba(50,210,120,0.1)" : "#a78bfa", color: done ? "#32D278" : "#000", fontSize: "14px", fontWeight: 700, border: done ? "1px solid rgba(50,210,120,0.3)" : "none", cursor: loading || done ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                            {loading ? "送信中..." : done ? "✓ 送信しました" : "リセットメールを送信"}
                        </button>
                    </>
                ) : (
                    <>
                        <input type="password" placeholder="新しいパスワード（8文字以上）" value={newPassword}
                            onChange={e => setNewPassword(e.target.value)} style={inputStyle} disabled={done} />
                        <button onClick={handleConfirm} disabled={loading || !newPassword || done}
                            style={{ padding: "13px", borderRadius: "12px", background: done ? "rgba(50,210,120,0.1)" : "#a78bfa", color: done ? "#32D278" : "#000", fontSize: "14px", fontWeight: 700, border: done ? "1px solid rgba(50,210,120,0.3)" : "none", cursor: loading || done ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                            {loading ? "変更中..." : done ? "✓ 変更しました" : "パスワードを変更する"}
                        </button>
                    </>
                )}
                {msg && (
                    <div style={{ padding: "12px 14px", borderRadius: "10px", fontSize: "13px", lineHeight: 1.6, background: isError ? "rgba(255,80,80,0.08)" : "rgba(50,210,120,0.08)", border: `1px solid ${isError ? "rgba(255,80,80,0.2)" : "rgba(50,210,120,0.2)"}`, color: isError ? "#ff5050" : "#32D278" }}>
                        {msg}
                    </div>
                )}
                <Link href="/login" style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                    ← ログインに戻る
                </Link>
            </div>
        </div>
    );
}