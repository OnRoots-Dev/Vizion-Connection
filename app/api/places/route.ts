import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { placeLimiter, getIp } from "@/lib/ratelimit";
import { placeCreateSchema, placeSearchSchema } from "@/features/place/place";
import { createPlace, searchPlaces } from "@/features/place/server/places";

const bboxQuerySchema = z.object({
    min_lat: z.coerce.number().min(-90).max(90),
    max_lat: z.coerce.number().min(-90).max(90),
    min_lng: z.coerce.number().min(-180).max(180),
    max_lng: z.coerce.number().min(-180).max(180),
});

function parseSearchParams(req: NextRequest) {
    const raw = Object.fromEntries(req.nextUrl.searchParams);
    if (raw.min_lat != null || raw.max_lat != null || raw.min_lng != null || raw.max_lng != null) {
        const bbox = bboxQuerySchema.safeParse(raw);
        if (!bbox.success) return null;
        return { ...bbox.data, q: undefined, prefecture: raw.prefecture };
    }
    return placeSearchSchema.safeParse(raw).success
        ? (placeSearchSchema.parse(raw) as { q?: string; prefecture?: string })
        : {};
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success: withinLimit } = await placeLimiter.limit(getIp(req));
    if (!withinLimit) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    let body: unknown;
    try {
        body = await readLimitedJson(req);
    } catch (e) {
        if (e instanceof PayloadTooLargeError) {
            return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
        }
        return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }

    const parsed = placeCreateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0]?.message ?? "バリデーションエラー" },
            { status: 400 },
        );
    }

    try {
        const place = await createPlace(user.id, parsed.data);
        return NextResponse.json({ success: true, place });
    } catch (e) {
        console.error("[places/POST]", e instanceof Error ? e.message : e);
        return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "保存に失敗しました" }, { status: 400 });
    }
}

/** Place検索（名称/都道府県/bbox）。認証必須（MVP）。 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const params = parseSearchParams(req);
    if (params === null) {
        return NextResponse.json({ success: false, error: "範囲指定が不正です" }, { status: 400 });
    }

    const places = await searchPlaces(params);
    return NextResponse.json({ success: true, places });
}
