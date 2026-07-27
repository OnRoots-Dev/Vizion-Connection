// app/(auth)/login/LoginForm.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LoginAmbientBg } from "@/components/auth/LoginAmbientBg";
import { springDefault, springSnap, fadeReduced } from "@/lib/motion/apple-springs";
import { PRESS_SCALE } from "@/components/ui/Pressable";

const MARKETING_HOME_URL = "https://vizion-connection.jp/";

function EyeIcon({ open }: { open: boolean }) {
    return open ? (
        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ) : (
        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    );
}

/** コンパクトな Pulse ローダー（ボタン内） */
function InlinePulseSpinner() {
    return (
        <span className="relative inline-flex h-4 w-4 items-center justify-center" aria-hidden>
            <span
                className="absolute inset-0 rounded-full border-2 border-black/20 border-t-black animate-spin"
            />
        </span>
    );
}

export default function LoginForm() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") ?? "/dashboard";
    const confirmError = searchParams.get("error") === "confirmation_failed";
    const reduce = useReducedMotion();
    const press = reduce ? undefined : { scale: PRESS_SCALE };

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<{ message: string; code?: string } | null>(
        confirmError
            ? { message: "メール認証に失敗しました。リンクの有効期限が切れている場合は、認証メールを再送してください。" }
            : null,
    );
    const [resendLoading, setResendLoading] = useState(false);
    const [resendDone, setResendDone] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

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
            // フル遷移で httpOnly セッション Cookie を確実に次リクエストへ
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
            <LoginAmbientBg />

            <a
                href={MARKETING_HOME_URL}
                title="Vizion Connection"
                className="relative z-10 mb-6 inline-block active:scale-[0.97] transition-transform duration-100"
            >
                <Image
                    src="/images/vizion-connection-logo-6-cropped.png"
                    alt="Vizion Connection"
                    width={320}
                    height={86}
                    priority
                    className="inline-block h-[4.25rem] w-auto sm:h-[4.75rem]"
                />
            </a>

            <motion.div
                className={`relative z-10 w-full max-w-[400px] overflow-hidden px-6 py-8 sm:px-8 sm:py-9 ${
                    reduce ? "vc-login-glass vc-login-glass--solid" : "vc-login-glass"
                }`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={reduce ? fadeReduced : springSnap}
            >
                {/* グラス上面ハイライト（光が乗る縁） */}
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 25%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.22) 75%, transparent)",
                    }}
                    aria-hidden
                />
                {/* すりガラスの白霞 */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        borderRadius: "inherit",
                        background:
                            "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 35%, rgba(0,0,0,0.12) 100%)",
                    }}
                    aria-hidden
                />
                <div className="relative z-[1]">
                {/* 見出し */}
                <div className="mb-7 text-center">
                    <p
                        className="m-0 mb-3 text-[10px] font-bold uppercase tracking-[0.2em]"
                        style={{ color: "var(--electric)", fontFamily: "monospace" }}
                    >
                        LOG IN
                    </p>
                    <h1 className="m-0 text-[1.5rem] font-bold tracking-[-0.025em] text-white sm:text-[1.65rem]">
                        ログインする
                    </h1>
                    <p className="m-0 mx-auto mt-2.5 max-w-[30ch] text-[13.5px] leading-relaxed text-white/50">
                        あなたの挑戦と Pulse が、ここで待っています。
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="login-email" className="block text-xs font-medium text-white/40">
                            メールアドレス
                        </label>
                        <motion.div
                            animate={
                                reduce
                                    ? undefined
                                    : {
                                          boxShadow: emailFocused
                                              ? "0 0 0 1px var(--electric), 0 0 20px var(--electric-glow)"
                                              : "0 0 0 0 transparent",
                                      }
                            }
                            transition={springDefault}
                            className="rounded-xl"
                        >
                            <input
                                id="login-email"
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                                className="vc-auth-input"
                                style={emailFocused ? { borderColor: "transparent", boxShadow: "none" } : undefined}
                            />
                        </motion.div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <label htmlFor="login-password" className="block text-xs font-medium text-white/40">
                                パスワード
                            </label>
                            <Link
                                href="/reset-password"
                                className="text-[11px] text-white/35 underline-offset-2 transition-colors hover:text-white/65 hover:underline"
                            >
                                お忘れですか？
                            </Link>
                        </div>
                        <motion.div
                            animate={
                                reduce
                                    ? undefined
                                    : {
                                          boxShadow: passwordFocused
                                              ? "0 0 0 1px var(--electric), 0 0 20px var(--electric-glow)"
                                              : "0 0 0 0 transparent",
                                      }
                            }
                            transition={springDefault}
                            className="relative rounded-xl"
                        >
                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                placeholder="8文字以上"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                className="vc-auth-input pr-11"
                                style={passwordFocused ? { borderColor: "transparent", boxShadow: "none" } : undefined}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60 active:scale-[0.97]"
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </motion.div>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                key="error"
                                role="alert"
                                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, height: 0 }}
                                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, height: "auto" }}
                                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                                transition={reduce ? fadeReduced : springDefault}
                                className="overflow-hidden rounded-xl px-4 py-3 text-sm font-medium"
                                style={{
                                    border: "1px solid rgba(255,107,0,0.35)",
                                    background: "rgba(255,107,0,0.08)",
                                    color: "var(--flame)",
                                }}
                            >
                                <p className="m-0 leading-relaxed">{error.message}</p>
                                {error.code === "email_not_confirmed" && (
                                    <div className="mt-2.5">
                                        {resendDone ? (
                                            <p className="m-0 text-xs font-medium text-white/50">
                                                認証メールを再送しました。メールボックスをご確認ください。
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => void handleResend()}
                                                disabled={resendLoading || !form.email}
                                                className="text-xs font-semibold text-white/65 underline underline-offset-2 disabled:opacity-50"
                                            >
                                                {resendLoading ? "送信中…" : "認証メールを再送する"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileTap={loading ? undefined : press}
                        transition={springDefault}
                        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-70"
                        style={{
                            background: "var(--electric)",
                            boxShadow: loading ? "none" : "0 0 24px var(--electric-glow)",
                        }}
                    >
                        {loading && <InlinePulseSpinner />}
                        {loading ? "ログイン中…" : "ログインする"}
                    </motion.button>
                </form>

                <div className="mt-7 space-y-3 border-t border-white/[0.08] pt-6 text-center">
                    <p className="m-0 text-xs text-white/40">
                        アカウントをお持ちでない方
                        <Link
                            href="/register"
                            className="ml-1.5 font-semibold text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
                        >
                            無料で登録
                        </Link>
                    </p>
                    <p className="m-0 text-[11px] leading-relaxed text-white/30">
                        ログインすると、あなたの Pulse と挑戦の記録に戻れます。
                    </p>
                </div>
                </div>
            </motion.div>
        </div>
    );
}
