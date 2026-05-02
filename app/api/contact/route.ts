import { NextResponse } from "next/server";
import { z } from "zod";
import { contactLimiter, getIp } from "@/lib/ratelimit";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { validateCSRF } from "@/lib/security/csrf";
import { submitContact } from "@/features/contact/server/contact-service";

const schema = z.object({
  category: z.enum(["広告・スポンサー", "取材・メディア", "不具合・バグ報告", "機能要望", "その他"]),
  name: z.string().min(1, "お名前を入力してください").max(50),
  email: z.string().email("有効なメールアドレスを入力してください"),
  message: z.string().min(10, "10文字以上入力してください").max(2000),
});

export async function POST(req: Request) {
  try {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

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
    await submitContact({ category, name, email, message });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ ok: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
