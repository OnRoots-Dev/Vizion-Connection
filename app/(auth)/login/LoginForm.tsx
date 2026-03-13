// app/(auth)/login/LoginForm.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") ?? "/dashboard";

    const [form, setForm] = useState({ email: "", password: "" });
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

            <Link href="/" className="mb-10 tracking-[0.2em] text-sm font-bold text-white/60 hover:text-white transition-colors uppercase">
                <img src="/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" style={{ height: "20vw", width: "auto" }} />
            </Link>

            <div className="w-full max-w-md">
                <div className="mb-8 text-center space-y-1">
                    <h1 className="text-2xl font-bold text-white">ログイン</h1>
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

                    <div className="space-y-1.5">
                        <label className="text-xs text-white/40 font-medium">パスワード</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                            style={{ background: "#111118", border: "1.5px solid #1e1e2a" }}
                            onFocus={(e) => e.target.style.borderColor = "#a78bfa"}
                            onBlur={(e) => e.target.style.borderColor = "#1e1e2a"}
                        />
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