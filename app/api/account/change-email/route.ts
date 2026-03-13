import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { findUserBySlug, findUserByEmail } from "@/lib/airtable/users";
import { airtableBase } from "@/lib/airtable/client";
import { sendVerifyEmail } from "@/lib/resend/send-verify-email";
import { env } from "@/lib/env";
import { z } from "zod";

const schema = z.object({
    newEmail: z.string().email("有効なメールアドレスを入力してください"),
});

const TABLE = "Users";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (!token) return NextResponse.json({ ok: false, error: "ログインが必要です" }, { status: 401 });
        const session = verifySession(token);
        if (!session) return NextResponse.json({ ok: false, error: "セッションが無効です" }, { status: 401 });

        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "入力が不正です" }, { status: 400 });

        const { newEmail } = parsed.data;

        const existing = await findUserByEmail(newEmail);
        if (existing) return NextResponse.json({ ok: false, error: "このメールアドレスはすでに使用されています" }, { status: 409 });

        const user = await findUserBySlug(session.slug);
        if (!user) return NextResponse.json({ ok: false, error: "ユーザーが見つかりません" }, { status: 404 });

        await airtableBase(TABLE).update(user.id, { email: newEmail });

        const verifyUrl = `${env.NEXT_PUBLIC_BASE_URL}/verify?email=${encodeURIComponent(newEmail)}`;
        await sendVerifyEmail({
            to: newEmail,
            displayName: user.displayName,
            verifyUrl,
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[change-email]", err);
        return NextResponse.json({ ok: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}