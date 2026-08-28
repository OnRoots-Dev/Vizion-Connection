"use client";
// Role-specific onboarding steps

import { useState } from "react";
import {
  Field, StepHeader, WizardInput, WizardSelect, WizardTextarea,
  Chip, HintBullets,
} from "@/components/career-wizard/WizardUI";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { ROLE_CONFIG } from "@/types/career";
import type { UserRole } from "@/types/career";
import {
  SPORTS_CATEGORIES, TRAINER_SPECIALTIES, TRAINER_TARGETS,
  COACHING_STYLES, CREW_INTERESTS, CREW_ACTIVITY_STYLES,
  BUSINESS_CATEGORIES, PREFECTURES,
} from "@/lib/career-wizard/flows";

// ─── Athlete ───────────────────────────────────────────────

export function StepAthleteSport() {
  const sportsCategory = useCareerWizard((s) => s.data.sportsCategory);
  const sport = useCareerWizard((s) => s.data.sportProfile);
  const stance = useCareerWizard((s) => s.data.stance);
  const setField = useCareerWizard((s) => s.setField);
  const cfg = ROLE_CONFIG.Athlete;

  return (
    <div>
      <StepHeader eyebrow="SPORT" title="どんな競技をしていますか？" />
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <Field label="競技カテゴリー">
          <WizardSelect value={sportsCategory} onChange={(v) => setField("sportsCategory", v)}>
            <option value="">選択してください</option>
            {SPORTS_CATEGORIES.map((v) => <option key={v} value={v}>{v}</option>)}
          </WizardSelect>
        </Field>
        <Field label="競技">
          <WizardSelect value={sport} onChange={(v) => setField("sportProfile", v)}>
            <option value="">選択してください</option>
            {cfg.sportOptions.map((v) => <option key={v} value={v}>{v}</option>)}
          </WizardSelect>
        </Field>
        <Field label="ポジション・スタイル">
          <WizardInput value={stance} onChange={(v) => setField("stance", v)} placeholder="例：FW / スピード型" maxLength={60} />
        </Field>
      </div>
    </div>
  );
}

// ─── Trainer ───────────────────────────────────────────────

export function StepTrainerSpecialty() {
  const sport = useCareerWizard((s) => s.data.sportProfile);
  const setField = useCareerWizard((s) => s.setField);

  return (
    <div>
      <StepHeader eyebrow="SPECIALTY" title="何を専門に指導していますか？" />
      <Field label="専門分野">
        <div className="flex flex-wrap gap-1.5 mt-1">
          {TRAINER_SPECIALTIES.map((opt) => (
            <Chip key={opt} label={opt} selected={sport === opt} onClick={() => setField("sportProfile", sport === opt ? "" : opt)} />
          ))}
        </div>
      </Field>
      <Field label="その他（自由入力）">
        <WizardInput value={sport} onChange={(v) => setField("sportProfile", v)} placeholder="専門分野を入力" maxLength={60} />
      </Field>
    </div>
  );
}

export function StepTrainerTarget() {
  const sports = useCareerWizard((s) => s.data.sports);
  const toggleSportsItem = useCareerWizard((s) => s.toggleSportsItem);

  return (
    <div>
      <StepHeader eyebrow="TARGET" title="どんな人をサポートしていますか？" hint="複数選択できます" />
      <div className="flex flex-wrap gap-1.5">
        {TRAINER_TARGETS.map((opt) => (
          <Chip key={opt} label={opt} selected={sports.includes(opt)} onClick={() => toggleSportsItem(opt)} />
        ))}
      </div>
    </div>
  );
}

