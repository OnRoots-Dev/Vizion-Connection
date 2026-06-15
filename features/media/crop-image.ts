// features/media/crop-image.ts
// canvas 生成・drawImage・webp 出力（fallback付き）の共通ロジック。
// AvatarCropModal / BannerCropModal の重複していた画像処理をここへ集約する。
// UI コンポーネントは「どこを切り出すか（rect）」だけを渡す。

/** 切り出し矩形（元画像の自然座標ピクセル） */
export interface CropRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ExportImageOptions {
    /** 出力 MIME（既定 image/webp）。非対応環境では png にフォールバック */
    mimeType?: string;
    /** 0–1（既定 0.9） */
    quality?: number;
    /** 固定出力サイズ（指定時は rect をこのサイズへリサイズ）。未指定なら rect サイズ */
    outputWidth?: number;
    outputHeight?: number;
}

const DEFAULT_MIME = "image/webp";
const DEFAULT_QUALITY = 0.9;

/** 画像を読み込む。別オリジン（Supabase Storage 等）の再クロップに備え CORS 許可付き。 */
export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
        img.src = src;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
}

/** canvas を Blob 化。指定 MIME が出力できない場合は png にフォールバックする。 */
export async function exportCanvasBlob(canvas: HTMLCanvasElement, options: ExportImageOptions = {}): Promise<Blob> {
    const mime = options.mimeType ?? DEFAULT_MIME;
    const quality = options.quality ?? DEFAULT_QUALITY;

    let blob = await canvasToBlob(canvas, mime, quality);
    if (!blob && mime !== "image/png") {
        blob = await canvasToBlob(canvas, "image/png", quality);
    }
    if (!blob) throw new Error("画像の生成に失敗しました");
    return blob;
}

/**
 * 元画像から rect を切り出して Blob を生成する。
 * @param source 画像の URL もしくは読込済み HTMLImageElement
 * @param rect   元画像（自然座標）での切り出し矩形
 */
export async function cropImageToBlob(
    source: string | HTMLImageElement,
    rect: CropRect,
    options: ExportImageOptions = {},
): Promise<Blob> {
    const image = typeof source === "string" ? await loadImage(source) : source;

    const outW = Math.max(1, Math.floor(options.outputWidth ?? rect.width));
    const outH = Math.max(1, Math.floor(options.outputHeight ?? rect.height));

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context is not available");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, outW, outH);

    return exportCanvasBlob(canvas, options);
}
