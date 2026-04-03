// app/(auth)/login/LoginForm.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") ?? "/dashboard";

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false); // ← 修正
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.error ?? "メールアドレスまたはパスワードが正しくありません");
                return;
            }
            router.refresh();
            router.push(redirectTo);
        } catch {
            setError("通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
            style={{ background: "#07070e" }}>

            <Link href="/" className="tracking-[0.2em] text-sm font-bold text-white/60 hover:text-white transition-colors uppercase">
                <img src="/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" style={{ height: "13vw", width: "auto" }} />
            </Link>

            <div className="w-full max-w-md">
                <div className="mb-8 text-center space-y-1">
                    <h1 className="text-3xl font-bold text-white">LOGIN</h1>
                    <p className="text-sm text-white/40">アカウントにサインイン</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs text-white/40 font-medium">メールアドレス</label>
                        <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                            style={{ background: "#111118", border: "1.5px solid #1e1e2a" }}
                            onFocus={(e) => e.target.style.borderColor = "#a78bfa"}
                            onBlur={(e) => e.target.style.borderColor = "#1e1e2a"}
                        />
                    </div>

                    {/* ← 修正: パスワード入力 + 目マーク */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-white/40 font-medium">パスワード</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 outline-none transition-all"
                                style={{ background: "#111118", border: "1.5px solid #1e1e2a" }}
                                onFocus={(e) => e.target.style.borderColor = "#a78bfa"}
                                onBlur={(e) => e.target.style.borderColor = "#1e1e2a"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl px-4 py-3 text-sm text-red-400"
                            style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)" }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl py-3.5 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        style={{
                            background: loading ? "#333" : "#a78bfa",
                            color: "#000",
                            boxShadow: loading ? "none" : "0 0 24px rgba(167,139,250,0.4)",
                        }}
                    >
                        {loading ? "ログイン中..." : "ログイン"}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-white/30">
                    アカウントをお持ちでない方は
                    <Link href="/register" className="ml-1 text-white/60 hover:text-white underline">
                        先行登録
                    </Link>
                </p>
                <p className="mt-3 text-center text-xs text-white/30">
                    パスワードをお忘れの方は
                    <Link href="/reset-password" className="ml-1 text-white/60 hover:text-white underline">
                        こちら
                    </Link>
                </p>
            </div>
        </div>
    );
}