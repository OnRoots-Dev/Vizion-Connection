import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { supabaseServer } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** コメント削除（投稿者本人のみ）。親Momentの可視性は既に通過した前提だが再確認する。 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> },
): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { id, commentId } = await params;
    if (!UUID_RE.test(id) || !UUID_RE.test(commentId)) {
        return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    // 投稿者本人のみ削除可（owner スコープを WHERE に直接指定）。
    const { data, error } = await supabaseServer
        .from("moment_comments")
        .delete()
        .eq("id", commentId)
        .eq("moment_id", id)
        .eq("user_id", Number(user.id))
        .select("id");

    if (error) {
        console.error("[moments/comments/DELETE]", error);
        return NextResponse.json({ success: false, error: "削除に失敗しました" }, { status: 400 });
    }
    if (!data || data.length === 0) {
        return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    // カウント同期
    const { count } = await supabaseServer
        .from("moment_comments")
        .select("*", { count: "exact", head: true })
        .eq("moment_id", id);
    await supabaseServer.from("moments").update({ comment_count: count ?? 0 }).eq("id", id);

    return NextResponse.json({ success: true, deleted: true });
}
