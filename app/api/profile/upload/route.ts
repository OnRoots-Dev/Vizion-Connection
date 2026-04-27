import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug } from "@/lib/supabase/data/users.server";
import { supabaseServer } from "@/lib/supabase/server";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

function getFileExtension(file: File) {
    const fromName = file.name.split(".").pop()?.trim().toLowerCase();
    if (fromName) return fromName;
    const fromType = file.type.split("/").pop()?.trim().toLowerCase();
    return fromType || "jpg";
}

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifySession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await findUserBySlug(session.slug);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const formData = await req.formData();
    const type = formData.get("type");
    const file = formData.get("file");

    if (type !== "profile" && type !== "avatar" && type !== "career") {
        return NextResponse.json({ error: "不正なアップロード種別です" }, { status: 400 });
    }
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "画像ファイルが見つかりません" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json({ error: "JPEG / PNG / WebP / GIF / AVIF をアップロードしてください" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_SIZE) {
        return NextResponse.json({ error: "画像サイズは5MB以内にしてください" }, { status: 400 });
    }

    const ext = getFileExtension(file);
    const path = `${user.slug}/${type}-${Date.now()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const upload = await supabaseServer.storage.from("profiles").upload(path, bytes, {
        upsert: true,
        contentType: file.type,
    });

    if (upload.error) {
        console.error("[profile/upload]", upload.error);
        return NextResponse.json({ error: "画像アップロードに失敗しました" }, { status: 500 });
    }

    const { data } = supabaseServer.storage.from("profiles").getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl });
}
