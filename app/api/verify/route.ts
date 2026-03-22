// app/api/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/features/auth/server/verify";
import { setSessionCookie } from "@/lib/auth/cookies";
import { env } from "@/lib/env";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const token = req.nextUrl.searchParams.get("token");
    const redirectTo = req.nextUrl.searchParams.get("redirect"); // ← 修正

    if (!token) {
        return NextResponse.redirect(`${env.NEXT_PUBLIC_BASE_URL}/login?error=invalid_token`);
    }

    const result = await verifyEmailToken(token);

    if (!result.success) {
        return NextResponse.redirect(`${env.NEXT_PUBLIC_BASE_URL}/login?error=verify_failed`);
    }

    await setSessionCookie(result.sessionToken);

    // ← 修正: redirectTo がある場合はそちらへ、なければ /dashboard
    const dest = redirectTo ? decodeURIComponent(redirectTo) : "/dashboard";
    return NextResponse.redirect(new URL(dest, env.NEXT_PUBLIC_BASE_URL)); // ← 修正
}