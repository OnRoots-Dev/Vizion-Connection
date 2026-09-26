// app/(app)/base/page.tsx
// BASE 画面 — 表示層のみ新規、データ取得は既存ロジックを再利用。DBスキーマ変更なし。
import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import { supabaseServer } from "@/lib/supabase/server";
import BaseClient from "./BaseClient";
import type { ActivityRecord } from "@/features/activity/types";

export const dynamic = "force-dynamic";

type ScheduleActivity = ActivityRecord & {
    place?: { id: string; name: string; prefecture: string } | null;
    isOwner: boolean;
};

const SELECT_COLUMNS =
    "id,user_id,type,title,description,starts_at,ends_at,place_id,visibility,tags,status,image_url,video_url,cheer_count,comment_count,created_at,updated_at";

async function getScheduleActivities(userId: number, limit = 20): Promise<ScheduleActivity[]> {
    // 主催: 自分の activities
    const { data: owned, error: ownedError } = await supabaseServer
        .from("activities")
        .select(`${SELECT_COLUMNS}, place:places!left(id,name,prefecture)`)
        .eq("user_id", userId)
        .order("starts_at", { ascending: true })
        .limit(limit);

    if (ownedError) console.error("[BASE:getScheduleActivities:owned]", ownedError);

    // 参加: activity_participants で accepted のもの
    const { data: participantRows, error: participantError } = await supabaseServer
        .from("activity_participants")
        .select("activity_id")
        .eq("user_id", userId)
        .eq("status", "accepted")
        .limit(limit);

    if (participantError) console.error("[BASE:getScheduleActivities:participant]", participantError);

    const participantIds = (participantRows ?? []).map((r) => (r as { activity_id: string }).activity_id).filter(Boolean);

    let participating: (ActivityRecord & { place?: { id: string; name: string; prefecture: string } | null })[] = [];
    if (participantIds.length > 0) {
        const { data: partActs, error: partError } = await supabaseServer
            .from("activities")
            .select(`${SELECT_COLUMNS}, place:places!left(id,name,prefecture)`)
            .in("id", participantIds)
            .order("starts_at", { ascending: true })
            .limit(limit);
        if (partError) console.error("[BASE:getScheduleActivities:participating]", partError);
        else participating = (partActs ?? []) as unknown as typeof participating;
    }

    // 結合 + 重複排除 (主催と参加が重なるケース) + 時系列ソート
    const map = new Map<string, ScheduleActivity>();
    for (const a of (owned ?? []) as unknown as (ActivityRecord & { place?: { id: string; name: string; prefecture: string } | null })[]) {
        map.set(a.id, { ...a, isOwner: true });
    }
    for (const a of participating) {
        if (!map.has(a.id)) map.set(a.id, { ...a, isOwner: false });
    }

    return Array.from(map.values())
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
        .slice(0, limit);
}

export default async function BasePage() {
    const result = await getProfileFromSession();

    if (!result.success) {
        redirect("/login?redirect=/base");
    }

    const { profile } = result.data;

    // Schedule: 本人が主催/参加している Activity を時系列で
    const scheduleActivities = await getScheduleActivities(Number(profile.id));

    return <BaseClient profile={profile} scheduleActivities={scheduleActivities} />;
}