export function StepTrainerCoaching() {
  const stance = useCareerWizard((s) => s.data.stance);
  const setField = useCareerWizard((s) => s.setField);

  return (
    <div>
      <StepHeader eyebrow="STYLE" title="あなたの指導スタイルを教えてください" />
      <div className="flex flex-wrap gap-1.5 mb-3">
        {COACHING_STYLES.map((opt) => (
          <Chip key={opt} label={opt} selected={stance === opt} onClick={() => setField("stance", stance === opt ? "" : opt)} />
        ))}
      </div>
      <Field label="補足（任意）">
        <WizardTextarea value={stance} onChange={(v) => setField("stance", v)} placeholder="指導の特徴や方針" rows={3} maxLength={200} />
      </Field>
    </div>
  );
}

export function StepTrainerExperience() {
  const bioCareer = useCareerWizard((s) => s.data.bioCareer);
  const setField = useCareerWizard((s) => s.setField);
  const setStat = useCareerWizard((s) => s.setStat);
  const stats = useCareerWizard((s) => s.data.stats);

  return (
    <div>
      <StepHeader eyebrow="EXPERIENCE" title="指導歴を教えてください" />
      <Field label="経験年数">
        <WizardInput
          value={stats[1]?.value ?? ""}
          onChange={(v) => setStat(1, "value", v)}
          placeholder="例：8"
          maxLength={10}
        />
      </Field>
      <Field label="指導経験・実績">
        <WizardTextarea
          value={bioCareer}
          onChange={(v) => setField("bioCareer", v)}
          placeholder="例：Jリーグクラブ帯同3年、独立後140名超を年間指導"
          rows={4}
          maxLength={500}
        />
      </Field>
    </div>
  );
}

export function StepTrainerCertifications() {
  const skills = useCareerWizard((s) => s.data.skills);
  const addSkill = useCareerWizard((s) => s.addSkill);
  const removeSkill = useCareerWizard((s) => s.removeSkill);
  const [input, setInput] = useState("");

  const certs = skills.filter((s) => s.level >= 90);

  return (
    <div>
      <StepHeader eyebrow="CERT" title="保有資格・認定を教えてください" hint="NSCA-CSCS、JATI-ATI など" />
      <div className="flex gap-2 mb-3">
        <WizardInput value={input} onChange={setInput} placeholder="資格名を入力" maxLength={80} />
        <button
          type="button"
          onClick={() => { if (input.trim()) { addSkill(input.trim()); setInput(""); } }}
          className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold text-white"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          追加
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {certs.map((s) => (
          <Chip key={s.name} label={s.name} selected onClick={() => removeSkill(s.name)} />
        ))}
      </div>
    </div>
  );
}

// ─── Crew ──────────────────────────────────────────────────

export function StepCrewInterests() {
  const sports = useCareerWizard((s) => s.data.sports);
  const toggleSportsItem = useCareerWizard((s) => s.toggleSportsItem);

  return (
    <div>
      <StepHeader eyebrow="INTERESTS" title="何に興味がありますか？" hint="複数選択できます" />
      <div className="flex flex-wrap gap-1.5">
        {CREW_INTERESTS.map((opt) => (
          <Chip key={opt} label={opt} selected={sports.includes(opt)} onClick={() => toggleSportsItem(opt)} />
        ))}
      </div>
    </div>
  );
}

export function StepCrewSports() {
  const sport = useCareerWizard((s) => s.data.sportProfile);
  const setField = useCareerWizard((s) => s.setField);
  const cfg = ROLE_CONFIG.Crew;

  return (
    <div>
      <StepHeader eyebrow="SPORTS" title="好きな競技は？" hint="メインの競技を選んでください" />
      <div className="flex flex-wrap gap-1.5">
        {cfg.sportOptions.map((opt) => (
          <Chip key={opt} label={opt} selected={sport === opt} onClick={() => setField("sportProfile", sport === opt ? "" : opt)} />
        ))}
      </div>
    </div>
  );
}

