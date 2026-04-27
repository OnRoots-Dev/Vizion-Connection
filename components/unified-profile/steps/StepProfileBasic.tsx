"use client";

import type { UnifiedProfileData } from "@/components/unified-profile/UnifiedProfileModal";

export type StepProfileBasicData = Pick<
  UnifiedProfileData,
  | "displayName"
  | "bio"
  | "region"
  | "prefecture"
  | "sportsCategory"
  | "sport"
  | "stance"
  | "instagram"
  | "xUrl"
  | "tiktok"
  | "isPublic"
>;

export default function StepProfileBasic({
  data,
  onChange,
  onNext,
}: {
  data: StepProfileBasicData;
  onChange: (field: string, value: string | boolean) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Step 1</p>
        <h3 className="mt-1 text-xl font-black text-white">プロフィール情報</h3>
        <p className="mt-2 text-sm leading-6 text-white/70">
          まずは基本情報を入力してください。後から変更できます。
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <Field label="表示名（アカウント名）">
          <TextInput
            value={data.displayName}
            placeholder="Taro Yamada"
            onChange={(v) => onChange("displayName", v)}
          />
        </Field>

        <Field label="ひとこと">
          <textarea
            value={data.bio}
            onChange={(e) => onChange("bio", e.target.value)}
            placeholder="例）今シーズンの目標"
            className="min-h-28 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
          />
        </Field>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h4 className="text-sm font-black text-white">活動エリア</h4>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="region（地方）">
            <SelectInput
              value={data.region}
              onChange={(v) => onChange("region", v)}
              placeholder="選択してください"
              options={["北海道", "東北", "関東", "中部", "近畿", "中国・四国", "九州・沖縄"]}
            />
          </Field>
          <Field label="prefecture（都道府県）">
            <SelectInput
              value={data.prefecture}
              onChange={(v) => onChange("prefecture", v)}
              placeholder="選択してください"
              options={[
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
              ]}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h4 className="text-sm font-black text-white">競技・活動</h4>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="sportsCategory">
            <TextInput value={data.sportsCategory} onChange={(v) => onChange("sportsCategory", v)} placeholder="球技" />
          </Field>
          <Field label="sport">
            <TextInput value={data.sport} onChange={(v) => onChange("sport", v)} placeholder="サッカー" />
          </Field>
          <Field label="stance">
            <TextInput value={data.stance} onChange={(v) => onChange("stance", v)} placeholder="競技力向上に集中" />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h4 className="text-sm font-black text-white">SNS</h4>

        <div className="grid gap-4">
          <Field label="instagram">
            <TextInput value={data.instagram} onChange={(v) => onChange("instagram", v)} placeholder="https://instagram.com/username" />
          </Field>
          <Field label="xUrl">
            <TextInput value={data.xUrl} onChange={(v) => onChange("xUrl", v)} placeholder="https://x.com/username" />
          </Field>
          <Field label="tiktok">
            <TextInput value={data.tiktok} onChange={(v) => onChange("tiktok", v)} placeholder="https://tiktok.com/@username" />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-white">プロフィールを公開する</p>
            <p className="mt-1 text-sm leading-6 text-white/60">
              {data.isPublic
                ? "現在公開中です。プロフィールページとカードページを表示できます。"
                : "現在非公開です。自分以外からの閲覧導線が止まります。"}
            </p>
          </div>
          <input
            type="checkbox"
            className="h-5 w-5 accent-white"
            checked={data.isPublic}
            onChange={(e) => onChange("isPublic", e.target.checked)}
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-black text-black"
        >
          次へ
        </button>
      </div>
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-white/60">{label}</p>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
    />
  );
}
