// app/(auth)/register/RegisterForm.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Role = "Athlete" | "Trainer" | "Members" | "Business";

const ROLES: { value: Role; label: string; color: string; border: string; desc: string }[] = [
    { value: "Athlete", label: "Athlete", color: "#FF5050", border: "rgba(255,80,80,0.4)", desc: "アスリート" },
    { value: "Trainer", label: "Trainer", color: "#32D278", border: "rgba(50,210,120,0.4)", desc: "トレーナー" },
    { value: "Members", label: "Members", color: "#FFC81E", border: "rgba(255,200,30,0.4)", desc: "メンバー" },
    { value: "Business", label: "Business", color: "#3C8CFF", border: "rgba(60,140,255,0.4)", desc: "ビジネス" },
];

export default function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const refSlug = searchParams.get("ref") ?? "";

    const [role, setRole] = useState<Role>("Athlete");
    const [form, setForm] = useState({
        displayName: "",
        slug: "",
        email: "",
        password: "",
        referrerSlug: refSlug,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const selectedRole = ROLES.find((r) => r.value === role)!;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, role }),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.error ?? "エラーが発生しました");
                return;
            }
            router.push("/thanks?type=verify");
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
                <img src="/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" className="inline-block w-5 mr-1 -mt-0.5" />
            </Link>

            <div className="w-full max-w-md">
                <div className="mb-8 text-center space-y-1">
                    <h1 className="text-2xl font-bold text-white">先行登録</h1>
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
                        <label className="text-xs text-white/40 font-medium">メールアドレス</label>
                        <input type="email" required placeholder="you@example.com" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                            style={{ background: "#111118", border: "1.5px solid #1e1e2a" }}
                            onFocus={(e) => e.target.style.borderColor = selectedRole.color}
                            onBlur={(e) => e.target.style.borderColor = "#1e1e2a"} />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-white/40 font-medium">パスワード</label>
                        <input type="password" required placeholder="8文字以上" value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                            style={{ background: "#111118", border: "1.5px solid #1e1e2a" }}
                            onFocus={(e) => e.target.style.borderColor = selectedRole.color}
                            onBlur={(e) => e.target.style.borderColor = "#1e1e2a"} />
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
                        {loading ? "登録中..." : "先行登録する"}
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