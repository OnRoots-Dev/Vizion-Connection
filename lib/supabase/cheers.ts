// lib/supabase/cheers.ts
import { supabaseServer as supabase } from "./server";
import type { LatestCheerItem } from "@/features/profile/types";
import { notifyCheerReceived } from "@/lib/notifications/create-notification";

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

function getJstPeriodStarts(now: Date) {
    const jstNow = new Date(now.getTime() + JST_OFFSET_MS);

    const dayStartJst = new Date(Date.UTC(
        jstNow.getUTCFullYear(),
        jstNow.getUTCMonth(),
        jstNow.getUTCDate(),
        0, 0, 0, 0,
    ));

    const dayOfWeek = jstNow.getUTCDay(); // 0: Sun ... 6: Sat
    const diffToMonday = (dayOfWeek + 6) % 7;
    const weekStartJst = new Date(dayStartJst);
    weekStartJst.setUTCDate(weekStartJst.getUTCDate() - diffToMonday);

    const monthStartJst = new Date(Date.UTC(
        jstNow.getUTCFullYear(),
        jstNow.getUTCMonth(),
        1,
        0, 0, 0, 0,
    ));

    return {
        dayStart: new Date(dayStartJst.getTime() - JST_OFFSET_MS).toISOString(),
        weekStart: new Date(weekStartJst.getTime() - JST_OFFSET_MS).toISOString(),
        monthStart: new Date(monthStartJst.getTime() - JST_OFFSET_MS).toISOString(),
    };
}

export interface CheerLimitUsage {
    sameTargetDay: number;
    sameTargetWeek: number;
    sameTargetMonth: number;
    dailyTotal: number;
}

export async function getCheerLimitUsage(toSlug: string, fromSlug: string, now = new Date()): Promise<CheerLimitUsage> {
    const { dayStart, weekStart, monthStart } = getJstPeriodStarts(now);

    const [sameTargetDayRes, sameTargetWeekRes, sameTargetMonthRes, dailyTotalRes] = await Promise.all([
        supabase
            .from("cheers")
            .select("*", { count: "exact", head: true })
            .eq("to_slug", toSlug)
            .eq("from_slug", fromSlug)
            .gte("created_at", dayStart),
        supabase
            .from("cheers")
            .select("*", { count: "exact", head: true })
            .eq("to_slug", toSlug)
            .eq("from_slug", fromSlug)
            .gte("created_at", weekStart),
        supabase
            .from("cheers")
            .select("*", { count: "exact", head: true })
            .eq("to_slug", toSlug)
            .eq("from_slug", fromSlug)
            .gte("created_at", monthStart),
        supabase
            .from("cheers")
            .select("*", { count: "exact", head: true })
            .eq("from_slug", fromSlug)
            .gte("created_at", dayStart),
    ]);

    if (sameTargetDayRes.error) throw sameTargetDayRes.error;
    if (sameTargetWeekRes.error) throw sameTargetWeekRes.error;
    if (sameTargetMonthRes.error) throw sameTargetMonthRes.error;
    if (dailyTotalRes.error) throw dailyTotalRes.error;

    return {
        sameTargetDay: sameTargetDayRes.count ?? 0,
        sameTargetWeek: sameTargetWeekRes.count ?? 0,
        sameTargetMonth: sameTargetMonthRes.count ?? 0,
        dailyTotal: dailyTotalRes.count ?? 0,
    };
}

export async function createCheer(toSlug: string, fromSlug: string | null, comment?: string): Promise<boolean> {
    const cleanedComment = comment?.trim();
    let error: { code?: string } | null = null;

    if (cleanedComment) {
        const withComment = await supabase
            .from("cheers")
            .insert({ to_slug: toSlug, from_slug: fromSlug, comment: cleanedComment });
        error = withComment.error as { code?: string } | null;

        // commentカラム未反映環境向けフォールバック
        if (error) {
            const fallback = await supabase
                .from("cheers")
                .insert({ to_slug: toSlug, from_slug: fromSlug });
            error = fallback.error as { code?: string } | null;
        }
    } else {
        const res = await supabase
            .from("cheers")
            .insert({ to_slug: toSlug, from_slug: fromSlug });
        error = res.error as { code?: string } | null;
    }

    if (error) { console.error("[createCheer]", error); return false; }

    // cheer_count をインクリメント
    await supabase.rpc("increment_cheer_count", { target_slug: toSlug });
    await notifyCheerReceived({ toSlug, fromSlug, comment: cleanedComment }).catch((err) => {
        console.error("[notifyCheerReceived]", err);
    });
    return true;
}

export async function countCheers(toSlug: string): Promise<number> {
    const { count } = await supabase
        .from("cheers")
        .select("*", { count: "exact", head: true })
        .eq("to_slug", toSlug);
    return count ?? 0;
}

export async function hasAlreadyCheered(toSlug: string, fromSlug: string): Promise<boolean> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
        .from("cheers")
        .select("id")
        .eq("to_slug", toSlug)
        .eq("from_slug", fromSlug)
        .gte("created_at", since)
        .single();
    return !!data;
}

export async function addCheerWithComment(fromUserId: number, toUserId: number, comment: string): Promise<boolean> {
    try {
        const [{ data: fromUser }, { data: toUser }] = await Promise.all([
            supabase.from("users").select("slug").eq("id", fromUserId).single(),
            supabase.from("users").select("slug").eq("id", toUserId).single(),
        ]);

        const fromSlug = fromUser?.slug as string | undefined;
        const toSlug = toUser?.slug as string | undefined;
        if (!fromSlug || !toSlug) return false;

        const cleaned = comment.trim();
        const { error } = await supabase
            .from("cheers")
            .insert({ to_slug: toSlug, from_slug: fromSlug, comment: cleaned || null });

        if (error) {
            console.error("[addCheerWithComment]", error);
            return false;
        }

        await supabase.rpc("increment_cheer_count", { target_slug: toSlug });
        return true;
    } catch (err) {
        console.error("[addCheerWithComment]", err);
        return false;
    }
}

export async function getLatestCheers(toUserId: number, limit = 3): Promise<LatestCheerItem[]> {
    try {
        const { data: user } = await supabase.from("users").select("slug").eq("id", toUserId).single();
        const toSlug = user?.slug as string | undefined;
        if (!toSlug) return [];

        const { data: cheers, error } = await supabase
            .from("cheers")
            .select("id, from_slug, comment, created_at")
            .eq("to_slug", toSlug)
            .not("comment", "is", null)
            .neq("comment", "")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error || !cheers) {
            // commentカラム未反映環境では静かに空配列へフォールバックする
            return [];
        }

        const fromSlugs = Array.from(new Set(
            cheers.map((c) => (c.from_slug as string | null) ?? "").filter(Boolean),
        ));

        let userMap = new Map<string, string>();
        if (fromSlugs.length > 0) {
            const { data: users } = await supabase
                .from("users")
                .select("slug, display_name")
                .in("slug", fromSlugs);
            userMap = new Map((users ?? []).map((u) => [String(u.slug), String(u.display_name ?? u.slug)]));
        }

        return cheers.map((row) => {
            const fromSlug = String(row.from_slug ?? "anonymous");
            return {
                id: String(row.id),
                comment: String(row.comment ?? ""),
                fromSlug,
                fromDisplayName: userMap.get(fromSlug) ?? fromSlug,
                createdAt: String(row.created_at ?? ""),
            };
        });
    } catch (err) {
        return [];
    }
}
