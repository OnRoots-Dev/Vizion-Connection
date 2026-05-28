// app/(auth)/register/RegisterForm.tsx

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { registerSchema } from "@/features/auth/validation/register-schema";

const MARKETING_HOME_URL = "https://vizion-connection.jp/";
const TERMS_URL = "https://tarry-plywood-9b9.notion.site/Vizion-Connection-287089f25fae80569ec8f5263bbc6fd2?source=copy_link";
const PRIVACY_URL = "https://tarry-plywood-9b9.notion.site/287089f25fae80e8a771d66b1ee4fa82?source=copy_link";

type Role = "Athlete" | "Trainer" | "Crew" | "Business";

const ROLES: { value: Role; label: string; color: string; border: string; desc: string; detail: string }[] = [
    { value: "Athlete", label: "Athlete", color: "#FF5050", border: "rgba(255,80,80,0.4)", desc: "アスリート", detail: "競技に取り組むすべての選手。競技歴・レベル・プロアマ問わず。" },
    { value: "Trainer", label: "Trainer", color: "#32D278", border: "rgba(50,210,120,0.4)", desc: "トレーナー", detail: "スポーツの指導・サポートをしている方向け。" },
    { value: "Crew", label: "Crew", color: "#FFC81E", border: "rgba(255,200,30,0.4)", desc: "クルー", detail: "ファン、サポーター、家族、友人、関係者の方向け。" },
    { value: "Business", label: "Business", color: "#3C8CFF", border: "rgba(60,140,255,0.4)", desc: "ビジネス", detail: "スポーツ界で注目・広告・エリア応援を検討している企業・団体の方向け。" },
];

//目アイコン
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

