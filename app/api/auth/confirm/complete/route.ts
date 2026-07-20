import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
    completeEmailVerification,
    sendVerifiedWelcomeEmail,
} from "@/features/auth/server/complete-verification";
import { validateCSRF } from "@/lib/security/csrf";
import { accountLimiter, getIp } from "@/lib/ratelimit";

/**
 * メール認証後のフォールバック + ウェルカムメール送信。
 * /thanks?type=verified 表示後にクライアントから呼ぶ。
 * - completeEmailVerification: verified / 報酬の冪等確定
 * - sendVerifiedWelcomeEmail: 完了メールを 1 回だけ送信
 */
export async function POST(request: Request): Promise<NextResponse> {
    const csrfError = validateCSRF(request);
    if (csrfError) return csrfError as unknown as NextResponse;

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

    const slug = user.user_metadata?.slug;
    if (typeof slug !== "string" || !slug) {
        return NextResponse.json({ success: false, error: "INVALID_USER" }, { status: 400 });
    }

    const ip = getIp(request);
    const { success: rateOk } = await accountLimiter.limit(`welcome-email:${ip}:${slug}`);
    if (!rateOk) {
        return NextResponse.json({ success: false, error: "RATE_LIMIT" }, { status: 429 });
    }

    const ok = await completeEmailVerification(slug);
    if (!ok) {
        return NextResponse.json({ success: false, error: "NOT_FOUND" }, { status: 404 });
    }

    const mail = await sendVerifiedWelcomeEmail(slug);

    return NextResponse.json({
        success: true,
        welcomeEmail: mail,
    });
}
