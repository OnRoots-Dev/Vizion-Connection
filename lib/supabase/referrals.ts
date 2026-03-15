// lib/supabase/referrals.ts
import { supabase } from "./client";

// 紹介レコード作成
export async function createReferral(params: {
    referrerSlug: string;
    referredSlug: string;
    referredRole?: string;
    referredEmail?: string;
}): Promise<boolean> {
    const { error } = await supabase
        .from("referrals")
        .insert({
            referrer_slug: params.referrerSlug,
            referred_slug: params.referredSlug,
            referred_role: params.referredRole ?? null,
            referred_email: params.referredEmail ?? null,
            status: "completed",
            points_awarded: 500,
        });
    if (error) { console.error("[createReferral]", error); return false; }
    return true;
}

// 紹介数カウント
export async function getReferralCount(referrerSlug: string): Promise<number> {
    const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_slug", referrerSlug);
    return count ?? 0;
}

// 既存コードとの互換性
export const countReferralsBySlug = getReferralCount;
export const findReferralByReferredSlug = async (referredSlug: string) => {
    const { data } = await supabase
        .from("referrals").select("referrer_slug").eq("referred_slug", referredSlug).single();
    return data ? { referrerSlug: data.referrer_slug } : null;
};