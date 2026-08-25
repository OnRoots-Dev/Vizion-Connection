// features/moment/server/moments.ts
// moments / moment_comments / moment_cheers のドメインサービス。
// service role でアクセスするため、可視性は DB の can_view_moment() と同一規則を
// アプリ層で再実装して強制する（RLS バイパス対策）。
import { supabaseServer } from "@/lib/supabase/server";
import { resolveActivityVisibility } from "@/features/activity/server/activities";
import type {
    CreateMomentInput,
    MomentCommentRecord,
    MomentFeedItem,
    MomentRecord,
} from "../types";

const MOMENT_COLUMNS =
    "id,user_id,activity_id,body,image_url,video_url,visibility,cheer_count,comment_count,created_at,updated_at";

interface OwnerLite {
    id: number;
    slug: string;
    display_name: string | null;
    avatar_url: string | null;
    is_public: boolean;
    is_deleted: boolean;
}

async function getOwner(userId: number): Promise<OwnerLite | null> {
    const { data } = await supabaseServer
        .from("users")
        .select("id, slug, display_name, avatar_url, is_public, is_deleted")
        .eq("id", userId)
        .maybeSingle<OwnerLite>();
    return data ?? null;
}

/**
 * DB の can_view_moment() と同一規則:
 * - owner本人は常に可視
 * - 削除済み所有者のコンテンツは不可視
 * - activity_id がある場合、親Activityの可視性が先に判定される（親ゲート）
 * - public は 所有者プロフィール公開が条件
 * - connections は受理済み Connection が条件
 */
