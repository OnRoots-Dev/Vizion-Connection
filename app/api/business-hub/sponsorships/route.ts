import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessProfile } from "@/lib/auth/require-business-session";
import { addSponsorship, listSponsorshipsForBusiness } from "@/lib/supabase/business-sponsorships";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";

const addSchema = z.object({
    sponsoredUserSlug: z.string().min(1).max(80),
}).strict();

export async function GET() {
    try {
        const profile = await requireBusinessProfile();
        const result = await listSponsorshipsForBusiness(profile);
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
        if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
        return NextResponse.json({ success: false, error: "支援先一覧の取得に失敗しました" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    try {
        const profile = await requireBusinessProfile();
        let body: unknown;
        try {
            body = await readLimitedJson(req);
        } catch (error) {
            if (error instanceof PayloadTooLargeError) {
                return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
            }
            return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
        }

        const parsed = addSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" }, { status: 400 });
        }

        const target = await addSponsorship(profile, parsed.data.sponsoredUserSlug);
        return NextResponse.json({ success: true, target });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
        if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
        return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
}
