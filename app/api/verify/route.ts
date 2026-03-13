// app/api/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/features/auth/server/verify";
import { COOKIE_OPTIONS, SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { env } from "@/lib/env";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const token = req.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(
                `${env.NEXT_PUBLIC_BASE_URL}/register`
            );
        }

        const result = await verifyEmailToken(token);

        if (!result.success) {
            const params = new URLSearchParams({ error: result.error });
            return NextResponse.redirect(
                `${env.NEXT_PUBLIC_BASE_URL}/register?${params.toString()}`
            );
        }

        const redirectPath =
            result.role === "Business"
                ? `${env.NEXT_PUBLIC_BASE_URL}/business/checkout`
                : `${env.NEXT_PUBLIC_BASE_URL}/thanks?type=verified`;

        // NextResponse.redirect に直接 Cookie をセットする
        const response = NextResponse.redirect(redirectPath);

        response.cookies.set(SESSION_COOKIE_NAME, result.sessionToken, COOKIE_OPTIONS);

        return response;
    } catch (err) {
        console.error("[GET /api/verify]", err);
        return NextResponse.redirect(
            `${env.NEXT_PUBLIC_BASE_URL}/thanks?type=verified`
        );
    }
}