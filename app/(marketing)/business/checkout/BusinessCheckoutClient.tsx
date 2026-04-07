// app/(marketing)/business/checkout/BusinessCheckoutClient.tsx
"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { BusinessPlanWithAvailability, PlanId } from "@/features/business/types";

type CheckoutState = "idle" | "loading" | "error";

export default function BusinessCheckoutClient({
  plans,
  initialPlanId,
}: {
  plans: BusinessPlanWithAvailability[];
  initialPlanId: string | null;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(
    (initialPlanId as PlanId) ?? null
  );
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

      const data = (await res.json()) as { success?: boolean; squareUrl?: string; error?: string };
      if (!res.ok || !data.success) {
        setState("error");
        setErrorMessage(data.error ?? "チェックアウトの開始に失敗しました。");
        return;
      }

      if (!data.squareUrl) {
        setState("error");
        setErrorMessage("決済リンクが設定されていません。管理者にお問い合わせください。");
        return;
      }

      window.location.href = data.squareUrl;
    } catch {
      setState("error");
      setErrorMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
    }
  }

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <>
      {/* Tailwindで表現できないアニメーション・疑似要素のみ */}
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes dotBlink {
          0%,100% { opacity:1; } 50% { opacity:.2; }
        }
        @keyframes flipIn {
          from { transform:rotateX(60deg) scaleY(.6); opacity:0; }
          to   { transform:rotateX(0) scaleY(1);     opacity:1; }
        }
        @keyframes selectGlow {
          0%  { box-shadow:0 0 0 0 rgba(0,210,255,0); }
          40% { box-shadow:0 0 20px 4px rgba(0,210,255,.2); }
          100%{ box-shadow:0 0 0 0 rgba(0,210,255,0); }
        }
        .anim-fade-up { animation:fadeUp .6s ease both; }
        .anim-blink   { animation:dotBlink 1.4s ease infinite; }
        .anim-flip    { animation:flipIn .3s ease; }
        .anim-glow    { animation:selectGlow .5s ease; }
        /* グリッド背景（::before はTailwindで書けない） */
        .grid-bg::before {
          content:''; position:fixed; inset:0;
          background-image:
            linear-gradient(rgba(0,210,255,.022) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,210,255,.022) 1px,transparent 1px);
          background-size:60px 60px;
          pointer-events:none; z-index:0;
        }
      `}</style>

      <div className="grid-bg relative min-h-screen overflow-x-hidden bg-[#07080f] text-[#e8eaf0]">
        <div className="relative z-10">
          <Header />

          <main className="mx-auto w-full max-w-[1320px] px-6 pt-28 pb-5">

            {/* ── Header block ── */}
            <div className="anim-fade-up mb-11">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00d2ff]/25 bg-[#00d2ff]/7 px-3.5 py-1.5">
                <span className="anim-blink h-1.5 w-1.5 rounded-full bg-[#00d2ff]" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-[#00d2ff]">
                  Business Plans Available
                </span>
              </div>

              <h1 className="mb-3 text-[clamp(1.8rem,5vw,2.6rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-white">
                Businessプランを選択
              </h1>
              <p className="text-[.84rem] font-light leading-relaxed text-[#5a6070]">
                プランを選んで申し込みボタンを押すと、Square の安全な決済ページへ移動します
              </p>
            </div>

            {/* ── Plan cards (ChatGPT-style comparison) ── */}
            <div className="mb-12">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#3a3f50]">Plans</p>
                <p className="font-mono text-[10px] text-[#3a3f50]">横にスワイプして比較</p>
              </div>

              <div className="flex items-stretch gap-4 overflow-x-auto pb-2 lg:grid lg:auto-rows-fr lg:grid-cols-5 lg:items-stretch lg:overflow-visible lg:pb-0">
              {plans.map((plan, i) => {
                const isSelected = selectedPlanId === plan.id;
                const isLow = !plan.soldOut && plan.remaining <= 3;
                const previewBenefits = plan.benefits.slice(0, 3);

                return (
                  <button
                    type="button"
                    key={plan.id}
                    onClick={() => !plan.soldOut && setSelectedPlanId(plan.id as PlanId)}
                    disabled={plan.soldOut}
                    aria-pressed={isSelected}
                    aria-label={`${plan.name} ${plan.priceLabel}`}
                    className={[
                      "flex min-h-[340px] min-w-[252px] self-stretch flex-col cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 lg:min-w-0 lg:h-full",
                      isSelected
                        ? "anim-glow border-[#00d2ff] bg-[#00d2ff]/5 shadow-[0_0_0_1px_rgba(0,210,255,0.2)]"
                        : "border-white/6 bg-[#0e1018] hover:border-[#00d2ff]/22 hover:bg-[#13151f]",
                      plan.soldOut ? "cursor-not-allowed opacity-40" : "",
                    ].join(" ")}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                      <div className="flex items-start gap-3">
                        {/* Radio */}
                        <div className={[
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          isSelected ? "border-[#00d2ff]" : "border-[#3a3f50]",
                        ].join(" ")}>
                          {isSelected && <div className="h-2 w-2 rounded-full bg-[#00d2ff]" />}
                        </div>

                        <div>
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] tracking-[.08em] text-[#3a3f50]">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="text-[1.02rem] font-extrabold tracking-[-0.01em] text-white">
                              {plan.name}
                            </span>
                            {plan.highlight && !plan.soldOut && (
                              <span className="rounded-full border border-[#00d2ff]/70 bg-[#00d2ff] px-2.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-[.08em] text-[#041018] shadow-[0_0_14px_rgba(0,210,255,0.5)]">
                                MOST POPULAR
                              </span>
                            )}
                            {plan.soldOut ? (
                              <span className="rounded-full border border-[#ff6b5b]/20 bg-[#ff6b5b]/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-[#ff6b5b]">
                                Sold Out
                              </span>
                            ) : isLow ? (
                              <span className="rounded-full border border-[#ff6b5b]/20 bg-[#ff6b5b]/8 px-2 py-0.5 font-mono text-[9px] font-bold text-[#ff6b5b]">
                                残り {plan.remaining} 枠
                              </span>
                            ) : (
                              <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[9px] text-[#5a6070]">
                                残り {plan.remaining} 枠
                              </span>
                            )}
                          </div>
                          <p className="text-[.72rem] font-light text-[#5a6070]">{plan.tagline}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-5">
                      <p className="text-[1.45rem] font-extrabold leading-none text-white">{plan.priceLabel}</p>
                      <p className="mt-1 font-mono text-[10px] tracking-[.08em] text-[#3a3f50]">ONE-TIME PAYMENT</p>
                    </div>

                    <div className="mx-5 mt-4 h-px bg-white/6" />

                    {/* Benefits preview */}
                    <div className="grid grid-cols-1 gap-y-2.5 px-5 py-4">
                      {previewBenefits.map((b) => (
                        <div key={b} className="flex items-start gap-1.5 text-[.73rem] font-light leading-relaxed text-[#7a8494]">
                          <svg
                            className={["mt-0.5 h-3 w-3 shrink-0", isSelected ? "text-[#00d2ff]" : "text-[#3a3f50]"].join(" ")}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {b}
                        </div>
                      ))}
                      {plan.benefits.length > previewBenefits.length && (
                        <p className="mt-1 text-[10px] font-mono tracking-[.06em] text-[#3a3f50]">
                          +{plan.benefits.length - previewBenefits.length} more
                        </p>
                      )}
                    </div>

                    <div className="mt-auto px-5 pb-5 pt-2">
                      <div className={[
                        "rounded-lg border px-3 py-2 text-center text-[11px] font-bold tracking-[.06em]",
                        isSelected
                          ? "border-[#00d2ff]/45 bg-[#00d2ff]/12 text-[#8de9ff]"
                          : "border-white/10 bg-white/[0.02] text-white/45",
                      ].join(" ")}>
                        {isSelected ? "選択中" : "選択する"}
                      </div>
                    </div>
                  </button>
                );
              })}
              </div>

              {selectedPlan && (
                <div className="mt-4 rounded-2xl border border-white/8 bg-[#0f121c] p-6">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[.12em] text-[#00d2ff]">
                    Selected Plan Details
                  </p>
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-[1.1rem] font-extrabold text-white">{selectedPlan.name}</p>
                      <p className="mt-1 text-[.75rem] text-[#5a6070]">{selectedPlan.tagline}</p>
                    </div>
                    <p className="text-[1.2rem] font-extrabold text-white">{selectedPlan.priceLabel}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {selectedPlan.benefits.map((b) => (
                      <div key={b} className="flex items-start gap-2 text-[.75rem] text-[#7a8494]">
                        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00d2ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* ── Sticky bar ── */}
          <div className="sticky bottom-3 z-40 mx-2 mb-3 rounded-2xl border border-[#00d2ff]/12 bg-[#0d0f16]/96 px-5 py-3.5 backdrop-blur-xl">
            <div className="mx-auto w-full max-w-[680px] xl:max-w-[980px] 2xl:max-w-[1320px]">
              {selectedPlan ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[.9rem] font-extrabold text-white">{selectedPlan.name}</p>
                      <p className={[
                        "mt-0.5 font-mono text-[.7rem] tracking-[.05em]",
                        selectedPlan.remaining <= 3 ? "text-[#ff6b5b]" : "text-[#3a3f50]",
                      ].join(" ")}>
                        {selectedPlan.priceLabel} · 残り {selectedPlan.remaining} 枠
                        {selectedPlan.remaining <= 3 && " — 残りわずか"}
                      </p>
                      {errorMessage && <p className="mt-0.5 text-[.72rem] text-[#ff6b5b]">{errorMessage}</p>}
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={state === "loading"}
                      className="shrink-0 rounded-lg bg-[#00d2ff] px-6 py-3 text-[.8rem] font-bold tracking-[.04em] text-[#07080f] shadow-[0_0_20px_rgba(0,210,255,0.25)] transition-all hover:bg-white hover:shadow-[0_0_32px_rgba(0,210,255,0.45)] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {state === "loading" ? "処理中..." : `${selectedPlan.priceLabel} で申し込む →`}
                    </button>
                  </div>
                  {/* 振込導線：Presence / Legacy のみ表示 */}
                  {(selectedPlan.id === "presence" || selectedPlan.id === "legacy") && (
                    <p className="text-center font-mono text-[.68rem] tracking-[.06em] text-[#3a3f50]">
                      請求書払い・振込をご希望の方は{" "}
                      <a
                        href={`/contact?plan=${selectedPlan.id}`}
                        className="text-[#00d2ff]/70 underline underline-offset-2 hover:text-[#00d2ff] transition-colors"
                      >
                        こちら
                      </a>
                      {" "}からお問い合わせください
                    </p>
                  )}
                </div>
              ) : (
                <p className="py-1 text-center font-mono text-[.78rem] tracking-[.08em] text-[#3a3f50]">
                  — プランを選択してください —
                </p>
              )}
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
}
