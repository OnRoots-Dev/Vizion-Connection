"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadImageToSupabase } from "@/lib/supabase/upload-image";
import { validateImageFile, blobToUploadFile } from "@/features/media";
import BannerCropModal from "@/components/profile/BannerCropModal";
import AvatarCropModal from "@/components/profile/AvatarCropModal";

export default function StepProfileMedia({
  profileImageUrl,
  bannerUrl,
  avatarUrl,
  onProfileImageChange,
  onBannerChange,
  onAvatarChange,
  onNext,
  onBack,
}: {
  profileImageUrl: string;
  bannerUrl: string;
  avatarUrl: string;
  onProfileImageChange: (url: string) => void;
  onBannerChange: (url: string) => void;
  onAvatarChange: (url: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [bannerError, setBannerError] = useState("");
  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);
  const [bannerCropSrc, setBannerCropSrc] = useState<string | null>(null);

  // アバターはアップロード前に Crop Editor を経由する
  function handleAvatarPick() {
    const input = avatarInputRef.current;
    const file = input?.files?.[0];
    if (!file) return;
    setAvatarError("");
    const validation = validateImageFile(file, { maxBytes: 5 * 1024 * 1024 });
    if (!validation.ok) {
      setAvatarError(validation.error ?? "画像ファイルを選択してください");
      input!.value = "";
      return;
    }
    setAvatarCropSrc(URL.createObjectURL(file));
    input!.value = "";
  }

  function closeAvatarCrop() {
    if (uploadingAvatar) return;
    setAvatarCropSrc((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }

  async function handleAvatarCropped(blob: Blob) {
    setUploadingAvatar(true);
    setAvatarError("");
    try {
      const url = await uploadImageToSupabase(blobToUploadFile(blob, "avatar"), "avatar");
      onAvatarChange(url);
      setAvatarCropSrc((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : "画像アップロードに失敗しました");
    } finally {
      setUploadingAvatar(false);
    }
  }

  // バナーもアップロード前に Crop Editor を経由する（src を親で管理）
  function handleBannerPick() {
    const input = bannerInputRef.current;
    const file = input?.files?.[0];
    if (!file) return;
    setBannerError("");
    const validation = validateImageFile(file, { maxBytes: 8 * 1024 * 1024 });
    if (!validation.ok) {
      setBannerError(validation.error ?? "画像ファイルを選択してください");
      input!.value = "";
      return;
    }
    setBannerCropSrc(URL.createObjectURL(file));
    input!.value = "";
  }

  function closeBannerCrop() {
    if (uploadingBanner) return;
    setBannerCropSrc((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }

  async function handleBannerCropped(blob: Blob) {
    setUploadingBanner(true);
    setBannerError("");
    try {
      const url = await uploadImageToSupabase(blobToUploadFile(blob, "banner"), "banner");
      onBannerChange(url);
      setBannerCropSrc((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
    } catch (e) {
      setBannerError(e instanceof Error ? e.message : "画像アップロードに失敗しました");
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleImageUpload(type: "profile" | "avatar") {
    const input = type === "profile" ? profileInputRef.current : avatarInputRef.current;
    const file = input?.files?.[0];
    if (!file) return;

    const setUploading = type === "profile" ? setUploadingProfile : setUploadingAvatar;
    const setErr = type === "profile" ? setProfileError : setAvatarError;
    const setUrl = type === "profile" ? onProfileImageChange : onAvatarChange;

    setErr("");

    if (!file.type.startsWith("image/")) {
      setErr("画像ファイルを選択してください");
      if (input) input.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr("画像サイズは5MB以内にしてください");
      if (input) input.value = "";
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImageToSupabase(file, type);
      setUrl(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "画像アップロードに失敗しました");
    } finally {
      setUploading(false);
      if (input) input.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <AvatarCropModal
        isOpen={avatarCropSrc !== null}
        src={avatarCropSrc}
        onClose={closeAvatarCrop}
        onComplete={(blob) => void handleAvatarCropped(blob)}
        busy={uploadingAvatar}
      />

      <BannerCropModal
        isOpen={bannerCropSrc !== null}
        src={bannerCropSrc}
        onClose={closeBannerCrop}
        onComplete={(blob) => void handleBannerCropped(blob)}
        busy={uploadingBanner}
      />

      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Step 2</p>
        <h3 className="mt-1 text-xl font-black text-white">画像設定</h3>
        <p className="mt-2 text-sm leading-6 text-white/70">
          カード画像・プロフィール画像・プロフィールバナー画像をアップロードできます（最大5MB）。
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-black text-white">プロフィールバナー画像</p>
              <p className="mt-1 text-sm text-white/60">公開プロフィールのヘッダーに表示されます（3:1でクロップ）。</p>
            </div>
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              className="shrink-0 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
            >
              {uploadingBanner ? "アップロード中..." : (bannerUrl ? "画像を変更" : "画像を設定")}
            </button>
          </div>

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerPick}
            aria-label="バナー画像を選択"
          />

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20" style={{ aspectRatio: "3 / 1" }}>
            {bannerUrl ? (
              <Image src={bannerUrl} alt="banner" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))" }} />
            )}
            <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)" }} />
          </div>

          <div className="flex flex-wrap gap-2">
            {bannerUrl ? (
              <button
                type="button"
                onClick={() => {
                  onBannerChange("");
                  setBannerError("");
                }}
                disabled={uploadingBanner}
                className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-black text-white/70 disabled:opacity-60"
              >
                削除
              </button>
            ) : null}
          </div>

          {bannerError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {bannerError}
            </div>
          ) : null}
        </div>

        <ImageUploadCard
          label="カード画像"
          description="プロフィールカードの大きい画像として表示されます。"
          type="profile"
          currentUrl={profileImageUrl}
          inputRef={profileInputRef}
          uploading={uploadingProfile}
          error={profileError}
          onPick={() => profileInputRef.current?.click()}
          onRemove={() => {
            onProfileImageChange("");
            setProfileError("");
          }}
          onChange={() => void handleImageUpload("profile")}
        />

        <ImageUploadCard
          label="プロフィール画像"
          description="アイコンなどに表示される写真です。"
          type="avatar"
          currentUrl={avatarUrl}
          inputRef={avatarInputRef}
          uploading={uploadingAvatar}
          error={avatarError}
          onPick={() => avatarInputRef.current?.click()}
          onRemove={() => {
            onAvatarChange("");
            setAvatarError("");
          }}
          onChange={handleAvatarPick}
          onAdjust={avatarUrl ? () => setAvatarCropSrc(avatarUrl) : undefined}
        />
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
          disabled={uploadingProfile || uploadingAvatar || uploadingBanner}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-black text-black disabled:opacity-60"
        >
          {uploadingProfile || uploadingAvatar || uploadingBanner ? "アップロード中..." : "保存して次へ"}
        </button>
      </div>
    </div>
  );
}

function ImageUploadCard({
  label,
  description,
  currentUrl,
  inputRef,
  uploading,
  error,
  onPick,
  onRemove,
  onChange,
  onAdjust,
}: {
  label: string;
  description: string;
  type: "profile" | "avatar";
  currentUrl: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  error: string;
  onPick: () => void;
  onRemove: () => void;
  onChange: () => void;
  onAdjust?: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          {currentUrl ? (
            <Image
              src={currentUrl}
              alt={label}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-xs font-semibold text-white/30">No Image</div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-white">{label}</p>
          <p className="mt-1 text-sm text-white/60">{description}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
        aria-label={`${label}を選択`}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPick}
          disabled={uploading}
          className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
        >
          {uploading ? "アップロード中..." : "画像を選択"}
        </button>
        {currentUrl && onAdjust ? (
          <button
            type="button"
            onClick={onAdjust}
            disabled={uploading}
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
          >
            調整
          </button>
        ) : null}
        {currentUrl ? (
          <button
            type="button"
            onClick={onRemove}
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
  );
}
