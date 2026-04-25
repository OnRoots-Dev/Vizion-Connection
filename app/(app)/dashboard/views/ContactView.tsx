"use client";

import { useMemo, useState } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";

const CATEGORIES = ["広告・スポンサー", "取材・メディア", "不具合・バグ報告", "機能要望", "その他"] as const;

type Category = (typeof CATEGORIES)[number];

type FormState = {
  category: Category | "";
  name: string;
  email: string;
  message: string;
};

export function ContactView({
  t,
  roleColor,
  onBack,
  setView,
}: {
  t: ThemeColors;
  roleColor: string;
  onBack: () => void;
  setView: (v: DashboardView) => void;
}) {
  const [form, setForm] = useState<FormState>({ category: "", name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return Boolean(form.category && form.name.trim() && form.email.trim() && form.message.trim().length >= 10);
  }, [form.category, form.email, form.message, form.name]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
  };

  async function handleSubmit() {
    setError(null);
    if (!canSubmit) {
      setError("すべての項目を入力してください（メッセージは10文字以上）");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "エラーが発生しました");
      }
      setDone(true);
      setForm({ category: "", name: "", email: "", message: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader title="Contact" sub="お問い合わせ" onBack={onBack} t={t} roleColor={roleColor} />

      <SectionCard t={t} accentColor={roleColor}>
        <SLabel text="お問い合わせ" color={roleColor} />
        <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.7, color: t.sub }}>
          広告・取材・不具合など、お気軽にご連絡ください。
        </p>

        {done ? (
          <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: t.text }}>送信しました</p>
            <p style={{ margin: "6px 0 0", fontSize: 12, lineHeight: 1.7, color: t.sub }}>
              お問い合わせありがとうございます。内容を確認の上、ご連絡いたします。
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setView("home")}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${t.border}`,
                  background: "rgba(255,255,255,0.04)",
                  color: t.sub,
                  fontWeight: 900,
                  fontSize: 12,
                  padding: "10px 12px",
                  cursor: "pointer",
                }}
              >
                Dashboardへ戻る
              </button>
              <button
                type="button"
                onClick={() => setDone(false)}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${roleColor}35`,
                  background: `${roleColor}18`,
                  color: roleColor,
                  fontWeight: 900,
                  fontSize: 12,
                  padding: "10px 12px",
                  cursor: "pointer",
                }}
              >
                続けて送る
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: t.sub, opacity: 0.7 }}>
                カテゴリ
              </label>
              <select
                value={form.category}
                onChange={set("category")}
                style={{
                  marginTop: 6,
                  width: "100%",
                  height: 42,
                  borderRadius: 12,
                  border: `1px solid ${t.border}`,
                  background: "rgba(255,255,255,0.03)",
                  color: t.text,
                  padding: "0 12px",
                  outline: "none",
                }}
              >
                <option value="" disabled>
                  選択してください
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: t.sub, opacity: 0.7 }}>
                お名前
              </label>
              <input
                value={form.name}
                onChange={set("name")}
                placeholder="山田 太郎"
                style={{
                  marginTop: 6,
                  width: "100%",
                  height: 42,
                  borderRadius: 12,
                  border: `1px solid ${t.border}`,
                  background: "rgba(255,255,255,0.03)",
                  color: t.text,
                  padding: "0 12px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: t.sub, opacity: 0.7 }}>
                メールアドレス
              </label>
              <input
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                type="email"
                style={{
                  marginTop: 6,
                  width: "100%",
                  height: 42,
                  borderRadius: 12,
                  border: `1px solid ${t.border}`,
                  background: "rgba(255,255,255,0.03)",
                  color: t.text,
                  padding: "0 12px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: t.sub, opacity: 0.7 }}>
                メッセージ
              </label>
              <textarea
                value={form.message}
                onChange={set("message")}
                placeholder="お問い合わせ内容をご記入ください（10文字以上）"
                rows={5}
                style={{
                  marginTop: 6,
                  width: "100%",
                  borderRadius: 12,
                  border: `1px solid ${t.border}`,
                  background: "rgba(255,255,255,0.03)",
                  color: t.text,
                  padding: "10px 12px",
                  outline: "none",
                  resize: "vertical",
                  lineHeight: 1.7,
                }}
              />
              <p style={{ margin: "6px 0 0", fontSize: 11, color: t.sub, opacity: 0.65, textAlign: "right" }}>
                {form.message.length} / 2000
              </p>
            </div>

            {error ? (
              <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff9b9b", fontSize: 12, lineHeight: 1.6 }}>
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={loading || !canSubmit}
              style={{
                marginTop: 4,
                width: "100%",
                padding: "12px 0",
                borderRadius: 12,
                background: loading || !canSubmit ? "rgba(167,139,250,0.25)" : roleColor,
                border: "none",
                color: "#0B0B0F",
                fontSize: 13,
                fontWeight: 900,
                cursor: loading ? "wait" : canSubmit ? "pointer" : "not-allowed",
                opacity: loading || !canSubmit ? 0.7 : 1,
              }}
            >
              {loading ? "送信中..." : "送信する"}
            </button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
