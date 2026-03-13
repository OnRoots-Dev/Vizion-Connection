import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/airtable/users";
import { airtableBase } from "@/lib/airtable/client";
import { sendResetEmail } from "@/lib/resend/send-reset-email";
import { env } from "@/lib/env";
import crypto from "crypto";

const TABLE = "Users";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (!email) return NextResponse.json({ ok: false, error: "メールアドレスを入力してください" }, { status: 400 });

        const user = await findUserByEmail(email);
        // ユーザーが存在しない場合もOKを返す（列挙攻撃対策）
        if (!user) return NextResponse.json({ ok: true });

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1時間

        await airtableBase(TABLE).update(user.id, {
            resetToken: token,
            resetTokenExpires: expires,
        });

        const resetUrl = `${env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
        await sendResetEmail({ to: user.email, displayName: user.displayName, resetUrl });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[reset-password/request]", err);
        return NextResponse.json({ ok: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}