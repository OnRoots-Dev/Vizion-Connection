// app/api/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/features/auth/server/login";
import type { LoginInput } from "@/features/auth/types";
import { loginLimiter, getIp } from "@/lib/ratelimit";
import { COOKIE_OPTIONS, SESSION_COOKIE_NAME } from "@/lib/auth/cookies";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const ip = getIp(req);
        const { success } = await loginLimiter.limit(ip);
        if (!success) {
            return NextResponse.json(
                { success: false, error: "しばらく時間をおいてから再度お試しください" },
                { status: 429 }
            );
        }
        const body: unknown = await req.json();

        if (!body || typeof body !== "object") {
            return NextResponse.json(
                { success: false, error: "リクエストが不正です" },
                { status: 400 }
            );
        }

        const input = body as LoginInput;
        const result = await loginUser(input);

        if (!result.success) {
            return NextResponse.json(result, { status: 401 });
        }

        const res = NextResponse.json(
            { success: true, slug: result.slug, role: result.role },
            { status: 200 }
        );
        res.cookies.set(SESSION_COOKIE_NAME, result.token, COOKIE_OPTIONS);
        return res;
    } catch (err) {
        console.error("[POST /api/login]", err);
        return NextResponse.json(
            {
                success: false,
                error: "サーバーエラーが発生しました。しばらく後にお試しください。",
            },
            { status: 500 }
        );
    }
}