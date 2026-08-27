import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";
import { momentLimiter, getIp } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/security/csrf";

// Moment の画像アップロード。profiles バケットの moments/<slug>/ へ保存し公開URLを返す。
// DB変更なし・既存Storage活用。UIは /components/feed の MediaViewer が参照して表示。
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

function getExt(file: File) {
    const fromName = file.name.split(".").pop()?.trim().toLowerCase();
    if (fromName && fromName.length <= 5) return fromName;
    const fromType = file.type.split("/").pop()?.trim().toLowerCase();
    return fromType || "jpg";
}

export async function POST(req: NextRequest) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success } = await momentLimiter.limit(getIp(req));
    if (!success) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
        return NextResponse.json({ success: false, error: "画像ファイルが見つかりません" }, { status: 400 });
    }
    if (!IMAGE_TYPES.has(file.type)) {
        return NextResponse.json({ success: false, error: "JPEG / PNG / WebP / GIF / AVIF をアップロードしてください" }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ success: false, error: "画像サイズは8MB以内にしてください" }, { status: 400 });
    }

    const ext = getExt(file);
    const path = `moments/${user.slug}/image-${Date.now()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const upload = await supabaseServer.storage.from("profiles").upload(path, bytes, {
        upsert: true,
        contentType: file.type,
    });
    if (upload.error) {
        console.error("[moments/upload]", upload.error);
        return NextResponse.json({ success: false, error: "画像アップロードに失敗しました" }, { status: 500 });
    }

    const { data } = supabaseServer.storage.from("profiles").getPublicUrl(path);
    return NextResponse.json({ success: true, url: data.publicUrl });
}
