// app/(auth)/reset-password/ResetPasswordForm.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// ← 修正: 目アイコン
function EyeIcon({ open }: { open: boolean }) {
    return open ? (
        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ) : (
        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    );
}

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // ← 修正
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [isError, setIsError] = useState(false);
    const [done, setDone] = useState(false);

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
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#07070e] px-5 py-10 text-white">
            <Link href="/login" className="mb-10">
                <img src="/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" className="h-[3vw] w-auto opacity-80" />
            </Link>
            <div className="vc-auth-card flex flex-col gap-5">
                <div>
                    <h1 className="mb-1.5 text-[20px] font-extrabold">
                        {token ? "新しいパスワードを設定" : "パスワードをリセット"}
                    </h1>
                    <p className="m-0 text-[13px] leading-relaxed text-white/40">
                        {token ? "8文字以上の新しいパスワードを入力してください" : "登録済みのメールアドレスを入力してください"}
                    </p>
                </div>

                {!token ? (
                    <>
                        <input type="email" placeholder="you@example.com" value={email}
                            onChange={e => setEmail(e.target.value)} className="vc-auth-input" disabled={done} />
                        <button onClick={handleRequest} disabled={loading || !email || done}
                            style={{ padding: "13px", borderRadius: "12px", background: done ? "rgba(50,210,120,0.1)" : "#a78bfa", color: done ? "#32D278" : "#000", fontSize: "14px", fontWeight: 700, border: done ? "1px solid rgba(50,210,120,0.3)" : "none", cursor: loading || done ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                            {loading ? "送信中..." : done ? "✓ 送信しました" : "リセットメールを送信"}
                        </button>
                    </>
                ) : (
                    <>
                        {/* ← 修正: パスワード入力 + 目マーク */}
                        <div className="flex flex-col gap-1.5">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="新しいパスワード（8文字以上）"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="vc-auth-input pr-11"
                                    disabled={done}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center border-none bg-transparent text-white/30"
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                            {/* ← 修正: パスワード制限の注意書き */}
                            <p className="m-0 pl-1 text-[11px] leading-relaxed text-white/25">
                                8文字以上 ／ 半角英字・数字を含めてください
                            </p>
                        </div>
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
                <Link href="/login" className="text-center text-[12px] text-white/30">
                    ← ログインに戻る
                </Link>
            </div>
        </div>
    );
}
