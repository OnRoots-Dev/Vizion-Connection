// app/(auth)/login/LoginForm.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { LottieAnim } from "@/components/ui/LottieAnim";

const MARKETING_HOME_URL = "https://vizion-connection.jp/";

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
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") ?? "/dashboard";
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<{ message: string; code?: string } | null>(null);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendDone, setResendDone] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResendDone(false);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!data.success) {
                setError({
                    message: data.message ?? data.error ?? "メールアドレスまたはパスワードが正しくありません",
                    code: data.code,
                });
                setLoading(false);
                return;
            }
            // Use a full navigation so the next request definitely carries
            // the freshly-set httpOnly session cookie in production.
            if (!data.isOnboardingComplete) {
                window.location.assign("/onboarding");
            } else {
                const appBase = "https://app.vizion-connection.jp";
                const target = redirectTo.startsWith("/")
                    ? appBase + redirectTo
                    : redirectTo;
                window.location.assign(target);
            }
        } catch {
            setError({ message: "通信エラーが発生しました" });
            setLoading(false);
        }
    }

    async function handleResend() {
        setResendLoading(true);
        try {
            await fetch("/api/register/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email }),
            });
        } finally {
            setResendLoading(false);
            setResendDone(true);
        }
    }

    return (
        <div className="vc-auth-shell">
            <a
                href={MARKETING_HOME_URL}
                title="Vizion Connection"
                className="tracking-[0.2em] text-sm font-bold text-white/60 hover:text-white transition-colors uppercase"
            >
                <Image
                    src="/images/Vizion_Connection_logo-wt.png"
                    alt="Vizion Connection"
                    width={280}
                    height={90}
                    priority
                    className="h-[13vw] max-h-24 w-auto"
                />
            </a>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md"
            >
                <div className="mb-8 text-center space-y-1">
                    <p style={{ margin: "0 0 6px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--electric)" }}>
                        VIZION CONNECTION
                    </p>
                    <h1 className="text-2xl font-bold text-white">Pulseに戻る</h1>
                    <p className="text-sm text-white/45">あなたの挑戦が待っています。</p>
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
                            className="vc-auth-input"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-white/40 font-medium">パスワード</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="vc-auth-input pr-11"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div
                            className="rounded-xl px-4 py-3 text-sm font-medium space-y-2"
                            style={{
                                border: "1px solid rgba(255,107,0,0.35)",
                                background: "rgba(255,107,0,0.08)",
                                color: "var(--flame)",
                            }}
                        >
                            <p>{error.message}</p>
                            {error.code === 'email_not_confirmed' && (
                                resendDone ? (
                                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                                        認証メールを再送しました。メールボックスをご確認ください。
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resendLoading}
                                        className="text-xs underline disabled:opacity-50"
                                        style={{ color: "rgba(255,255,255,0.6)" }}
                                    >
                                        {resendLoading ? "送信中..." : "認証メールを再送する →"}
                                    </button>
                                )
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
                        style={{
                            background: "var(--electric)",
                            boxShadow: loading ? "none" : "0 0 24px var(--electric-glow)",
                        }}
                    >
                        {loading && <LottieAnim src="/lottie/loading-pulse.json" loop className="h-5 w-5" />}
                        {loading ? "ログイン中..." : "ログインしてPulseへ"}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-white/30">
                    アカウントをお持ちでない方
                    <Link href="/register" className="ml-1 text-white/60 hover:text-white underline">
                        登録はこちら
                    </Link>
                </p>
                <p className="mt-3 text-center text-xs text-white/30">
                    パスワードをお忘れの方は
                    <Link href="/reset-password" className="ml-1 text-white/60 hover:text-white underline">
                        こちら
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
