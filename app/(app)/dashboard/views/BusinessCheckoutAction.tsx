"use client";

import { useState } from "react";
import type { BusinessMonetizePlan } from "@/features/business-monetize/types";
import { MONETIZE_TO_AD_SLOT_TIER } from "@/features/business-monetize/constants";
import { PrimaryButton } from "@/app/(app)/dashboard/components/ui";

/** Square checkout entry point used by the official Business Monetize view. */
export function BusinessCheckoutAction({
  selectedPlan,
  currentPlan,
  primaryPrefecture,
  priceLabel,
  onSubmitError,
}: {
  selectedPlan: BusinessMonetizePlan;
  currentPlan: string;
  primaryPrefecture?: string | null;
  priceLabel: string;
  onSubmitError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  const startCheckout = async () => {
    if (busy || selectedPlan === "FREE" || selectedPlan === currentPlan) return;
    if (selectedPlan === "ENTERPRISE") {
      onSubmitError("ENTERPRISEは個別契約です。営業担当者までお問い合わせください。");
      return;
    }
    const legacyPlanId = MONETIZE_TO_AD_SLOT_TIER[selectedPlan];
    if (!legacyPlanId) {
      onSubmitError("このプランは現在オンライン契約に対応していません。営業担当者までお問い合わせください。");
      return;
    }
    setBusy(true);
    onSubmitError("");
    try {
      const res = await fetch("/api/business-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: legacyPlanId,
          ...(selectedPlan === "LOCAL" && primaryPrefecture ? { prefecture: primaryPrefecture } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        squareUrl?: string;
        error?: string;
      };
      if (res.status === 401) {
        onSubmitError("セッションが切れています。ログインし直してください。");
        return;
      }
      if (!res.ok || !data.success) {
        onSubmitError(data.error ?? "決済の開始に失敗しました。");
        return;
      }
      if (!data.squareUrl) {
        onSubmitError("決済リンクの取得に失敗しました。しばらくしてから再試行してください。");
        return;
      }
      window.location.href = data.squareUrl;
    } catch {
      onSubmitError("通信エラーが発生しました。通信環境を確認して再試行してください。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PrimaryButton onClick={() => void startCheckout()} disabled={busy}>
      {busy ? "決済準備中..." : `Square決済で契約する（${priceLabel}）`}
    </PrimaryButton>
  );
}
