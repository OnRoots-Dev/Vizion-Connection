import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { z } from "zod";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";

const schema = z.object({
    currentPassword: z.string().min(1).max(100),
    newPassword: z.string()
        .min(8, "パスワードは8文字以上で入力してください")
        .max(100)
        .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/, "使用できない文字が含まれています"),
}).strict();

export async function POST(req: Request) {
    try {
        const csrfError = validateCSRF(req);
        if (csrfError) return csrfError as unknown as NextResponse;

        const user = await getSupabaseProfile();
        if (!user) return NextResponse.json({ ok: false, error: "セッションが無効です" }, { status: 401 });

        let body: unknown;
        try {
            body = await readLimitedJson(req);
        } catch (e) {
            if (e instanceof PayloadTooLargeError) return new NextResponse("Payload too large", { status: 413 });
            return new NextResponse("Bad request", { status: 400 });
        }
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "入力が不正です" }, { status: 400 });

        const { currentPassword, newPassword } = parsed.data;

        const supabase = await createClient();
        const signInResult = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });
        if (signInResult.error) return NextResponse.json({ ok: false, error: "現在のパスワードが正しくありません" }, { status: 403 });

        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) return NextResponse.json({ ok: false, error: "パスワード更新に失敗しました" }, { status: 500 });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[change-password]", err);
        return NextResponse.json({ ok: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}
