import { NextResponse } from "next/server";
import { createContact } from "@/lib/supabase/contacts";
import { z } from "zod";
import { contactLimiter, getIp } from "@/lib/ratelimit";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);
const CONTACT_TO = "contact@vizion-connection.jp";

const schema = z.object({
  category: z.enum(["広告・スポンサー", "取材・メディア", "不具合・バグ報告", "機能要望", "その他"]),
  name: z.string().min(1, "お名前を入力してください").max(50),
  email: z.string().email("有効なメールアドレスを入力してください"),
  message: z.string().min(10, "10文字以上入力してください").max(2000),
});

export async function POST(req: Request) {
    try {
        const ip = getIp(req);
        const { success } = await contactLimiter.limit(ip);
        if (!success) {
            return NextResponse.json(
                { ok: false, error: "しばらく時間をおいてから再度お試しください" },
        { status: 429 }
      );
    }

        let body: unknown;
        try {
            body = await readLimitedJson(req);
        } catch (e) {
            if (e instanceof PayloadTooLargeError) return NextResponse.json({ ok: false, error: "Payload too large" }, { status: 413 });
            return e as NextResponse;
        }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { category, name, email, message } = parsed.data;
    await createContact({ category, name, email, message });

    const { error: mailError } = await resend.emails.send({
      from: env.FROM_EMAIL,
      to: CONTACT_TO,
      replyTo: email,
      subject: `【Vizion Connection】お問い合わせ：${category}`,
      html: `
<!DOCTYPE html>
<html lang="ja">
  <body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;background:#ffffff;color:#111;">
    <h2 style="margin:0 0 16px;">お問い合わせを受け付けました</h2>
    <p style="margin:0 0 8px;"><strong>カテゴリ：</strong>${category}</p>
    <p style="margin:0 0 8px;"><strong>お名前：</strong>${name}</p>
    <p style="margin:0 0 16px;"><strong>メール：</strong>${email}</p>
    <pre style="white-space:pre-wrap;word-break:break-word;background:#f6f6f8;border:1px solid #e5e5ea;padding:12px;border-radius:10px;line-height:1.6;">${message}</pre>
  </body>
</html>
      `.trim(),
    });

    if (mailError) {
      console.error("[contact] resend mail error", mailError);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ ok: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
