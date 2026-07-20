// features/business/server/create-checkout.ts

import {
  BUSINESS_PLANS,
  getBusinessRegionLabel,
  isBusinessRegionId,
  PREFECTURES_BY_BUSINESS_REGION,
} from "@/features/business/constants";
import { saveBusinessOrder } from "@/features/business/server/save-order";
import type { PlanId, CreateCheckoutResult } from "@/features/business/types";
import { getAdSlot } from "@/lib/supabase/ad-slots";
import { createSquarePaymentLink } from "@/lib/square/payment-links";

const COMPLETE_REDIRECT_URL = "https://app.vizion-connection.jp/business/complete";

interface CreateCheckoutInput {
  planId: PlanId;
  email: string;
  slug: string;
  /** roots 用: 都道府県名（例: 東京都） */
  prefecture?: string | null;
  /** 互換: 地方ブロック ID（prefecture 未指定時のフォールバック用） */
  region?: string | null;
}

function isKnownPrefecture(name: string): boolean {
  return Object.values(PREFECTURES_BY_BUSINESS_REGION).some((list) => list.includes(name));
}

export async function createCheckout(
  input: CreateCheckoutInput,
): Promise<CreateCheckoutResult> {
  const { planId, email, slug } = input;

  const plan = BUSINESS_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return { success: false, error: "プランが見つかりません" };
  }

  // Legacy は個別見積（Payment Link 対象外）
  if (plan.amount === 0 || planId === "legacy") {
    return {
      success: false,
      error: "このプランは個別相談となります。お問い合わせください。",
    };
  }

  // 枠キー: roots → 都道府県 / 全国プラン → 全国
  let slotPrefecture: string;
  if (planId === "roots") {
    const pref = (input.prefecture ?? "").trim();
    if (pref && isKnownPrefecture(pref)) {
      slotPrefecture = pref;
    } else if (isBusinessRegionId(input.region)) {
      // 旧 UI 互換: ブロック選択のみの場合はブロック内の先頭空き都道府県を使わない（明示必須）
      return {
        success: false,
        error: "都道府県を選択してください",
      };
    } else {
      return { success: false, error: "都道府県を選択してください" };
    }
  } else {
    slotPrefecture = "全国";
  }

  const slot = await getAdSlot(slotPrefecture, planId);
  if (!slot) {
    return { success: false, error: "掲載枠データが見つかりません。管理者にお問い合わせください。" };
  }
  if (slot.soldOut) {
    return { success: false, error: "この枠は満席です" };
  }

  const displayName =
    planId === "roots"
      ? `地域プラン - ${slotPrefecture}`
      : `${plan.name.replace(/^[^\p{L}\p{N}]+/u, "").trim() || plan.id} - 全国`;

  // payment_note: webhook 照合用（email 等の PII は載せない）
  const paymentNote = `vc:${planId}:${slotPrefecture}:${slug}`.slice(0, 500);

  const link = await createSquarePaymentLink({
    name: displayName,
    amountYen: plan.amount,
    redirectUrl: COMPLETE_REDIRECT_URL,
    paymentNote,
  });

  if (!link.success) {
    return { success: false, error: link.error };
  }

  // region カラムに都道府県 or 全国を保存（ad_slots 突合用）
  await saveBusinessOrder(
    {
      email,
      slug,
      planId: plan.id,
      planName: plan.name,
      amount: plan.amount,
      squareLink: link.url,
      region: slotPrefecture,
    },
    "pending",
  );

  return {
    success: true,
    squareUrl: link.url,
    planName: plan.name,
  };
}

/** デバッグ / 表示用 */
export function describeCheckoutSlot(planId: PlanId, prefecture: string | null) {
  if (planId === "roots") {
    return prefecture ?? "";
  }
  if (isBusinessRegionId(prefecture)) {
    return getBusinessRegionLabel(prefecture);
  }
  return "全国";
}
