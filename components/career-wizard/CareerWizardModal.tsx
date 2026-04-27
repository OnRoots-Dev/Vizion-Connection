"use client";
// components/career-wizard/CareerWizardModal.tsx
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCareerWizard, STEPS, PHASE_LABELS, TOTAL_STEPS } from "@/hooks/useCareerWizard";
import EpisodeSubModal from "./EpisodeSubModal";

import StepRole      from "./steps/StepRole";
import StepTagline   from "./steps/StepTagline";
import StepLocation  from "./steps/StepLocation";
import StepBio       from "./steps/StepBio";
import StepStats     from "./steps/StepStats";
import StepEpisodes  from "./steps/StepEpisodes";
import StepSkills    from "./steps/StepSkills";
import StepContact   from "./steps/StepContact";
import StepComplete  from "./steps/StepComplete";

const STEP_COMPONENTS = [
  StepRole, StepTagline, StepLocation, StepBio,
  StepStats, StepEpisodes, StepSkills, StepContact, StepComplete,
];

export default function CareerWizardModal({
  onClose,
  contained = false,
  onCompleted,
}: {
  onClose?: () => void;
  contained?: boolean;
  onCompleted?: () => void;
}) {
  const {
    currentStepIndex, nextStep, prevStep, skipStep,
    data, isSaving, saveError, saveToApi,
    isEpisodeModalOpen,
    progressPct, currentPhase, roleColor, isCurrentStepSkippable,
  } = useCareerWizard();

  const color = roleColor();
  const pct = progressPct();
  const phase = currentPhase();
  const isCompleteStep = currentStepIndex === TOTAL_STEPS;
  const isLastContentStep = currentStepIndex === TOTAL_STEPS - 1;
  const isFirstStep = currentStepIndex === 0;
  const canSkip = isCurrentStepSkippable();

  const StepComponent = STEP_COMPONENTS[currentStepIndex] ?? StepComplete;

  const handleNext = async () => {
    if (isLastContentStep) {
      const ok = await saveToApi();
      if (!ok) return; // saveErrorが表示される
      onCompleted?.();
    }
    nextStep();
  };

  const backdropClass = contained ? "absolute inset-0 z-40" : "fixed inset-0 z-40";
  const containerClass = contained
    ? "absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
    : "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4";

  if (contained) {
    return (
      <div
        className="relative w-full min-h-0 overflow-hidden rounded-[24px] border border-white/10 bg-[#0c0c16]"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.28)" }}
      >
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 blur-3xl opacity-15 rounded-full"
          style={{ background: color }} />

        {!isCompleteStep && (
          <div className="relative z-10 px-5 pt-4 pb-0 pr-5 flex-shrink-0">
            <div className="flex gap-1.5 mb-2">
              {PHASE_LABELS.map((label, i) => (
                <div key={label} className="h-[3px] flex-1 rounded-full transition-all duration-500"
                  style={{ background: i < phase ? color : i === phase ? `${color}70` : "rgba(255,255,255,0.07)" }} />
              ))}
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] tracking-[0.24em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
                {PHASE_LABELS[phase]} · {currentStepIndex + 1}/{TOTAL_STEPS}
              </span>
              <motion.span key={pct} className="font-mono text-[13px] font-medium" style={{ color }}
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {pct}%
              </motion.span>
            </div>
            <div className="h-[2px] rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
            </div>
          </div>
        )}

        <div className="relative z-10 max-h-[58dvh] overflow-y-auto px-5 pb-6" style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
          <AnimatePresence mode="wait">
            <motion.div key={currentStepIndex}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}>
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {!isCompleteStep && (
          <div className="relative z-10 px-5 pt-3 pb-5 flex-shrink-0 flex items-center gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={prevStep} disabled={isFirstStep}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl border font-semibold text-[12px] transition-all disabled:opacity-20 disabled:pointer-events-none"
              style={{ borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.38)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/>
              </svg>
              戻る
            </button>
            {canSkip && (
              <button onClick={skipStep} className="font-mono text-[9px] tracking-[0.16em] uppercase transition-colors whitespace-nowrap"
                style={{ color: "rgba(255,255,255,0.2)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}>
                スキップ
              </button>
            )}
            <motion.button onClick={handleNext}
              disabled={isSaving || (currentStepIndex === 0 && !data.role)}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] tracking-[0.04em] text-white transition-all hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none"
              style={{ background: color }}>
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                  保存中...
                </>
              ) : isLastContentStep ? (
                <>完成させる
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
        )}

        <EpisodeSubModal />
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div className={backdropClass} style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} />

      {/* Modal — centered on all breakpoints */}
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
          // sm以上は完全な角丸
          initial={{ y: 80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}>

          {/* 丸角を sm+ では全周に適用 */}
          <style>{`@media(min-width:640px){.wizard-modal-inner{border-radius:28px !important}}`}</style>

          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-0 sm:hidden">
            <div className="w-8 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>

          {/* Ambient glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 blur-3xl opacity-15 rounded-full"
            style={{ background: color }} />

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-3 right-3 z-[70] w-8 h-8 flex items-center justify-center rounded-full transition-all bg-white/5 border border-white/10 text-white/35 hover:bg-white/10 hover:text-white"
            aria-label="閉じる">
            <X size={12} />
          </button>

          {/* Progress header */}
          {!isCompleteStep && (
            <div className="relative z-10 px-5 pt-4 pb-0 pr-14 flex-shrink-0">
              <div className="flex gap-1.5 mb-2">
                {PHASE_LABELS.map((label, i) => (
                  <div key={label} className="h-[3px] flex-1 rounded-full transition-all duration-500"
                    style={{ background: i < phase ? color : i === phase ? `${color}70` : "rgba(255,255,255,0.07)" }} />
                ))}
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[9px] tracking-[0.24em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {PHASE_LABELS[phase]} · {currentStepIndex + 1}/{TOTAL_STEPS}
                </span>
                <motion.span key={pct} className="font-mono text-[13px] font-medium" style={{ color }}
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                  {pct}%
                </motion.span>
              </div>
              <div className="h-[2px] rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
              </div>
            </div>
          )}

          {/* Step content */}
          <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-6" style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
            <AnimatePresence mode="wait">
              <motion.div key={currentStepIndex}
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}>
                <StepComponent />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          {!isCompleteStep && (
            <div className="relative z-10 px-5 pt-3 pb-5 flex-shrink-0 flex items-center gap-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={prevStep} disabled={isFirstStep}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl border font-semibold text-[12px] transition-all disabled:opacity-20 disabled:pointer-events-none"
                style={{ borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.38)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/>
                </svg>
                戻る
              </button>
              {canSkip && (
                <button onClick={skipStep} className="font-mono text-[9px] tracking-[0.16em] uppercase transition-colors whitespace-nowrap"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}>
                  スキップ
                </button>
              )}
              <motion.button onClick={handleNext}
                disabled={isSaving || (currentStepIndex === 0 && !data.role)}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] tracking-[0.04em] text-white transition-all hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none"
                style={{ background: color }}>
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                    保存中...
                  </>
                ) : isLastContentStep ? (
                  <>完成させる
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
          )}

          {/* Episode sub-modal */}
          <EpisodeSubModal />
        </motion.div>
      </motion.div>
    </>
  );
}



