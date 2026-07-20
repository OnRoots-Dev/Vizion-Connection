// app/(auth)/reset-password/ResetPasswordForm.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AuthAmbientBg } from "@/components/auth/AuthAmbientBg";
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

function InlinePulseSpinner() {
    return (
        <span className="relative inline-flex h-4 w-4 items-center justify-center" aria-hidden>
            <span className="absolute inset-0 rounded-full border-2 border-black/20 border-t-black animate-spin" />
        </span>
    );
}

function SuccessCheckIcon() {
    return (
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
                d="M6.5 12.5 10 16l7.5-8"
                stroke="var(--electric)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const reduce = useReducedMotion();
    const press = reduce ? undefined : { scale: PRESS_SCALE };

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmFocused, setConfirmFocused] = useState(false);

    async function handleRequest(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/account/reset-password/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (data.ok) {
                setDone(true);
            } else {
                setError(data.error ?? "エラーが発生しました");
            }
        } catch {
            setError("通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    }

    async function handleConfirm(e: React.FormEvent) {
        e.preventDefault();
        if (!token || !newPassword) return;
        if (newPassword.length < 8) {
            setError("パスワードは8文字以上で入力してください");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("パスワードが一致しません");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/account/reset-password/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();
            if (data.ok) {
                setDone(true);
                setTimeout(() => router.push("/login"), 2400);
            } else {
                setError(data.error ?? "エラーが発生しました");
            }
        } catch {
            setError("通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    }

    const isConfirmStep = Boolean(token);

    return (
        <div className="vc-auth-shell">
            <AuthAmbientBg />

            <a
                href={MARKETING_HOME_URL}
                title="Vizion Connection"
                className="relative z-10 mb-6 inline-block active:scale-[0.97] transition-transform duration-100"
            >
                <Image
                    src="/images/Vizion_Connection_logo-wt.png"
                    alt="Vizion Connection"
                    width={320}
                    height={86}
                    priority
                    className="inline-block h-[4.25rem] w-auto sm:h-[4.75rem]"
                />
            </a>

            <motion.div
                className="relative z-10 w-full max-w-[400px] rounded-[28px] border border-white/[0.08] px-6 py-8 sm:px-8 sm:py-9"
                style={{
                    background: "rgba(10,10,10,0.72)",
                    backdropFilter: reduce ? "none" : "blur(24px) saturate(160%)",
                    WebkitBackdropFilter: reduce ? "none" : "blur(24px) saturate(160%)",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
                }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={reduce ? fadeReduced : springSnap}
            >
                <AnimatePresence mode="wait">
                    {/* ── 送信完了（リクエスト） ── */}
                    {!isConfirmStep && done ? (
                        <motion.div
                            key="request-done"
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                            transition={reduce ? fadeReduced : springDefault}
                            className="text-center"
                        >
                            <div
                                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                                style={{
                                    background: "linear-gradient(145deg, rgba(200,232,0,0.18), rgba(200,232,0,0.05))",
                                    border: "1.5px solid rgba(200,232,0,0.35)",
                                    boxShadow: "0 0 28px var(--electric-glow)",
                                }}
                            >
                                <SuccessCheckIcon />
                            </div>
                            <p
                                className="m-0 mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                                style={{ color: "var(--electric)", fontFamily: "monospace" }}
                            >
                                CHECK YOUR INBOX
                            </p>
                            <h1 className="m-0 text-[1.35rem] font-bold tracking-[-0.02em] text-white sm:text-[1.5rem]">
                                メールを送信しました
                            </h1>
                            <p className="m-0 mx-auto mt-3 max-w-[32ch] text-[13.5px] leading-relaxed text-white/50">
                                登録済みのメールアドレス宛に、パスワード再設定用のリンクをお送りしました。
                            </p>

                            <div className="mt-5 space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left">
                                <p className="m-0 text-[11px] leading-relaxed text-white/40">
                                    メールが届かない場合は、迷惑メールフォルダやプロモーションタブもご確認ください。
                                </p>
                                <p className="m-0 text-[11px] leading-relaxed text-white/35">
                                    リンクの有効期限は送信から約1時間です。期限切れの場合は、もう一度お手続きください。
                                </p>
                            </div>

                            <div className="mt-7 space-y-3">
                                <Link href="/login" className="block">
                                    <motion.span
                                        whileTap={press}
                                        transition={springDefault}
                                        className="inline-flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-black text-black"
                                        style={{
                                            background: "var(--electric)",
                                            boxShadow: "0 0 24px var(--electric-glow)",
                                        }}
                                    >
                                        ログイン画面へ
                                    </motion.span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDone(false);
                                        setEmail("");
                                        setError("");
                                    }}
                                    className="w-full text-xs text-white/40 underline-offset-4 transition-colors hover:text-white/70 hover:underline"
                                >
                                    別のメールアドレスで再送信
                                </button>
                            </div>
                        </motion.div>
                    ) : isConfirmStep && done ? (
                        /* ── 変更完了 ── */
                        <motion.div
                            key="confirm-done"
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                            transition={reduce ? fadeReduced : springDefault}
                            className="text-center"
                        >
                            <div
                                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                                style={{
                                    background: "linear-gradient(145deg, rgba(200,232,0,0.18), rgba(200,232,0,0.05))",
                                    border: "1.5px solid rgba(200,232,0,0.35)",
                                    boxShadow: "0 0 28px var(--electric-glow)",
                                }}
                            >
                                <SuccessCheckIcon />
                            </div>
                            <p
                                className="m-0 mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                                style={{ color: "var(--electric)", fontFamily: "monospace" }}
                            >
                                PASSWORD UPDATED
                            </p>
                            <h1 className="m-0 text-[1.35rem] font-bold tracking-[-0.02em] text-white sm:text-[1.5rem]">
                                パスワードを変更しました
                            </h1>
                            <p className="m-0 mx-auto mt-3 max-w-[32ch] text-[13.5px] leading-relaxed text-white/50">
                                新しいパスワードでログインできます。確認メールもお送りしています。ログイン画面へ移動します…
                            </p>
                            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left">
                                <p className="m-0 text-[11px] leading-relaxed text-white/40">
                                    身に覚えのない変更の場合は、すぐにサポートへご連絡のうえ、再度パスワードを変更してください。
                                </p>
                            </div>
                            <div className="mt-7">
                                <Link href="/login" className="block">
                                    <motion.span
                                        whileTap={press}
                                        transition={springDefault}
                                        className="inline-flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-black text-black"
                                        style={{
                                            background: "var(--electric)",
                                            boxShadow: "0 0 24px var(--electric-glow)",
                                        }}
                                    >
                                        今すぐログインする
                                    </motion.span>
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        /* ── フォーム ── */
                        <motion.div
                            key={isConfirmStep ? "confirm-form" : "request-form"}
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                            transition={reduce ? fadeReduced : springDefault}
                        >
                            <div className="mb-7 text-center">
                                <p
                                    className="m-0 mb-3 text-[10px] font-bold uppercase tracking-[0.2em]"
                                    style={{ color: "var(--electric)", fontFamily: "monospace" }}
                                >
                                    {isConfirmStep ? "NEW PASSWORD" : "RESET PASSWORD"}
                                </p>
                                <h1 className="m-0 text-[1.5rem] font-bold tracking-[-0.025em] text-white sm:text-[1.65rem]">
                                    {isConfirmStep ? "パスワードを再設定" : "パスワードをリセット"}
                                </h1>
                                <p className="m-0 mx-auto mt-2.5 max-w-[30ch] text-[13.5px] leading-relaxed text-white/45">
                                    {isConfirmStep
                                        ? "新しいパスワードを2回入力して確定してください。"
                                        : "登録済みのメールアドレスを入力すると、再設定用のリンクをお送りします。"}
                                </p>
                            </div>

                            {!isConfirmStep ? (
                                <form onSubmit={(e) => void handleRequest(e)} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="reset-email" className="block text-xs font-medium text-white/40">
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
                                                id="reset-email"
                                                type="email"
                                                required
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => setEmailFocused(true)}
                                                onBlur={() => setEmailFocused(false)}
                                                className="vc-auth-input"
                                                style={
                                                    emailFocused
                                                        ? { borderColor: "transparent", boxShadow: "none" }
                                                        : undefined
                                                }
                                            />
                                        </motion.div>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {error && (
                                            <motion.div
                                                key="err"
                                                role="alert"
                                                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={reduce ? { opacity: 0 } : { opacity: 0 }}
                                                transition={reduce ? fadeReduced : springDefault}
                                                className="rounded-xl px-4 py-3 text-sm font-medium leading-relaxed"
                                                style={{
                                                    border: "1px solid rgba(255,107,0,0.35)",
                                                    background: "rgba(255,107,0,0.08)",
                                                    color: "var(--flame)",
                                                }}
                                            >
                                                {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <motion.button
                                        type="submit"
                                        disabled={loading || !email.trim()}
                                        whileTap={loading ? undefined : press}
                                        transition={springDefault}
                                        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-70"
                                        style={{
                                            background: "var(--electric)",
                                            boxShadow: loading ? "none" : "0 0 24px var(--electric-glow)",
                                        }}
                                    >
                                        {loading && <InlinePulseSpinner />}
                                        {loading ? "送信中…" : "リセットメールを送信"}
                                    </motion.button>
                                </form>
                            ) : (
                                <form onSubmit={(e) => void handleConfirm(e)} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="reset-password" className="block text-xs font-medium text-white/40">
                                            新しいパスワード
                                        </label>
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
                                                id="reset-password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                autoComplete="new-password"
                                                placeholder="8文字以上"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                onFocus={() => setPasswordFocused(true)}
                                                onBlur={() => setPasswordFocused(false)}
                                                className="vc-auth-input pr-11"
                                                style={
                                                    passwordFocused
                                                        ? { borderColor: "transparent", boxShadow: "none" }
                                                        : undefined
                                                }
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
                                        <p className="m-0 pl-0.5 text-[10px] leading-relaxed text-white/25">
                                            8文字以上 ／ 半角英字・数字を含めてください
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="reset-password-confirm" className="block text-xs font-medium text-white/40">
                                            新しいパスワード（確認）
                                        </label>
                                        <motion.div
                                            animate={
                                                reduce
                                                    ? undefined
                                                    : {
                                                          boxShadow: confirmFocused
                                                              ? "0 0 0 1px var(--electric), 0 0 20px var(--electric-glow)"
                                                              : "0 0 0 0 transparent",
                                                      }
                                            }
                                            transition={springDefault}
                                            className="relative rounded-xl"
                                        >
                                            <input
                                                id="reset-password-confirm"
                                                type={showConfirm ? "text" : "password"}
                                                required
                                                autoComplete="new-password"
                                                placeholder="もう一度入力"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                onFocus={() => setConfirmFocused(true)}
                                                onBlur={() => setConfirmFocused(false)}
                                                className="vc-auth-input pr-11"
                                                style={
                                                    confirmFocused
                                                        ? { borderColor: "transparent", boxShadow: "none" }
                                                        : undefined
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm((v) => !v)}
                                                aria-label={showConfirm ? "パスワードを隠す" : "パスワードを表示"}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60 active:scale-[0.97]"
                                            >
                                                <EyeIcon open={showConfirm} />
                                            </button>
                                        </motion.div>
                                        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                                            <p className="m-0 pl-0.5 text-[10px] leading-relaxed" style={{ color: "var(--flame)" }}>
                                                パスワードが一致していません
                                            </p>
                                        )}
                                        {confirmPassword.length > 0 && newPassword === confirmPassword && newPassword.length >= 8 && (
                                            <p className="m-0 pl-0.5 text-[10px] leading-relaxed text-[#32D278]">
                                                パスワードが一致しています
                                            </p>
                                        )}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {error && (
                                            <motion.div
                                                key="err2"
                                                role="alert"
                                                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={reduce ? { opacity: 0 } : { opacity: 0 }}
                                                transition={reduce ? fadeReduced : springDefault}
                                                className="rounded-xl px-4 py-3 text-sm font-medium leading-relaxed"
                                                style={{
                                                    border: "1px solid rgba(255,107,0,0.35)",
                                                    background: "rgba(255,107,0,0.08)",
                                                    color: "var(--flame)",
                                                }}
                                            >
                                                {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <motion.button
                                        type="submit"
                                        disabled={loading || !newPassword || !confirmPassword}
                                        whileTap={loading ? undefined : press}
                                        transition={springDefault}
                                        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-70"
                                        style={{
                                            background: "var(--electric)",
                                            boxShadow: loading ? "none" : "0 0 24px var(--electric-glow)",
                                        }}
                                    >
                                        {loading && <InlinePulseSpinner />}
                                        {loading ? "変更中…" : "パスワードを再設定する"}
                                    </motion.button>
                                </form>
                            )}

                            <div className="mt-7 space-y-3 border-t border-white/[0.06] pt-6 text-center">
                                <p className="m-0 text-xs text-white/35">
                                    <Link
                                        href="/login"
                                        className="font-semibold text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
                                    >
                                        ログイン画面に戻る
                                    </Link>
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
