// features/activity/server/activities.ts
// activities のドメインサービス。書き込みは service role（lib/supabase/server.ts）経由。
// supabaseServer は RLS をバイパスするため、可視性判定はこの層で DB の
// can_view_activity / can_view_moment と同じ規則を必ず再実装する。
import { supabaseServer } from "@/lib/supabase/server";
import type { ActivityRecord, CreateActivityInput, UpdateActivityInput } from "../types";

const SELECT_COLUMNS =
    "id,user_id,type,title,description,starts_at,ends_at,place_id,visibility,tags,status,image_url,video_url,created_at,updated_at";

export interface OwnerProfileLite {
    id: number;
    slug: string;
    is_public: boolean;
    is_deleted: boolean;
}

/** DB の can_view_activity() と同一規則のアプリ側判定（connections 階層を含む）。 */
export async function resolveActivityVisibility(
    activity: Pick<ActivityRecord, "id" | "user_id" | "visibility">,
    viewerUserId: number | null,
): Promise<{ visible: boolean; owner: OwnerProfileLite | null }> {
    const { data: owner } = await supabaseServer
        .from("users")
        .select("id, slug, is_public, is_deleted")
        .eq("id", activity.user_id)
        .maybeSingle<OwnerProfileLite>();
    if (!owner) return { visible: false, owner: null };

    if (viewerUserId != null && viewerUserId === activity.user_id) return { visible: true, owner };
    if (owner.is_deleted) return { visible: false, owner };

    if (activity.visibility === "public") {
        return { visible: owner.is_public, owner };
    }
    if (activity.visibility === "connections" && viewerUserId != null) {
        const connected = await hasAcceptedConnection(viewerUserId, activity.user_id);
        return { visible: connected, owner };
    }
    return { visible: false, owner };
}

export async function hasAcceptedConnection(a: number, b: number): Promise<boolean> {
    const { data } = await supabaseServer
        .from("connections")
        .select("id")
        .eq("status", "accepted")
        .or(`and(requester_id.eq.${a},addressee_id.eq.${b}),and(requester_id.eq.${b},addressee_id.eq.${a})`)
        .limit(1)
        .maybeSingle();
    return Boolean(data);
}

function assertTimeOrder(startsAt: string, endsAt?: string | null) {
    if (endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
        throw new Error("終了日時は開始日時より後にしてください");
    }
}

export async function createActivity(
    actorId: number,
    input: CreateActivityInput,
): Promise<ActivityRecord> {
    assertTimeOrder(input.starts_at, input.ends_at ?? null);

    if (input.place_id != null) {
        const { data: place } = await supabaseServer
            .from("places")
            .select("id")
            .eq("id", input.place_id)
            .maybeSingle();
        if (!place) throw new Error("指定された場所が見つかりません");
    }

    const { data, error } = await supabaseServer
        .from("activities")
        .insert({
            user_id: actorId,
            type: input.type,
            title: input.title ?? null,
            description: input.description ?? null,
            starts_at: input.starts_at,
            ends_at: input.ends_at ?? null,
            place_id: input.place_id ?? null,
            visibility: input.visibility,
            tags: input.tags ?? [],
            status: input.status ?? "planned",
            image_url: input.image_url ?? null,
            video_url: input.video_url ?? null,
        })
        .select(SELECT_COLUMNS)
        .single();

    if (error || !data) {
        console.error("[createActivity]", error);
        throw new Error("Activityの保存に失敗しました");
    }
    return data as unknown as ActivityRecord;
}

