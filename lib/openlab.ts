import { supabaseServer } from "@/lib/supabase/server";
import type { OpenlabCategory, OpenlabPost, OpenlabStatus } from "@/lib/openlab-shared";

export async function getOpenlabPosts(): Promise<OpenlabPost[]> {
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
            console.error("[getOpenlabPosts]", error);
            return [];
        }

        return (data ?? []).map((row) => {
            const userObj = Array.isArray(row.users) ? row.users[0] : row.users;
            return {
                id: String(row.id),
                userId: typeof row.user_id === "number" ? row.user_id : null,
                category: row.category as OpenlabCategory,
                title: String(row.title),
                body: String(row.body),
                upvotes: Number(row.upvotes ?? 0),
                status: row.status as OpenlabStatus,
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
        console.error("[getOpenlabPosts]", err);
        return [];
    }
}

export async function createOpenlabPost(
    userId: number,
    category: OpenlabCategory,
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
            console.error("[createOpenlabPost]", error);
            return false;
        }
        return true;
    } catch (err) {
        console.error("[createOpenlabPost]", err);
        return false;
    }
}

export async function updateOpenlabPostStatus(
    postId: string,
    userId: number,
    status: OpenlabStatus,
): Promise<boolean> {
    try {
        const { error } = await supabaseServer
            .from("openlab_posts")
            .update({ status })
            .eq("id", postId)
            .eq("user_id", userId);

        if (error) {
            console.error("[updateOpenlabPostStatus]", error);
            return false;
        }

        return true;
    } catch (err) {
        console.error("[updateOpenlabPostStatus]", err);
        return false;
    }
}

export async function toggleUpvote(postId: string, userId: number): Promise<boolean> {
    try {
        const { error } = await supabaseServer.rpc("toggle_upvote", {
            p_post_id: postId,
            p_user_id: userId,
        });
        if (error) {
            console.error("[toggleUpvote]", error);
            return false;
        }
        return true;
    } catch (err) {
        console.error("[toggleUpvote]", err);
        return false;
    }
}

export async function getUserUpvotes(userId: number): Promise<string[]> {
    try {
        const { data, error } = await supabaseServer
            .from("openlab_upvotes")
            .select("post_id")
            .eq("user_id", userId);

        if (error) {
            console.error("[getUserUpvotes]", error);
            return [];
        }

        return (data ?? []).map((row) => String(row.post_id));
    } catch (err) {
        console.error("[getUserUpvotes]", err);
        return [];
    }
}
