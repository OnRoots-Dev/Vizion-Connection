"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { ROLE_CONFIG } from "@/types/career";
import type { UserRole, CareerEpisode } from "@/types/career";
import { Field, WizardInput, WizardTextarea, Toggle } from "./WizardUI";

export default function EpisodeSubModal() {
  const { isEpisodeModalOpen, editingEpisode, closeEpisodeModal, saveEpisode, data } = useCareerWizard();
  const cfg = ROLE_CONFIG[(data.role || "Athlete") as UserRole];

  const roleColorTextClass =
    data.role === "Trainer" ? "text-[#1a7a4a]" :
    data.role === "Members" ? "text-[#b8860b]" :
    data.role === "Business" ? "text-[#1b3a8c]" :
    "text-[#c1272d]";

  const roleBgClass =
    data.role === "Trainer" ? "bg-[#1a7a4a]" :
    data.role === "Members" ? "bg-[#b8860b]" :
    data.role === "Business" ? "bg-[#1b3a8c]" :
    "bg-[#c1272d]";

  const [draft, setDraft] = useState<Omit<CareerEpisode, "id">>({
    period: "", role: "", org: "", desc: "", milestone: "", tags: [], isCurrent: false,
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (editingEpisode) {
      setDraft({ period: editingEpisode.period, role: editingEpisode.role,
        org: editingEpisode.org, desc: editingEpisode.desc,
        milestone: editingEpisode.milestone ?? "", tags: editingEpisode.tags,
        isCurrent: editingEpisode.isCurrent });
      setTagInput(editingEpisode.tags.join(", "));
    }
  }, [editingEpisode]);

  const set = <K extends keyof typeof draft>(k: K, v: typeof draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = () => {
    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 4);
    saveEpisode({ ...draft, tags });
  };

  const QUICK_PERIODS = ["〜現在", "2022〜現在", "2018〜2022", "2014〜2018", "2010〜2014", "2005〜2010"];

  return (
    <AnimatePresence>
      {isEpisodeModalOpen && (
        <motion.div key="ep-modal"
          className="absolute inset-0 z-30 flex flex-col overflow-hidden rounded-[inherit] bg-[#0c0c16]"
          initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 34 }}>
          <div className="flex flex-shrink-0 items-center gap-3 border-b border-white/10 px-5 pb-4 pt-5">
            <button onClick={closeEpisodeModal} aria-label="Back"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-colors hover:bg-white/10 hover:text-white">
              <ArrowLeft size={14} />
            </button>
            <div>
              <p className={`${roleColorTextClass} mb-0.5 font-mono text-[8.5px] uppercase tracking-[0.22em]`}>
                Career Episode
              </p>
              <h3 className="text-[15px] font-extrabold tracking-[-0.02em]">
                {editingEpisode?.id ? "エピソードを編集" : "エピソードを追加"}
              </h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <Field label="期間 *">
              <WizardInput value={draft.period} onChange={(v) => set("period", v)}
                placeholder="例：2012 – 2021" maxLength={25} />
              <div className="flex gap-1.5 flex-wrap mt-2">
                {QUICK_PERIODS.map((p) => (
                  <button key={p} type="button" onClick={() => set("period", p)}
                    className="rounded-full border border-white/10 px-2.5 py-1.5 font-mono text-[9px] tracking-widest text-white/40 transition-colors hover:border-white/20 hover:text-white/70">
                    {p}
                  </button>
                ))}
              </div>
            </Field>
            <div className="mb-3.5">
              <Toggle checked={draft.isCurrent ?? false} onChange={(v) => set("isCurrent", v)} label="現職・現在の活動" />
            </div>
            <Field label="役職・タイトル *">
              <WizardInput value={draft.role} onChange={(v) => set("role", v)}
                placeholder={cfg.episodeRolePlaceholder} maxLength={40} />
            </Field>
            <Field label="所属チーム・組織">
              <WizardInput value={draft.org} onChange={(v) => set("org", v)}
                placeholder={cfg.episodeOrgPlaceholder} maxLength={40} />
            </Field>
            <Field label="エピソード">
              <WizardTextarea value={draft.desc} onChange={(v) => set("desc", v)}
                placeholder={cfg.episodeDescPlaceholder} rows={3} maxLength={180} />
            </Field>
            <Field label="ハイライト（最大の実績・受賞）">
              <WizardInput value={draft.milestone ?? ""} onChange={(v) => set("milestone", v)}
                placeholder={cfg.episodeMilestonePlaceholder} maxLength={60} />
            </Field>
            <Field label="タグ（カンマ区切り、最大4つ）">
              <WizardInput value={tagInput} onChange={setTagInput}
                placeholder="例：Serie A, UEFA CL, Italy" maxLength={80} />
            </Field>
          </div>

          <div className="flex-shrink-0 border-t border-white/10 px-5 pb-5 pt-3">
            <button type="button" onClick={handleSave}
              disabled={!draft.role && !draft.org}
              className={`${roleBgClass} w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-[13px] font-bold tracking-[0.04em] text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30`}>
              <Check size={14} />
              {editingEpisode?.id ? "変更を保存" : "追加する"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
