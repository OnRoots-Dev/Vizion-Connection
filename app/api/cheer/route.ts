// app/api/cheer/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { getCheerLimitUsage } from "@/lib/supabase/cheers";
import { cheerProfile } from "@/features/profile/server/cheer-profile";
import { cheerLimiter, getIp } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { z } from "zod";
import { recordMissionAction } from "@/lib/missions";

const schema = z.object({
    toSlug: z.string().min(1).max(50),
    comment: z.string().max(120).optional(),
}).strict();

interface RequestBody {
    toSlug: string;
    comment?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const csrfError = validateCSRF(req);
        if (csrfError) return csrfError as unknown as NextResponse;

        const ip = getIp(req);
        const { success } = await cheerLimiter.limit(ip);
        if (!success) {
            return NextResponse.json(
                { success: false, error: "しばらく時間をおいてから再度お試しください" },
                { status: 429 }
            );
        }

        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
        }
        const session = verifySession(token);
        if (!session) {
            return NextResponse.json({ success: false, error: "セッションが無効です" }, { status: 401 });
        }

        let body: unknown;
        try {
            body = await readLimitedJson(req);
        } catch (e) {
            if (e instanceof PayloadTooLargeError) {
                return new NextResponse("Payload too large", { status: 413 });
            }
            return new NextResponse("Bad request", { status: 400 });
        }

        if (!body || typeof body !== "object") {
            return NextResponse.json(
                { success: false, error: "リクエストが不正です" },
                { status: 400 }
            );
        }

        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: "リクエストが不正です" },
                { status: 400 }
            );
        }
        const { toSlug, comment } = parsed.data;

        if (!toSlug || typeof toSlug !== "string") {
            return NextResponse.json(
                { success: false, error: "スラッグが指定されていません" },
                { status: 400 }
            );
        }

        if (session.slug === toSlug) {
            return NextResponse.json({ success: false, error: "自分自身にはCheerできません" }, { status: 403 });
        }

        const usage = await getCheerLimitUsage(toSlug, session.slug);

        // 同一人物への制限：1日1回・週2回・月4回
        if (usage.sameTargetDay >= 1) {
            return NextResponse.json({ success: false, error: "同じユーザーには1日1回までです" }, { status: 409 });
        }
        if (usage.sameTargetWeek >= 2) {
            return NextResponse.json({ success: false, error: "同じユーザーには1週間で2回までです" }, { status: 409 });
        }
        if (usage.sameTargetMonth >= 4) {
            return NextResponse.json({ success: false, error: "同じユーザーには1ヶ月で4回までです" }, { status: 409 });
        }

        // 1日の総数制限：5回まで
        if (usage.dailyTotal >= 5) {
            return NextResponse.json({ success: false, error: "1日にCheerできる回数は5回までです" }, { status: 429 });
        }

        const result = await cheerProfile(toSlug, session.slug, comment);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        await recordMissionAction({
            userId: session.userId,
            slug: session.slug,
            requiredAction: "cheer",
        }).catch((error) => {
            console.error("[POST /api/cheer mission progress]", error);
        });

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
