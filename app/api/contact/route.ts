import { NextResponse } from "next/server";
import { createContact } from "@/lib/supabase/contacts";
import { z } from "zod";
import { contactLimiter, getIp } from "@/lib/ratelimit";

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

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { category, name, email, message } = parsed.data;
    await createContact({ category, name, email, message });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ ok: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}