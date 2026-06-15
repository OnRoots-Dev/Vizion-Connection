// app/api/onboarding/day0/route.ts
// DAY 0宣言の保存。day0_dateはDAYカウントの基準日として初回のみ設定される。

import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { saveDay0Declaration } from "@/lib/supabase/data/users.server";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";

const schema = z.object({
    declaration: z.string().max(200, "宣言は200文字以内で入力してください").optional(),
}).strict();

export async function POST(req: NextRequest): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try {
        body = await readLimitedJson(req);
    } catch (e) {
        if (e instanceof PayloadTooLargeError) {
            return new NextResponse("Payload too large", { status: 413 });
        }
        return new NextResponse("Bad request", { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "リクエストが不正です";
        return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    const declaration = parsed.data.declaration?.trim() || null;
    const ok = await saveDay0Declaration(user.slug, declaration);
    if (!ok) {
        return NextResponse.json({ success: false, error: "保存に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
