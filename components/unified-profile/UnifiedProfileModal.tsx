"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
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
  bannerUrl?: string;
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
  bannerUrl: string;
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
      bannerUrl: user.bannerUrl ?? "",
      avatarUrl: user.avatarUrl ?? "",
      isPublic: user.isPublic !== false,
    };
  }, [user]);

  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [profileData, setProfileData] = useState<UnifiedProfileData>(initialProfileData);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [hydrating, setHydrating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);
    setProfileData(initialProfileData);
    setSaving(false);
    setSaveError("");
  }, [isOpen, initialProfileData]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    async function hydrate() {
      setHydrating(true);
      try {
        const [meRes, careerRes] = await Promise.all([
          fetch("/api/profile/save/me", { cache: "no-store" }),
          fetch("/api/career-profile", { cache: "no-store" }),
        ]);

        const meJson: unknown = await meRes.json().catch(() => ({}));
        const careerJson: unknown = await careerRes.json().catch(() => null);

        if (cancelled) return;

        const profile = (meRes.ok && typeof (meJson as any)?.profile === "object" && (meJson as any).profile)
          ? (meJson as any).profile
          : null;

        setProfileData((prev) => ({
          ...prev,
          displayName: typeof profile?.displayName === "string" ? profile.displayName : prev.displayName,
          bio: typeof profile?.bio === "string" ? profile.bio : prev.bio,
          region: typeof profile?.region === "string" ? profile.region : prev.region,
          prefecture: typeof profile?.prefecture === "string" ? profile.prefecture : prev.prefecture,
          sportsCategory: typeof profile?.sportsCategory === "string" ? profile.sportsCategory : prev.sportsCategory,
          sport: typeof profile?.sport === "string" ? profile.sport : prev.sport,
          stance: typeof profile?.stance === "string" ? profile.stance : prev.stance,
          instagram: typeof profile?.instagram === "string" ? profile.instagram : prev.instagram,
          xUrl: typeof profile?.xUrl === "string" ? profile.xUrl : prev.xUrl,
          tiktok: typeof profile?.tiktok === "string" ? profile.tiktok : prev.tiktok,
          profileImageUrl: typeof profile?.profileImageUrl === "string" ? profile.profileImageUrl : prev.profileImageUrl,
          bannerUrl: typeof profile?.bannerUrl === "string" ? profile.bannerUrl : prev.bannerUrl,
          avatarUrl: typeof profile?.avatarUrl === "string" ? profile.avatarUrl : prev.avatarUrl,
          isPublic: typeof profile?.isPublic === "boolean" ? profile.isPublic : prev.isPublic,
        }));

        // キャリアモーダル側は Zustand が持つので、ここでは「存在確認」だけしておく
        // （必要なら後で CareerWizardModal 側に init API を追加）
        void careerJson;
      } finally {
        if (!cancelled) setHydrating(false);
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

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
          bannerUrl: profileData.bannerUrl,
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
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "エラーが発生しました");
      setCurrentStep(2);
    } finally {
      setSaving(false);
    }
  }

  const progressPct = (currentStep / 6) * 100;
  const pct = Math.round(progressPct);

  const steps: Array<{ n: StepNumber; label: string; enabled: boolean }> = [
    { n: 1, label: "プロフィール情報", enabled: true },
    { n: 2, label: "画像設定", enabled: true },
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
          bannerUrl={profileData.bannerUrl}
          avatarUrl={profileData.avatarUrl}
          onProfileImageChange={(url) => setProfileData((p) => ({ ...p, profileImageUrl: url }))}
          onBannerChange={(url) => setProfileData((p) => ({ ...p, bannerUrl: url }))}
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
          bannerUrl: profileData.bannerUrl,
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
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-[480px] flex flex-col overflow-hidden"
              style={{
                background: "#0c0c16",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "28px",
                height: "92dvh",
                maxHeight: "92dvh",
              }}
              initial={{ y: 80, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 blur-3xl opacity-15 rounded-full"
                style={{ background: "#ffffff" }}
              />

              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-[70] w-8 h-8 flex items-center justify-center rounded-full transition-all bg-white/5 border border-white/10 text-white/35 hover:bg-white/10 hover:text-white"
                aria-label="閉じる"
              >
                <X size={12} />
              </button>

              <div className="relative z-10 px-5 pt-4 pb-0 pr-14 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="font-mono text-[9px] tracking-[0.24em] uppercase"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {steps[currentStep - 1]?.label} · {currentStep}/6
                  </span>
                  <motion.span
                    key={pct}
                    className="font-mono text-[13px] font-medium"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {pct}%
                  </motion.span>
                </div>
                <div className="h-[2px] rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.35))" }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>

              <div
                className="relative z-10 flex-1 overflow-y-auto px-5 pb-6"
                style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", paddingBottom: "calc(6rem + env(safe-area-inset-bottom))" }}
              >
                {hydrating ? (
                  <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                    読み込み中...
                  </div>
                ) : null}
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
              </div>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
