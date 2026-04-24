"use client";

import { useEffect, useMemo, useState } from "react";
import StepProfileBasic from "@/components/unified-profile/steps/StepProfileBasic";
import StepProfileMedia from "@/components/unified-profile/steps/StepProfileMedia";
import StepProfileComplete from "@/components/unified-profile/steps/StepProfileComplete";

export type UnifiedProfileUser = {
  slug: string;
  displayName?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
  bio?: string;
  region?: string;
  prefecture?: string;
  sportsCategory?: string;
  sport?: string;
  stance?: string;
  instagram?: string;
  xUrl?: string;
  tiktok?: string;
  isPublic?: boolean;
};

export type UnifiedProfileData = {
  displayName: string;
  bio: string;
  region: string;
  prefecture: string;
  sportsCategory: string;
  sport: string;
  stance: string;
  instagram: string;
  xUrl: string;
  tiktok: string;
  profileImageUrl: string;
  avatarUrl: string;
  isPublic: boolean;
};

type StepNumber = 1 | 2 | 3 | 4 | 5 | 6;

export default function UnifiedProfileModal({
  isOpen,
  onClose,
  user,
  onCompleted,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: UnifiedProfileUser;
  onCompleted?: () => void;
}) {
  const initialProfileData = useMemo<UnifiedProfileData>(() => {
    return {
      displayName: user.displayName ?? "",
      bio: user.bio ?? "",
      region: user.region ?? "",
      prefecture: user.prefecture ?? "",
      sportsCategory: user.sportsCategory ?? "",
      sport: user.sport ?? "",
      stance: user.stance ?? "",
      instagram: user.instagram ?? "",
      xUrl: user.xUrl ?? "",
      tiktok: user.tiktok ?? "",
      profileImageUrl: user.profileImageUrl ?? "",
      avatarUrl: user.avatarUrl ?? "",
      isPublic: user.isPublic !== false,
    };
  }, [user]);

  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [profileData, setProfileData] = useState<UnifiedProfileData>(initialProfileData);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);
    setProfileData(initialProfileData);
    setSaving(false);
    setSaveError("");
  }, [isOpen, initialProfileData]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  function handleChange(field: string, value: string | boolean) {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveAndGoComplete() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: profileData.displayName,
          bio: profileData.bio,
          region: profileData.region,
          prefecture: profileData.prefecture,
          sportsCategory: profileData.sportsCategory,
          sport: profileData.sport,
          stance: profileData.stance,
          instagram: profileData.instagram,
          xUrl: profileData.xUrl,
          tiktok: profileData.tiktok,
          profileImageUrl: profileData.profileImageUrl,
          avatarUrl: profileData.avatarUrl,
          isPublic: profileData.isPublic,
        }),
      });

      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const error =
          typeof (json as { error?: unknown })?.error === "string"
            ? (json as { error: string }).error
            : "保存に失敗しました";
        throw new Error(error);
      }

      setCurrentStep(3);
      onCompleted?.();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "エラーが発生しました");
      setCurrentStep(2);
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  const steps: Array<{ n: StepNumber; label: string; enabled: boolean }> = [
    { n: 1, label: "プロフィール情報", enabled: true },
    { n: 2, label: "プロフィール画像", enabled: true },
    { n: 3, label: "プロフィール完了", enabled: true },
    { n: 4, label: "キャリア情報", enabled: false },
    { n: 5, label: "キャリア画像", enabled: false },
    { n: 6, label: "キャリア完了", enabled: false },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />

      <div className="relative mx-auto flex h-full max-w-3xl flex-col overflow-hidden border-x border-white/10 bg-[#07070e]">
        <header className="flex items-center gap-3 border-b border-white/10 bg-black/20 px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80"
          >
            閉じる
          </button>
          <div className="min-w-0">
            <p className="truncate text-xs font-black uppercase tracking-[0.2em] text-white/40">Registration</p>
            <h2 className="truncate text-base font-black text-white">プロフィール / キャリア登録</h2>
          </div>
        </header>

        <div className="border-b border-white/10 px-4 py-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
            {steps.map((s) => {
              const isActive = s.n === currentStep;
              const isDone = s.n < currentStep;
              const disabled = !s.enabled;

              const textTone = disabled
                ? "text-white/25"
                : isActive
                  ? "text-white"
                  : isDone
                    ? "text-white/70"
                    : "text-white/50";
              const bgTone = disabled ? "bg-white/5" : isActive ? "bg-white/15" : "bg-white/5";
              const borderTone = disabled ? "border-white/10" : isActive ? "border-white/20" : "border-white/10";

              return (
                <div key={s.n} className={`rounded-xl border px-2 py-2 ${bgTone} ${borderTone}`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${textTone}`}>Step {s.n}</p>
                  <p className={`mt-1 truncate text-xs font-semibold ${textTone}`}>{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4">
          {currentStep === 1 ? (
            <StepProfileBasic data={profileData} onChange={handleChange} onNext={() => setCurrentStep(2)} />
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-4">
              <StepProfileMedia
                profileImageUrl={profileData.profileImageUrl}
                avatarUrl={profileData.avatarUrl}
                onProfileImageChange={(url) => setProfileData((p) => ({ ...p, profileImageUrl: url }))}
                onAvatarChange={(url) => setProfileData((p) => ({ ...p, avatarUrl: url }))}
                onBack={() => setCurrentStep(1)}
                onNext={() => void handleSaveAndGoComplete()}
              />

              {saveError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {saveError}
                </div>
              ) : null}

              {saving ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                  保存中...
                </div>
              ) : null}
            </div>
          ) : null}

          {currentStep === 3 ? (
            <StepProfileComplete
              profileData={{
                displayName: profileData.displayName,
                bio: profileData.bio,
                profileImageUrl: profileData.profileImageUrl,
                avatarUrl: profileData.avatarUrl,
              }}
              onContinueToCareer={() => setCurrentStep(4)}
              onClose={onClose}
            />
          ) : null}

          {currentStep === 4 || currentStep === 5 || currentStep === 6 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-sm text-white/70">キャリア登録は次のステップで設定します</p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-semibold text-white/80"
                >
                  閉じる
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
