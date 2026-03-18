import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { findUserBySlug, updatePassword } from "@/lib/supabase/users";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { accountLimiter, getIp } from "@/lib/ratelimit";

const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "8文字以上で入力してください").max(100).regex(/^\S+$/, "スペースは使用できません"),
});

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (!token) return NextResponse.json({ ok: false, error: "ログインが必要です" }, { status: 401 });
        const session = verifySession(token);
        if (!session) return NextResponse.json({ ok: false, error: "セッションが無効です" }, { status: 401 });

        const { success } = await accountLimiter.limit(getIp(req));
        if (!success) return NextResponse.json({ error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "入力が不正です" }, { status: 400 });

        const { currentPassword, newPassword } = parsed.data;

        const user = await findUserBySlug(session.slug);
        if (!user) return NextResponse.json({ ok: false, error: "ユーザーが見つかりません" }, { status: 404 });

        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) return NextResponse.json({ ok: false, error: "現在のパスワードが正しくありません" }, { status: 400 });

        const newHash = await bcrypt.hash(newPassword, 12);
        await updatePassword(session.slug, newHash);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[change-password]", err);
        return NextResponse.json({ ok: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}