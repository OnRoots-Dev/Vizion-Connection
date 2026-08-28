// lib/career-wizard/flows.ts
// Role-based Profile Onboarding step definitions.
// Role is NEVER selected in the wizard — it comes from the existing account.

import type { UserRole } from "@/features/auth/types";

export type WizardStepId =
  | "basic"
  | "media"
  | "tagline"
  | "athlete_sport"
  | "trainer_specialty"
  | "trainer_target"
  | "trainer_coaching"
  | "trainer_experience"
  | "trainer_certifications"
  | "crew_interests"
  | "crew_sports"
  | "crew_activity"
  | "crew_communities"
  | "crew_places"
  | "business_basic"
  | "business_category"
  | "business_description"
  | "business_location"
  | "location"
  | "bio"
  | "stats"
  | "episodes"
  | "skills"
  | "social"
  | "contact"
  | "complete";

export interface WizardStepMeta {
  id: WizardStepId;
  label: string;
  phase: number;
  skippable: boolean;
}

const step = (
  id: WizardStepId,
  label: string,
  phase: number,
  skippable = true,
): WizardStepMeta => ({ id, label, phase, skippable });

/** Role-specific onboarding flows — no role selection step. */
export const ROLE_FLOWS: Record<UserRole, WizardStepMeta[]> = {
  Athlete: [
    step("basic", "基本情報", 0, false),
    step("media", "プロフィール画像", 0),
    step("tagline", "キャッチコピー", 0),
    step("athlete_sport", "競技", 0, false),
    step("bio", "自己紹介", 1),
    step("episodes", "キャリア年表", 1),
    step("stats", "実績", 1),
    step("skills", "スキル", 2),
    step("location", "活動エリア", 2),
    step("social", "SNS", 2),
    step("complete", "確認", 2, false),
  ],
  Trainer: [
    step("basic", "基本情報", 0, false),
    step("media", "プロフィール画像", 0),
    step("tagline", "キャッチコピー", 0),
    step("trainer_specialty", "専門分野", 0, false),
    step("trainer_target", "対象者", 0),
    step("trainer_coaching", "指導スタイル", 1),
    step("trainer_experience", "指導歴", 1),
    step("trainer_certifications", "資格", 1),
    step("stats", "実績", 1),
    step("episodes", "経歴", 1),
    step("skills", "スキル", 2),
    step("location", "活動エリア", 2),
    step("social", "SNS", 2),
    step("complete", "確認", 2, false),
  ],
  Crew: [
    step("basic", "基本情報", 0, false),
    step("media", "プロフィール画像", 0),
    step("tagline", "キャッチコピー", 0),
    step("crew_interests", "興味", 0, false),
    step("crew_sports", "好きな競技", 0),
    step("crew_activity", "関わり方", 1),
    step("crew_communities", "コミュニティ", 1),
    step("crew_places", "よく行く場所", 1),
    step("location", "活動エリア", 2),
    step("social", "SNS", 2),
    step("complete", "確認", 2, false),
  ],
  Business: [
    step("business_basic", "ビジネス基本", 0, false),
    step("media", "ロゴ・画像", 0),
    step("business_category", "カテゴリ", 0, false),
    step("business_description", "サービス内容", 0),
    step("business_location", "店舗所在地", 0, false),
    step("stats", "ハイライト", 1),
    step("social", "SNS・Web", 1),
    step("complete", "確認", 1, false),
  ],
  Admin: [
    step("basic", "基本情報", 0, false),
    step("media", "プロフィール画像", 0),
    step("tagline", "キャッチコピー", 0),
    step("location", "活動エリア", 1),
    step("social", "SNS", 1),
    step("complete", "確認", 1, false),
  ],
};

export const PHASE_LABELS_BY_ROLE: Record<UserRole, string[]> = {
  Athlete: ["基本設定", "キャリア詳細", "仕上げ"],
  Trainer: ["基本設定", "指導プロフィール", "仕上げ"],
  Crew: ["基本設定", "スポーツとの関わり", "仕上げ"],
  Business: ["ビジネス情報", "公開設定"],
  Admin: ["基本設定", "仕上げ"],
};

export function getStepsForRole(role: UserRole | ""): WizardStepMeta[] {
  if (!role) return ROLE_FLOWS.Athlete;
  return ROLE_FLOWS[role] ?? ROLE_FLOWS.Athlete;
}

export function getPhaseLabelsForRole(role: UserRole | ""): string[] {
  if (!role) return PHASE_LABELS_BY_ROLE.Athlete;
  return PHASE_LABELS_BY_ROLE[role] ?? PHASE_LABELS_BY_ROLE.Athlete;
}

/** Prefecture list reused across location steps. */
export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;

export const REGIONS = [
  "北海道", "東北", "関東", "中部", "近畿", "中国・四国", "九州・沖縄",
] as const;

export const SPORTS_CATEGORIES = [
  "球技", "格闘技", "陸上", "水泳", "体操", "ウィンタースポーツ", "その他",
] as const;

export const TRAINER_SPECIALTIES = [
  "Strength", "Conditioning", "Running", "Nutrition", "Mental",
  "Skill Training", "Recovery", "S&C", "リハビリ", "その他",
] as const;

export const TRAINER_TARGETS = [
  "Professional Athletes", "Amateur Athletes", "Youth", "Teams",
  "General Fitness", "Beginners",
] as const;

export const COACHING_STYLES = [
  "科学的アプローチ", "モチベーション重視", "データドリブン",
  "ハイタッチ型", "個別最適化", "チーム統合型", "その他",
] as const;

export const CREW_INTERESTS = [
  "観戦", "応援", "ボランティア", "コーチング", "フィットネス",
  "イベント", "コンテンツ", "コミュニティ", "アスリート支援",
] as const;

export const CREW_ACTIVITY_STYLES = [
  "Watch", "Support", "Play", "Train", "Attend Events",
  "Create Content", "Volunteer",
] as const;

export const BUSINESS_CATEGORIES = [
  "Gym", "Sports Shop", "Restaurant", "Club", "Academy",
  "Facility", "Healthcare", "Sports Brand", "Event", "Other",
] as const;