export async function resolveMomentVisibility(
    moment: Pick<MomentRecord, "id" | "user_id" | "activity_id" | "visibility">,
    viewerUserId: number | null,
): Promise<{ visible: boolean; owner: OwnerLite | null }> {
    const owner = await getOwner(moment.user_id);
    if (!owner) return { visible: false, owner: null };

    if (viewerUserId != null && viewerUserId === moment.user_id) return { visible: true, owner };
    if (owner.is_deleted) return { visible: false, owner };

    // 親ゲート: 親Activityが見えないなら Moment も見えない
    if (moment.activity_id != null) {
        const { data: parent } = await supabaseServer
            .from("activities")
            .select("id,user_id,visibility")
            .eq("id", moment.activity_id)
            .maybeSingle<{ id: string; user_id: number; visibility: "public" | "connections" | "private" }>();
        if (parent) {
            const parentResult = await resolveActivityVisibility(parent, viewerUserId);
            if (!parentResult.visible) return { visible: false, owner };
        }
        // 親が存在しない（削除済み）場合は Moment 単体の規則で継続
    }

    if (moment.visibility === "public") return { visible: owner.is_public, owner };

    if (moment.visibility === "connections" && viewerUserId != null) {
        const connected = await hasAcceptedConnection(viewerUserId, moment.user_id);
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

export async function createMoment(actorId: number, input: CreateMomentInput): Promise<MomentRecord> {
    if (input.image_url == null && input.video_url == null && input.body.trim().length === 0) {
        throw new Error("内容を入力してください");
    }

    if (input.activity_id != null) {
        // 親は自分の Activity のみに限定（他者のActivityへの紐付け禁止）。
        const { data: parent } = await supabaseServer
            .from("activities")
            .select("id")
            .eq("id", input.activity_id)
            .eq("user_id", actorId)
            .maybeSingle();
        if (!parent) throw new Error("紐付けるActivityが見つかりません");
    }

    const { data, error } = await supabaseServer
        .from("moments")
        .insert({
            user_id: actorId,
            activity_id: input.activity_id ?? null,
            body: input.body,
            image_url: input.image_url ?? null,
            video_url: input.video_url ?? null,
            visibility: input.visibility,
        })
        .select(MOMENT_COLUMNS)
        .single();

    if (error || !data) {
        console.error("[createMoment]", error);
        throw new Error("Momentの保存に失敗しました");
    }
    return data as unknown as MomentRecord;
}

/** 単一参照（可視性ゲート付き）。可視でない場合は null。 */
export async function getVisibleMoment(
    momentId: string,
    viewerUserId: number | null,
): Promise<MomentRecord | null> {
    const { data } = await supabaseServer
        .from("moments")
        .select(MOMENT_COLUMNS)
        .eq("id", momentId)
        .maybeSingle();
    if (!data) return null;
    const { visible } = await resolveMomentVisibility(
        data as unknown as MomentRecord,
        viewerUserId,
    );
    return visible ? (data as unknown as MomentRecord) : null;
}

/**
 * 公開フィード（Viz Map/タイムライン共通の基礎クエリ）。
 * 「public かつ 親Activityもpublic かつ 所有者プロフィール公開」のみ。
 */
export async function listPublicMoments(options: {
    limit?: number;
    before?: string;
    /** ログイン時、自分がCheer済みかを付与する */
    viewerId?: number | null;
}): Promise<MomentFeedItem[]> {
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 50);

    let query = supabaseServer
        .from("moments")
        .select(
            `${MOMENT_COLUMNS},
             author:users!inner(id,slug,display_name,avatar_url,is_public,is_deleted),
             activity:activities!left(id,visibility,place_id,title,type),
             place:activities!left(place_id, places(name,prefecture))`,
        )
        .eq("visibility", "public")
        .eq("author.is_public", true)
        .eq("author.is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (options.before) query = query.lt("created_at", options.before);

    const { data, error } = await query;
    if (error) {
        console.error("[listPublicMoments]", error);
        return [];
    }

    type Row = MomentRecord & {
        author: OwnerLite;
        activity: { id: string; visibility: string; place_id: string | null; title: string | null; type: string } | null;
        place: { places: { name: string; prefecture: string } | null } | null;
    };

    const rows = (data ?? []) as unknown as Row[];
    // 親ゲート: 公開フィードでは「standalone または 親Activityもpublic」のみ掲載可。
    // （resolveMomentVisibility と同一規則。RLSバイパス経路のためここで強制する）
    const feedItems: MomentFeedItem[] = rows
        .filter(
            (r) =>
                r.author.is_public &&
                !r.author.is_deleted &&
                (r.activity == null || r.activity.visibility === "public"),
        )
        .map((r) => ({
            moment: {
                id: r.id,
                user_id: r.user_id,
                activity_id: r.activity_id,
                body: r.body,
                image_url: r.image_url,
                video_url: r.video_url,
                visibility: r.visibility,
                cheer_count: r.cheer_count,
                comment_count: r.comment_count,
                created_at: r.created_at,
                updated_at: r.updated_at,
            },
            author: {
                id: r.author.id,
                slug: r.author.slug,
                display_name: r.author.display_name,
                avatar_url: r.author.avatar_url,
            },
            activity: r.activity
                ? { id: r.activity.id, title: r.activity.title, type: r.activity.type }
                : null,
            place: r.place?.places
                ? { id: r.activity?.place_id ?? "", name: r.place.places.name, prefecture: r.place.places.prefecture }
                : null,
            cheered_by_me: false,
        }));

    if (options.viewerId != null && feedItems.length > 0) {
        const ids = feedItems.map((f) => f.moment.id);
        const { data: cheeredRows } = await supabaseServer
            .from("moment_cheers")
            .select("moment_id")
            .eq("from_user_id", options.viewerId)
            .in("moment_id", ids);
        if (cheeredRows) {
            const cheeredSet = new Set(cheeredRows.map((row) => String((row as { moment_id?: string }).moment_id)));
            for (const item of feedItems) {
                item.cheered_by_me = cheeredSet.has(item.moment.id);
            }
        }
    }

    return feedItems;
}

// ------------------------------------------------------------
// comments
// ------------------------------------------------------------
export async function addComment(
    actorId: number,
    momentId: string,
    body: string,
): Promise<MomentCommentRecord> {
    const { data, error } = await supabaseServer
        .from("moment_comments")
        .insert({ moment_id: momentId, user_id: actorId, body })
        .select("id,moment_id,user_id,body,created_at")
        .single();
    if (error || !data) {
        console.error("[addComment]", error);
        throw new Error("コメントの保存に失敗しました");
    }
    await syncCommentCount(momentId);
    return data as unknown as MomentCommentRecord;
}

export async function listComments(
    momentId: string,
    limit = 100,
): Promise<(MomentCommentRecord & { author_slug: string | null; author_display_name: string | null })[]> {
    const { data, error } = await supabaseServer
        .from("moment_comments")
        .select(
            `id,moment_id,user_id,body,created_at,
             author:users(id,slug,display_name)`,
        )
        .eq("moment_id", momentId)
        .order("created_at", { ascending: true })
        .limit(limit);

    if (error) {
        console.error("[listComments]", error);
        return [];
    }
    type Row = MomentCommentRecord & { author: { slug: string; display_name: string | null } | null };
    return ((data ?? []) as unknown as Row[]).map((row) => ({
        id: row.id,
        moment_id: row.moment_id,
        user_id: row.user_id,
        body: row.body,
        created_at: row.created_at,
        author_slug: row.author?.slug ?? null,
        author_display_name: row.author?.display_name ?? null,
    }));
}

async function syncCommentCount(momentId: string): Promise<void> {
    const { count } = await supabaseServer
        .from("moment_comments")
        .select("*", { count: "exact", head: true })
        .eq("moment_id", momentId);
    await supabaseServer.from("moments").update({ comment_count: count ?? 0 }).eq("id", momentId);
}

// ------------------------------------------------------------
// cheers（既存 cheers テーブルとは独立した moment_cheers）
// ------------------------------------------------------------
export async function toggleCheer(
    actorId: number,
    momentId: string,
): Promise<{ cheered: boolean; cheer_count: number }> {
    const { data: existing } = await supabaseServer
        .from("moment_cheers")
        .select("id")
        .eq("moment_id", momentId)
        .eq("from_user_id", actorId)
        .maybeSingle();

    let cheered: boolean;
    if (existing) {
        const { error } = await supabaseServer
            .from("moment_cheers")
            .delete()
            .eq("id", existing.id)
            .eq("from_user_id", actorId);
        if (error) {
            console.error("[toggleCheer:remove]", error);
            throw new Error("Cheerの解除に失敗しました");
        }
        cheered = false;
    } else {
        const { error } = await supabaseServer
            .from("moment_cheers")
            .insert({ moment_id: momentId, from_user_id: actorId });
        if (error) {
            console.error("[toggleCheer:insert]", error);
            throw new Error("Cheerに失敗しました");
        }
        cheered = true;
    }

    const { count } = await supabaseServer
        .from("moment_cheers")
        .select("*", { count: "exact", head: true })
        .eq("moment_id", momentId);

    await supabaseServer.from("moments").update({ cheer_count: count ?? 0 }).eq("id", momentId);
    return { cheered, cheer_count: count ?? 0 };
}

// ------------------------------------------------------------
// 公開プロフィール用: 特定ユーザーの Moment を閲覧者の可視性で取得
// ------------------------------------------------------------
export async function listVisibleMomentsByOwner(
    ownerUserId: number,
    viewerUserId: number | null,
    limit = 5,
): Promise<MomentFeedItem[]> {
    const { data, error } = await supabaseServer
        .from("moments")
        .select(
            `${MOMENT_COLUMNS},
             activity:activities!left(id,visibility,place_id,title,type),
             place:activities!left(place_id, places(name,prefecture))`,
        )
        .eq("user_id", ownerUserId)
        .in("visibility", ["public", "connections", ...(viewerUserId === ownerUserId ? ["private" as const] : [])])
        .order("created_at", { ascending: false })
        .limit(limit * 2);

    if (error || !data) {
        console.error("[listVisibleMomentsByOwner]", error);
        return [];
    }

    type Row = {
        author: OwnerLite;
        activity: { id: string; visibility: string; place_id: string | null; title: string | null; type: string } | null;
        place: { places: { name: string; prefecture: string } | null } | null;
    } & MomentRecord;

    const rows = (data ?? []) as unknown as Row[];
    const items: MomentFeedItem[] = [];
    for (const r of rows) {
        const { visible } = await resolveMomentVisibility(r, viewerUserId);
        if (!visible) continue;
        const owner = await getOwner(r.user_id);
        items.push({
            moment: {
                id: r.id,
                user_id: r.user_id,
                activity_id: r.activity_id,
                body: r.body,
                image_url: r.image_url,
                video_url: r.video_url,
                visibility: r.visibility,
                cheer_count: r.cheer_count,
                comment_count: r.comment_count,
                created_at: r.created_at,
                updated_at: r.updated_at,
            },
            author: owner
                ? { id: owner.id, slug: owner.slug, display_name: owner.display_name, avatar_url: owner.avatar_url }
                : null,
            activity: r.activity ? { id: r.activity.id, title: r.activity.title, type: r.activity.type } : null,
            place: r.place?.places
                ? { id: r.activity?.place_id ?? "", name: r.place.places.name, prefecture: r.place.places.prefecture }
                : null,
            cheered_by_me: false,
        });
        if (items.length >= limit) break;
    }
    return items;
}
