"use client";
import { useState } from "react";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { ROLE_CONFIG } from "@/types/career";
import type { UserRole } from "@/types/career";
import { StepWrapper, StepHeader, Field, WizardInput, WizardSelect } from "../WizardUI";

export default function StepContact() {
  const { data, setField } = useCareerWizard();
  const cfg = ROLE_CONFIG[(data.role || "Athlete") as UserRole];
  const [showExamples, setShowExamples] = useState(false);
  const color = useCareerWizard((s) => s.roleColor());

  return (
    <StepWrapper>
      <StepHeader eyebrow="Step 10 / 11" title="コンタクト設定"
        hint="ページ末尾のCTAセクションに表示されます" />
      <Field label="CTAタイトル">
        <WizardInput value={data.ctaTitle} onChange={(v) => setField("ctaTitle", v)}
          placeholder={cfg.ctaTitlePlaceholder} maxLength={55} />
        <button type="button" onClick={() => setShowExamples(!showExamples)}
          className="mt-1.5 font-mono text-[9px] tracking-[0.16em] uppercase transition-colors"
          style={{ color: "rgba(255,255,255,0.25)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>
          {showExamples ? "例を隠す ↑" : "例を見る ↓"}
        </button>
        {showExamples && (
          <div className="mt-2 flex flex-col gap-1.5">
            {cfg.ctaExamples.map((ex) => (
              <button key={ex} type="button"
                onClick={() => { setField("ctaTitle", ex); setShowExamples(false); }}
                className="text-left text-[12px] px-3 py-2 rounded-lg transition-all"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
                {ex}
              </button>
            ))}
          </div>
        )}
      </Field>
      <Field label="補足テキスト">
        <WizardInput value={data.ctaSub} onChange={(v) => setField("ctaSub", v)}
          placeholder={cfg.ctaSubPlaceholder} maxLength={80} />
      </Field>
      <Field label="ボタンテキスト">
        <WizardInput value={data.ctaBtn} onChange={(v) => setField("ctaBtn", v)}
          placeholder={cfg.ctaBtnPlaceholder} maxLength={22} />
      </Field>
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="X (Twitter)">
          <WizardInput value={data.snsX} onChange={(v) => setField("snsX", v)} placeholder="@handle" maxLength={30} />
        </Field>
        <Field label="Instagram">
          <WizardInput value={data.snsInstagram} onChange={(v) => setField("snsInstagram", v)} placeholder="@handle" maxLength={30} />
        </Field>
      </div>
      <Field label="公開設定">
        <WizardSelect value={data.visibility}
          onChange={(v) => setField("visibility", v as "public" | "members" | "private")}>
          <option value="public">全体公開</option>
          <option value="members">メンバーのみ</option>
          <option value="private">非公開（下書き）</option>
        </WizardSelect>
      </Field>
    </StepWrapper>
  );
}
