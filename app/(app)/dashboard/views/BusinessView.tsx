"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import { BUSINESS_PLANS } from "@/features/business/constants";
import type { PlanId } from "@/features/business/types";

export function BusinessView({ profile, t, roleColor, setView, onProfilePatch }: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    onProfilePatch: (patch: Partial<ProfileData>) => void;
}) {
    const bizColor = roleColor || "#3C8CFF";
    const isPaid = profile.plan === "paid" || Boolean(profile.sponsorPlan);
    const [activeTab, setActiveTab] = useState<"ads" | "analytics" | "matching">("ads");
    const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutMessage, setCheckoutMessage] = useState("");
    const [checkoutError, setCheckoutError] = useState("");

    const selectedPlan = BUSINESS_PLANS.find((plan) => plan.id === selectedPlanId) ?? null;

    const mockAds = [
        { id: "ad_1", title: "Summer Camp 2025", status: "active", impressions: 12480, clicks: 342, ctr: 2.74, budget: 30000, spent: 18200 },
        { id: "ad_2", title: "スポーツ栄養セミナー", status: "paused", impressions: 4200, clicks: 88, ctr: 2.10, budget: 15000, spent: 9800 },
    ];

    const mockAnalytics = {
        totalImpressions: 16680,
        totalClicks: 430,
        avgCtr: 2.58,
        weeklyTrend: [210, 340, 290, 420, 380, 510, 490],
    };

    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState !== "visible") return;
            fetch("/api/profile/save/me", { cache: "no-store" })
                .then((res) => res.json())
                .then((data) => {
                    if (data?.profile) {
                        onProfilePatch(data.profile as Partial<ProfileData>);
                    }
                })
                .catch(() => undefined);
        };

        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [onProfilePatch]);

    async function handleCheckout() {
        if (!selectedPlanId || checkoutLoading) return;
        setCheckoutLoading(true);
        setCheckoutError("");
        setCheckoutMessage("");

        try {
            const res = await fetch("/api/business-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: selectedPlanId }),
            });
            const data = await res.json() as { success?: boolean; squareUrl?: string; error?: string };

            if (!res.ok || !data.success) {
                setCheckoutError(data.error ?? "申込処理に失敗しました。");
                return;
            }

            if (data.squareUrl) {
                window.open(data.squareUrl, "_blank", "noopener,noreferrer");
                setCheckoutMessage("Squareの決済ページを新しいタブで開きました。決済完了後、この画面へ戻るとプランが自動反映されます。");
                return;
            }

            setCheckoutMessage("プランを有効化しました。");
        } catch {
            setCheckoutError("通信エラーが発生しました。時間をおいて再度お試しください。");
        } finally {
            setCheckoutLoading(false);
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Business" sub="Vizion Businessポータル" onBack={() => setView("home")} t={t} roleColor={bizColor} />

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 14, background: isPaid ? "rgba(60,140,255,0.07)" : "rgba(255,255,255,0.025)", border: `1px solid ${isPaid ? "rgba(60,140,255,0.25)" : t.border}` }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: isPaid ? "rgba(60,140,255,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${isPaid ? "rgba(60,140,255,0.3)" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    🏢
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0 }}>{profile.displayName}</p>
                        <span style={{ fontSize: 7, fontWeight: 900, padding: "2px 7px", borderRadius: 4, background: isPaid ? "rgba(60,140,255,0.15)" : "rgba(255,255,255,0.07)", color: isPaid ? bizColor : t.sub, border: `1px solid ${isPaid ? "rgba(60,140,255,0.3)" : "rgba(255,255,255,0.12)"}`, fontFamily: "monospace", letterSpacing: "0.1em" }}>
                            {isPaid ? "PAID" : "FREE"}
                        </span>
                    </div>
                    <p style={{ fontSize: 10, color: t.sub, margin: "2px 0 0", opacity: 0.55 }}>
                        {isPaid ? "広告・分析・マッチング機能が利用可能です" : "FREEプラン — 基本機能のみ利用可能"}
                    </p>
                </div>
            </motion.div>

            {!isPaid && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <SectionCard t={t} accentColor={bizColor}>
                        <SLabel text="プラン比較" color={bizColor} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div style={{ padding: "14px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                <p style={{ fontSize: 11, fontWeight: 900, color: t.sub, margin: "0 0 10px", fontFamily: "monospace", letterSpacing: "0.1em" }}>FREE</p>
                                {[{ label: "Businessページ", ok: true }, { label: "公開プロフィール", ok: true }, { label: "ミッション参加", ok: true }, { label: "広告掲載", ok: false }, { label: "効果測定", ok: false }, { label: "マッチング", ok: false }].map(({ label, ok }) => (
                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                                        <div style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: ok ? "rgba(50,210,120,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${ok ? "rgba(50,210,120,0.3)" : "rgba(255,255,255,0.08)"}` }}>
                                            {ok ? <svg width={8} height={8} fill="none" viewBox="0 0 24 24" stroke="#32D278" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <div style={{ width: 4, height: 1.5, background: "rgba(255,255,255,0.2)", borderRadius: 1 }} />}
                                        </div>
                                        <span style={{ fontSize: 10, color: ok ? t.text : t.sub, opacity: ok ? 0.8 : 0.4 }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: "14px", borderRadius: 12, background: "rgba(60,140,255,0.07)", border: "1px solid rgba(60,140,255,0.25)", position: "relative", overflow: "hidden" }}>
                                <div style={{ position: "absolute", top: -10, right: -10, width: 50, height: 50, borderRadius: "50%", background: "radial-gradient(circle,rgba(60,140,255,0.2),transparent 70%)", pointerEvents: "none" }} />
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                                    <p style={{ fontSize: 11, fontWeight: 900, color: bizColor, margin: 0, fontFamily: "monospace", letterSpacing: "0.1em" }}>PAID</p>
                                    <span style={{ fontSize: 7, fontWeight: 900, padding: "1px 5px", borderRadius: 3, background: "rgba(60,140,255,0.2)", color: bizColor, fontFamily: "monospace" }}>推奨</span>
                                </div>
                                {["Businessページ", "公開プロフィール", "ミッション参加", "広告掲載", "効果測定", "マッチング"].map((label) => (
                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                                        <div style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(60,140,255,0.15)", border: "1px solid rgba(60,140,255,0.3)" }}>
                                            <svg width={8} height={8} fill="none" viewBox="0 0 24 24" stroke={bizColor} strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <span style={{ fontSize: 10, color: t.text, opacity: 0.85 }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard t={t} accentColor={bizColor}>
                        <SLabel text="プラン選択" color={bizColor} />
                        <p style={{ fontSize: 11, color: t.sub, lineHeight: 1.7, margin: "0 0 16px", opacity: 0.7 }}>
                            プラン選択はこの画面内で完結します。決済だけSquareの安全なページを新しいタブで開きます。
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, marginBottom: 16 }}>
                            {BUSINESS_PLANS.map((plan) => {
                                const selected = selectedPlanId === plan.id;
                                return (
                                    <button
                                        key={plan.id}
                                        type="button"
                                        onClick={() => setSelectedPlanId(plan.id)}
                                        className="vz-btn"
                                        style={{
                                            textAlign: "left",
                                            padding: "14px",
                                            borderRadius: 14,
                                            border: `1px solid ${selected ? "rgba(60,140,255,0.4)" : "rgba(255,255,255,0.1)"}`,
                                            background: selected ? "rgba(60,140,255,0.12)" : "rgba(255,255,255,0.03)",
                                            color: t.text,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                                            <p style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>{plan.name}</p>
                                            {plan.highlight && (
                                                <span style={{ fontSize: 8, fontWeight: 900, padding: "3px 7px", borderRadius: 999, background: "rgba(60,140,255,0.18)", color: bizColor, border: "1px solid rgba(60,140,255,0.28)" }}>
                                                    おすすめ
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: 11, color: t.sub, margin: "0 0 10px", opacity: 0.75 }}>{plan.tagline}</p>
                                        <p style={{ fontSize: 18, fontWeight: 900, color: bizColor, margin: "0 0 10px", fontFamily: "monospace" }}>{plan.priceLabel}</p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            {plan.benefits.slice(0, 3).map((benefit) => (
                                                <div key={benefit} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                                                    <span style={{ color: bizColor, fontSize: 10, lineHeight: 1.6 }}>●</span>
                                                    <span style={{ fontSize: 10, color: t.sub, lineHeight: 1.6 }}>{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedPlan && (
                            <div style={{ padding: "16px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${t.border}`, marginBottom: 12 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 800, color: t.text, margin: "0 0 4px" }}>{selectedPlan.name}</p>
                                        <p style={{ fontSize: 11, color: t.sub, margin: 0, opacity: 0.75 }}>{selectedPlan.tagline}</p>
                                    </div>
                                    <p style={{ fontSize: 18, fontWeight: 900, color: bizColor, margin: 0, fontFamily: "monospace" }}>{selectedPlan.priceLabel}</p>
                                </div>
                                <div style={{ display: "grid", gap: 6 }}>
                                    {selectedPlan.benefits.map((benefit) => (
                                        <div key={benefit} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                            <span style={{ color: bizColor, fontSize: 10, lineHeight: 1.7 }}>●</span>
                                            <span style={{ fontSize: 11, color: t.sub, lineHeight: 1.7 }}>{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {checkoutError && <p style={{ fontSize: 11, color: "#ff8b8b", margin: "0 0 10px" }}>{checkoutError}</p>}
                        {checkoutMessage && <p style={{ fontSize: 11, color: bizColor, margin: "0 0 10px", lineHeight: 1.7 }}>{checkoutMessage}</p>}

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={!selectedPlanId || checkoutLoading}
                                className="vz-btn"
                                style={{ padding: "10px 18px", borderRadius: 10, background: selectedPlanId ? bizColor : "rgba(255,255,255,0.06)", color: selectedPlanId ? "#000" : t.sub, fontSize: 12, fontWeight: 800, cursor: selectedPlanId ? "pointer" : "not-allowed", border: "none" }}
                            >
                                {checkoutLoading ? "申込処理中..." : "このプランで決済へ進む"}
                            </button>
                            <button onClick={() => setView("home")} className="vz-btn" style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: t.sub, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>後で確認する</button>
                        </div>
                    </SectionCard>
                </motion.div>
            )}

            {isPaid && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 16, padding: "4px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: `1px solid ${t.border}` }}>
                        {[{ id: "ads", label: "広告管理" }, { id: "analytics", label: "効果測定" }, { id: "matching", label: "マッチング" }].map(({ id, label }) => (
                            <button key={id} onClick={() => setActiveTab(id as "ads" | "analytics" | "matching")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: activeTab === id ? 700 : 500, background: activeTab === id ? bizColor : "transparent", color: activeTab === id ? "#000" : t.sub, transition: "all 0.2s" }}>{label}</button>
                        ))}
                    </div>

                    {activeTab === "ads" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <button className="vz-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px", borderRadius: 12, background: `${bizColor}15`, border: "1px dashed rgba(60,140,255,0.35)", color: bizColor, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                新しい広告を作成
                            </button>
                            {mockAds.map((ad, i) => (
                                <motion.div key={ad.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} style={{ padding: "16px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: `1px solid ${ad.status === "active" ? "rgba(50,210,120,0.2)" : t.border}` }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                        <div style={{ flex: 1 }}><p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0 }}>{ad.title}</p></div>
                                        <span style={{ fontSize: 8, fontWeight: 900, padding: "2px 8px", borderRadius: 4, background: ad.status === "active" ? "rgba(50,210,120,0.15)" : "rgba(255,255,255,0.06)", color: ad.status === "active" ? "#32D278" : t.sub, border: `1px solid ${ad.status === "active" ? "rgba(50,210,120,0.3)" : "rgba(255,255,255,0.1)"}`, fontFamily: "monospace", letterSpacing: "0.08em" }}>{ad.status === "active" ? "ACTIVE" : "PAUSED"}</span>
                                        <button className="vz-btn" style={{ padding: "5px 12px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: `1px solid ${t.border}`, color: t.sub, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>編集</button>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                                        {[{ label: "インプレッション", val: ad.impressions.toLocaleString(), sub: "imp" }, { label: "クリック数", val: ad.clicks.toLocaleString(), sub: "click" }, { label: "CTR", val: `${ad.ctr}%`, sub: "" }, { label: "消化率", val: `${Math.round((ad.spent / ad.budget) * 100)}%`, sub: `¥${ad.spent.toLocaleString()}` }].map(({ label, val, sub }) => (
                                            <div key={label} style={{ padding: "8px 10px", borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${t.border}`, textAlign: "center" }}>
                                                <p style={{ fontSize: 13, fontWeight: 800, color: bizColor, margin: 0, fontFamily: "monospace" }}>{val}</p>
                                                {sub && <p style={{ fontSize: 8, color: t.sub, margin: "1px 0 0", opacity: 0.5, fontFamily: "monospace" }}>{sub}</p>}
                                                <p style={{ fontSize: 8, color: t.sub, margin: "3px 0 0", opacity: 0.4 }}>{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: 10 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 9, color: t.sub, opacity: 0.5, fontFamily: "monospace" }}>予算消化</span><span style={{ fontSize: 9, color: t.sub, opacity: 0.5, fontFamily: "monospace" }}>¥{ad.budget.toLocaleString()}</span></div>
                                        <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(ad.spent / ad.budget) * 100}%` }} transition={{ duration: 1, delay: 0.2 }} style={{ height: "100%", borderRadius: 99, background: ad.status === "active" ? "linear-gradient(90deg,#32D278,#32D27888)" : "linear-gradient(90deg,rgba(255,255,255,0.3),rgba(255,255,255,0.1))" }} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === "analytics" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                                {[{ label: "総インプレッション", val: mockAnalytics.totalImpressions.toLocaleString(), icon: "👁️" }, { label: "総クリック数", val: mockAnalytics.totalClicks.toLocaleString(), icon: "🖱️" }, { label: "平均CTR", val: `${mockAnalytics.avgCtr}%`, icon: "📊" }].map(({ label, val, icon }) => (
                                    <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "14px 12px", borderRadius: 14, background: "rgba(60,140,255,0.06)", border: "1px solid rgba(60,140,255,0.18)", textAlign: "center" }}>
                                        <span style={{ fontSize: 18 }}>{icon}</span>
                                        <p style={{ fontSize: 20, fontWeight: 900, color: bizColor, margin: "4px 0 2px", fontFamily: "monospace" }}>{val}</p>
                                        <p style={{ fontSize: 9, color: t.sub, margin: 0, opacity: 0.5 }}>{label}</p>
                                    </motion.div>
                                ))}
                            </div>
                            <SectionCard t={t} accentColor={bizColor}>
                                <SLabel text="週次クリック推移" color={bizColor} />
                                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, marginBottom: 8 }}>
                                    {mockAnalytics.weeklyTrend.map((v, i) => {
                                        const max = Math.max(...mockAnalytics.weeklyTrend);
                                        const pct = (v / max) * 100;
                                        const days = ["月", "火", "水", "木", "金", "土", "日"];
                                        return (
                                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                                <motion.div initial={{ height: 0 }} animate={{ height: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.07 }} style={{ width: "100%", borderRadius: "4px 4px 2px 2px", background: i === 5 || i === 6 ? `${bizColor}88` : bizColor, minHeight: 4 }} />
                                                <span style={{ fontSize: 8, color: t.sub, opacity: 0.4, fontFamily: "monospace" }}>{days[i]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p style={{ fontSize: 9, color: t.sub, margin: 0, opacity: 0.4, textAlign: "right", fontFamily: "monospace" }}>直近7日 · クリック数</p>
                            </SectionCard>
                        </div>
                    )}

                    {activeTab === "matching" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <SectionCard t={t} accentColor={bizColor}>
                                <SLabel text="アスリートマッチング" color={bizColor} />
                                <p style={{ fontSize: 12, color: t.sub, lineHeight: 1.7, margin: "0 0 14px", opacity: 0.7 }}>スポンサー案件を投稿してアスリートとマッチングできます。</p>
                                <button className="vz-btn" style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, background: bizColor, color: "#000", fontSize: 12, fontWeight: 800, cursor: "pointer", border: "none" }}>
                                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                    案件を投稿する
                                </button>
                            </SectionCard>
                            <div style={{ padding: "16px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: `1px solid ${t.border}`, textAlign: "center" }}>
                                <span style={{ fontSize: 22, display: "block", marginBottom: 8 }}>🤝</span>
                                <p style={{ fontSize: 12, fontWeight: 700, color: t.text, margin: "0 0 4px" }}>マッチング機能 β版</p>
                                <p style={{ fontSize: 10, color: t.sub, margin: 0, opacity: 0.5, lineHeight: 1.6 }}>現在アスリートマッチング機能を準備中です。<br />正式版リリース時にお知らせします。</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
