import { NextResponse } from "next/server";
import { findUserByEmail, saveResetToken } from "@/lib/supabase/data/users.server";
import { sendResetEmail } from "@/lib/resend/send-reset-email";
import { env } from "@/lib/env";
import crypto from "crypto";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { resetIpLimiter, resetEmailLimiter, getIp } from "@/lib/ratelimit";
import { z } from "zod";

const schema = z.object({
    email: z.string().email().max(320),
}).strict();

export async function POST(req: Request) {
    try {
        const csrfError = validateCSRF(req);
        if (csrfError) return csrfError as unknown as NextResponse;

        const ip = getIp(req);
        const { success: ipOk } = await resetIpLimiter.limit(ip);
        if (!ipOk) return NextResponse.json({ ok: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

        let body: any;
        try {
            body = await readLimitedJson(req);
        } catch (e) {
            if (e instanceof PayloadTooLargeError) return new NextResponse("Payload too large", { status: 413 });
            return new NextResponse("Bad request", { status: 400 });
        }

        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ ok: false, error: "メールアドレスを入力してください" }, { status: 400 });
        const { email } = parsed.data;

        const { success: emailOk } = await resetEmailLimiter.limit(email);
        if (!emailOk) return NextResponse.json({ ok: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

        const user = await findUserByEmail(email);
        // ユーザーが存在しない場合もOKを返す（列挙攻撃対策）
        if (!user) return NextResponse.json({ ok: true });

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1時間

        await saveResetToken(user.email, token, expires);

        const resetUrl = `${env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
        await sendResetEmail({ to: user.email, displayName: user.displayName, resetUrl });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[reset-password/request]", err);
        return NextResponse.json({ ok: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}
