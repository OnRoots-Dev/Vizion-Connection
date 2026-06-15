import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeEmailVerification } from "@/features/auth/server/complete-verification";

// メール認証後処理のフォールバックAPI。
// 通常は /auth/confirm 内で完結するが、クライアントから明示的に再実行したい場合に使う。
export async function POST(request: Request): Promise<NextResponse> {
    const supabase = await createClient();
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : null;
    const {
        data: { user },
        error,
    } = accessToken
        ? await supabase.auth.getUser(accessToken)
        : await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const slug = user.user_metadata.slug;
    if (typeof slug !== "string" || !slug) {
        return NextResponse.json({ success: false, error: "INVALID_USER" }, { status: 400 });
    }

    const ok = await completeEmailVerification(slug);
    if (!ok) {
        return NextResponse.json({ success: false, error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
