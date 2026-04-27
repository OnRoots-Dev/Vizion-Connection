"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepProfileBasic from "@/components/unified-profile/steps/StepProfileBasic";
import StepProfileMedia from "@/components/unified-profile/steps/StepProfileMedia";
import StepProfileComplete from "@/components/unified-profile/steps/StepProfileComplete";
import CareerWizardModal from "@/components/career-wizard/CareerWizardModal";
import StepCareerMedia from "@/components/unified-profile/steps/StepCareerMedia";
import StepCareerComplete from "@/components/unified-profile/steps/StepCareerComplete";

export type UnifiedProfileUser = {
  slug: string;
  displayName?: string;
  profileImageUrl?: string;
  avatarUrl?: string | null;
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

  const progressPct = (currentStep / 6) * 100;

  const steps: Array<{ n: StepNumber; label: string; enabled: boolean }> = [
    { n: 1, label: "プロフィール情報", enabled: true },
    { n: 2, label: "プロフィール画像", enabled: true },
    { n: 3, label: "プロフィール完了", enabled: true },
    { n: 4, label: "キャリア情報", enabled: true },
    { n: 5, label: "キャリア画像", enabled: true },
    { n: 6, label: "完了", enabled: true },
  ];


  const stepContent =
    currentStep === 1 ? (
      <StepProfileBasic data={profileData} onChange={handleChange} onNext={() => setCurrentStep(2)} />
    ) : currentStep === 2 ? (
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
    ) : currentStep === 3 ? (
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
    ) : currentStep === 4 ? (
      <div className="relative">
        <CareerWizardModal
          contained
          onClose={() => {}}
          onCompleted={() => {
            setCurrentStep(5);
          }}
        />
      </div>
    ) : currentStep === 5 ? (
      <StepCareerMedia onBack={() => setCurrentStep(4)} onNext={() => setCurrentStep(6)} />
    ) : (
      <StepCareerComplete slug={user.slug} onClose={onClose} />
    );

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative mx-auto my-2 flex max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#07070e]"
            style={{ height: "calc(100dvh - 16px)", maxHeight: "calc(100dvh - 16px)" }}
            initial={{ y: 80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <header className="flex items-center gap-3 border-b border-white/10 bg-black/20 px-4 py-4">
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80"
              >
                閉じる
              </motion.button>
              <div className="min-w-0">
                <p className="truncate text-xs font-black uppercase tracking-[0.2em] text-white/40">Registration</p>
                <h2 className="truncate text-base font-black text-white">プロフィール / キャリア登録</h2>
              </div>
            </header>

            <div className="flex-1 min-h-0 overflow-hidden md:flex">
              <div className="border-b border-white/10 px-4 py-3 md:hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                      Step {currentStep}/6
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-white">{steps[currentStep - 1]?.label}</p>
                  </div>
                  <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                    {Math.round(progressPct)}%
                  </div>
                </div>

                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-white"
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>

              <aside className="hidden md:flex md:w-48 md:flex-col md:border-r md:border-white/10">
                <div className="border-b border-white/10 px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Steps</p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-white"
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                  <div className="space-y-1">
                    {steps.map((s) => {
                      const isActive = s.n === currentStep;
                      const isDone = s.n < currentStep;
                      const isUpcoming = s.n > currentStep;

                      const base = "w-full rounded-xl border px-3 py-2 text-left transition-colors";
                      const tones = isActive
                        ? "border-white/20 bg-white/10 text-white"
                        : isDone
                          ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                          : "border-white/10 bg-white/5 text-white/35";

                      return (
                        <button
                          key={s.n}
                          type="button"
                          onClick={() => {
                            if (!isUpcoming) setCurrentStep(s.n);
                          }}
                          disabled={isUpcoming}
                          className={`${base} ${tones} disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em]">Step {s.n}</p>
                              <p className="mt-1 truncate text-xs font-semibold">{s.label}</p>
                            </div>
                            <div className="shrink-0">
                              {isDone ? (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white">
                                  ✓
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              <main className="flex-1 min-h-0 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {stepContent}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
