// app/(app)/trail/page.tsx
// Trail 画面 — 表示層のみ新規、データ取得は既存ドメインサービスをそのまま利用。
// DB スキーマ変更なし。activities / moments は service-role 経由の既存ロジックを再利用。
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";
import { listPublicMoments } from "@/features/moment/server/moments";
import type { ActivityRecord } from "@/features/activity/types";
import type { MomentFeedItem } from "@/features/moment/types";
import TrailClient from "./TrailClient";

export const dynamic = "force-dynamic";

type ActivityWithAuthor = ActivityRecord & {
    place?: { id: string; name: string; prefecture: string } | null;
    author?: { id: number; slug: string; display_name: string | null; avatar_url: string | null } | null;
};

async function getTrailActivities(limit = 20): Promise<ActivityWithAuthor[]> {
    // 既存の可視性規則 (public + owner公開) を踏襲。Trail では public フィードとして横断表示。
    // features/activity/server/activities.ts の SELECT_COLUMNS と同列 + author/place join。
    const { data, error } = await supabaseServer
        .from("activities")
        .select(
            `id,user_id,type,title,description,starts_at,ends_at,place_id,visibility,tags,status,image_url,video_url,cheer_count,comment_count,created_at,updated_at,
             author:users!inner(id,slug,display_name,avatar_url,is_public,is_deleted),
             place:places!left(id,name,prefecture)`,
        )
        .eq("visibility", "public")
        .eq("author.is_public", true)
        .eq("author.is_deleted", false)
        .order("starts_at", { ascending: false })
        .limit(limit);

    if (error || !data) {
        console.error("[Trail:getTrailActivities]", error);
        return [];
    }

    type Row = ActivityRecord & {
        author: { id: number; slug: string; display_name: string | null; avatar_url: string | null; is_public: boolean; is_deleted: boolean };
        place: { id: string; name: string; prefecture: string } | null;
    };

    return (data as unknown as Row[]).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        type: row.type,
        title: row.title,
        description: row.description,
        starts_at: row.starts_at,
        ends_at: row.ends_at,
        place_id: row.place_id,
        visibility: row.visibility,
        tags: row.tags,
        status: row.status,
        image_url: row.image_url,
        video_url: row.video_url,
        cheer_count: row.cheer_count,
        comment_count: row.comment_count,
        created_at: row.created_at,
        updated_at: row.updated_at,
        place: row.place,
        author: row.author
            ? { id: row.author.id, slug: row.author.slug, display_name: row.author.display_name, avatar_url: row.author.avatar_url }
            : null,
    }));
}

export default async function TrailPage() {
    const profile = await getSupabaseProfile();

    // 既存ロジックをそのまま利用
    const [activities, moments] = await Promise.all([
        getTrailActivities(20),
        listPublicMoments({ limit: 20, viewerId: profile?.id ?? null }),
    ]);

    return (
        <TrailClient
            initialActivities={activities}
            initialMoments={moments as MomentFeedItem[]}
            viewerId={profile?.id ? Number(profile.id) : null}
            viewerRole={profile?.role ?? null}
        />
    );
}
