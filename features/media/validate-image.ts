// features/media/validate-image.ts
// 画像ファイルのクライアント検証（種別・サイズ）。各アップロード導線で重複していた
// バリデーションを一本化する。

export interface ImageValidationOptions {
    /** 上限バイト数（既定 5MB） */
    maxBytes?: number;
}

export interface ImageValidationResult {
    ok: boolean;
    error: string | null;
}

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File, options: ImageValidationOptions = {}): ImageValidationResult {
    if (!file.type.startsWith("image/")) {
        return { ok: false, error: "画像ファイルを選択してください" };
    }
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
    if (file.size > maxBytes) {
        const mb = Math.round(maxBytes / 1024 / 1024);
        return { ok: false, error: `画像サイズは${mb}MB以内にしてください` };
    }
    return { ok: true, error: null };
}
