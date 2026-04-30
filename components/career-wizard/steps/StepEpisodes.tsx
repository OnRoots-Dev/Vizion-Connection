"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { ROLE_CONFIG } from "@/types/career";
import type { UserRole } from "@/types/career";
import { StepWrapper, StepHeader, EpisodeTips } from "../WizardUI";

export default function StepEpisodes() {
  const { data, openNewEpisode, openEditEpisode, deleteEpisode, roleColor } = useCareerWizard();
  const color = roleColor();
  const cfg = ROLE_CONFIG[(data.role || "Athlete") as UserRole];

  return (
    <StepWrapper>
      <StepHeader eyebrow="Step 8 / 11" title="キャリア年表"
        hint="時代ごとのエピソードを追加。1つからOK。" />
      <EpisodeTips tips={cfg.episodeTips} />
      <AnimatePresence>
        {data.episodes.map((ep, i) => (
          <motion.div key={ep.id} layout
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 mb-2 p-3.5 rounded-xl group"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <GripVertical size={14} style={{ color: "rgba(255,255,255,0.15)" }} className="flex-shrink-0" />
            <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-medium flex-shrink-0"
              style={{ background: `${color}18`, color }}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-bold truncate" style={{ color: "rgba(255,255,255,0.8)" }}>
                {ep.role || "役職未設定"}
                {ep.org ? <span className="font-normal" style={{ color: "rgba(255,255,255,0.4)" }}> — {ep.org}</span> : null}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>{ep.period}</p>
                {ep.isCurrent && (
                  <span className="font-mono text-[8px] tracking-[0.12em] uppercase px-1.5 py-0.5 rounded"
                    style={{ background: `${color}18`, color }}>現在</span>
                )}
              </div>
            </div>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditEpisode(ep.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}>
                <Pencil size={11} />
              </button>
              <button onClick={() => deleteEpisode(ep.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ color: "rgba(255,255,255,0.35)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.1)"; e.currentTarget.style.color = "#f87171"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}>
                <Trash2 size={11} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.button type="button" onClick={openNewEpisode} whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-dashed font-mono text-[10px] tracking-[0.18em] uppercase transition-all mt-1"
        style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.25)" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}55`; e.currentTarget.style.color = color; e.currentTarget.style.background = `${color}08`; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "transparent"; }}>
        <Plus size={14} />エピソードを追加
      </motion.button>
    </StepWrapper>
  );
}
