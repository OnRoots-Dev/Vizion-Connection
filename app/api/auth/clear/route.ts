// app/api/auth/clear/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deleteSessionCookie } from "@/lib/auth/cookies";

export async function GET(req: NextRequest): Promise<NextResponse> {
    await deleteSessionCookie();

    const reason = req.nextUrl.searchParams.get("reason");
    const loginUrl = reason === "unauthenticated"
        ? "/login?redirect=/dashboard"
        : "/login";

    return NextResponse.redirect(new URL(loginUrl, req.url));
}