export function StepCrewActivity() {
  const stance = useCareerWizard((s) => s.data.stance);
  const setField = useCareerWizard((s) => s.setField);
  const selected = stance ? stance.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    setField("stance", next.join(", "));
  };

  return (
    <div>
      <StepHeader eyebrow="ACTIVITY" title="どんな形でスポーツに関わっていますか？" hint="複数選択できます" />
      <div className="flex flex-wrap gap-1.5">
        {CREW_ACTIVITY_STYLES.map((opt) => (
          <Chip key={opt} label={opt} selected={selected.includes(opt)} onClick={() => toggle(opt)} />
        ))}
      </div>
    </div>
  );
}

export function StepCrewCommunities() {
  const episodes = useCareerWizard((s) => s.data.episodes);
  const openNewEpisode = useCareerWizard((s) => s.openNewEpisode);
  const deleteEpisode = useCareerWizard((s) => s.deleteEpisode);

  return (
    <div>
      <StepHeader eyebrow="COMMUNITY" title="参加しているコミュニティ・チームはありますか？" hint="任意 — 後から追加もできます" />
      {episodes.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {episodes.map((ep) => (
            <div key={ep.id} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
              <div>
                <p className="text-[13px] font-bold text-white/80">{ep.org || ep.role}</p>
                {ep.desc && <p className="text-[11px] text-white/40 mt-0.5">{ep.desc}</p>}
              </div>
              <button type="button" onClick={() => deleteEpisode(ep.id)} className="text-[10px] text-white/30 hover:text-red-400">削除</button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={openNewEpisode}
        className="w-full py-3 rounded-xl border border-dashed border-white/15 text-[12px] font-semibold text-white/40 hover:text-white/70"
      >
        + コミュニティを追加
      </button>
    </div>
  );
}

export function StepCrewPlaces() {
  const location = useCareerWizard((s) => s.data.location);
  const setField = useCareerWizard((s) => s.setField);

  return (
    <div>
      <StepHeader eyebrow="PLACES" title="よく行く場所・ジム・施設はありますか？" hint="任意" />
      <Field label="場所・施設名">
        <WizardInput value={location} onChange={(v) => setField("location", v)} placeholder="例：〇〇アリーナ、△△ジム" maxLength={120} />
      </Field>
    </div>
  );
}

// ─── Business ──────────────────────────────────────────────

export function StepBusinessBasic() {
  const displayName = useCareerWizard((s) => s.data.displayName);
  const setField = useCareerWizard((s) => s.setField);

  return (
    <div>
      <StepHeader eyebrow="BUSINESS" title="店舗・会社名を教えてください" />
      <Field label="ビジネス名">
        <WizardInput value={displayName} onChange={(v) => setField("displayName", v)} placeholder="例：Vizion Gym Shibuya" maxLength={80} />
      </Field>
    </div>
  );
}

export function StepBusinessCategory() {
  const sport = useCareerWizard((s) => s.data.sportProfile);
  const setField = useCareerWizard((s) => s.setField);

  return (
    <div>
      <StepHeader eyebrow="CATEGORY" title="どんな事業をしていますか？" />
      <div className="flex flex-wrap gap-1.5">
        {BUSINESS_CATEGORIES.map((opt) => (
          <Chip key={opt} label={opt} selected={sport === opt} onClick={() => setField("sportProfile", sport === opt ? "" : opt)} />
        ))}
      </div>
    </div>
  );
}

export function StepBusinessDescription() {
  const bio = useCareerWizard((s) => s.data.bio);
  const setField = useCareerWizard((s) => s.setField);

  return (
    <div>
      <StepHeader eyebrow="SERVICE" title="どんなサービスを提供していますか？" />
      <HintBullets items={["提供サービスの概要", "ターゲット顧客", "強み・特徴"]} />
      <Field label="サービス内容">
        <WizardTextarea value={bio} onChange={(v) => setField("bio", v)} placeholder="例：パーソナルトレーニング、チームコンディショニング..." rows={5} maxLength={600} />
      </Field>
    </div>
  );
}

export function StepBusinessLocation() {
  const name = useCareerWizard((s) => s.data.businessLocationName);
  const prefecture = useCareerWizard((s) => s.data.prefecture);
  const address = useCareerWizard((s) => s.data.businessAddress);
  const lat = useCareerWizard((s) => s.data.businessLatitude);
  const lng = useCareerWizard((s) => s.data.businessLongitude);
  const hours = useCareerWizard((s) => s.data.businessHours);
  const phone = useCareerWizard((s) => s.data.businessPhone);
  const website = useCareerWizard((s) => s.data.businessWebsite);
  const setField = useCareerWizard((s) => s.setField);

  return (
    <div>
      <StepHeader
        eyebrow="LOCATION"
        title="店舗所在地"
        hint="Map Pinは必ず実際のBusiness所在地の緯度経度を使用します"
      />
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
        <Field label="店舗名">
          <WizardInput value={name} onChange={(v) => setField("businessLocationName", v)} placeholder="例：Vizion Gym 渋谷店" maxLength={120} />
        </Field>
        <Field label="都道府県">
          <WizardSelect value={prefecture} onChange={(v) => setField("prefecture", v)}>
            <option value="">選択してください</option>
            {PREFECTURES.map((v) => <option key={v} value={v}>{v}</option>)}
          </WizardSelect>
        </Field>
        <Field label="住所">
          <WizardInput value={address} onChange={(v) => setField("businessAddress", v)} placeholder="例：東京都渋谷区..." maxLength={200} />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="緯度 (Latitude)">
            <WizardInput value={lat} onChange={(v) => setField("businessLatitude", v)} placeholder="35.6812" type="text" maxLength={20} />
          </Field>
          <Field label="経度 (Longitude)">
            <WizardInput value={lng} onChange={(v) => setField("businessLongitude", v)} placeholder="139.7671" type="text" maxLength={20} />
          </Field>
        </div>
        <Field label="営業時間（任意）">
          <WizardInput value={hours} onChange={(v) => setField("businessHours", v)} placeholder="例：10:00-22:00" maxLength={100} />
        </Field>
        <Field label="電話（任意）">
          <WizardInput value={phone} onChange={(v) => setField("businessPhone", v)} placeholder="03-xxxx-xxxx" maxLength={40} />
        </Field>
        <Field label="Website（任意）">
          <WizardInput value={website} onChange={(v) => setField("businessWebsite", v)} placeholder="https://..." maxLength={200} />
        </Field>
      </div>
    </div>
  );
}

// ─── Tagline (shared, role-aware) ──────────────────────────

export function StepTaglineRole() {
  const data = useCareerWizard((s) => s.data);
  const setField = useCareerWizard((s) => s.setField);
  const role = (data.role || "Athlete") as UserRole;
  const cfg = ROLE_CONFIG[role];
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div>
      <StepHeader eyebrow="TAGLINE" title="あなたを一言で表すと？" />
      <Field label="キャッチコピー">
        <WizardInput
          value={data.tagline || data.claim}
          onChange={(v) => { setField("tagline", v); setField("claim", v); }}
          placeholder={cfg.taglinePlaceholder}
          maxLength={140}
        />
        <button type="button" onClick={() => setShowExamples(!showExamples)}
          className="mt-1.5 font-mono text-[9px] tracking-[0.16em] uppercase transition-colors"
          style={{ color: "rgba(255,255,255,0.25)" }}>
          {showExamples ? "例を隠す ↑" : "例を見る ↓"}
        </button>
        {showExamples && (
          <div className="mt-2 flex flex-col gap-1.5">
            {cfg.taglineExamples.map((ex) => (
              <button key={ex} type="button"
                onClick={() => { setField("tagline", ex); setField("claim", ex); setShowExamples(false); }}
                className="text-left text-[12px] px-3 py-2 rounded-lg transition-all"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                {ex}
              </button>
            ))}
          </div>
        )}
      </Field>
    </div>
  );
}
