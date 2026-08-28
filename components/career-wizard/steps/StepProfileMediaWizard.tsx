"use client";

import { useRef, useState } from "react";
import { StepHeader } from "@/components/career-wizard/WizardUI";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { useCropUpload } from "@/features/media";
import AvatarCropModal from "@/components/profile/AvatarCropModal";
import ProfileHeroCropModal from "@/components/profile/ProfileHeroCropModal";
import Image from "next/image";

export default function StepProfileMediaWizard() {
  const profileImageUrl = useCareerWizard((s) => s.data.profileImageUrl);
  const avatarUrl = useCareerWizard((s) => s.data.avatarUrl);
  const setField = useCareerWizard((s) => s.setField);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);
  const [profileCropSrc, setProfileCropSrc] = useState<string | null>(null);

  function clearAvatarCrop() {
    setAvatarCropSrc((prev) => {
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
    onUploaded: (url) => { setField("avatarUrl", url); clearAvatarCrop(); },
  });
  const profileUpload = useCropUpload({
    uploadType: "profile",
    baseName: "profile",
    maxBytes: 5 * 1024 * 1024,
    onUploaded: (url) => { setField("profileImageUrl", url); clearProfileCrop(); },
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

  const uploading = profileUpload.uploading || avatarUpload.uploading;

  return (
    <div>
      <AvatarCropModal
        isOpen={avatarCropSrc !== null}
        src={avatarCropSrc}
        onClose={closeAvatarCrop}
        onComplete={(blob) => void avatarUpload.upload(blob)}
        busy={avatarUpload.uploading}
      />

      <ProfileHeroCropModal
        isOpen={profileCropSrc !== null}
        src={profileCropSrc}
        onClose={closeProfileCrop}
        onComplete={(blob) => void profileUpload.upload(blob)}
        busy={profileUpload.uploading}
      />

      <StepHeader
        eyebrow="PROFILE"
        title="プロフィール画像"
        hint="プロフィール画像とアバター画像をアップロードできます（最大5MB）"
      />

      <div className="grid gap-4">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-black text-white">プロフィール画像</p>
              <p className="mt-1 text-sm leading-relaxed text-white/60">カード背景・プロフィールのヒーロー画像です。</p>
            </div>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt="プロフィール画像"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-xs font-semibold text-white/30">No Image</div>
              )}
            </div>
          </div>

          <input
            ref={profileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePick}
            aria-label="プロフィール画像を選択"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              disabled={profileUpload.uploading}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
            >
              {profileUpload.uploading ? "アップロード中..." : "画像を選択"}
            </button>
            {profileImageUrl ? (
              <>
                <button
                  type="button"
                  onClick={() => setProfileCropSrc(profileImageUrl)}
                  disabled={profileUpload.uploading}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
                >
                  調整
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setField("profileImageUrl", "");
                    profileUpload.setError("");
                  }}
                  className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-black text-white/70"
                >
                  削除
                </button>
              </>
            ) : null}
          </div>

          {profileUpload.error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {profileUpload.error}
            </div>
          ) : null}
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-black text-white">アバター画像</p>
              <p className="mt-1 text-sm leading-relaxed text-white/60">アイコンとして表示される写真です。</p>
            </div>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="アバター画像"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-xs font-semibold text-white/30">No Image</div>
              )}
            </div>
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarPick}
            aria-label="アバター画像を選択"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUpload.uploading}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
            >
              {avatarUpload.uploading ? "アップロード中..." : "画像を選択"}
            </button>
            {avatarUrl ? (
              <>
                <button
                  type="button"
                  onClick={() => setAvatarCropSrc(avatarUrl)}
                  disabled={avatarUpload.uploading}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
                >
                  調整
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setField("avatarUrl", "");
                    avatarUpload.setError("");
                  }}
                  className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-black text-white/70"
                >
                  削除
                </button>
              </>
            ) : null}
          </div>

          {avatarUpload.error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {avatarUpload.error}
            </div>
          ) : null}
        </div>
      </div>

      {uploading ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          アップロード中...
        </div>
      ) : null}
    </div>
  );
}
