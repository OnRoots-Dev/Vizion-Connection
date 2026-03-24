"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { ROLE_CONFIG } from "@/types/career";
import type { UserRole } from "@/types/career";
import { StepWrapper, StepHeader, SkillSlider } from "../WizardUI";

export default function StepSkills() {
  const { data, setSkillLevel, toggleSkillHighlight, addSkill, removeSkill, roleColor } = useCareerWizard();
  const color = roleColor();
  const cfg = ROLE_CONFIG[(data.role || "Athlete") as UserRole];
  const [extra, setExtra] = useState("");

  const handleAdd = () => {
    extra.split(",").map((s) => s.trim()).filter(Boolean).forEach(addSkill);
    setExtra("");
  };

  return (
    <StepWrapper>
      <StepHeader eyebrow="Step 7 / 8" title="スキル・強み" hint={cfg.skillsHint} />
      <div className="flex items-center gap-3 mb-4 p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 flex-shrink-0"/>
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>= ハイライト（大きく表示）</span>
        </div>
      </div>
      <AnimatePresence>
        {data.skills.map((sk) => (
          <motion.div key={sk.name} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <SkillSlider name={sk.name} level={sk.level} isHighlight={sk.isHighlight}
              onLevelChange={(v) => setSkillLevel(sk.name, v)}
              onToggleHighlight={() => toggleSkillHighlight(sk.name)}
              onRemove={data.skills.length > 2 ? () => removeSkill(sk.name) : undefined} />
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex gap-2 mt-4">
        <input value={extra} onChange={(e) => setExtra(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="スキルを追加（カンマ区切りで複数）"
          className="flex-1 rounded-xl px-4 py-2.5 text-[13px] text-white outline-none"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          onFocus={(e) => (e.target.style.borderColor = `${color}55`)}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")} />
        <button type="button" onClick={handleAdd}
          className="px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:brightness-110"
          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
          追加
        </button>
      </div>
    </StepWrapper>
  );
}
