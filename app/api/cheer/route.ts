// app/api/cheer/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { hasAlreadyCheered } from "@/lib/supabase/cheers";
import { cheerProfile } from "@/features/profile/server/cheer-profile";

interface RequestBody {
    toSlug: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
        }
        const session = verifySession(token);
        if (!session) {
            return NextResponse.json({ success: false, error: "セッションが無効です" }, { status: 401 });
        }

        const body: unknown = await req.json();

        if (!body || typeof body !== "object") {
            return NextResponse.json(
                { success: false, error: "リクエストが不正です" },
                { status: 400 }
            );
        }

        const { toSlug } = body as RequestBody;

        if (!toSlug || typeof toSlug !== "string") {
            return NextResponse.json(
                { success: false, error: "スラッグが指定されていません" },
                { status: 400 }
            );
        }

        if (session.slug === toSlug) {
            return NextResponse.json({ success: false, error: "自分自身にはCheerできません" }, { status: 403 });
        }

        if (await hasAlreadyCheered(toSlug, session.slug)) {
            return NextResponse.json({ success: false, error: "すでにCheer済みです" }, { status: 409 });
        }

        const result = await cheerProfile(toSlug, session.slug);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("[POST /api/cheer]", err);
        return NextResponse.json(
            {
                success: false,
                error: "サーバーエラーが発生しました。しばらく後にお試しください。",
            },
            { status: 500 }
        );
    }
}