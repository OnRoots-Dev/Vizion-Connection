export async function uploadImageToSupabase(
    file: File,
    type: "profile" | "avatar" | "banner",
): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok || typeof json?.url !== "string") {
        throw new Error(typeof json?.error === "string" ? json.error : "画像アップロードに失敗しました");
    }

    return json.url;
}
