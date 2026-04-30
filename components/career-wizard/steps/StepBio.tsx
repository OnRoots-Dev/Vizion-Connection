"use client";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { ROLE_CONFIG } from "@/types/career";
import type { UserRole } from "@/types/career";
import { StepWrapper, StepHeader, Field, WizardTextarea, HintBullets } from "../WizardUI";

export default function StepBio() {
  const { data, setField } = useCareerWizard();
  const cfg = ROLE_CONFIG[(data.role || "Athlete") as UserRole];
  return (
    <StepWrapper>
      <StepHeader eyebrow="Step 6 / 11" title="キャリア自己紹介"
        hint="プロフィールの自己紹介とは別に、キャリアページ専用の紹介文を書けます。" />
      <HintBullets items={cfg.bioBullets} />
      <Field label="キャリアストーリー">
        <WizardTextarea value={data.bioCareer} onChange={(v) => setField("bioCareer", v)}
          placeholder={cfg.bioPlaceholder} rows={5} maxLength={280} />
      </Field>
    </StepWrapper>
  );
}
