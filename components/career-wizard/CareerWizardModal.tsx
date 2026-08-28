"use client";
// components/career-wizard/CareerWizardModal.tsx
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  useCareerWizard,
  getPhaseLabelsForRole,
} from "@/hooks/useCareerWizard";
import { useWizardAutoSave } from "@/hooks/useWizardAutoSave";
import EpisodeSubModal from "./EpisodeSubModal";
import { getStepComponent } from "./stepRegistry";
import type { UserRole } from "@/types/career";

export default function CareerWizardModal({
  onClose,
  contained = false,
  onCompleted,
  onboardingMode = false,
}: {
  onClose?: () => void;
  contained?: boolean;
  onCompleted?: () => void;
  /** true: 初回ログイン用オンボーディングモード（閉じるボタン非表示、完了後にis_onboarding_complete更新） */
  onboardingMode?: boolean;
}) {
  const {
    currentStepIndex, nextStep, prevStep, skipStep,
    data, isSaving, saveError, saveProfileToApi, saveCareerToApi, saveBusinessLocationToApi,
    isEpisodeModalOpen,
    progressPct, currentPhase, roleColor, isCurrentStepSkippable,
    getSteps, getTotalSteps, getCurrentStep,
  } = useCareerWizard();

  useWizardAutoSave();

  const [doneError, setDoneError] = useState("");

  const color = roleColor();
  const phase = currentPhase();
  const steps = getSteps();
  const totalSteps = getTotalSteps();
  const currentStep = getCurrentStep();
  const phaseLabels = getPhaseLabelsForRole(data.role as UserRole);
  const isCompleteStep = currentStep?.id === "complete";
  const isLastContentStep = currentStepIndex === steps.length - 2;
  const isFirstStep = currentStepIndex === 0;
  const canSkip = isCurrentStepSkippable();
  const pct = progressPct();

  const StepComponent = currentStep ? getStepComponent(currentStep.id) : getStepComponent("complete");

  const handleNext = async () => {
    if (currentStep?.id === "media") {
      const ok = await saveProfileToApi();
      if (!ok) return;
    }

    if (currentStep?.id === "business_location") {
      const ok = await saveBusinessLocationToApi();
      if (!ok) return;
    }

    if (isLastContentStep) {
      const okProfile = await saveProfileToApi();
      if (!okProfile) return;
      const okCareer = await saveCareerToApi();
      if (!okCareer) return;
      if (data.role === "Business") {
        const okBiz = await saveBusinessLocationToApi();
        if (!okBiz) return;
      }
      if (onboardingMode) {
        try {
          const res = await fetch("/api/onboarding/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
          });
          if (!res.ok) {
            setDoneError("完了の保存に失敗しました。もう一度お試しください。");
            return;
          }
        } catch {
          setDoneError("ネットワークエラーが発生しました。もう一度お試しください。");
          return;
        }
      }
      onCompleted?.();
    }
    nextStep();
  };

  const backdropClass = contained ? "absolute inset-0 z-40" : "fixed inset-0 z-40";
  const containerClass = contained
    ? "absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
    : "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4";

  const finalButtonLabel = onboardingMode ? "プロフィールを完成" : "完成させる";
  const stepLabel = `${currentStepIndex + 1}/${totalSteps}`;

  const footer = !isCompleteStep ? (
    <>
      {doneError && (
        <p className="relative z-10 mx-5 mb-1 text-center text-xs font-medium" style={{ color: "rgba(255,120,120,0.9)" }}>
          {doneError}
        </p>
      )}
      <div
        className={`relative z-10 flex-shrink-0 flex items-center gap-2 px-5 pt-3 ${contained ? "" : "pb-5 gap-3"}`}
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "#0c0c16",
          paddingBottom: contained ? "calc(1.25rem + env(safe-area-inset-bottom))" : undefined,
        }}
      >
        <button onClick={prevStep} disabled={isFirstStep}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl border font-semibold text-[12px] transition-all disabled:opacity-20 disabled:pointer-events-none"
          style={{ borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.38)" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/>
          </svg>
          戻る
        </button>
        {canSkip && (
          <button onClick={skipStep}
            className={`font-mono tracking-[0.12em] uppercase transition-all whitespace-nowrap ${contained ? "px-3 py-3 rounded-xl border text-[10px]" : "text-[9px] tracking-[0.16em]"}`}
            style={{ borderColor: contained ? "rgba(255,255,255,0.08)" : undefined, color: "rgba(255,255,255,0.28)" }}>
            スキップ
          </button>
        )}
        <div className={contained ? "flex-1" : undefined} />
        <motion.button onClick={handleNext}
          disabled={isSaving || !data.role}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] tracking-[0.04em] text-white transition-all hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none ${contained ? "min-w-[110px] px-5" : "flex-1"}`}
          style={{ background: color }}>
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
              保存中...
            </>
          ) : isLastContentStep ? (
            <>{finalButtonLabel}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </>
          ) : (
            <>次へ
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </>
          )}
        </motion.button>
      </div>
    </>
  ) : null;

  const progressHeader = !isCompleteStep ? (
    <div className={`relative z-10 px-5 pt-4 pb-0 flex-shrink-0 ${contained ? "pr-5" : "pr-14"}`}>
      <div className="flex gap-1.5 mb-2">
        {phaseLabels.map((label, i) => (
          <div key={label} className="h-[3px] flex-1 rounded-full transition-all duration-500"
            style={{ background: i < phase ? color : i === phase ? `${color}70` : "rgba(255,255,255,0.07)" }} />
        ))}
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[9px] tracking-[0.24em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
          {phaseLabels[phase] ?? ""} · {stepLabel}
        </span>
        <motion.span key={stepLabel} className="font-mono text-[13px] font-medium" style={{ color }}
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
          {contained ? stepLabel : `${pct}%`}
        </motion.span>
      </div>
      <div className="h-[2px] rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
      </div>
    </div>
  ) : null;

  const stepContent = (
    <div className={`relative z-10 flex-1 min-h-0 overflow-y-auto px-5 pb-6`} style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
      <AnimatePresence mode="wait">
        <motion.div key={currentStepIndex}
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}>
          <StepComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  );

  if (contained) {
    return (
      <div className="relative flex-1 flex flex-col min-h-0" style={{ background: "#0c0c16" }}>
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 blur-3xl opacity-15 rounded-full"
          style={{ background: color }} />
        {progressHeader}
        {stepContent}
        {footer}
        <EpisodeSubModal />
      </div>
    );
  }

  return (
    <>
      <motion.div className={backdropClass} style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onboardingMode ? undefined : onClose} />

      <motion.div className={containerClass}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className="relative w-full max-w-[480px] flex flex-col overflow-hidden"
          style={{
            background: "#0c0c16",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "28px",
            maxHeight: "92dvh",
          }}
          initial={{ y: 80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}>

          <div className="flex justify-center pt-3 pb-0 sm:hidden">
            <div className="w-8 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>

          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 blur-3xl opacity-15 rounded-full"
            style={{ background: color }} />

          {!onboardingMode && (
            <button onClick={onClose}
              className="absolute top-3 right-3 z-[70] w-8 h-8 flex items-center justify-center rounded-full transition-all bg-white/5 border border-white/10 text-white/35 hover:bg-white/10 hover:text-white"
              aria-label="閉じる">
              <X size={12} />
            </button>
          )}

          {progressHeader}
          {stepContent}
          {footer}
          <EpisodeSubModal />
        </motion.div>
      </motion.div>
    </>
  );
}
