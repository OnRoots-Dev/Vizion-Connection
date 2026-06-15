// features/og/server/og-portfolio-data.ts
// Portfolio 専用 OGP のデータ収集。公開プロフィール かつ is_public のみ成功を返す。
// 非公開/存在しない slug は { success:false } を返し、ユーザー情報を一切出さない。

import { getPublicProfileBySlug } from "@/features/profile/server/get-profile-by-slug";
import { supabaseServer } from "@/lib/supabase/server";
import { calcDayCount, getJstDateKey } from "@/lib/day-count";
import { env } from "@/lib/env";
import { fetchBase64 } from "./og-data-service";

// Portfolio は実体験の配色（明色）を使用し、公開ページと一致させる
const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Crew: "#FFC81E", Business: "#3C8CFF", Admin: "#7C3AED",
};
const ROLE_GRADIENT: Record<string, string> = {
    Athlete: "#2D0000", Trainer: "#001A0A", Crew: "#1A0F00", Business: "#000A24", Admin: "#1F0F2E",
};
const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Crew: "CREW", Business: "BUSINESS", Admin: "ADMIN",
};

export type OgPortfolioData = {
    slug: string;
    displayName: string;
    roleLabel: string;
    roleColor: string;
    roleGradient: string;
    initials: string;
    dayCount: number;
    streak: number;
    journeyCount: number;
    completion: number;
    avatarData: string | null;
    logoData: string | null;
};

interface JourneyRow {
    condition_score: number | null;
    image_url: string | null;
    video_url: string | null;
    tags: string[] | null;
    created_at: string;
}

function shiftDate(d: Date, n: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}

function currentStreak(dateKeys: Set<string>): number {
    if (dateKeys.size === 0) return 0;
    const today = getJstDateKey(new Date());
    const yesterday = getJstDateKey(shiftDate(new Date(), -1));
    if (!dateKeys.has(today) && !dateKeys.has(yesterday)) return 0;
    let count = 0;
    let cursor = dateKeys.has(today) ? new Date() : shiftDate(new Date(), -1);
    while (dateKeys.has(getJstDateKey(cursor))) {
        count += 1;
        cursor = shiftDate(cursor, -1);
    }
    return count;
}

export async function getOgPortfolioData(
    slug: string,
): Promise<{ success: true; data: OgPortfolioData } | { success: false }> {
    const result = await getPublicProfileBySlug(slug);
    if (!result.success || !result.data.isPublic) {
        return { success: false };
    }

    const p = result.data;

    const [journeysRes, userMetaRes] = await Promise.all([
        supabaseServer
            .from("journeys")
            .select("condition_score, image_url, video_url, tags, created_at")
            .eq("user_slug", slug)
            .eq("is_public", true)
            .order("created_at", { ascending: false })
            .limit(300),
        supabaseServer.from("users").select("day0_date").eq("slug", slug).single(),
    ]);

    const journeys = (journeysRes.data ?? []) as JourneyRow[];
    const day0Date = (userMetaRes.data?.day0_date as string | null) ?? null;
    const oldest = journeys.length ? journeys[journeys.length - 1].created_at : null;

    const dayCount = calcDayCount(day0Date, oldest) ?? 0;
    const journeyCount = journeys.length;
    const keys = new Set(journeys.map((j) => getJstDateKey(new Date(j.created_at))));
    const streak = currentStreak(keys);

    const completionItems = [
        Boolean(day0Date),
        journeyCount >= 1,
        journeyCount >= 7,
        journeyCount >= 30,
        journeys.some((j) => j.image_url || j.video_url),
        journeys.some((j) => j.tags?.length),
        Boolean(p.bio?.trim() || p.claim?.trim()),
    ];
    const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

    const role = p.role ?? "Crew";
    const displayName = p.displayName ?? "Vizion Member";
    const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

    const [avatarData, logoData] = await Promise.all([
        fetchBase64(p.avatarUrl ?? p.profileImageUrl ?? null),
        fetchBase64(`${env.NEXT_PUBLIC_BASE_URL}/images/Vizion_Connection_logo-wt.png`),
    ]);

    return {
        success: true,
        data: {
            slug,
            displayName,
            roleLabel: ROLE_LABEL[role] ?? String(role).toUpperCase(),
            roleColor: ROLE_COLOR[role] ?? "#a78bfa",
            roleGradient: ROLE_GRADIENT[role] ?? "#1a1a2e",
            initials,
            dayCount,
            streak,
            journeyCount,
            completion,
            avatarData,
            logoData,
        },
    };
}
