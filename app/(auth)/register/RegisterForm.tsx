// app/(auth)/register/RegisterForm.tsx

"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { registerSchema } from "@/features/auth/validation/register-schema";

type Role = "Athlete" | "Trainer" | "Members" | "Business";

const ROLES: { value: Role; label: string; color: string; border: string; desc: string }[] = [
    { value: "Athlete", label: "Athlete", color: "#FF5050", border: "rgba(255,80,80,0.4)", desc: "アスリート" },
    { value: "Trainer", label: "Trainer", color: "#32D278", border: "rgba(50,210,120,0.4)", desc: "トレーナー" },
    { value: "Members", label: "Members", color: "#FFC81E", border: "rgba(255,200,30,0.4)", desc: "メンバー" },
    { value: "Business", label: "Business", color: "#3C8CFF", border: "rgba(60,140,255,0.4)", desc: "ビジネス" },
];
const REGIONS = ["北海道", "東北", "関東", "中部", "近畿", "中国・四国", "九州・沖縄"] as const;

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

    const [role, setRole] = useState<Role>("Athlete");
    const [form, setForm] = useState({
        displayName: "",
        slug: "",
        email: "",
        password: "",
        region: "",
        referrerSlug: refSlug,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, role, redirectTo }),
            });
            const data = await res.json();
            if (!data.success) {
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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
            style={{ background: "#07070e" }}>

            <Link href="/" className="mb-4 tracking-[0.2em]">
                <Image src="/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" width={300} height={80} priority className="inline-block w-auto h-20" />
            </Link>

            <div className="w-full max-w-md">
                <div className="mb-8 text-center space-y-1">
                    <h1 className="text-2xl font-bold text-white">新規登録</h1>
                    <p className="text-sm text-white/40">あなたのロールを選んで登録してください</p>
                    {refSlug && (
                        <p className="text-xs font-mono mt-2" style={{ color: "#a78bfa" }}>
                            紹介コード: {refSlug}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-4 gap-2 mb-8">
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
                                    <div className="text-xs font-bold mb-0.5" style={{ color: isSelected ? r.color : "#555" }}>{r.label}</div>
                                    <div className="text-[10px]" style={{ color: isSelected ? "rgba(255,255,255,0.5)" : "#333" }}>{r.desc}</div>
                                </div>
                            </label>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div
                        className="rounded-xl px-4 py-3 text-[11px] font-medium leading-relaxed text-[#FFD600]"
                        style={{ background: "rgba(255,214,0,0.08)", border: "1px solid rgba(255,214,0,0.45)" }}
                    >
                        ※ 登録フォームの入力項目はすべて必須です。
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-white/40 font-medium">表示名</label>
                            <input type="text" required placeholder="Sho Tanaka" value={form.displayName}
                                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                                style={{ background: "#111118", border: "1.5px solid #1e1e2a" }}
                                onFocus={(e) => e.target.style.borderColor = selectedRole.color}
                                onBlur={(e) => e.target.style.borderColor = "#1e1e2a"} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-white/40 font-medium">ユーザーID</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-sm font-mono select-none">@</span>
                                <input type="text" required placeholder="tanaka10" value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                    className="w-full rounded-xl py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                                    style={{
                                        background: "#111118",
                                        border: "1.5px solid #1e1e2a",
                                        paddingLeft: "1.75rem",
                                        paddingRight: "1rem",
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = selectedRole.color}
                                    onBlur={(e) => e.target.style.borderColor = "#1e1e2a"} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="register-region" className="text-xs text-white/40 font-medium">活動エリア（region）</label>
                        <select
                            id="register-region"
                            name="region"
                            title="活動エリア（region）"
                            aria-label="活動エリア（region）"
                            required
                            value={form.region}
                            onChange={(e) => setForm({ ...form, region: e.target.value })}
                            className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                            style={{ background: "#111118", border: "1.5px solid #1e1e2a" }}
                            onFocus={(e) => e.target.style.borderColor = selectedRole.color}
                            onBlur={(e) => e.target.style.borderColor = "#1e1e2a"}
                        >
                            <option value="" disabled>選択してください</option>
                            {REGIONS.map((region) => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-white/40 font-medium">メールアドレス</label>
                        <input type="email" required placeholder="you@example.com" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                            style={{ background: "#111118", border: "1.5px solid #1e1e2a" }}
                            onFocus={(e) => e.target.style.borderColor = selectedRole.color}
                            onBlur={(e) => e.target.style.borderColor = "#1e1e2a"} />
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
                                className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 outline-none transition-all"
                                style={{ background: "#111118", border: "1.5px solid #1e1e2a" }}
                                onFocus={(e) => e.target.style.borderColor = selectedRole.color}
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
                        {/*パスワード制限の注意書き */}
                        <p className="text-[10px] text-white/25 leading-relaxed pl-1">
                            8文字以上 ／ 半角英字・数字を含めてください
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-xl px-4 py-3 text-sm text-red-400"
                            style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)" }}>
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

                <p className="mt-6 text-center text-xs text-white/30">
                    すでにアカウントをお持ちの方は
                    <Link href="/login" className="ml-1 text-white/60 hover:text-white underline">ログイン</Link>
                </p>
            </div>
        </div>
    );
}
