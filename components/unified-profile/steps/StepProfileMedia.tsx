"use client";

import { useRef, useState } from "react";
import { uploadImageToSupabase } from "@/lib/supabase/upload-image";

export default function StepProfileMedia({
  profileImageUrl,
  avatarUrl,
  onProfileImageChange,
  onAvatarChange,
  onNext,
  onBack,
}: {
  profileImageUrl: string;
  avatarUrl: string;
  onProfileImageChange: (url: string) => void;
  onAvatarChange: (url: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
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
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Step 2</p>
        <h3 className="mt-1 text-xl font-black text-white">プロフィール画像</h3>
        <p className="mt-2 text-sm leading-6 text-white/70">
          プロフィール画像とアバター画像をアップロードできます（最大5MB）。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ImageUploadCard
          label="プロフィール画像"
          description="カード背景・プロフィールのヒーロー画像です。"
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
          label="アバター画像"
          description="アイコンとして表示される写真です。"
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
          onChange={() => void handleImageUpload("avatar")}
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
          disabled={uploadingProfile || uploadingAvatar}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-black text-black disabled:opacity-60"
        >
          {uploadingProfile || uploadingAvatar ? "アップロード中..." : "保存して次へ"}
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
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          {currentUrl ? (
            <img src={currentUrl} alt={label} className="h-full w-full object-cover" />
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
