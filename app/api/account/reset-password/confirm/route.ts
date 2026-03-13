import { NextResponse } from "next/server";
import { airtableBase } from "@/lib/airtable/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const TABLE = "Users";

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

        const records = await airtableBase(TABLE)
            .select({ filterByFormula: `{resetToken} = "${token}"`, maxRecords: 1 })
            .firstPage();

        if (records.length === 0) return NextResponse.json({ ok: false, error: "無効なリンクです" }, { status: 400 });

        const record = records[0];
        const expires = record.fields["resetTokenExpires"] as string;
        if (!expires || new Date(expires) < new Date()) {
            return NextResponse.json({ ok: false, error: "リンクの有効期限が切れています" }, { status: 400 });
        }

        const newHash = await bcrypt.hash(newPassword, 12);
        await airtableBase(TABLE).update(record.id, {
            passwordHash: newHash,
            resetToken: "",
            resetTokenExpires: "",
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[reset-password/confirm]", err);
        return NextResponse.json({ ok: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }
}