export async function updateActivity(
    actorId: number,
    id: string,
    input: UpdateActivityInput,
): Promise<ActivityRecord | null> {
    if (input.starts_at !== undefined || input.ends_at !== undefined) {
        const current = await getOwnedActivity(actorId, id);
        if (!current) return null;
        assertTimeOrder(
            input.starts_at ?? current.starts_at,
            input.ends_at !== undefined ? input.ends_at : current.ends_at,
        );
    }

    const patch: Record<string, unknown> = {};
    for (const key of ["type", "title", "description", "starts_at", "ends_at", "place_id", "visibility", "tags", "status", "image_url", "video_url"] as const) {
        if (input[key] !== undefined) patch[key] = input[key];
    }
    if (Object.keys(patch).length === 0) return getOwnedActivity(actorId, id);

    // place_id 変更時は存在確認（create と同一基準）。
    if (patch.place_id != null) {
        const { data: place } = await supabaseServer
            .from("places")
            .select("id")
            .eq("id", patch.place_id as string)
            .maybeSingle();
        if (!place) throw new Error("指定された場所が見つかりません");
    }

    // 所有者スコープを WHERE に直接含める（RLS バイパス対策）。
    const { data, error } = await supabaseServer
        .from("activities")
        .update(patch)
        .eq("id", id)
        .eq("user_id", actorId)
        .select(SELECT_COLUMNS)
        .single();

    if (error) {
        console.error("[updateActivity]", error);
        return null;
    }
    return (data as unknown as ActivityRecord) ?? null;
}

export async function deleteActivity(actorId: number, id: string): Promise<{ ok: boolean; reason?: string }> {
    const { error } = await supabaseServer
        .from("activities")
        .delete()
        .eq("id", id)
        .eq("user_id", actorId);

    if (error) {
        // FK restrict: Moment から参照されている Activity は削除不可（履歴保護）。
        if (error.code === "23503") {
            return { ok: false, reason: "このActivityにはMomentがあるため削除できません（ステータス変更をご利用ください）" };
        }
        console.error("[deleteActivity]", error);
        return { ok: false, reason: "削除に失敗しました" };
    }
    return { ok: true };
}

export async function getOwnedActivity(actorId: number, id: string): Promise<ActivityRecord | null> {
    const { data } = await supabaseServer
        .from("activities")
        .select(SELECT_COLUMNS)
        .eq("id", id)
        .eq("user_id", actorId)
        .maybeSingle();
    return (data as unknown as ActivityRecord) ?? null;
}

/**
 * 公開プロフィール用: 指定ユーザーの Activity を閲覧者の可視性ルールで取得。
 * private は所有者本人にのみ。connections は受理済み Connection のみ。
 */
export async function listVisibleActivitiesByOwner(
    ownerUserId: number,
    viewerUserId: number | null,
    limit = 10,
): Promise<(ActivityRecord & { place?: { id: string; name: string; prefecture: string } | null })[]> {
    const { data, error } = await supabaseServer
        .from("activities")
        .select(`${SELECT_COLUMNS}, place:places!left(id,name,prefecture)`)
        .eq("user_id", ownerUserId)
        .in("visibility", ["public", "connections", ...(viewerUserId === ownerUserId ? ["private" as const] : [])])
        .order("starts_at", { ascending: false })
        .limit(limit);

    if (error || !data) {
        console.error("[listVisibleActivitiesByOwner]", error);
        return [];
    }

    const rows = data as unknown as (ActivityRecord & { place?: { id: string; name: string; prefecture: string } | null })[];
    const visible: typeof rows = [];
    for (const row of rows) {
        const { visible: ok } = await resolveActivityVisibility(row, viewerUserId);
        if (ok) visible.push(row);
        if (visible.length >= limit) break;
    }
    return visible;
}

/** 自分の Activity 一覧（ダッシュボード用。場所名を埋め込み）。 */
export async function listMyActivities(actorId: number, limit = 50): Promise<(ActivityRecord & { place?: { id: string; name: string; prefecture: string } | null })[]> {
    const { data, error } = await supabaseServer
        .from("activities")
        .select(`${SELECT_COLUMNS}, place:places!left(id,name,prefecture)`)
        .eq("user_id", actorId)
        .order("starts_at", { ascending: false })
        .limit(limit);
    if (error) {
        console.error("[listMyActivities]", error);
        return [];
    }
    return (data ?? []) as unknown as (ActivityRecord & { place?: { id: string; name: string; prefecture: string } | null })[];
}
