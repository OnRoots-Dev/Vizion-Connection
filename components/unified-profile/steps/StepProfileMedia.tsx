"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useCropUpload } from "@/features/media";
import BannerCropModal from "@/components/profile/BannerCropModal";
import AvatarCropModal from "@/components/profile/AvatarCropModal";
import ProfileHeroCropModal from "@/components/profile/ProfileHeroCropModal";

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

  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);
  const [bannerCropSrc, setBannerCropSrc] = useState<string | null>(null);
  const [profileCropSrc, setProfileCropSrc] = useState<string | null>(null);

  function clearAvatarCrop() {
    setAvatarCropSrc((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }
  function clearBannerCrop() {
    setBannerCropSrc((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }
  function clearProfileCrop() {
    setProfileCropSrc((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }

  // crop 後〜upload は useCropUpload に集約（UI/cropSrc は本 component が保持）
  const avatarUpload = useCropUpload({
    uploadType: "avatar",
    baseName: "avatar",
    maxBytes: 5 * 1024 * 1024,
    onUploaded: (url) => { onAvatarChange(url); clearAvatarCrop(); },
  });
  const bannerUpload = useCropUpload({
    uploadType: "banner",
    baseName: "banner",
    maxBytes: 8 * 1024 * 1024,
    onUploaded: (url) => { onBannerChange(url); clearBannerCrop(); },
  });
  const profileUpload = useCropUpload({
    uploadType: "profile",
    baseName: "profile",
    maxBytes: 5 * 1024 * 1024,
    onUploaded: (url) => { onProfileImageChange(url); clearProfileCrop(); },
  });

  // アバターはアップロード前に Crop Editor を経由する
  function handleAvatarPick() {
    const input = avatarInputRef.current;
    const file = input?.files?.[0];
    if (!file) return;
    if (!avatarUpload.validateFile(file)) { input.value = ""; return; }
    setAvatarCropSrc(URL.createObjectURL(file));
    input.value = "";
  }
  function closeAvatarCrop() {
    if (avatarUpload.uploading) return;
    clearAvatarCrop();
  }

  // バナーもアップロード前に Crop Editor を経由する（src を親で管理）
  function handleBannerPick() {
    const input = bannerInputRef.current;
    const file = input?.files?.[0];
    if (!file) return;
    if (!bannerUpload.validateFile(file)) { input.value = ""; return; }
    setBannerCropSrc(URL.createObjectURL(file));
    input.value = "";
  }
  function closeBannerCrop() {
    if (bannerUpload.uploading) return;
    clearBannerCrop();
  }

  // プロフィール(hero)画像もアップロード前に Crop Editor を経由する（16:9）
  function handleProfilePick() {
    const input = profileInputRef.current;
    const file = input?.files?.[0];
    if (!file) return;
    if (!profileUpload.validateFile(file)) { input.value = ""; return; }
    setProfileCropSrc(URL.createObjectURL(file));
    input.value = "";
  }
  function closeProfileCrop() {
    if (profileUpload.uploading) return;
    clearProfileCrop();
  }

  return (
    <div className="space-y-6">
      <AvatarCropModal
        isOpen={avatarCropSrc !== null}
        src={avatarCropSrc}
        onClose={closeAvatarCrop}
        onComplete={(blob) => void avatarUpload.upload(blob)}
        busy={avatarUpload.uploading}
      />

      <BannerCropModal
        isOpen={bannerCropSrc !== null}
        src={bannerCropSrc}
        onClose={closeBannerCrop}
        onComplete={(blob) => void bannerUpload.upload(blob)}
        busy={bannerUpload.uploading}
      />

      <ProfileHeroCropModal
        isOpen={profileCropSrc !== null}
        src={profileCropSrc}
        onClose={closeProfileCrop}
        onComplete={(blob) => void profileUpload.upload(blob)}
        busy={profileUpload.uploading}
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
              disabled={bannerUpload.uploading}
              className="shrink-0 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
            >
              {bannerUpload.uploading ? "アップロード中..." : (bannerUrl ? "画像を変更" : "画像を設定")}
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
                  bannerUpload.setError("");
                }}
                disabled={bannerUpload.uploading}
                className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-black text-white/70 disabled:opacity-60"
              >
                削除
              </button>
            ) : null}
          </div>

          {bannerUpload.error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {bannerUpload.error}
            </div>
          ) : null}
        </div>

        <ImageUploadCard
          label="カード画像"
          description="プロフィールカードの大きい画像として表示されます。"
          type="profile"
          currentUrl={profileImageUrl}
          inputRef={profileInputRef}
          uploading={profileUpload.uploading}
          error={profileUpload.error}
          onPick={() => profileInputRef.current?.click()}
          onRemove={() => {
            onProfileImageChange("");
            profileUpload.setError("");
          }}
          onChange={handleProfilePick}
          onAdjust={profileImageUrl ? () => setProfileCropSrc(profileImageUrl) : undefined}
        />

        <ImageUploadCard
          label="プロフィール画像"
          description="アイコンなどに表示される写真です。"
          type="avatar"
          currentUrl={avatarUrl}
          inputRef={avatarInputRef}
          uploading={avatarUpload.uploading}
          error={avatarUpload.error}
          onPick={() => avatarInputRef.current?.click()}
          onRemove={() => {
            onAvatarChange("");
            avatarUpload.setError("");
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
          disabled={profileUpload.uploading || avatarUpload.uploading || bannerUpload.uploading}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-black text-black disabled:opacity-60"
        >
          {profileUpload.uploading || avatarUpload.uploading || bannerUpload.uploading ? "アップロード中..." : "保存して次へ"}
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
