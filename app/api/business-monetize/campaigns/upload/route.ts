// app/api/business-monetize/campaigns/upload/route.ts
// 広告Campaignのクリエイティブ用メディア（画像・動画）アップロード。
// profiles バケットの campaigns/<slug>/ へ保存し公開URLを返す。既存Campaign APIへ渡すURLをここで生成する。
// 参考: app/api/activities/upload/route.ts（同じ方式・承認CSRF/レートリミット/種別検証を踏襲）。

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";
import { monetizeLimiter, getIp } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/security/csrf";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_SIZE = 60 * 1024 * 1024; // 60MB
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function getExt(file: File, fallback: string) {
    const fromName = file.name.split(".").pop()?.trim().toLowerCase();
    if (fromName && fromName.length <= 5) return fromName;
    const fromType = file.type.split("/").pop()?.trim().toLowerCase();
    return fromType || fallback;
}

export async function POST(req: NextRequest) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success } = await monetizeLimiter.limit(getIp(req));
    if (!success) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const formData = await req.formData();
    const kind = formData.get("kind");
    const file = formData.get("file");

    if (kind !== "image" && kind !== "video") {
        return NextResponse.json({ success: false, error: "不正なアップロード種別です" }, { status: 400 });
    }
    if (!(file instanceof File)) {
        return NextResponse.json({ success: false, error: "ファイルが見つかりません" }, { status: 400 });
    }

    const isImage = kind === "image";
    const allowed = isImage ? IMAGE_TYPES : VIDEO_TYPES;
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

    if (!allowed.has(file.type)) {
        return NextResponse.json(
            {
                success: false,
                error: isImage
                    ? "JPEG / PNG / WebP / GIF / AVIF をアップロードしてください"
                    : "MP4 / WebM / MOV をアップロードしてください",
            },
            { status: 400 },
        );
    }
    if (file.size > maxSize) {
        return NextResponse.json(
            {
                success: false,
                error: isImage ? "画像サイズは8MB以内にしてください" : "動画サイズは60MB以内にしてください",
            },
            { status: 400 },
        );
    }

    const ext = getExt(file, isImage ? "jpg" : "mp4");
    const path = `campaigns/${user.slug}/${isImage ? "image" : "video"}-${Date.now()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const upload = await supabaseServer.storage.from("profiles").upload(path, bytes, {
        upsert: true,
        contentType: file.type,
    });
    if (upload.error) {
        console.error("[campaigns/upload]", upload.error);
        return NextResponse.json(
            { success: false, error: `${isImage ? "画像" : "動画"}アップロードに失敗しました` },
            { status: 500 },
        );
    }

    const { data } = supabaseServer.storage.from("profiles").getPublicUrl(path);
    return NextResponse.json({ success: true, url: data.publicUrl });
}
