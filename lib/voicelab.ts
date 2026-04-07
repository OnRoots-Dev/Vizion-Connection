import { supabaseServer } from "@/lib/supabase/server";
import type { VoiceLabCategory, VoiceLabPost, VoiceLabStatus } from "@/lib/voicelab-shared";

export async function getVoiceLabPosts(): Promise<VoiceLabPost[]> {
    try {
        const { data, error } = await supabaseServer
            .from("openlab_posts")
            .select(`
                id, user_id, category, title, body, upvotes, status, created_at,
                users:user_id (id, slug, display_name, role)
            `)
            .order("upvotes", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[getVoiceLabPosts]", error);
            return [];
        }

        return (data ?? []).map((row) => {
            const userObj = Array.isArray(row.users) ? row.users[0] : row.users;
            return {
                id: String(row.id),
                userId: typeof row.user_id === "number" ? row.user_id : null,
                category: row.category as VoiceLabCategory,
                title: String(row.title),
                body: String(row.body),
                upvotes: Number(row.upvotes ?? 0),
                status: row.status as VoiceLabStatus,
                createdAt: String(row.created_at),
                user: userObj
                    ? {
                        id: Number(userObj.id),
                        slug: String(userObj.slug),
                        displayName: String(userObj.display_name ?? userObj.slug),
                        role: String(userObj.role ?? ""),
                    }
                    : null,
            };
        });
    } catch (err) {
        console.error("[getVoiceLabPosts]", err);
        return [];
    }
}

export async function createVoiceLabPost(
    userId: number,
    category: VoiceLabCategory,
    title: string,
    body: string,
): Promise<boolean> {
    try {
        const { error } = await supabaseServer
            .from("openlab_posts")
            .insert({
                user_id: userId,
                category,
                title: title.trim(),
                body: body.trim(),
            });
        if (error) {
            console.error("[createVoiceLabPost]", error);
            return false;
        }
        return true;
    } catch (err) {
        console.error("[createVoiceLabPost]", err);
        return false;
    }
}

export async function updateVoiceLabPostStatus(
    postId: string,
    status: VoiceLabStatus,
): Promise<boolean> {
    try {
        const { error } = await supabaseServer
            .from("openlab_posts")
            .update({ status })
            .eq("id", postId);

        if (error) {
            console.error("[updateVoiceLabPostStatus]", error);
            return false;
        }

        return true;
    } catch (err) {
        console.error("[updateVoiceLabPostStatus]", err);
        return false;
    }
}

export async function toggleVoiceLabUpvote(postId: string, userId: number): Promise<boolean> {
    try {
        const { error } = await supabaseServer.rpc("toggle_upvote", {
            p_post_id: postId,
            p_user_id: userId,
        });
        if (error) {
            console.error("[toggleVoiceLabUpvote]", error);
            return false;
        }
        return true;
    } catch (err) {
        console.error("[toggleVoiceLabUpvote]", err);
        return false;
    }
}

export async function getVoiceLabUserUpvotes(userId: number): Promise<string[]> {
    try {
        const { data, error } = await supabaseServer
            .from("openlab_upvotes")
            .select("post_id")
            .eq("user_id", userId);

        if (error) {
            console.error("[getVoiceLabUserUpvotes]", error);
            return [];
        }

        return (data ?? []).map((row) => String(row.post_id));
    } catch (err) {
        console.error("[getVoiceLabUserUpvotes]", err);
        return [];
    }
}
