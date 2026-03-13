// app/(marketing)/business/checkout/BusinessCheckoutClient.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { HeaderLight } from "@/components/layout/HeaderLight";
import { FooterLight } from "@/components/layout/FooterLight";
import type { BusinessPlanWithAvailability, PlanId } from "@/features/business/types";

type CheckoutState = "idle" | "loading" | "error";

export default function BusinessCheckoutClient({
    plans,
    deadlineText,
}: {
    plans: BusinessPlanWithAvailability[];
    deadlineText: string;
}) {
    const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null);
    const [state, setState] = useState<CheckoutState>("idle");
    const [errorMessage, setErrorMessage] = useState("");

    async function handleCheckout() {
        if (!selectedPlanId) return;
        setState("loading");
        setErrorMessage("");

        try {
            const res = await fetch("/api/business-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: selectedPlanId }),
            });

            const data: { success: boolean; error?: string; squareUrl?: string } =
                await res.json();

            if (!data.success) {
                if (res.status === 403) {
                    window.location.href = `/register?message=business_required`;
                    return;
                }
                setState("error");
                setErrorMessage(data.error ?? "エラーが発生しました");
                return;
            }

            if (data.squareUrl) {
                window.location.href = data.squareUrl;
            }
        } catch {
            setState("error");
            setErrorMessage("通信エラーが発生しました。もう一度お試しください。");
        } finally {
            setState("idle");
        }
    }

    const selectedPlan = plans.find((p) => p.id === selectedPlanId);

    return (
        <div className="min-h-screen" style={{ background: "#f5f5f7" }}>
            <HeaderLight />

            <main className="max-w-2xl mx-auto px-8 py-16 pt-32 space-y-10">

                {/* Header */}
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1"
                        style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.15)" }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#ff3b30" }} />
                        <span className="text-xs font-medium" style={{ color: "#ff3b30" }}>{deadlineText}</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight" style={{ color: "#1d1d1f" }}>
                        先行ポジションを選択
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: "#6e6e73" }}>
                        プランを選んで申し込みボタンを押すと、Square の安全な決済ページへ移動します
                    </p>
                </div>

                {/* Plans */}
                <div className="space-y-3">
                    {plans.map((plan, i) => {
                        const isSelected = selectedPlanId === plan.id;
                        return (
                            <label
                                key={plan.id}
                                htmlFor={`plan-${plan.id}`}
                                className={`block rounded-3xl transition-all ${plan.soldOut ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                                    }`}
                                style={{
                                    background: isSelected ? "rgba(0,122,255,0.06)" : "rgba(255,255,255,0.7)",
                                    backdropFilter: "blur(30px)",
                                    WebkitBackdropFilter: "blur(30px)",
                                    border: isSelected
                                        ? "2px solid rgba(0,122,255,0.4)"
                                        : "1.5px solid rgba(255,255,255,0.95)",
                                    boxShadow: isSelected
                                        ? "0 4px 32px rgba(0,122,255,0.12)"
                                        : "0 2px 16px rgba(0,0,0,0.05)",
                                }}
                            >
                                <input
                                    type="radio"
                                    id={`plan-${plan.id}`}
                                    name="plan"
                                    value={plan.id}
                                    checked={isSelected}
                                    disabled={plan.soldOut}
                                    onChange={() => !plan.soldOut && setSelectedPlanId(plan.id)}
                                    style={{
                                        position: "absolute",
                                        width: "1px",
                                        height: "1px",
                                        padding: 0,
                                        margin: "-1px",
                                        overflow: "hidden",
                                        clip: "rect(0,0,0,0)",
                                        whiteSpace: "nowrap",
                                        border: 0,
                                    }}
                                />

                                <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">

                                        {/* Radio indicator — 大きく明確に */}
                                        <div
                                            className="flex-shrink-0 flex items-center justify-center rounded-full transition-all"
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                minWidth: "28px",
                                                marginTop: "1px",
                                                border: isSelected
                                                    ? "2.5px solid #007aff"
                                                    : "2px solid rgba(0,0,0,0.18)",
                                                background: isSelected
                                                    ? "rgba(0,122,255,0.12)"
                                                    : "rgba(255,255,255,0.8)",
                                                boxShadow: isSelected
                                                    ? "0 0 0 4px rgba(0,122,255,0.1)"
                                                    : "none",
                                            }}
                                        >
                                            {isSelected && (
                                                <div
                                                    className="rounded-full"
                                                    style={{
                                                        width: "12px",
                                                        height: "12px",
                                                        background: "#007aff",
                                                    }}
                                                />
                                            )}
                                        </div>

                                        <div className="space-y-1.5 pointer-events-none min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-mono" style={{ color: "rgba(0,0,0,0.2)" }}>
                                                    {String(i + 1).padStart(2, "0")}
                                                </span>
                                                <span className="text-base font-bold" style={{ color: "#1d1d1f" }}>
                                                    {plan.name}
                                                </span>
                                                {plan.highlight && !plan.soldOut && (
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                                                        style={{ background: "#007aff", color: "#fff" }}>
                                                        POPULAR
                                                    </span>
                                                )}
                                                {plan.soldOut ? (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                        style={{ background: "rgba(255,59,48,0.1)", color: "#ff3b30", border: "1px solid rgba(255,59,48,0.2)" }}>
                                                        SOLD OUT
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                                        style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.35)" }}>
                                                        残り {plan.remaining} 枠
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs" style={{ color: "#6e6e73" }}>{plan.tagline}</p>
                                        </div>
                                    </div>

                                    <div className="text-right flex-shrink-0 pointer-events-none">
                                        <p className="text-xl font-black" style={{ color: "#1d1d1f" }}>{plan.priceLabel}</p>
                                        <p className="text-[10px] mt-0.5" style={{ color: "#aeaeb2" }}>一括払い</p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div style={{ height: "1px", background: "rgba(0,0,0,0.05)", margin: "0 24px" }} />

                                {/* Benefits */}
                                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pointer-events-none">
                                    <div className="flex items-start gap-2 sm:col-span-2 mb-1">
                                        <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="currentColor"
                                            style={{ color: "#ff9500" }} viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-xs font-medium" style={{ color: "#ff9500" }}>
                                            先行特典：正式版リリース後 3ヶ月間を初回料金のみで利用可能
                                        </span>
                                    </div>
                                    {plan.benefits.map((b) => (
                                        <div key={b} className="flex items-start gap-2">
                                            <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                                                style={{ color: isSelected ? "#007aff" : "#aeaeb2" }}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-xs leading-relaxed" style={{ color: "#6e6e73" }}>{b}</span>
                                        </div>
                                    ))}
                                </div>
                            </label>
                        );
                    })}
                </div>
            </main>

            {/* 申し込みバー — フッターの直上に配置 */}
            <div className="sticky bottom-0 z-40 px-6 py-5 mb-14 mx-4 rounded-3xl flex items-center justify-between gap-4 transition-all"
                style={{
                    background: "rgba(245,245,247,0.95)",
                    backdropFilter: "saturate(180%) blur(24px)",
                    WebkitBackdropFilter: "saturate(180%) blur(24px)",
                    borderTop: "1px solid rgba(0,0,0,0.08)",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}>
                <div className="max-w-2xl mx-auto">
                    {selectedPlan ? (
                        <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate" style={{ color: "#1d1d1f" }}>
                                    {selectedPlan.name}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: "#aeaeb2" }}>
                                    {selectedPlan.priceLabel} 一括払い / 残り {selectedPlan.remaining} 枠
                                </p>
                            </div>
                            {errorMessage && (
                                <p className="text-xs flex-shrink-0 max-w-xs text-right" style={{ color: "#ff3b30" }}>
                                    {errorMessage}
                                </p>
                            )}
                            <button
                                onClick={handleCheckout}
                                disabled={state === "loading"}
                                className="flex-shrink-0 font-bold px-8 py-3.5 rounded-full text-sm whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background: "#FFD600",
                                    color: "#1d1d1f",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                                }}
                            >
                                {state === "loading" ? "処理中..." : `${selectedPlan.priceLabel} で申し込む`}
                            </button>
                        </div>
                    ) : (
                        <p className="text-center text-sm py-1" style={{ color: "#aeaeb2" }}>
                            プランを選択してください
                        </p>
                    )}
                </div>
            </div>

            <FooterLight />
        </div>
    );
}