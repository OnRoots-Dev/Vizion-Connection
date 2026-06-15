// features/media/to-file.ts
// Blob → アップロード用 File 変換。拡張子・MIME を blob.type 基準で決める。
// webp 非対応環境（iOS Safari < 16.4）で toBlob が png にフォールバックした場合でも、
// File の拡張子/型が実体と一致し、保存時の content-type 不整合を防ぐ。

const EXT_BY_MIME: Record<string, string> = {
    "image/webp": "webp",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/gif": "gif",
    "image/avif": "avif",
};

export function extensionForMimeType(type: string | undefined): string {
    if (!type) return "png";
    return EXT_BY_MIME[type] ?? (type.split("/")[1] || "png");
}

/** Blob を `${baseName}.${ext}` の File にする（ext/type は blob.type 基準）。 */
export function blobToUploadFile(blob: Blob, baseName: string): File {
    const type = blob.type || "image/webp";
    const ext = extensionForMimeType(type);
    return new File([blob], `${baseName}.${ext}`, { type });
}
