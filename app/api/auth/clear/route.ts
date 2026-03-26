// app/api/auth/clear/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    const reason = req.nextUrl.searchParams.get("reason");
    const loginUrl = reason === "unauthenticated"
        ? "/login?redirect=/dashboard"
        : "/login";

    return NextResponse.redirect(new URL(loginUrl, req.url));
}