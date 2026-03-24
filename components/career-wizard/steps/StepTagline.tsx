"use client";
// Step 2: キャッチコピー + 専門分野（ロール別）
import { useState } from "react";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { ROLE_CONFIG } from "@/types/career";
import type { UserRole } from "@/types/career";
import { StepWrapper, StepHeader, Field, WizardInput, Chip } from "../WizardUI";

export default function StepTagline() {
  const { data, setField } = useCareerWizard();
  const role = (data.role || "Athlete") as UserRole;
  const cfg = ROLE_CONFIG[role];
  const color = useCareerWizard((s) => s.roleColor());
  const [showExamples, setShowExamples] = useState(false);

  return (
    <StepWrapper>
      <StepHeader eyebrow="Step 2 / 8" title="基本プロフィール" />

      {/* 現在のusers.display_name / sport を参考表示 */}
      {data.name && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: `${color}18` }}>
            {cfg.icon}
          </div>
          <div>
            <p className="text-[12px] font-bold text-white/70">{data.name}</p>
            <p className="font-mono text-[9px] text-white/30 mt-0.5">
              {data.sport || cfg.sportLabel} · {data.existingRegion || "地域未設定"}
            </p>
          </div>
          <span className="ml-auto font-mono text-[8px] tracking-[0.16em] uppercase text-white/20">
            既存プロフから読み込み
          </span>
        </div>
      )}

      {/* 専門分野チップ */}
      <Field label={cfg.sportLabel}>
        <WizardInput value={data.sport} onChange={(v) => setField("sport", v)}
          placeholder={`例：${cfg.sportOptions[0]}`} maxLength={30} />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {cfg.sportOptions.map((opt) => (
            <Chip key={opt} label={opt} selected={data.sport === opt}
              onClick={() => setField("sport", data.sport === opt ? "" : opt)} />
          ))}
        </div>
      </Field>

      {/* キャッチコピー */}
      <Field label="キャッチコピー">
        <WizardInput value={data.tagline} onChange={(v) => setField("tagline", v)}
          placeholder={cfg.taglinePlaceholder} maxLength={55} />
        <button type="button" onClick={() => setShowExamples(!showExamples)}
          className="mt-1.5 font-mono text-[9px] tracking-[0.16em] uppercase transition-colors"
          style={{ color: "rgba(255,255,255,0.25)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>
          {showExamples ? "例を隠す ↑" : "例を見る ↓"}
        </button>
        {showExamples && (
          <div className="mt-2 flex flex-col gap-1.5">
            {cfg.taglineExamples.map((ex) => (
              <button key={ex} type="button"
                onClick={() => { setField("tagline", ex); setShowExamples(false); }}
                className="text-left text-[12px] px-3 py-2 rounded-lg transition-all"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                {ex}
              </button>
            ))}
          </div>
        )}
      </Field>
    </StepWrapper>
  );
}
