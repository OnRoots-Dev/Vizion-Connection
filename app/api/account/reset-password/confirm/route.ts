import { NextResponse } from "next/server";
import { findUserByResetToken, updatePassword } from "@/lib/supabase/data/users.server";
import { supabaseServer } from "@/lib/supabase/server";
import { z } from "zod";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";

const schema = z.object({
    token: z.string().min(1).max(128),
    newPassword: z.string().min(8).max(100).regex(/^\S+$/, "スペースは使用できません"),
}).strict();

export async function POST(req: Request) {
    try {
        const csrfError = validateCSRF(req);
        if (csrfError) return csrfError as unknown as NextResponse;

        let body: unknown;
        try {
            body = await readLimitedJson(req);
        } catch (e) {
            if (e instanceof PayloadTooLargeError) return new NextResponse("Payload too large", { status: 413 });
            return new NextResponse("Bad request", { status: 400 });
        }
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });

        const { token, newPassword } = parsed.data;

        const user = await findUserByResetToken(token);
        if (!user) return NextResponse.json({ ok: false, error: "無効なリンク、または有効期限切れです" }, { status: 400 });

        if (!user.authId) {
            return NextResponse.json({ ok: false, error: "Auth連携されていないユーザーです" }, { status: 400 });
        }

        const { error } = await supabaseServer.auth.admin.updateUserById(user.authId, {
            password: newPassword,
        });
        if (error) {
            return NextResponse.json({ ok: false, error: "パスワード更新に失敗しました" }, { status: 500 });
        }

        await updatePassword(user.slug, "supabase-auth");

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[reset-password/confirm]", err);
        return NextResponse.json({ ok: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}
