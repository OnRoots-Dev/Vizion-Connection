"use client";

import { useRef, useState } from "react";
import { StepHeader, Field } from "@/components/career-wizard/WizardUI";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { uploadImageToSupabase } from "@/lib/supabase/upload-image";

export default function StepProfileMediaWizard() {
  const profileImageUrl = useCareerWizard((s) => s.data.profileImageUrl);
  const avatarUrl = useCareerWizard((s) => s.data.avatarUrl);
  const setField = useCareerWizard((s) => s.setField);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [avatarError, setAvatarError] = useState("");

  async function handleImageUpload(type: "profile" | "avatar") {
    const input = type === "profile" ? profileInputRef.current : avatarInputRef.current;
    const file = input?.files?.[0];
    if (!file) return;

    const setUploading = type === "profile" ? setUploadingProfile : setUploadingAvatar;
    const setErr = type === "profile" ? setProfileError : setAvatarError;

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
      if (type === "profile") setField("profileImageUrl", url);
      else setField("avatarUrl", url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "画像アップロードに失敗しました");
    } finally {
      setUploading(false);
      if (input) input.value = "";
    }
  }

  const uploading = uploadingProfile || uploadingAvatar;

  return (
    <div>
      <StepHeader
        eyebrow="PROFILE"
        title="プロフィール画像"
        hint="プロフィール画像とアバター画像をアップロードできます（最大5MB）"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="プロフィール画像" className="h-full w-full object-cover" />
              ) : (
                <div className="text-xs font-semibold text-white/30">No Image</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white">プロフィール画像</p>
              <p className="mt-1 text-sm text-white/60">カード背景・プロフィールのヒーロー画像です。</p>
            </div>
          </div>

          <input
            ref={profileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={() => void handleImageUpload("profile")}
            aria-label="プロフィール画像を選択"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              disabled={uploadingProfile}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
            >
              {uploadingProfile ? "アップロード中..." : "画像を選択"}
            </button>
            {profileImageUrl ? (
              <button
                type="button"
                onClick={() => {
                  setField("profileImageUrl", "");
                  setProfileError("");
                }}
                className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-black text-white/70"
              >
                削除
              </button>
            ) : null}
          </div>

          {profileError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {profileError}
            </div>
          ) : null}
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt="アバター画像" className="h-full w-full object-cover" />
              ) : (
                <div className="text-xs font-semibold text-white/30">No Image</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white">アバター画像</p>
              <p className="mt-1 text-sm text-white/60">アイコンとして表示される写真です。</p>
            </div>
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={() => void handleImageUpload("avatar")}
            aria-label="アバター画像を選択"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
            >
              {uploadingAvatar ? "アップロード中..." : "画像を選択"}
            </button>
            {avatarUrl ? (
              <button
                type="button"
                onClick={() => {
                  setField("avatarUrl", "");
                  setAvatarError("");
                }}
                className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-black text-white/70"
              >
                削除
              </button>
            ) : null}
          </div>

          {avatarError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {avatarError}
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
