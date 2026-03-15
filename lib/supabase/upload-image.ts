// lib/supabase/upload-image.ts
// クライアントサイドから直接Supabase Storageにアップロード

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function uploadImageToSupabase(
    file: File,
    slug: string,
    type: "profile" | "avatar"
): Promise<string> {
    // ファイル拡張子取得
    const ext = file.name.split(".").pop() ?? "jpg";
    // パス：profiles/[slug]/[type].[ext]
    const path = `${slug}/${type}.${ext}`;

    // 既存ファイルを削除してから上書き（upsert）
    const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/profiles/${path}`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": file.type,
                "x-upsert": "true", // 上書き許可
            },
            body: file,
        }
    );

    if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.message ?? "Upload failed");
    }

    // 公開URLを返す
    return `${SUPABASE_URL}/storage/v1/object/public/profiles/${path}`;
}