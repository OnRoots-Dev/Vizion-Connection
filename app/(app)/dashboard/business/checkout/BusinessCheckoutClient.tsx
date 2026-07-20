// app/(app)/dashboard/business/checkout/BusinessCheckoutClient.tsx
"use client";

import { useMemo, useState } from "react";
import {
  BUSINESS_CAMPAIGN,
  PREFECTURES_BY_BUSINESS_REGION,
  type BusinessRegionId,
} from "@/features/business/constants";
import type { BusinessPlanWithAvailability, PlanId, RootsRegionAvailability } from "@/features/business/types";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { motion } from "framer-motion";
import { PRESS_SCALE } from "@/components/ui/Pressable";
import { springDefault, springSnap } from "@/lib/motion/apple-springs";

type CheckoutState = "idle" | "loading" | "error";

type PrefSlot = {
  prefecture: string;
  remaining: number;
  soldOut: boolean;
  total: number;
};

export default function BusinessCheckoutClient({
  plans,
  initialPlanId,
  rootsRegionAvailability = [],
  prefSlots = [],
}: {
  plans: BusinessPlanWithAvailability[];
  initialPlanId: string | null;
  rootsRegionAvailability?: RootsRegionAvailability[];
  /** roots の都道府県別残枠（ad_slots） */
  prefSlots?: PrefSlot[];
}) {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(
    (initialPlanId as PlanId) ?? null
  );
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [state, setState] = useState<CheckoutState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [authRequired, setAuthRequired] = useState(false);

  const isRootsSelected = selectedPlanId === "roots";
  // Roots は都道府県必須（ad_slots のキー）。
  const prefectureRequiredButMissing = isRootsSelected && !selectedPrefecture;

  const prefByName = useMemo(() => {
    const map = new Map(prefSlots.map((p) => [p.prefecture, p]));
    return map;
  }, [prefSlots]);

  const prefecturesInRegion = useMemo(() => {
    if (!selectedRegion || !(selectedRegion in PREFECTURES_BY_BUSINESS_REGION)) return [];
    const names = PREFECTURES_BY_BUSINESS_REGION[selectedRegion as BusinessRegionId] ?? [];
    return names.map((name) => {
      const slot = prefByName.get(name);
      return {
        name,
        remaining: slot?.remaining ?? 0,
        soldOut: slot?.soldOut ?? true,
        total: slot?.total ?? 0,
      };
    });
  }, [selectedRegion, prefByName]);

  function selectPlan(planId: PlanId) {
    setSelectedPlanId(planId);
    if (planId !== "roots") {
      setSelectedRegion(null);
      setSelectedPrefecture(null);
    }
  }

  function selectRegion(regionId: string) {
    setSelectedRegion(regionId);
    setSelectedPrefecture(null);
  }

  const checkoutRedirect = useMemo(
    () =>
      selectedPlanId
        ? `/dashboard/business/checkout?plan=${selectedPlanId}`
        : "/dashboard/business/checkout",
    [selectedPlanId],
  );

  const appCheckoutUrl = `https://app.vizion-connection.jp${checkoutRedirect}`;
  const registerHref = `https://vizion-connection.jp/register?role=Business&redirect=${encodeURIComponent(appCheckoutUrl)}`;
  const loginHref = `https://vizion-connection.jp/login?redirect=${encodeURIComponent(appCheckoutUrl)}`;

  async function handleCheckout() {
    if (!selectedPlanId) return;
    if (prefectureRequiredButMissing) {
      setState("error");
      setErrorMessage("都道府県を選択してください。");
      return;
    }
    setState("loading");
    setErrorMessage("");
    setAuthRequired(false);
    try {
      const res = await fetch("/api/business-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlanId,
          ...(isRootsSelected && selectedPrefecture
            ? { prefecture: selectedPrefecture, region: selectedRegion }
            : {}),
        }),
      });

      if (res.status === 401) {
        setState("idle");
        setAuthRequired(true);
        return;
      }

      const data = (await res.json()) as { success?: boolean; squareUrl?: string; error?: string };
      if (!res.ok || !data.success) {
        setState("error");
        setErrorMessage(data.error ?? "チェックアウトの開始に失敗しました。");
        return;
      }

      if (!data.squareUrl) {
        setState("error");
        setErrorMessage("支払いリンクの生成に失敗しました。管理者にお問い合わせください。");
        return;
      }

      // Square Checkout（Payment Link）へリダイレクト
      window.location.href = data.squareUrl;
    } catch {
      setState("error");
      setErrorMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
    }
  }

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <>
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
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0B0B0F", color: "#e8eaf0", padding: "32px 24px" }}>
        <main style={{ maxWidth: 1200, margin: "0 auto" }}>
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
            <p className="mt-3 max-w-2xl text-[.75rem] font-light leading-[1.8] text-[#7a8494]">
              {BUSINESS_CAMPAIGN.periodLabel}
              <br />
              キャンペーン期間：{BUSINESS_CAMPAIGN.dateRange}
              <br />
              {BUSINESS_CAMPAIGN.autoRenewNote}
            </p>
          </div>

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
                    onClick={() => !plan.soldOut && selectPlan(plan.id as PlanId)}
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
                    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                      <div className="flex items-start gap-3">
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
                      {plan.regularPriceLabel && (
                        <p className="mb-1 font-mono text-[10px] tracking-[.04em] text-[#5a6070] line-through">
                          通常 {plan.regularPriceLabel}
                        </p>
                      )}
                      <p className="text-[1.45rem] font-extrabold leading-none text-white">{plan.priceLabel}</p>
                      <p className="mt-1 font-mono text-[10px] tracking-[.06em] text-[#3a3f50]">
                        {plan.amount === 0 ? "CUSTOM QUOTE" : "1ヶ月料金で4ヶ月利用"}
                      </p>
                    </div>

                    <div className="mx-5 mt-4 h-px bg-white/6" />

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
                  <div className="text-right">
                    {selectedPlan.regularPriceLabel && (
                      <p className="font-mono text-[10px] text-[#5a6070] line-through">
                        通常 {selectedPlan.regularPriceLabel}
                      </p>
                    )}
                    <p className="text-[1.2rem] font-extrabold tracking-[-0.02em] text-white">
                      {selectedPlan.amount > 0 ? (
                        <>
                          ¥
                          <AnimatedNumber value={selectedPlan.amount} className="font-extrabold tabular-nums" />
                        </>
                      ) : (
                        selectedPlan.priceLabel
                      )}
                    </p>
                    {selectedPlan.amount > 0 && (
                      <p className="mt-0.5 font-mono text-[10px] text-[#3a3f50]">1ヶ月料金で4ヶ月利用</p>
                    )}
                    <p className="mt-1 font-mono text-[10px] tracking-[0.04em] text-[#00d2ff]/80">
                      残{" "}
                      <AnimatedNumber
                        value={
                          selectedPrefecture
                            ? (prefByName.get(selectedPrefecture)?.remaining ?? 0)
                            : selectedPlan.remaining
                        }
                        className="tabular-nums font-bold"
                      />
                      {" / "}
                      <AnimatedNumber
                        value={
                          selectedPrefecture
                            ? (prefByName.get(selectedPrefecture)?.total ?? 0)
                            : selectedPlan.seats
                        }
                        className="tabular-nums"
                      />
                    </p>
                  </div>
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

                {isRootsSelected && (
                  <div className="mt-6 border-t border-white/8 pt-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#00d2ff]">1. 地方ブロック</p>
                      <p className="font-mono text-[10px] text-[#3a3f50]">ad_slots 集計</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {rootsRegionAvailability.map((region) => {
                        const active = selectedRegion === region.id;
                        return (
                          <motion.button
                            type="button"
                            key={region.id}
                            onClick={() => !region.soldOut && selectRegion(region.id)}
                            disabled={region.soldOut}
                            aria-pressed={active}
                            whileTap={region.soldOut ? undefined : { scale: PRESS_SCALE }}
                            transition={springSnap}
                            className={[
                              "flex flex-col items-start gap-1 rounded-xl border px-3.5 py-3 text-left",
                              active
                                ? "border-[#00d2ff] bg-[#00d2ff]/8 shadow-[0_0_0_1px_rgba(0,210,255,0.2)]"
                                : region.soldOut
                                  ? "cursor-not-allowed border-white/6 bg-white/[0.02] opacity-45"
                                  : "cursor-pointer border-white/8 bg-[#0e1018] hover:border-[#00d2ff]/30",
                            ].join(" ")}
                          >
                            <span className="text-[.8rem] font-bold text-white">{region.label}</span>
                            <span className={[
                              "font-mono text-[.68rem] tracking-[.04em] tabular-nums",
                              region.soldOut ? "text-[#ff6b5b]" : region.remaining <= 3 ? "text-[#ff6b5b]" : "text-[#5a6070]",
                            ].join(" ")}>
                              {region.soldOut ? (
                                "満席"
                              ) : (
                                <>
                                  残り{" "}
                                  <AnimatedNumber value={region.remaining} className="tabular-nums" />
                                  /
                                  <AnimatedNumber value={region.seats} className="tabular-nums" />
                                </>
                              )}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {selectedRegion && (
                      <div className="mt-5">
                        <p className="mb-3 font-mono text-[10px] uppercase tracking-[.12em] text-[#00d2ff]">
                          2. 都道府県（必須）
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {prefecturesInRegion.map((pref) => {
                            const active = selectedPrefecture === pref.name;
                            return (
                              <motion.button
                                type="button"
                                key={pref.name}
                                onClick={() => !pref.soldOut && setSelectedPrefecture(pref.name)}
                                disabled={pref.soldOut}
                                aria-pressed={active}
                                whileTap={pref.soldOut ? undefined : { scale: PRESS_SCALE }}
                                transition={springSnap}
                                layout
                                className={[
                                  "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left",
                                  active
                                    ? "border-[#00d2ff] bg-[#00d2ff]/10"
                                    : pref.soldOut
                                      ? "cursor-not-allowed border-white/6 opacity-40"
                                      : "border-white/8 bg-[#0e1018] hover:border-[#00d2ff]/30",
                                ].join(" ")}
                              >
                                <span className="text-[.78rem] font-bold text-white">{pref.name}</span>
                                <span className="font-mono text-[.65rem] tabular-nums text-[#5a6070]">
                                  {pref.soldOut ? (
                                    "満席"
                                  ) : (
                                    <>
                                      残{" "}
                                      <AnimatedNumber value={pref.remaining} className="tabular-nums" />
                                      /
                                      <AnimatedNumber value={pref.total} className="tabular-nums" />
                                    </>
                                  )}
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {prefectureRequiredButMissing && (
                      <p className="mt-3 font-mono text-[.68rem] tracking-[.05em] text-[#3a3f50]">
                        ※ Roots は都道府県を選択してからお申し込みください（Square で決済します）
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <div className="sticky bottom-3 z-40 mx-2 mb-3 rounded-2xl border border-[#00d2ff]/12 bg-[#0d0f16]/96 px-5 py-3.5 backdrop-blur-xl">
          <div className="mx-auto w-full max-w-[680px] xl:max-w-[980px] 2xl:max-w-[1200px]">
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
                      {isRootsSelected && selectedPrefecture && ` · ${selectedPrefecture}`}
                    </p>
                    {errorMessage && <p className="mt-0.5 text-[.72rem] text-[#ff6b5b]">{errorMessage}</p>}
                  </div>
                  <motion.button
                    type="button"
                    onClick={handleCheckout}
                    disabled={state === "loading" || prefectureRequiredButMissing || selectedPlan.amount === 0}
                    whileTap={
                      state === "loading" || prefectureRequiredButMissing || selectedPlan.amount === 0
                        ? undefined
                        : { scale: PRESS_SCALE }
                    }
                    transition={springDefault}
                    className="shrink-0 rounded-lg bg-[#00d2ff] px-6 py-3 text-[.8rem] font-bold tracking-[.04em] text-[#07080f] shadow-[0_0_20px_rgba(0,210,255,0.25)] hover:bg-white hover:shadow-[0_0_32px_rgba(0,210,255,0.45)] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {state === "loading"
                      ? "リンク生成中..."
                      : selectedPlan.amount === 0
                        ? "個別相談へ"
                        : prefectureRequiredButMissing
                          ? "都道府県を選択"
                          : `${selectedPlan.priceLabel} で決済へ →`}
                  </motion.button>
                </div>
                {(selectedPlan.id === "signal" || selectedPlan.id === "presence" || selectedPlan.id === "legacy") && (
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
      </div>

      {authRequired && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 border-none bg-black/75 backdrop-blur-sm"
            aria-label="閉じる"
            onClick={() => setAuthRequired(false)}
          />
          <div
            role="dialog"
            aria-labelledby="auth-required-title"
            className="relative w-full max-w-md rounded-2xl border border-[#00d2ff]/20 bg-[#0e1018] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          >
            <h2
              id="auth-required-title"
              className="text-[1.15rem] font-extrabold tracking-[-0.01em] text-white"
            >
              申し込みにはアカウントが必要です
            </h2>
            <p className="mt-3 text-[.84rem] font-light leading-[1.85] text-[#5a6070]">
              Businessアカウントを無料で作成して、
              <br />
              そのままプランを購入できます。
            </p>
            <div className="mt-7 flex flex-col gap-3">
              <a
                href={registerHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00d2ff] px-6 py-3 text-[.82rem] font-bold tracking-[.04em] text-[#07080f] shadow-[0_0_20px_rgba(0,210,255,0.25)] transition-all hover:bg-white"
              >
                無料登録して申し込む →
              </a>
              <a
                href={loginHref}
                className="inline-flex items-center justify-center rounded-lg border border-white/12 px-6 py-3 text-[.82rem] font-semibold text-[#c8cdd8] transition-colors hover:border-[#00d2ff]/30 hover:text-white"
              >
                すでにアカウントをお持ちの方
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