export default function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const refSlug = searchParams.get("ref") ?? "";
    const redirectTo = searchParams.get("redirect") ?? "";
    const roleFromQuery = searchParams.get("role");

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [registerState, setRegisterState] = useState<
        | null
        | {
            kind: "pending_verification";
            email: string;
            resent: boolean;
        }
        | {
            kind: "already_registered";
            email: string;
        }
    >(null);

    const selectedRole = ROLES.find((r) => r.value === role)!;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const parsed = registerSchema.safeParse({
            ...form,
            role,
            redirectTo: undefined,
        });
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "入力内容を確認してください");
            return;
        }
        setLoading(true);
        setError("");
        setRegisterState(null);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, role, redirectTo }),
            });
            const data = await res.json();
            if (!data.success) {
                if (data.code === "PENDING_VERIFICATION") {
                    setRegisterState({
                        kind: "pending_verification",
                        email: data.email ?? form.email,
                        resent: Boolean(data.resent),
                    });
                    return;
                }
                if (data.code === "ALREADY_REGISTERED") {
                    setRegisterState({
                        kind: "already_registered",
                        email: data.email ?? form.email,
                    });
                    return;
                }
                setError(data.error ?? "エラーが発生しました");
                return;
            }
            const next = redirectTo
                ? `/thanks?type=verify&redirect=${encodeURIComponent(redirectTo)}`
                : "/thanks?type=verify";
            router.push(next);
        } catch {
            setError("通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        setResendLoading(true);
        setError("");

        try {
            const res = await fetch("/api/register/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    redirectTo,
                }),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.error ?? "認証メールの再送に失敗しました");
                return;
            }

            setRegisterState({
                kind: "pending_verification",
                email: form.email,
                resent: true,
            });
        } catch {
            setError("通信エラーが発生しました");
        } finally {
            setResendLoading(false);
        }
    }

    function resetRegisterState() {
        setRegisterState(null);
        setError("");
    }

    return (
        <div className="vc-auth-shell">

            <a href={MARKETING_HOME_URL} className="mb-4 tracking-[0.2em]">
                <Image src="/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" width={300} height={80} priority className="inline-block w-auto h-20" />
            </a>

            <div className="w-full max-w-md">
                <div className="mb-8 text-center space-y-1">
                    <h1 className="text-2xl font-bold text-white">新規登録</h1>
                    <p className="text-sm text-white/40">あなたのロールを選んで登録してください</p>
                    {refSlug && (
                        <p className="mt-2 text-xs font-mono text-[#a78bfa]">
                            紹介コード: {refSlug}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                    {ROLES.map((r) => {
                        const isSelected = role === r.value;
                        return (
                            <label key={r.value} htmlFor={`role-${r.value}`} className="cursor-pointer">
                                <input type="radio" id={`role-${r.value}`} name="role" value={r.value}
                                    checked={isSelected} onChange={() => setRole(r.value)} className="sr-only" />
                                <div className="rounded-xl py-3 px-2 text-center transition-all"
                                    style={{
                                        background: isSelected ? `${r.color}18` : "#111118",
                                        border: `1.5px solid ${isSelected ? r.color : "#1e1e2a"}`,
                                        boxShadow: isSelected ? `0 0 16px ${r.color}30` : "none",
                                    }}>
                                    <div className="mb-0.5 text-xs font-bold" style={{ color: isSelected ? r.color : "#555" }}>{r.label}</div>
                                    <div className="text-[10px]" style={{ color: isSelected ? "rgba(255,255,255,0.5)" : "#333" }}>{r.desc}</div>
                                </div>
                            </label>
                        );
                    })}
                </div>

                <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                    <div className="space-y-1">
                        <p className="text-xs font-bold tracking-wide" style={{ color: selectedRole.color }}>
                            {selectedRole.label}
                        </p>
                        <p className="text-[11px] leading-relaxed text-white/45">
                            {selectedRole.detail}
                        </p>
                    </div>
                </div>

                {registerState ? (
                    <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-6">
                        {registerState.kind === "pending_verification" ? (
                            <>
                                <div className="space-y-2 text-center">
                                    <p className="text-xs font-bold tracking-[0.2em] text-[#FFD600]">PENDING</p>
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

                                {error && (
                                    <div className="rounded-xl border border-[rgba(255,80,80,0.2)] bg-[rgba(255,80,80,0.08)] px-4 py-3 text-sm text-red-400">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => void handleResend()}
                                    disabled={resendLoading}
                                    className="w-full rounded-xl py-3.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                                    style={{
                                        background: resendLoading ? "#333" : selectedRole.color,
                                        color: "#000",
                                        boxShadow: resendLoading ? "none" : `0 0 24px ${selectedRole.color}50`,
                                    }}
                                >
                                    {resendLoading ? "再送中..." : "認証メールを再送する"}
                                </button>

                                <div className="space-y-1 text-center text-xs text-white/35">
                                    <p>メールが届かない場合</p>
                                    <p>迷惑メールをご確認ください</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={resetRegisterState}
                                    className="w-full text-sm text-white/65 underline underline-offset-4 hover:text-white"
                                >
                                    別のメールアドレスを使用する
                                </button>

                                <Link href="/login" className="block text-center text-sm text-white/45 underline underline-offset-4 hover:text-white/75">
                                    既に認証済みの場合はこちら
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2 text-center">
                                    <p className="text-xs font-bold tracking-[0.2em] text-[#FF8A5B]">REGISTERED</p>
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
                                    className="block w-full rounded-xl py-3.5 text-center text-sm font-bold transition-all"
                                    style={{
                                        background: selectedRole.color,
                                        color: "#000",
                                        boxShadow: `0 0 24px ${selectedRole.color}50`,
                                    }}
                                >
                                    ログインへ進む
                                </Link>

                                <Link href="/reset-password" className="block text-center text-sm text-white/55 underline underline-offset-4 hover:text-white/75">
                                    パスワードを忘れた場合
                                </Link>

                                <button
                                    type="button"
                                    onClick={resetRegisterState}
                                    className="w-full text-sm text-white/65 underline underline-offset-4 hover:text-white"
                                >
                                    別のメールアドレスで登録
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div
                        className="rounded-xl border border-[rgba(255,214,0,0.45)] bg-[rgba(255,214,0,0.08)] px-4 py-3 text-[11px] font-medium leading-relaxed text-[#FFD600]"
                    >
                        ※ 登録フォームの入力項目はすべて必須です。
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-white/40 font-medium">メールアドレス</label>
                        <input type="email" required placeholder="you@example.com" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="vc-auth-input"
                            style={{ ["--vc-focus-color" as string]: selectedRole.color }} />
                    </div>

                    {/*パスワード入力 + 目マーク + 注意書き */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-white/40 font-medium">パスワード</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="8文字以上"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="vc-auth-input pr-11"
                                style={{ ["--vc-focus-color" as string]: selectedRole.color }}
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
                        {/*パスワード制限の注意書き */}
                        <p className="text-[10px] text-white/25 leading-relaxed pl-1">
                            8文字以上 ／ 半角英字・数字を含めてください
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-white/40 font-medium">ユーザーID</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-sm font-mono select-none">@</span>
                            <input type="text" required placeholder="your_id00" value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                className="vc-auth-input pr-4 pl-7"
                                style={{
                                    ["--vc-focus-color" as string]: selectedRole.color,
                                }}
                            />
                        </div>
                        <p className="text-[10px] text-white/30 leading-relaxed pl-1">
                            あなたのプロフィールページのアドレスになります。登録後の変更はできません。
                        </p>
                        <p className="text-[10px] text-white/25 leading-relaxed pl-1">
                            使用できる文字：英小文字、数字、アンダースコア（_）、ドット（.）
                        </p>
                        <p className={`text-xs font-mono ${form.slug ? "text-white/60" : "text-white/25"}`}>
                            {form.slug ? "vizion-connection.jp/u/" : "例：vizion-connection.jp/u/"}{form.slug || "your_id00"}
                        </p>
                    </div>

                    <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                        <input
                            type="checkbox"
                            checked={form.termsAccepted}
                            onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/20 text-[#FFD600] accent-[#FFD600]"
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

                    {error && (
                        <div className="rounded-xl border border-[rgba(255,80,80,0.2)] bg-[rgba(255,80,80,0.08)] px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full rounded-xl py-3.5 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: loading ? "#333" : selectedRole.color,
                            color: "#000",
                            boxShadow: loading ? "none" : `0 0 24px ${selectedRole.color}50`,
                        }}>
                        {loading ? "登録中..." : "登録する"}
                    </button>
                </form>
                )}

                <p className="mt-6 text-center text-xs text-white/30">
                    すでにアカウントをお持ちの方は
                    <Link href="/login" className="ml-1 text-white/60 hover:text-white underline">ログイン</Link>
                </p>
            </div>
        </div>
    );
}
