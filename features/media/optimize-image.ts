// features/media/optimize-image.ts
// 画像最適化（長辺リサイズ + webp変換 + 品質指定 + fallback）の汎用 media layer。
// Blob 入力 / Blob 出力。Crop 後データ（Blob）にそのまま接続できる。
// UI ロジックは持たない（純粋な画像処理のみ）。将来の Journey / Portfolio / Event
// 画像など、crop を伴わない最適化にも再利用できる。

import { exportCanvasBlob, loadImage, type ExportImageOptions } from "./crop-image";

export interface OptimizeBlobOptions extends Pick<ExportImageOptions, "mimeType" | "quality"> {
    /** 長辺の上限px（既定 1600）。これを超える場合のみ縮小する */
    maxEdge?: number;
}

const DEFAULT_MAX_EDGE = 1600;
const DEFAULT_MIME = "image/webp";

/**
 * Blob を最適化して Blob を返す。
 * - 長辺が maxEdge を超える場合のみアスペクト比維持で縮小
 * - mimeType（既定 webp）へ変換、非対応環境では png へ fallback（exportCanvasBlob）
 * - 既に目標形式かつ縮小不要なら **再エンコードせず原本を返す**（二重圧縮回避）
 */
export async function optimizeBlob(blob: Blob, options: OptimizeBlobOptions = {}): Promise<Blob> {
    const maxEdge = options.maxEdge ?? DEFAULT_MAX_EDGE;
    const mimeType = options.mimeType ?? DEFAULT_MIME;

    const objectUrl = URL.createObjectURL(blob);
    try {
        const image = await loadImage(objectUrl);
        const naturalW = image.naturalWidth || image.width;
        const naturalH = image.naturalHeight || image.height;
        const longest = Math.max(naturalW, naturalH);

        const needsResize = longest > maxEdge;
        const alreadyTarget = blob.type === mimeType;

        // skip-when-small: 目標形式かつ縮小不要なら二重圧縮を避けて原本返却
        if (!needsResize && alreadyTarget) return blob;

        const scale = needsResize ? maxEdge / longest : 1;
        const outW = Math.max(1, Math.round(naturalW * scale));
        const outH = Math.max(1, Math.round(naturalH * scale));

        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context is not available");

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(image, 0, 0, naturalW, naturalH, 0, 0, outW, outH);

        return await exportCanvasBlob(canvas, { mimeType, quality: options.quality });
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}
