// features/media/optimize-image.ts
// クロップを伴わない画像最適化（長辺リサイズ + webp 出力 + fallback）。
// 将来のプロフィール/Journey 画像の軽量化に再利用できる共通ユーティリティ。

import { exportCanvasBlob, loadImage, type ExportImageOptions } from "./crop-image";

export interface OptimizeImageOptions extends Pick<ExportImageOptions, "mimeType" | "quality"> {
    /** 長辺の上限px（既定 1600）。これを超える場合のみ縮小する */
    maxEdge?: number;
}

const DEFAULT_MAX_EDGE = 1600;

/**
 * 画像をアスペクト比維持で縮小し、webp（非対応時 png）Blob を返す。
 * @param source URL / File / 読込済み HTMLImageElement
 */
export async function createOptimizedImage(
    source: string | File | HTMLImageElement,
    options: OptimizeImageOptions = {},
): Promise<Blob> {
    const maxEdge = options.maxEdge ?? DEFAULT_MAX_EDGE;

    let objectUrl: string | null = null;
    let image: HTMLImageElement;
    if (typeof source === "string") {
        image = await loadImage(source);
    } else if (source instanceof HTMLImageElement) {
        image = source;
    } else {
        objectUrl = URL.createObjectURL(source);
        image = await loadImage(objectUrl);
    }

    try {
        const naturalW = image.naturalWidth || image.width;
        const naturalH = image.naturalHeight || image.height;
        const longest = Math.max(naturalW, naturalH);
        const scale = longest > maxEdge ? maxEdge / longest : 1;

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

        return await exportCanvasBlob(canvas, { mimeType: options.mimeType, quality: options.quality });
    } finally {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
}
