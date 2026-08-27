"use client";

// dashboard/components/feed/upload.ts
// Moment / Activity 共通の 画像・動画アップロード helper（クライアント）。
// 既存 /api/<scope>/upload ルート（CSRF Cookie 付与 + Storage 保存）を利用。

export type MediaKind = "image" | "video";

export async function uploadFeedMedia(scope: "moments" | "activities", kind: MediaKind, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("file", file);

    const res = await fetch(`/api/${scope}/upload`, {
        method: "POST",
        body: formData,
        credentials: "same-origin",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || typeof json?.url !== "string") {
        throw new Error(typeof json?.error === "string" ? json.error : "アップロードに失敗しました");
    }
    return json.url;
}
