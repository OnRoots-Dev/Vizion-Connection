// app/(auth)/register/RegisterForm.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { registerSchema } from "@/features/auth/validation/register-schema";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthPulseLoader, AuthSuccessMark } from "@/components/auth/AuthStatusMotion";
import { EyeIcon } from "@/components/auth/EyeIcon";
import { springDefault, springSnap, fadeReduced } from "@/lib/motion/apple-springs";
import { PRESS_SCALE } from "@/components/ui/Pressable";
import { authGlassTokens } from "@/lib/design/tokens";
import { controlStyle } from "@/components/ui/field";

const TERMS_URL = "https://tarry-plywood-9b9.notion.site/Vizion-Connection-287089f25fae80569ec8f5263bbc6fd2?source=copy_link";
const PRIVACY_URL = "https://tarry-plywood-9b9.notion.site/287089f25fae80e8a771d66b1ee4fa82?source=copy_link";

type Role = "Athlete" | "Trainer" | "Crew" | "Business";

const ROLES: {
    value: Role;
    label: string;
    displayName: string;
    color: string;
    detail: string;
}[] = [
    {
        value: "Athlete", label: "Athlete", displayName: "アスリート", color: "#FF5050",
        detail: "競技に取り組むすべての選手。競技歴・レベル・プロアマ問わず。",
    },
    {
        value: "Trainer", label: "Trainer", displayName: "トレーナー", color: "#30de1d",
        detail: "スポーツの指導・サポートをしている方向け。",
    },
    {
        value: "Crew", label: "Crew", displayName: "サポーター", color: "#FFC81E",
        detail: "ファン、サポーター、家族、友人、関係者の方向け。",
    },
    {
        value: "Business", label: "Business", displayName: "ビジネス", color: "#3C8CFF",
        detail: "スポーツ界で注目・広告・エリア応援を検討している企業・団体の方向け。",
    },
];

const STEP_LABELS = ["ロール", "基本情報", "確認", "完了"];

// エラー表示（Flame Orange）
function ErrorBox({ message }: { message: string }) {
    return (
        <div
            className="rounded-xl px-4 py-3 text-sm font-medium"
            style={{
                border: "1px solid rgba(255,107,0,0.35)",
                background: "rgba(255,107,0,0.08)",
                color: "var(--flame)",
            }}
        >
            {message}
        </div>
    );
}

