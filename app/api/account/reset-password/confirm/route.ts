import { NextResponse } from "next/server";
import { findUserByResetToken, updatePassword } from "@/lib/supabase/users";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8).max(100).regex(/^\S+$/, "スペースは使用できません"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });

        const { token, newPassword } = parsed.data;

        const user = await findUserByResetToken(token);
        if (!user) return NextResponse.json({ ok: false, error: "無効なリンク、または有効期限切れです" }, { status: 400 });

        const newHash = await bcrypt.hash(newPassword, 12);
        await updatePassword(user.slug, newHash);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[reset-password/confirm]", err);
        return NextResponse.json({ ok: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}