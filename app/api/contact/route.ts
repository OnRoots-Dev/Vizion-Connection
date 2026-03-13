import { NextResponse } from "next/server";
import { airtableBase } from "@/lib/airtable/client";
import { z } from "zod";

const TABLE = "Contacts";

const schema = z.object({
  category: z.enum(["広告・スポンサー", "取材・メディア", "不具合・バグ報告", "機能要望", "その他"]),
  name: z.string().min(1, "お名前を入力してください").max(50),
  email: z.string().email("有効なメールアドレスを入力してください"),
  message: z.string().min(10, "10文字以上入力してください").max(2000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { category, name, email, message } = parsed.data;

    await airtableBase(TABLE).create({
      category,
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ ok: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}