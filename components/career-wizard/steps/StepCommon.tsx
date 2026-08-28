"use client";
// Common steps shared across roles

import { Field, StepHeader, WizardInput, WizardSelect, WizardTextarea } from "@/components/career-wizard/WizardUI";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { ROLE_CONFIG } from "@/types/career";
import type { UserRole } from "@/types/career";
import { PREFECTURES, REGIONS } from "@/lib/career-wizard/flows";

export function StepBasicIdentity() {
  const role = useCareerWizard((s) => s.data.role) as UserRole | "";
  const displayName = useCareerWizard((s) => s.data.displayName);
  const bio = useCareerWizard((s) => s.data.bio);
  const setField = useCareerWizard((s) => s.setField);
  const cfg = ROLE_CONFIG[(role || "Athlete") as UserRole];

  return (
    <div>
      <StepHeader
        eyebrow="PROFILE"
        title="表示名を教えてください"
        hint={cfg ? `${cfg.labelJa}としての基本情報を入力してください` : undefined}
      />
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <Field label="表示名">
          <WizardInput
            value={displayName}
            onChange={(v) => setField("displayName", v)}
            placeholder="Taro Yamada"
            maxLength={40}
          />
        </Field>
        <Field label="あなたについて教えてください">
          <WizardTextarea
            value={bio}
            onChange={(v) => setField("bio", v)}
            placeholder="自己紹介や活動内容を書いてください"
            rows={4}
            maxLength={500}
          />
        </Field>
      </div>
    </div>
  );
}

export function StepLocationPrefecture() {
  const region = useCareerWizard((s) => s.data.region);
  const prefecture = useCareerWizard((s) => s.data.prefecture);
  const location = useCareerWizard((s) => s.data.location);
  const setField = useCareerWizard((s) => s.setField);

  return (
    <div>
      <StepHeader
        eyebrow="LOCATION"
        title="主な活動エリアはどこですか？"
        hint="Discovery・Viz Map・Around Your Region で利用されます"
      />
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="地方">
            <WizardSelect value={region} onChange={(v) => setField("region", v)}>
              <option value="">選択してください</option>
              {REGIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </WizardSelect>
          </Field>
          <Field label="都道府県">
            <WizardSelect value={prefecture} onChange={(v) => setField("prefecture", v)}>
              <option value="">選択してください</option>
              {PREFECTURES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </WizardSelect>
          </Field>
        </div>
        <Field label="市区町村・エリア（任意）">
          <WizardInput
            value={location}
            onChange={(v) => setField("location", v)}
            placeholder="例：渋谷区、愛媛県今治市"
            maxLength={80}
          />
        </Field>
      </div>
    </div>
  );
}

export function StepSocial() {
  const instagram = useCareerWizard((s) => s.data.instagram);
  const xUrl = useCareerWizard((s) => s.data.xUrl);
  const tiktok = useCareerWizard((s) => s.data.tiktok);
  const youtube = useCareerWizard((s) => s.data.youtube);
  const website = useCareerWizard((s) => s.data.website);
  const setField = useCareerWizard((s) => s.setField);
  const role = useCareerWizard((s) => s.data.role);

  return (
    <div>
      <StepHeader
        eyebrow="SOCIAL"
        title="SNS・Web（任意）"
        hint="公開プロフィールに表示されます"
      />
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 grid gap-4 md:grid-cols-2">
        <Field label="Instagram">
          <WizardInput value={instagram} onChange={(v) => { setField("instagram", v); setField("snsInstagram", v); }} placeholder="https://instagram.com/..." maxLength={200} />
        </Field>
        <Field label="X">
          <WizardInput value={xUrl} onChange={(v) => { setField("xUrl", v); setField("snsX", v); }} placeholder="https://x.com/..." maxLength={200} />
        </Field>
        <Field label="TikTok">
          <WizardInput value={tiktok} onChange={(v) => { setField("tiktok", v); setField("snsTiktok", v); }} placeholder="https://tiktok.com/..." maxLength={200} />
        </Field>
        {(role === "Business" || website) && (
          <>
            <Field label="YouTube">
              <WizardInput value={youtube} onChange={(v) => setField("youtube", v)} placeholder="https://youtube.com/..." maxLength={200} />
            </Field>
            <Field label="Website">
              <WizardInput value={website} onChange={(v) => setField("website", v)} placeholder="https://..." maxLength={200} />
            </Field>
          </>
        )}
      </div>
    </div>
  );
}
