// app/api/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/features/auth/server/verify";
import { setSessionCookie } from "@/lib/auth/cookies";
import { env } from "@/lib/env";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
        return NextResponse.redirect(`${env.NEXT_PUBLIC_BASE_URL}/login?error=invalid_token`);
    }

    const result = await verifyEmailToken(token);

    if (!result.success) {
        return NextResponse.redirect(`${env.NEXT_PUBLIC_BASE_URL}/login?error=verify_failed`);
    }

    await setSessionCookie(result.sessionToken);

    return NextResponse.redirect(`${env.NEXT_PUBLIC_BASE_URL}/dashboard`);
}