"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export default function StepCareerMedia({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [careerImageUrl, setCareerImageUrl] = useState("");

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("画像サイズは5MB以内にしてください");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "career");

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok || typeof (json as { url?: unknown })?.url !== "string") {
        const message =
          typeof (json as { error?: unknown })?.error === "string"
            ? (json as { error: string }).error
            : "画像アップロードに失敗しました";
        throw new Error(message);
      }

      setCareerImageUrl((json as { url: string }).url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "画像アップロードに失敗しました");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Step 5</p>
        <h3 className="mt-1 text-xl font-black text-white">キャリアページ用メディア</h3>
        <p className="mt-2 text-sm leading-6 text-white/70">
          キャリアページに表示する画像を登録できます（任意）
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            {careerImageUrl ? (
              <Image
                src={careerImageUrl}
                alt="キャリア画像"
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-xs font-semibold text-white/30">No Image</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white">キャリア画像</p>
            <p className="mt-1 text-sm text-white/60">キャリアページに表示する画像です（任意）</p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={() => void handleUpload()}
          aria-label="キャリア画像を選択"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
          >
            {uploading ? "アップロード中..." : "画像を選択"}
          </button>
          {careerImageUrl ? (
            <button
              type="button"
              onClick={() => {
                setCareerImageUrl("");
                setError("");
              }}
              className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-black text-white/70"
            >
              削除
            </button>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-black text-white/80"
        >
          戻る
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={uploading}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-black text-black disabled:opacity-60"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
