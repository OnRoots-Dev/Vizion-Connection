"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Cropper, { type Area } from "react-easy-crop";
import { cropImageToBlob, optimizeBlob, type OptimizeBlobOptions } from "@/features/media";

export interface MediaCropOutput {
    width: number;
    height: number;
}

export interface MediaCropModalProps {
    isOpen: boolean;
    src: string | null;
    onClose: () => void;
    onComplete: (blob: Blob) => void;
    busy?: boolean;
    accentColor?: string;
    /** クロップ枠のアスペクト比（avatar=1, banner=3） */
    aspect: number;
    cropShape?: "round" | "rect";
    /** 固定出力サイズ（指定時はリサイズ）。未指定なら crop の自然解像度をそのまま出力 */
    output?: MediaCropOutput;
    /** 指定時、crop 後に長辺リサイズ/webp 最適化を適用（avatar は非接続=未指定） */
    optimize?: OptimizeBlobOptions;
    eyebrow?: string;
    title?: string;
    hint?: string;
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;

// react-easy-crop ベースの汎用 Crop モーダル。Avatar / Banner の共通基盤。
// UI は crop 操作のみ担当し、出力（canvas/webp/fallback）は features/media に委譲する。
export default function MediaCropModal({
    isOpen,
    src,
    onClose,
    onComplete,
    busy = false,
    accentColor = "#a78bfa",
    aspect,
    cropShape = "rect",
    output,
    optimize,
    eyebrow = "Media",
    title = "画像を調整",
    hint = "ドラッグで位置調整・スライダーで拡大",
}: MediaCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [area, setArea] = useState<Area | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // src が変わったら crop 状態を初期化
    useEffect(() => {
        if (!src) return;
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setArea(null);
        setError("");
        setLoading(true);
    }, [src]);

    const onCropComplete = useCallback((_a: Area, areaPixels: Area) => {
        setArea(areaPixels);
    }, []);

    function reset() {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setError("");
    }

    async function handleSave() {
        if (!src || !area) {
            setError("画像を調整してください");
            return;
        }
        setError("");
        try {
            const cropped = await cropImageToBlob(src, area, {
                ...(output ? { outputWidth: output.width, outputHeight: output.height } : {}),
                mimeType: "image/webp",
                quality: 0.9,
            });
            // crop 後のみ最適化（optimize 未指定の avatar は素通り）
            const blob = optimize ? await optimizeBlob(cropped, optimize) : cropped;
            onComplete(blob);
        } catch (e) {
            setError(e instanceof Error ? e.message : "画像の処理に失敗しました");
        }
    }

    return (
        <AnimatePresence>
            {isOpen && src ? (
                <>
                    <motion.div
                        className="fixed inset-0 z-[80]"
                        style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            if (!busy) onClose();
                        }}
                    />

                    <motion.div
                        className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="flex w-full max-w-[440px] flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[#0c0c16]"
                            style={{ maxHeight: "94dvh" }}
                            initial={{ y: 30, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 260, damping: 26 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                                <div className="min-w-0">
                                    <p className="m-0 font-mono text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/35">{eyebrow}</p>
                                    <p className="m-0 text-[14px] font-black text-white">{title}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={busy}
                                    aria-label="閉じる"
                                    className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-[12px] font-black text-white/70 disabled:opacity-60"
                                >
                                    キャンセル
                                </button>
                            </div>

                            {/* クロップ領域 */}
                            <div className="relative w-full bg-black" style={{ height: "min(72vw, 340px)" }}>
                                <Cropper
                                    image={src}
                                    crop={crop}
                                    zoom={zoom}
                                    minZoom={ZOOM_MIN}
                                    maxZoom={ZOOM_MAX}
                                    aspect={aspect}
                                    cropShape={cropShape}
                                    showGrid={false}
                                    restrictPosition
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                    onMediaLoaded={() => setLoading(false)}
                                />
                                {loading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <span
                                            className="inline-block h-6 w-6 rounded-full border-2 border-white/20"
                                            style={{ borderTopColor: accentColor, animation: "mediacrop-spin 0.7s linear infinite" }}
                                        />
                                    </div>
                                ) : null}
                            </div>

                            <div className="space-y-3 p-4">
                                {/* ズームスライダー */}
                                <div className="flex items-center gap-3">
                                    <span className="text-[16px] text-white/45">−</span>
                                    <input
                                        type="range"
                                        min={ZOOM_MIN}
                                        max={ZOOM_MAX}
                                        step={0.01}
                                        value={zoom}
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        aria-label="ズーム"
                                        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/15"
                                        style={{ accentColor }}
                                    />
                                    <span className="text-[16px] text-white/45">＋</span>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <p className="m-0 text-[11px] text-white/40">{hint}</p>
                                    <button
                                        type="button"
                                        onClick={reset}
                                        disabled={busy}
                                        className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-black text-white/60 disabled:opacity-60"
                                    >
                                        リセット
                                    </button>
                                </div>

                                {error ? (
                                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                        {error}
                                    </div>
                                ) : null}

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={busy}
                                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/75 disabled:opacity-60"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleSave()}
                                        disabled={busy || !area || loading}
                                        className="flex-1 rounded-xl px-4 py-3 text-sm font-black text-black disabled:opacity-60"
                                        style={{ background: accentColor }}
                                    >
                                        {busy ? "保存中..." : "この画像にする"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <style>{`@keyframes mediacrop-spin{to{transform:rotate(360deg)}}`}</style>
                </>
            ) : null}
        </AnimatePresence>
    );
}
