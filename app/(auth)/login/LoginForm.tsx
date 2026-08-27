// app/(auth)/login/LoginForm.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AuthShell } from "@/components/auth/AuthShell";
import { EyeIcon } from "@/components/auth/EyeIcon";
import { springDefault, fadeReduced } from "@/lib/motion/apple-springs";
import { PRESS_SCALE } from "@/components/ui/Pressable";
import { Field, Input } from "@/components/ui/field";

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
            // 初回ログイン含め、未完了ユーザーは必ず /dashboard へ遷移する。
            // DashboardClient が CareerWizardModal（プロフィール・キャリア登録）を自動表示する。
            // 完了済みユーザーのみ redirect パラメータを尊重する。
            const targetPath =
                !data.isOnboardingComplete
                    ? "/dashboard"
                    : redirectTo.startsWith("/")
                        ? redirectTo
                        : "/dashboard";
            const appBase = process.env.NEXT_PUBLIC_APP_BASE_URL || "https://app.vizion-connection.jp";
            window.location.assign(appBase + targetPath);
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
        <AuthShell
            variant="login"
            cardOverlay
            cardClassName="max-w-[400px] px-6 py-8 sm:px-8 sm:py-9"
        >
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
                    <Field label="メールアドレス" htmlFor="login-email">
                        <Input
                            id="login-email"
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </Field>

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
                        <div className="relative">
                            <Input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                placeholder="8文字以上"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                style={{ paddingRight: 44 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60 active:scale-[0.97]"
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>
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
        </AuthShell>
    );
}
