// app/api/business-checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { BUSINESS_PLANS } from "@/features/business/constants";
import { createCheckout } from "@/features/business/server/create-checkout";
import type { PlanId } from "@/features/business/types";
import { businessLimiter, getIp } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { notifyBusinessCheckoutSubmitted } from "@/lib/notifications/create-notification";
import {
  getNationalTierAvailabilityFromAdSlots,
  getRootsRegionAvailabilityFromAdSlots,
  listAdSlots,
} from "@/lib/supabase/ad-slots";
import { isSquareConfigured } from "@/lib/square/payment-links";

export async function GET(): Promise<NextResponse> {
  try {
    const [slots, regions, national] = await Promise.all([
      listAdSlots(),
      getRootsRegionAvailabilityFromAdSlots(),
      getNationalTierAvailabilityFromAdSlots(),
    ]);

    const rootsAgg = slots
      .filter((s) => s.tier === "roots")
      .reduce(
        (acc, s) => {
          acc.total += s.total;
          acc.sold += s.sold;
          return acc;
        },
        { total: 0, sold: 0 },
      );
    const nationalByTier = new Map(national.map((n) => [n.tier, n]));

    const plans = BUSINESS_PLANS.map((plan) => {
      if (plan.id === "roots") {
        const remaining = Math.max(0, rootsAgg.total - rootsAgg.sold);
        return {
          ...plan,
          squareUrl: "",
          seats: rootsAgg.total || plan.seats,
          soldCount: rootsAgg.sold,
          remaining,
          soldOut: remaining <= 0,
        };
      }
      const nat = nationalByTier.get(plan.id);
      if (nat) {
        return {
          ...plan,
          squareUrl: "",
          seats: nat.seats || plan.seats,
          soldCount: nat.seats - nat.remaining,
          remaining: nat.remaining,
          soldOut: nat.soldOut,
        };
      }
      return {
        ...plan,
        squareUrl: "",
        soldCount: 0,
        remaining: plan.seats,
        soldOut: false,
      };
    });

    return NextResponse.json({
      plans,
      regions,
      national,
      squareConfigured: isSquareConfigured(),
    });
  } catch (err) {
    console.error("[GET /api/business-checkout]", err instanceof Error ? err.message : "error");
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const profile = await getSupabaseProfile();
    if (!profile) {
      return NextResponse.json({ success: false, error: "セッションが無効です" }, { status: 401 });
    }

    const { success } = await businessLimiter.limit(getIp(req));
    if (!success) {
      return NextResponse.json(
        { success: false, error: "しばらく時間をおいてから再度お試しください" },
        { status: 429 },
      );
    }

    let body: { planId?: PlanId; prefecture?: string; region?: string };
    try {
      body = await readLimitedJson(req);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) {
        return NextResponse.json({ error: "Payload too large" }, { status: 413 });
      }
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const { planId, prefecture, region } = body;
    if (!planId) {
      return NextResponse.json({ success: false, error: "プランIDが指定されていません" }, { status: 400 });
    }

    const result = await createCheckout({
      planId,
      email: profile.email,
      slug: profile.slug,
      prefecture: prefecture ?? null,
      region: region ?? null,
    });

    if (!result.success) {
      const status =
        result.error.includes("満席") ? 409 :
        result.error.includes("選択") ? 400 :
        result.error.includes("未設定") || result.error.includes("失敗") ? 502 :
        400;
      return NextResponse.json({ success: false, error: result.error }, { status });
    }

    await notifyBusinessCheckoutSubmitted({
      slug: profile.slug,
      planName: result.planName,
      amount: BUSINESS_PLANS.find((p) => p.id === planId)?.amount ?? 0,
    }).catch((err) => {
      console.error("[notifyBusinessCheckoutSubmitted]", err instanceof Error ? err.message : "error");
    });

    return NextResponse.json({
      success: true,
      squareUrl: result.squareUrl,
      planName: result.planName,
    });
  } catch (err) {
    console.error("[POST /api/business-checkout]", err instanceof Error ? err.message : "error");
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
