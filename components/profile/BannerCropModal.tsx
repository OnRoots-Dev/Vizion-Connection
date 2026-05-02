"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

async function cropToWebpBlob(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(crop.width * scaleX));
  canvas.height = Math.max(1, Math.floor(crop.height * scaleY));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context is not available");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.9);
  });

  if (!blob) throw new Error("画像の生成に失敗しました");
  return blob;
}

export default function BannerCropModal({
  isOpen,
  onClose,
  onComplete,
  aspect = 3 / 1,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (blob: Blob) => void;
  aspect?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [srcUrl, setSrcUrl] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => srcUrl, [srcUrl]);

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setBusy(false);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (srcUrl.startsWith("blob:")) URL.revokeObjectURL(srcUrl);
    };
  }, [srcUrl]);

  function handlePickFile() {
    inputRef.current?.click();
  }

  function handleFileChange() {
    const input = inputRef.current;
    if (!input) return;
    const file = input.files?.[0];
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      input.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("画像サイズは8MB以内にしてください");
      input.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSrcUrl(objectUrl);
    setCrop(undefined);
    setCompletedCrop(null);
  }

  async function handleConfirm() {
    if (!imgRef.current || !completedCrop) {
      setError("クロップ範囲を選択してください");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const blob = await cropToWebpBlob(imgRef.current, completedCrop);
      onComplete(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "画像の処理に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            className="fixed inset-0 z-[80]"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
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
              className="w-full max-w-[720px] overflow-hidden rounded-[20px] border border-white/10 bg-[#0c0c16]"
              style={{ maxHeight: "92dvh" }}
              initial={{ y: 30, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div className="min-w-0">
                  <p className="m-0 font-mono text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/35">Banner</p>
                  <p className="m-0 text-[14px] font-black text-white">バナー画像をクロップ</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePickFile}
                    disabled={busy}
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[12px] font-black text-white disabled:opacity-60"
                  >
                    画像を選択
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={busy}
                    className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-[12px] font-black text-white/70 disabled:opacity-60"
                  >
                    閉じる
                  </button>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  aria-label="バナー画像を選択"
                />

                {previewUrl ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <ReactCrop
                      crop={crop}
                      onChange={(_c: Crop, percentCrop: Crop) => setCrop(percentCrop)}
                      onComplete={(c: PixelCrop) => setCompletedCrop(c)}
                      aspect={aspect}
                      keepSelection
                      minWidth={40}
                    >
                      <img
                        ref={(node) => {
                          imgRef.current = node;
                        }}
                        alt=""
                        src={previewUrl}
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          setCrop(centerAspectCrop(img.width, img.height, aspect));
                        }}
                        style={{ maxHeight: "60dvh", width: "100%", objectFit: "contain" }}
                      />
                    </ReactCrop>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-white/55">
                    画像を選択してクロップ範囲を調整してください
                  </div>
                )}

                {error ? (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => void handleConfirm()}
                    disabled={busy || !completedCrop}
                    className="rounded-xl bg-white px-5 py-2.5 text-sm font-black text-black disabled:opacity-60"
                  >
                    {busy ? "処理中..." : "この範囲で確定"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
