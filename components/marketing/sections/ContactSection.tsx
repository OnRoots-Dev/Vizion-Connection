"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicBackground } from "@/components/marketing/DynamicBackground";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const CATEGORIES = ["広告・スポンサー", "取材・メディア", "不具合・バグ報告", "機能要望", "その他"] as const;
type Category = typeof CATEGORIES[number];

const PLAN_LABELS: Record<string, string> = {
    roots: "Roots（¥30,000）",
    "roots-plus": "Roots+（¥50,000）",
    signal: "Signal（¥100,000）",
    presence: "Presence（¥500,000）",
    legacy: "Legacy（¥1,000,000）",
    // Backward-compatible aliases for older shared links.
    root: "Roots（¥30,000）",
    "roots+": "Roots+（¥50,000）",
};

export default function ContactSection() {
    const searchParams = useSearchParams();
    const planParam = searchParams.get("plan")?.toLowerCase() ?? null;
    const planLabel = planParam ? PLAN_LABELS[planParam] ?? null : null;

    const defaultMessage = planLabel
        ? `【振込・請求書払い希望】
プラン：${planLabel}

会社名：
担当者名：
電話番号：

ご質問・備考：`
        : "";

    const [form, setForm] = useState({
        category: (planParam ? "広告・スポンサー" : "") as Category | "",
        name: "", email: "",
        message: defaultMessage,
    });
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }));

    async function handleSubmit() {
        if (!form.category || !form.name || !form.email || !form.message) {
            setError("すべての項目を入力してください"); return;
        }
        setLoading(true); setError("");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
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

    const inputBase: React.CSSProperties = {
        width: "100%", padding: "12px 14px", borderRadius: "12px",
        background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)",
        color: "#fff", fontSize: "14px", outline: "none",
        transition: "border-color 0.2s",
    };


    return (
        <section id="contact" style={{ padding: "80px 20px", background: "#07070e" }}>
            <div style={{ maxWidth: "560px", margin: "0 auto" }}>

                <Header />
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    style={{ textAlign: "center", marginBottom: "40px" }}
                >
                    <p style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "12px" }}>
                        Contact
                    </p>
                    <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                        お問い合わせ
                    </h2>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>
                        広告・取材・不具合など、お気軽にご連絡ください。
                    </p>
                    {planLabel && (
                        <div style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "99px", background: "rgba(0,210,255,0.07)", border: "1px solid rgba(0,210,255,0.2)" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d2ff", display: "inline-block", flexShrink: 0 }} />
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "#00d2ff", letterSpacing: "0.04em" }}>
                                {planLabel} の振込・請求書払いについて
                            </span>
                        </div>
                    )}
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "32px 28px" }}
                >
                    <AnimatePresence mode="wait">
                        {done ? (
                            <motion.div
                                key="done"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ textAlign: "center", padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
                            >
                                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(50,210,120,0.1)", border: "1px solid rgba(50,210,120,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#32D278" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>送信しました</p>
                                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
                                        お問い合わせありがとうございます。<br />内容を確認の上、ご連絡いたします。
                                    </p>
                                </div>
                                <motion.a
                                    href="/"
                                    whileTap={{ scale: 0.97 }}
                                    style={{
                                        display: "inline-flex", alignItems: "center", gap: "6px",
                                        marginTop: "8px", padding: "11px 24px", borderRadius: "12px",
                                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                        color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600,
                                        textDecoration: "none", transition: "all 0.2s",
                                    }}
                                >
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    トップページへ戻る
                                </motion.a>
                            </motion.div>
                        ) : (
                            <motion.div key="form" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                                {/* カテゴリ */}
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: 600, color: "rgba(200,200,200,0.4)", display: "block", marginBottom: "6px" }}>
                                        カテゴリ <span style={{ color: "#ff5050" }}>*</span>
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={set("category")}
                                        className="contact-select"
                                        aria-label="カテゴリ"
                                    >
                                        <option value="" disabled className="contact-option">選択してください</option>
                                        {CATEGORIES.map(c => (
                                            <option key={c} value={c} className="contact-option">{c}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 名前 */}
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "6px" }}>
                                        お名前 <span style={{ color: "#ff5050" }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="山田 太郎"
                                        value={form.name}
                                        onChange={set("name")}
                                        style={inputBase}
                                    />
                                </div>

                                {/* メール */}
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "6px" }}>
                                        メールアドレス <span style={{ color: "#ff5050" }}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={set("email")}
                                        style={inputBase}
                                    />
                                </div>

                                {/* メッセージ */}
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "6px" }}>
                                        メッセージ <span style={{ color: "#ff5050" }}>*</span>
                                    </label>
                                    <textarea
                                        placeholder="お問い合わせ内容をご記入ください（10文字以上）"
                                        value={form.message}
                                        onChange={set("message")}
                                        rows={5}
                                        style={{ ...inputBase, resize: "vertical", lineHeight: 1.7 }}
                                    />
                                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", margin: "4px 0 0", textAlign: "right" }}>
                                        {form.message.length} / 2000
                                    </p>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff5050", fontSize: "13px" }}>
                                        {error}
                                    </div>
                                )}

                                {/* Submit */}
                                <motion.button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    whileTap={{ scale: 0.97 }}
                                    style={{
                                        padding: "14px", borderRadius: "12px", border: "none",
                                        background: loading ? "rgba(167,139,250,0.4)" : "#a78bfa",
                                        color: "#000", fontSize: "14px", fontWeight: 700,
                                        cursor: loading ? "not-allowed" : "pointer",
                                        boxShadow: loading ? "none" : "0 0 24px rgba(167,139,250,0.35)",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {loading ? "送信中..." : "送信する"}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
            <Footer />
        </section>
    );
}
