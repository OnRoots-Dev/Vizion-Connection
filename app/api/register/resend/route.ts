import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { findUserByEmail } from "@/lib/supabase/data/users.server";
import { resendSignupVerificationEmail } from "@/features/auth/server/register";
import { resendLimiter, getIp } from "@/lib/ratelimit";

const schema = z.object({
    email: z.string().email().max(320),
    redirectTo: z.string().max(500).optional(),
}).strict();

export async function POST(req: NextRequest): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    let body: unknown;
    try {
        body = await readLimitedJson(req);
    } catch (e) {
        if (e instanceof PayloadTooLargeError) {
            return new NextResponse("Payload too large", { status: 413 });
        }
        return new NextResponse("Bad request", { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ success: false, error: "リクエストが不正です" }, { status: 400 });
    }

    const ip = getIp(req);
    const { success: rateLimitOk } = await resendLimiter.limit(`${ip}:${parsed.data.email}`);
    if (!rateLimitOk) {
        return NextResponse.json({ success: false, error: "リクエストが多すぎます。しばらく経ってから再度お試しください。" }, { status: 429 });
    }

    const existingUser = await findUserByEmail(parsed.data.email);
    if (!existingUser) {
        return NextResponse.json({ success: false, error: "このメールアドレスの仮登録は見つかりませんでした" }, { status: 404 });
    }

    if (existingUser.verified) {
        return NextResponse.json({ success: false, error: "このメールアドレスは既に認証済みです" }, { status: 400 });
    }

    const resendResult = await resendSignupVerificationEmail(parsed.data);
    if (!resendResult.success) {
        return NextResponse.json({ success: false, error: resendResult.error ?? "認証メールの再送に失敗しました" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}
