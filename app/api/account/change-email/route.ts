import { NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/supabase/data/users.server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { accountLimiter, getIp } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";

const schema = z.object({
    newEmail: z.string().email("有効なメールアドレスを入力してください").max(320),
}).strict();

export async function POST(req: Request) {
    try {
        const csrfError = validateCSRF(req);
        if (csrfError) return csrfError as unknown as NextResponse;

        const user = await getSupabaseProfile();
        if (!user) return NextResponse.json({ ok: false, error: "セッションが無効です" }, { status: 401 });

        const { success } = await accountLimiter.limit(getIp(req));
        if (!success) return NextResponse.json({ error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

        let body: unknown;
        try {
            body = await readLimitedJson(req);
        } catch (e) {
            if (e instanceof PayloadTooLargeError) return new NextResponse("Payload too large", { status: 413 });
            return new NextResponse("Bad request", { status: 400 });
        }
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "入力が不正です" }, { status: 400 });

        const { newEmail } = parsed.data;

        const existing = await findUserByEmail(newEmail);
        if (existing) return NextResponse.json({ ok: false, error: "このメールアドレスはすでに使用されています" }, { status: 409 });

        const supabase = await createClient();
        const { error } = await supabase.auth.updateUser(
            { email: newEmail },
            { emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/confirm` },
        );
        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[change-email]", err);
        return NextResponse.json({ ok: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}
