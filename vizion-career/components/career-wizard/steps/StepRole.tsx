"use client";
import { motion } from "framer-motion";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { ROLE_CONFIG } from "@/types/career";
import type { UserRole } from "@/types/career";
import { StepWrapper, StepHeader } from "../WizardUI";

const ROLES: UserRole[] = ["Athlete", "Trainer", "Business", "Members"];

export default function StepRole() {
  const { data, setRole, nextStep } = useCareerWizard();

  const handleSelect = (role: UserRole) => {
    setRole(role);
    setTimeout(nextStep, 320);
  };

  return (
    <StepWrapper>
      <StepHeader eyebrow="Step 1 / 8" title="あなたの役割は？"
        hint="選択するとページテーマが変わります。あとで変更できます。" />
      <div className="grid grid-cols-2 gap-2.5">
        {ROLES.map((roleId, i) => {
          const cfg = ROLE_CONFIG[roleId];
          const selected = data.role === roleId;
          return (
            <motion.button key={roleId} type="button"
              onClick={() => handleSelect(roleId)}
              whileTap={{ scale: 0.94 }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="relative flex flex-col items-start gap-2 p-4 rounded-2xl border text-left overflow-hidden transition-all"
              style={selected
                ? { background: `${cfg.color}12`, borderColor: `${cfg.color}50` }
                : { background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" }}>
              {selected && (
                <motion.div layoutId="role-glow" className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: `${cfg.color}08` }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }} />
              )}
              <span className="text-[26px] leading-none">{cfg.icon}</span>
              <div>
                <p className="font-extrabold text-[15px] text-white leading-tight">{cfg.labelJa}</p>
                <p className="font-mono text-[8px] tracking-[0.2em] uppercase mt-0.5"
                  style={{ color: selected ? cfg.color : "rgba(255,255,255,0.28)" }}>
                  {cfg.labelEn}
                </p>
              </div>
              <p className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.35)" }}>
                {cfg.descJa}
              </p>
              {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: cfg.color }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </StepWrapper>
  );
}
