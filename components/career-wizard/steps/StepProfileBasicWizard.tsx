"use client";

import { Field, StepHeader, WizardInput, WizardSelect, WizardTextarea } from "@/components/career-wizard/WizardUI";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { ROLE_CONFIG } from "@/types/career";
import type { UserRole } from "@/types/career";

export default function StepProfileBasicWizard() {
  const role = useCareerWizard((s) => s.data.role) as UserRole | "";
  const displayName = useCareerWizard((s) => s.data.displayName);
  const bio = useCareerWizard((s) => s.data.bio);
  const region = useCareerWizard((s) => s.data.region);
  const prefecture = useCareerWizard((s) => s.data.prefecture);
  const sportsCategory = useCareerWizard((s) => s.data.sportsCategory);
  const sport = useCareerWizard((s) => s.data.sportProfile);
  const stance = useCareerWizard((s) => s.data.stance);
  const instagram = useCareerWizard((s) => s.data.instagram);
  const xUrl = useCareerWizard((s) => s.data.xUrl);
  const tiktok = useCareerWizard((s) => s.data.tiktok);
  const setField = useCareerWizard((s) => s.setField);

  const cfg = ROLE_CONFIG[(role || "Athlete") as UserRole];
  const isSportRole = role === "Athlete" || role === "Trainer";
  const sportTitle = cfg.sportLabel; // 例：アスリート「競技・スポーツ」/ Business「業界・職種」/ Crew「応援・活動」
  const stanceLabel =
    role === "Business" ? "ビジネスステージ" :
    role === "Crew" ? "関わり方" :
    role === "Trainer" ? "提供スタイル" : "ポジション・スタイル";

  return (
    <div>
      <StepHeader
        eyebrow="PROFILE"
        title="プロフィール情報"
        hint={cfg ? `${cfg.labelJa}としての登録内容を入力してください（あとで変更できます）` : "基本情報を入力してください（あとで変更できます）"}
      />

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <Field label="表示名（アカウント名）">
          <WizardInput value={displayName} onChange={(v) => setField("displayName", v)} placeholder="Taro Yamada" maxLength={40} />
        </Field>

        <Field label="ひとこと">
          <WizardTextarea value={bio} onChange={(v) => setField("bio", v)} placeholder="例）今シーズンの目標" rows={4} maxLength={180} />
        </Field>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-black text-white mb-3">活動エリア</p>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="region（地方）">
            <WizardSelect value={region} onChange={(v) => setField("region", v)}>
              <option value="">選択してください</option>
              {[
                "北海道",
                "東北",
                "関東",
                "中部",
                "近畿",
                "中国・四国",
                "九州・沖縄",
              ].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </WizardSelect>
          </Field>

          <Field label="prefecture（都道府県）">
            <WizardSelect value={prefecture} onChange={(v) => setField("prefecture", v)}>
              <option value="">選択してください</option>
              {[
                "北海道",
                "青森県",
                "岩手県",
                "宮城県",
                "秋田県",
                "山形県",
                "福島県",
                "茨城県",
                "栃木県",
                "群馬県",
                "埼玉県",
                "千葉県",
                "東京都",
                "神奈川県",
                "新潟県",
                "富山県",
                "石川県",
                "福井県",
                "山梨県",
                "長野県",
                "岐阜県",
                "静岡県",
                "愛知県",
                "三重県",
                "滋賀県",
                "京都府",
                "大阪府",
                "兵庫県",
                "奈良県",
                "和歌山県",
                "鳥取県",
                "島根県",
                "岡山県",
                "広島県",
                "山口県",
                "徳島県",
                "香川県",
                "愛媛県",
                "高知県",
                "福岡県",
                "佐賀県",
                "長崎県",
                "熊本県",
                "大分県",
                "宮崎県",
                "鹿児島県",
                "沖縄県",
              ].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </WizardSelect>
          </Field>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-black text-white mb-3">{sportTitle}</p>

        <div className="grid gap-4 md:grid-cols-3">
          {isSportRole && (
            <Field label="sportsCategory">
              <WizardSelect value={sportsCategory} onChange={(v) => setField("sportsCategory", v)}>
                <option value="">選択してください</option>
                {["球技", "格闘技", "陸上", "水泳", "体操", "ウィンタースポーツ", "その他"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </WizardSelect>
            </Field>
          )}

          <Field label="sport">
            <WizardSelect value={sport} onChange={(v) => setField("sportProfile", v)}>
              <option value="">選択してください</option>
              {cfg.sportOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </WizardSelect>
          </Field>

          <Field label={stanceLabel}>
            <WizardSelect value={stance} onChange={(v) => setField("stance", v)}>
              <option value="">選択してください</option>
              {[
                "競技力向上に集中",
                "指導・コーチング",
                "マネジメント",
                "ビジネス",
                "コミュニティ",
                "その他",
              ].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </WizardSelect>
          </Field>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-black text-white mb-3">SNS（任意）</p>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Instagram">
            <WizardInput value={instagram} onChange={(v) => setField("instagram", v)} placeholder="https://instagram.com/..." maxLength={200} />
          </Field>
          <Field label="X">
            <WizardInput value={xUrl} onChange={(v) => setField("xUrl", v)} placeholder="https://x.com/..." maxLength={200} />
          </Field>
          <Field label="TikTok">
            <WizardInput value={tiktok} onChange={(v) => setField("tiktok", v)} placeholder="https://www.tiktok.com/..." maxLength={200} />
          </Field>
        </div>
      </div>
    </div>
  );
}