// ステップインジケーター — spring で現在値から次へ（中断可能な見た目の遷移）
function StepBar({ current }: { current: number }) {
    const reduce = useReducedMotion();
    return (
        <div className="mb-8 flex items-center justify-center gap-2">
            {STEP_LABELS.map((label, i) => {
                const step = i + 1;
                const active = step === current;
                const done = step < current;
                return (
                    <div key={label} className="flex items-center gap-2">
                        <div className="flex flex-col items-center gap-1">
                            <motion.div
                                layout
                                animate={{
                                    scale: active ? 1.08 : 1,
                                    backgroundColor: active || done ? "var(--electric)" : "rgba(255,255,255,0.06)",
                                    color: active || done ? "#000" : "rgba(255,255,255,0.3)",
                                    boxShadow: active ? "0 0 14px var(--electric-glow)" : "0 0 0 transparent",
                                }}
                                transition={reduce ? fadeReduced : springSnap}
                                className="flex h-7 w-7 items-center justify-center rounded-full font-display text-[11px] font-black"
                            >
                                {done ? "✓" : step}
                            </motion.div>
                            <motion.span
                                animate={{ color: active ? "var(--electric)" : "rgba(255,255,255,0.25)" }}
                                transition={reduce ? fadeReduced : springDefault}
                                className="text-[9px] tracking-wider"
                            >
                                {label}
                            </motion.span>
                        </div>
                        {step < STEP_LABELS.length && (
                            <motion.div
                                animate={{ backgroundColor: done ? "var(--electric)" : "rgba(255,255,255,0.1)" }}
                                transition={reduce ? fadeReduced : springDefault}
                                className="mb-4 h-px w-6 sm:w-10"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/** ステップ間: spring ベース（CSS duration 固定ではなく中断可能） */
const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 36 : -36, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -28 : 28, opacity: 0 }),
};

const stepTransition = {
    type: "spring" as const,
    stiffness: 380,
    damping: 34,
    mass: 0.85,
};

export default function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reduce = useReducedMotion();
    const refSlug = searchParams.get("ref") ?? "";
    const redirectTo = searchParams.get("redirect") ?? "";
    const roleFromQuery = searchParams.get("role");

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const press = reduce ? undefined : { scale: PRESS_SCALE };
    const stepTr = reduce ? fadeReduced : stepTransition;

    const [role, setRole] = useState<Role>(() => {
        if (roleFromQuery && ROLES.some((r) => r.value === roleFromQuery)) {
            return roleFromQuery as Role;
        }
        return "Athlete";
    });

    useEffect(() => {
        const q = searchParams.get("role");
        if (q && ROLES.some((r) => r.value === q)) {
            setRole(q as Role);
        }
    }, [searchParams]);

    const [form, setForm] = useState({
        slug: "",
        email: "",
        password: "",
        referrerSlug: refSlug,
        termsAccepted: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [error, setError] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [registerState, setRegisterState] = useState<
        | null
        | { kind: "pending_verification"; email: string; resent: boolean }
        | { kind: "already_registered"; email: string }
    >(null);

    const selectedRole = ROLES.find((r) => r.value === role)!;

    function goTo(next: number) {
        setDirection(next > step ? 1 : -1);
        setError("");
        setStep(next);
    }

    function buildPayload() {
        return {
            slug: form.slug,
            email: form.email,
            password: form.password,
            referrerSlug: form.referrerSlug || undefined,
            termsAccepted: form.termsAccepted,
            role,
        };
    }

    function handleStep2Next() {
        const parsed = registerSchema.safeParse({ ...buildPayload(), redirectTo: undefined });
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "入力内容を確認してください");
            return;
        }
        goTo(3);
    }

    async function handleSubmit() {
        goTo(4);
        setSubmitting(true);
        setError("");
        setRegisterState(null);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...buildPayload(), redirectTo }),
            });
            const data = await res.json();
            if (!data.success) {
                if (data.code === "PENDING_VERIFICATION") {
                    setRegisterState({ kind: "pending_verification", email: data.email ?? form.email, resent: Boolean(data.resent) });
                    return;
                }
                if (data.code === "ALREADY_REGISTERED") {
                    setRegisterState({ kind: "already_registered", email: data.email ?? form.email });
                    return;
                }
                setError(data.error ?? "エラーが発生しました");
                setDirection(-1);
                setStep(3);
                return;
            }
            setSucceeded(true);
            const next = redirectTo
                ? `/login?redirect=${encodeURIComponent(redirectTo)}`
                : "/login";
            setTimeout(() => router.push(next), 1600);
        } catch {
            setError("通信エラーが発生しました");
            setDirection(-1);
            setStep(3);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleResend() {
        setResendLoading(true);
        setError("");
        try {
            const res = await fetch("/api/register/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, redirectTo }),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.error ?? "認証メールの再送に失敗しました");
                return;
            }
            setRegisterState({ kind: "pending_verification", email: form.email, resent: true });
        } catch {
            setError("通信エラーが発生しました");
        } finally {
            setResendLoading(false);
        }
    }

    function resetToForm() {
        setRegisterState(null);
        setError("");
        setSucceeded(false);
        setDirection(-1);
        setStep(2);
    }

    return (
        <AuthShell
            logoMarginClass="mb-5"
            logoClassName="h-[4.5rem] w-auto sm:h-20"
            logoWithTitle={false}
            animated={false}
            cardClassName="max-w-md px-5 py-7 sm:px-7 sm:py-8"
        >
                <div className="mb-6 space-y-1 text-center">
                    <p style={{ margin: "0 0 6px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--electric)" }}>
                        VIZION CONNECTION
                    </p>
                    <h1 className="text-2xl font-bold tracking-[-0.02em] text-white">アカウントを作成する</h1>
                    <p className="text-sm leading-relaxed text-white/45">挑戦の記録が、信頼になる。</p>
                    {refSlug && (
                        <p className="mt-2 font-mono text-xs" style={{ color: "var(--electric)" }}>
                            紹介コード: {refSlug}
                        </p>
                    )}
                </div>

                <StepBar current={step} />

                <AnimatePresence mode="wait" custom={direction} initial={false}>
                    {/* ─── STEP 1: ロール選択 ─── */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={stepTr}
                            className="space-y-4"
                        >
                            <p className="text-center text-sm font-bold text-white/70">あなたの役割を選んでください</p>
                            <div className="grid grid-cols-2 gap-3">
                                {ROLES.map((r) => {
                                    const isSelected = role === r.value;
                                    return (
                                        <motion.button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setRole(r.value)}
                                            whileTap={press}
                                            transition={springSnap}
                                            layout
                                            className="rounded-2xl px-4 py-5 text-center"
                                            style={{
                                                background: isSelected ? `${r.color}16` : "rgba(17,17,24,0.9)",
                                                border: `1.5px solid ${isSelected ? r.color : "rgba(30,30,42,1)"}`,
                                                boxShadow: isSelected ? `0 0 20px ${r.color}30` : "none",
                                            }}
                                        >
                                            <div className="font-display text-[14px] font-black tracking-wide" style={{ color: isSelected ? r.color : "#555" }}>{r.label}</div>
                                            <div className="mt-1 text-[11px] font-bold" style={{ color: isSelected ? "rgba(255,255,255,0.75)" : "#444" }}>{r.displayName}</div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedRole.value}
                                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                                    animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                                    transition={reduce ? fadeReduced : springDefault}
                                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4"
                                >
                                    <p className="text-xs font-bold tracking-wide" style={{ color: selectedRole.color }}>
                                        {selectedRole.label}（{selectedRole.displayName}）
                                    </p>
                                    <p className="mt-1 text-[11px] leading-relaxed text-white/45">
                                        {selectedRole.detail}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            <motion.button
                                type="button"
                                onClick={() => goTo(2)}
                                whileTap={press}
                                transition={springDefault}
                                className="w-full rounded-xl py-3.5 text-sm font-black text-black hover:opacity-90"
                                style={{ background: "var(--electric)", boxShadow: "0 0 24px var(--electric-glow)" }}
                            >
                                次へ進む
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ─── STEP 2: 基本情報 ─── */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={stepTr}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
                                <span className="h-2 w-2 rounded-full" style={{ background: selectedRole.color }} />
                                <span className="text-xs font-bold text-white/70">{selectedRole.displayName}として登録</span>
                                <button type="button" onClick={() => goTo(1)} className="ml-auto text-[11px] text-white/40 underline underline-offset-2 hover:text-white/70 active:scale-[0.97]">
                                    変更する
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/40">メールアドレス <span style={{ color: "var(--flame)" }}>*</span></label>
                                <input
                                    type="email" required placeholder="you@example.com" value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    style={controlStyle}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/40">パスワード <span style={{ color: "var(--flame)" }}>*</span></label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoComplete="new-password"
                                        placeholder="8文字以上"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        style={{ ...controlStyle, paddingRight: 44 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                                    >
                                        <EyeIcon open={showPassword} />
                                    </button>
                                </div>
                                <p className="pl-1 text-[10px] leading-relaxed text-white/25">
                                    8文字以上 ／ 半角英字・数字を含めてください
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/40">ユーザーID <span style={{ color: "var(--flame)" }}>*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none font-mono text-sm text-white/20">@</span>
                                    <input
                                        type="text" required placeholder="your_id00" value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                        style={{ ...controlStyle, paddingLeft: 28, paddingRight: 16 }}
                                    />
                                </div>
                                <p className="pl-1 text-[10px] leading-relaxed text-white/30">
                                    プロフィールページのアドレスになります。登録後の変更はできません。
                                </p>
                                <p className="pl-1 text-[10px] leading-relaxed text-white/25">
                                    使用できる文字：英小文字、数字、アンダースコア（_）、ドット（.）
                                </p>
                                <p className={`font-mono text-xs ${form.slug ? "text-white/60" : "text-white/25"}`}>
                                    {form.slug ? "vizion-connection.jp/u/" : "例：vizion-connection.jp/u/"}{form.slug || "your_id00"}
                                </p>
                            </div>

                            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                                <input
                                    type="checkbox"
                                    checked={form.termsAccepted}
                                    onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/20 accent-[#C8E800]"
                                />
                                <span className="text-xs leading-relaxed text-white/55">
                                    <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="text-white/80 underline underline-offset-4 hover:text-white">
                                        利用規約
                                    </a>
                                    {" "}および{" "}
                                    <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="text-white/80 underline underline-offset-4 hover:text-white">
                                        プライバシーポリシー
                                    </a>
                                    {" "}に同意します
                                </span>
                            </label>

                            {error && <ErrorBox message={error} />}

                            <div className="flex gap-3">
                                <motion.button
                                    type="button"
                                    onClick={() => goTo(1)}
                                    whileTap={press}
                                    transition={springDefault}
                                    className="w-1/3 rounded-xl border border-white/15 py-3.5 text-sm font-bold text-white/60 hover:border-white/30 hover:text-white"
                                >
                                    戻る
                                </motion.button>
                                <motion.button
                                    type="button"
                                    onClick={handleStep2Next}
                                    whileTap={press}
                                    transition={springDefault}
                                    className="w-2/3 rounded-xl py-3.5 text-sm font-black text-black hover:opacity-90"
                                    style={{ background: "var(--electric)", boxShadow: "0 0 24px var(--electric-glow)" }}
                                >
                                    確認画面へ
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── STEP 3: 確認 ─── */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={stepTr}
                            className="space-y-4"
                        >
                            <p className="text-center text-sm font-bold text-white/70">入力内容をご確認ください</p>

                            <div className="divide-y divide-white/6 rounded-2xl border border-white/10 bg-white/[0.03] px-5">
                                {[
                                    { label: "ロール", value: `${selectedRole.label}（${selectedRole.displayName}）`, color: selectedRole.color },
                                    { label: "メールアドレス", value: form.email },
                                    { label: "パスワード", value: "•".repeat(Math.min(form.password.length, 12)) },
                                    { label: "ユーザーID", value: `@${form.slug}` },
                                    ...(form.referrerSlug ? [{ label: "紹介コード", value: form.referrerSlug }] : []),
                                ].map((row) => (
                                    <div key={row.label} className="flex items-center justify-between gap-4 py-3.5">
                                        <span className="shrink-0 text-[11px] text-white/35">{row.label}</span>
                                        <span className="truncate text-sm font-medium" style={{ color: row.color ?? "rgba(255,255,255,0.85)" }}>
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <p className="text-center text-[11px] leading-relaxed text-white/35">
                                登録後、認証メールをお送りします。
                            </p>

                            {error && <ErrorBox message={error} />}

                            <div className="flex gap-3">
                                <motion.button
                                    type="button"
                                    onClick={() => goTo(2)}
                                    whileTap={press}
                                    transition={springDefault}
                                    className="w-1/3 rounded-xl border border-white/15 py-3.5 text-sm font-bold text-white/60 hover:border-white/30 hover:text-white"
                                >
                                    修正する
                                </motion.button>
                                <motion.button
                                    type="button"
                                    onClick={() => void handleSubmit()}
                                    whileTap={press}
                                    transition={springDefault}
                                    className="w-2/3 rounded-xl py-3.5 text-sm font-black text-black hover:opacity-90"
                                    style={{ background: "var(--electric)", boxShadow: "0 0 24px var(--electric-glow)" }}
                                >
                                    登録を完了する
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── STEP 4: 送信・結果 ─── */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={stepTr}
                        >
                            {submitting && (
                                <AuthPulseLoader label="アカウントを作成しています…" />
                            )}

                            {!submitting && succeeded && (
                                <AuthSuccessMark
                                    title="登録を受け付けました"
                                    subtitle="認証メールをご確認ください。移動します…"
                                />
                            )}

                            {!submitting && !succeeded && registerState?.kind === "pending_verification" && (
                                <div className="space-y-4 border border-white/10 bg-white/[0.04] px-5 py-6" style={{ borderRadius: authGlassTokens().borderRadius }}>
                                    <div className="space-y-2 text-center">
                                        <p className="text-xs font-bold tracking-[0.2em]" style={{ color: "var(--flame)" }}>PENDING</p>
                                        <h2 className="text-2xl font-bold text-white">仮登録済みです</h2>
                                        <p className="text-sm font-medium text-white/60">メール認証が未完了です</p>
                                        <p className="text-sm leading-relaxed text-white/45">
                                            このメールアドレスは既に仮登録されています
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center">
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/25">Email</p>
                                        <p className="mt-1 text-sm font-medium text-white/80">{registerState.email}</p>
                                    </div>

                                    {registerState.resent && (
                                        <div className="rounded-xl border border-[rgba(50,210,120,0.28)] bg-[rgba(50,210,120,0.1)] px-4 py-3 text-sm text-[#32D278]">
                                            認証メールを再送しました
                                        </div>
                                    )}

                                    {error && <ErrorBox message={error} />}

                                    <motion.button
                                        type="button"
                                        onClick={() => void handleResend()}
                                        disabled={resendLoading}
                                        whileTap={resendLoading ? undefined : press}
                                        transition={springDefault}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
                                        style={{ background: "var(--electric)", boxShadow: resendLoading ? "none" : "0 0 24px var(--electric-glow)" }}
                                    >
                                        {resendLoading && (
                                            <span
                                                className="inline-block h-4 w-4 rounded-full border-2 border-black/25 border-t-black animate-spin"
                                                aria-hidden
                                            />
                                        )}
                                        {resendLoading ? "再送中..." : "認証メールを再送する"}
                                    </motion.button>

                                    <div className="space-y-1 text-center text-xs text-white/35">
                                        <p>メールが届かない場合</p>
                                        <p>迷惑メールをご確認ください</p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={resetToForm}
                                        className="w-full text-sm text-white/65 underline underline-offset-4 hover:text-white"
                                    >
                                        別のメールアドレスを使用する
                                    </button>
                                </div>
                            )}

                            {!submitting && !succeeded && registerState?.kind === "already_registered" && (
                                <div className="space-y-4 border border-white/10 bg-white/[0.04] px-5 py-6" style={{ borderRadius: authGlassTokens().borderRadius }}>
                                    <div className="space-y-2 text-center">
                                        <p className="text-xs font-bold tracking-[0.2em]" style={{ color: "var(--flame)" }}>REGISTERED</p>
                                        <h2 className="text-2xl font-bold text-white">既に登録されています</h2>
                                        <p className="text-sm leading-relaxed text-white/45">
                                            このメールアドレスは既に登録済みです
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center">
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/25">Email</p>
                                        <p className="mt-1 text-sm font-medium text-white/80">{registerState.email}</p>
                                    </div>

                                    <Link
                                        href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
                                        className="block w-full rounded-xl py-3.5 text-center text-sm font-black text-black active:scale-[0.97] transition-transform duration-100"
                                        style={{ background: "var(--electric)", boxShadow: "0 0 24px var(--electric-glow)" }}
                                    >
                                        ログインへ進む
                                    </Link>

                                    <Link href="/reset-password" className="block text-center text-sm text-white/55 underline underline-offset-4 hover:text-white/75">
                                        パスワードを忘れた場合
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={resetToForm}
                                        className="w-full text-sm text-white/65 underline underline-offset-4 hover:text-white"
                                    >
                                        別のメールアドレスで登録
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {step <= 2 && (
                    <p className="mt-6 text-center text-xs text-white/30">
                        すでにアカウントをお持ちの方
                        <Link href="/login" className="ml-1 text-white/60 underline hover:text-white">ログインはこちら</Link>
                    </p>
                )}
        </AuthShell>
    );
}
