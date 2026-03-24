// types/career.ts
// UserRole は既存の features/auth/types から import
import type { UserRole } from "@/features/auth/types";

// ─── re-export for convenience ────────────────────────────
export type { UserRole };

// ─── Wizard state ──────────────────────────────────────────
// usersテーブルにすでにある sport / region / bio は
// ウィザード内では「表示用に読み込む」だけで、
// 保存は既存の profile update 経路を使う。
// career_profiles テーブルにはキャリア固有のデータだけ保存。

export interface CareerEpisode {
  id: string;
  period: string;
  role: string;
  org: string;
  desc: string;
  milestone?: string;
  tags: string[];
  isCurrent?: boolean;
}

export interface CareerSkill {
  name: string;
  level: number;        // 0–100
  isHighlight?: boolean;
}

export interface CareerStat {
  value: string;
  label: string;
  color: "default" | "gold" | "role";
}

export interface CareerWizardState {
  // ── usersテーブルから読み込む（読み取り専用）
  role: UserRole | "";
  name: string;           // users.display_name
  slug: string;           // users.slug
  sport: string;          // users.sport
  existingRegion: string; // users.region（参考表示用）

  // ── career_profiles テーブルへ保存
  tagline: string;
  bioCareer: string;
  countryCode: string;
  countryName: string;
  stats: CareerStat[];
  episodes: CareerEpisode[];
  skills: CareerSkill[];
  ctaTitle: string;
  ctaSub: string;
  ctaBtn: string;
  snsX: string;
  snsInstagram: string;
  snsTiktok: string;
  visibility: "public" | "members" | "private";
}

// ─── Role-specific configs ────────────────────────────────

export interface SkillPreset {
  name: string;
  defaultLevel: number;
  highlight?: boolean;
}

export interface StatTemplate {
  label: string;
  placeholder: string;
  color: "default" | "gold" | "role";
  hint: string;
}

export interface EpisodeTip {
  icon: string;
  text: string;
}

export interface RoleConfig {
  color: string;
  gradient: string;
  icon: string;
  labelJa: string;
  labelEn: string;
  descJa: string;

  // Step: Profile
  sportLabel: string;
  sportOptions: string[];
  taglinePlaceholder: string;
  taglineExamples: string[];

  // Step: Bio
  bioBullets: string[];
  bioPlaceholder: string;

  // Step: Stats
  stats: StatTemplate[];

  // Step: Episodes
  episodeRolePlaceholder: string;
  episodeOrgPlaceholder: string;
  episodeDescPlaceholder: string;
  episodeMilestonePlaceholder: string;
  episodeTips: EpisodeTip[];
  chapterTitles: string[];
  chapterBgWords: string[];

  // Step: Skills
  skills: SkillPreset[];
  skillsHint: string;

  // Step: Contact
  ctaTitlePlaceholder: string;
  ctaSubPlaceholder: string;
  ctaBtnPlaceholder: string;
  ctaExamples: string[];
}

// ─── ROLE_CONFIG ──────────────────────────────────────────
// UserRole = "Athlete" | "Trainer" | "Members" | "Business"

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {

  Athlete: {
    color: "#C1272D", gradient: "#3D0000",
    icon: "🏃", labelJa: "アスリート", labelEn: "ATHLETE",
    descJa: "プロ・アマ問わず競技者",

    sportLabel: "競技・スポーツ",
    sportOptions: ["サッカー","バスケットボール","野球","陸上","水泳",
      "テニス","ラグビー","バレーボール","格闘技","体操","スキー","その他"],
    taglinePlaceholder: "例：不屈の意志で世界を駆け抜ける",
    taglineExamples: [
      "不屈の意志で世界を駆け抜ける",
      "限界を超え続けるために走る",
      "グラウンドで人生を語る",
    ],

    bioBullets: [
      "どの競技を、いつから始めたか",
      "転機になった出来事・試合",
      "今一番伝えたいこと",
    ],
    bioPlaceholder: "例：愛媛出身。高校でサッカーを本格的に始め、大学でキャプテンを務めた後プロへ。Jリーグを経てイタリアへ移籍し、セリエAで10年間活躍。引退後は次世代の育成に力を注いでいます。",

    stats: [
      { label: "Pro Years",  placeholder: "例：15",  color: "role",    hint: "プロとして活動してきた年数" },
      { label: "国際試合数", placeholder: "例：116", color: "default", hint: "代表・国際舞台での出場数" },
      { label: "Cheer",      placeholder: "自動",    color: "gold",    hint: "Vizionのチア数（自動取得）" },
    ],

    episodeRolePlaceholder:      "例：プロサッカー選手 / 主将",
    episodeOrgPlaceholder:       "例：FC東京 / インテル・ミラノ",
    episodeDescPlaceholder:      "そのチームで経験したこと、感じたこと、乗り越えた壁を書いてください。",
    episodeMilestonePlaceholder: "例：コッパ・イタリア優勝 / J1ベストイレブン選出",
    episodeTips: [
      { icon: "⚽", text: "所属チームごとに1エピソードが読みやすい" },
      { icon: "📅", text: "時系列順（古→新）に並べると流れが伝わる" },
      { icon: "⭐", text: "ハイライトに受賞・タイトルを入れると映える" },
    ],
    chapterTitles:  ["原点",   "台頭",  "世界へ", "現在"],
    chapterBgWords: ["ORIGIN", "RISE",  "WORLD",  "NOW"],

    skills: [
      { name: "持久力",         defaultLevel: 85, highlight: true  },
      { name: "スピード",       defaultLevel: 80 },
      { name: "テクニック",     defaultLevel: 78 },
      { name: "守備力",         defaultLevel: 75 },
      { name: "メンタル強度",   defaultLevel: 88, highlight: true  },
      { name: "リーダーシップ", defaultLevel: 80 },
    ],
    skillsHint: "★をタップした項目が「強み」としてページ上部に大きく表示されます",

    ctaTitlePlaceholder: "例：オファー・スポンサーシップのご相談はこちら",
    ctaSubPlaceholder:   "例：メディア出演・講演・コラボのご依頼お待ちしています",
    ctaBtnPlaceholder:   "例：メッセージを送る",
    ctaExamples: [
      "スポンサーシップを検討中の方へ",
      "取材・メディア掲載について",
      "一緒に活動しませんか",
    ],
  },

  Trainer: {
    color: "#1A7A4A", gradient: "#002211",
    icon: "💪", labelJa: "トレーナー", labelEn: "TRAINER",
    descJa: "S&C・コーチ・リハビリ専門家",

    sportLabel: "専門分野",
    sportOptions: ["S&C（ストレングス）","フィジカルコーチ","リハビリ・AT",
      "栄養コーチング","メンタルコーチ","ムーブメント",
      "パーソナルトレーナー","チームトレーナー","その他"],
    taglinePlaceholder: "例：科学的根拠でアスリートのポテンシャルを解放する",
    taglineExamples: [
      "科学的根拠でアスリートのポテンシャルを解放する",
      "怪我ゼロで、最大パフォーマンスへ",
      "現場とエビデンスをつなぐトレーナー",
    ],

    bioBullets: [
      "取得資格・専門領域",
      "これまでに指導してきた選手・チーム",
      "自分ならではのアプローチ・強み",
    ],
    bioPlaceholder: "例：Jリーグクラブ帯同トレーナーとして3年間従事後、独立。NSCA-CSCS・JATI-ATI保有。負傷予防プログラムの設計を得意とし、在籍クラブのシーズン負傷件数を30%削減。現在は年間140名超を指導中。",

    stats: [
      { label: "指導クライアント数", placeholder: "例：140+", color: "role",    hint: "累計または年間の指導人数" },
      { label: "経験年数",           placeholder: "例：8",    color: "default", hint: "トレーナーとしてのキャリア年数" },
      { label: "Cheer",              placeholder: "自動",     color: "gold",    hint: "Vizionのチア数（自動取得）" },
    ],

    episodeRolePlaceholder:      "例：チームトレーナー / ヘッドS&Cコーチ",
    episodeOrgPlaceholder:       "例：ガンバ大阪 / Gold's Gym Japan",
    episodeDescPlaceholder:      "担当した業務内容、工夫したプログラム、達成した成果を書いてください。",
    episodeMilestonePlaceholder: "例：チーム負傷件数30%削減 / NSCA-CSCS取得 / 著書出版",
    episodeTips: [
      { icon: "🏋️", text: "資格取得・転職など転換点をエピソードに" },
      { icon: "📊", text: "数値で語れる実績（削減率・人数）を入れると説得力UP" },
      { icon: "🤝", text: "チーム帯同と独立指導は分けて書くとわかりやすい" },
    ],
    chapterTitles:  ["きっかけ",  "資格・修行", "実績を積む",  "独立・現在"],
    chapterBgWords: ["START",     "STUDY",      "BUILD",       "NOW"],

    skills: [
      { name: "ストレングストレーニング", defaultLevel: 88, highlight: true },
      { name: "負傷予防・評価",           defaultLevel: 85, highlight: true },
      { name: "栄養コーチング",           defaultLevel: 72 },
      { name: "リカバリー設計",           defaultLevel: 80 },
      { name: "プログラム設計",           defaultLevel: 90 },
      { name: "スポーツ科学",             defaultLevel: 78 },
    ],
    skillsHint: "★の項目がページの「専門分野」として強調表示されます",

    ctaTitlePlaceholder: "例：トレーニング依頼・チームコンサルはこちら",
    ctaSubPlaceholder:   "例：パーソナル指導・チーム帯同・オンラインコーチングのご依頼をお待ちしています",
    ctaBtnPlaceholder:   "例：無料相談を申し込む",
    ctaExamples: [
      "パーソナルトレーニングを依頼したい",
      "チームのコンディショニング相談",
      "オンライン指導について聞きたい",
    ],
  },

  Business: {
    color: "#1B3A8C", gradient: "#000D30",
    icon: "💼", labelJa: "ビジネス", labelEn: "BUSINESS",
    descJa: "エージェント・スポンサー・経営",

    sportLabel: "業界・職種",
    sportOptions: ["スポーツエージェント","スポンサーシップ",
      "スポーツマーケティング","スポーツ施設・運営",
      "メディア・放映権","スポーツテック",
      "ベンチャー・投資","コンサルティング","その他"],
    taglinePlaceholder: "例：アスリートの価値を最大化するブリッジになる",
    taglineExamples: [
      "アスリートの価値を最大化するブリッジになる",
      "スポーツの力で、ビジネスと社会をつなぐ",
      "データと人脈でスポーツ産業を動かす",
    ],

    bioBullets: [
      "前職・経歴の要点（会社名＋役職）",
      "専門とするビジネス領域",
      "これまで関わった案件・実績の規模感",
    ],
    bioPlaceholder: "例：アディダスジャパンでアスリートマーケティングを経験後、IMGにてアジア太平洋のスポンサーシップ責任者として年間目標200%達成。2021年に独立し「TANAKA SPORTS AGENCY」設立。現在10名のプロアスリートをマネジメント、累計契約総額10億円超。",

    stats: [
      { label: "成約・案件数", placeholder: "例：60+", color: "role",    hint: "これまで成立させたスポンサー・契約数" },
      { label: "キャリア年数", placeholder: "例：12",  color: "default", hint: "スポーツビジネス業界での経験年数" },
      { label: "Cheer",        placeholder: "自動",    color: "gold",    hint: "Vizionのチア数（自動取得）" },
    ],

    episodeRolePlaceholder:      "例：CEO / Business Development Manager",
    episodeOrgPlaceholder:       "例：TANAKA SPORTS AGENCY / IMG Japan / Adidas Japan",
    episodeDescPlaceholder:      "担当した業務・プロジェクト・達成した成果（数値含む）を書いてください。",
    episodeMilestonePlaceholder: "例：年間目標200%達成 / Forbes Japan 30人選出 / 累計10億円超",
    episodeTips: [
      { icon: "💰", text: "数字で語れる実績（売上・件数・達成率）を必ず入れる" },
      { icon: "🌐", text: "国際経験・グローバル実績は別エピソードにすると映える" },
      { icon: "🚀", text: "起業・独立はキャリアの転換点として必ず1エピソードに" },
    ],
    chapterTitles:  ["キャリアの始まり", "成長と実績", "グローバルへ", "起業・現在"],
    chapterBgWords: ["START",            "BUILD",       "GLOBAL",       "FOUNDER"],

    skills: [
      { name: "ネゴシエーション",    defaultLevel: 90, highlight: true },
      { name: "スポンサー営業",      defaultLevel: 88, highlight: true },
      { name: "ブランド戦略",        defaultLevel: 82 },
      { name: "契約・法務知識",      defaultLevel: 74 },
      { name: "ネットワーク構築",    defaultLevel: 92 },
      { name: "メディアリレーション",defaultLevel: 78 },
    ],
    skillsHint: "★の項目がビジネスパートナーへの訴求ポイントとして前面に出ます",

    ctaTitlePlaceholder: "例：スポンサーシップ・事業提携のご相談はこちら",
    ctaSubPlaceholder:   "例：アスリートマネジメント、スポンサー提案、コンサルのご依頼をお待ちしています",
    ctaBtnPlaceholder:   "例：ビジネス相談をする",
    ctaExamples: [
      "スポンサーシップについて相談したい",
      "アスリートのマネジメントを依頼したい",
      "事業提携・パートナーシップについて",
    ],
  },

  Members: {
    color: "#B8860B", gradient: "#221500",
    icon: "🌐", labelJa: "メンバー", labelEn: "MEMBERS",
    descJa: "サポーター・ファン・応援者",

    sportLabel: "応援している競技・チーム",
    sportOptions: ["サッカー観戦","野球観戦","バスケ観戦",
      "格闘技観戦","ラグビー観戦","陸上・マラソン",
      "コミュニティ運営","スポーツボランティア","その他"],
    taglinePlaceholder: "例：スタンドからアスリートを全力で後押しする",
    taglineExamples: [
      "スタンドからアスリートを全力で後押しする",
      "スポーツの感動を次の世代に伝えたい",
      "応援することで、自分も成長できる",
    ],

    bioBullets: [
      "どのスポーツ・チームを応援しているか",
      "スポーツとの関わり方（観戦・ボランティア等）",
      "Vizion Connectionで何をしたいか",
    ],
    bioPlaceholder: "例：FC東京を20年応援し続けているサポーター。地域のサッカー教室でコーチングボランティアもしています。スポーツの持つコミュニティの力を大切にし、Vizion Connectionを通じてアスリートとの距離を縮めたいと思っています。",

    stats: [
      { label: "応援歴",      placeholder: "例：20年", color: "role",    hint: "特定の競技・チームを応援してきた年数" },
      { label: "参加イベント", placeholder: "例：50+",  color: "default", hint: "観戦・イベント参加数（おおよそでOK）" },
      { label: "Cheer",       placeholder: "自動",     color: "gold",    hint: "Vizionのチア数（自動取得）" },
    ],

    episodeRolePlaceholder:      "例：コアサポーター / ボランティアコーチ / 運営スタッフ",
    episodeOrgPlaceholder:       "例：FC東京後援会 / 地域少年サッカークラブ",
    episodeDescPlaceholder:      "その時期のスポーツとの関わり、思い出に残る出来事、活動内容を書いてください。",
    episodeMilestonePlaceholder: "例：J1優勝の瞬間をスタジアムで目撃 / ボランティア累計100時間達成",
    episodeTips: [
      { icon: "❤️", text: "応援を始めたきっかけのエピソードは特に印象的" },
      { icon: "🏟️", text: "忘れられない試合・観戦体験を具体的に書くと共感を呼ぶ" },
      { icon: "🤝", text: "選手・チームとの出会いや交流エピソードも歓迎" },
    ],
    chapterTitles:  ["スポーツとの出会い", "熱狂の記憶",  "コミュニティへ", "これから"],
    chapterBgWords: ["MEET",               "PASSION",     "COMMUNITY",     "FUTURE"],

    skills: [
      { name: "応援・コミュニティ",  defaultLevel: 90, highlight: true },
      { name: "情報発信・SNS",       defaultLevel: 78 },
      { name: "企画・イベント運営",  defaultLevel: 72, highlight: true },
      { name: "コーチング・指導",    defaultLevel: 60 },
      { name: "スポーツ知識",        defaultLevel: 85 },
      { name: "ネットワーク構築",    defaultLevel: 75 },
    ],
    skillsHint: "スポーツコミュニティへの貢献を示すスキルを強調しましょう",

    ctaTitlePlaceholder: "例：一緒にスポーツを盛り上げませんか",
    ctaSubPlaceholder:   "例：共催イベント・メディア掲載・ボランティア活動のご相談はお気軽に",
    ctaBtnPlaceholder:   "例：つながりを申請する",
    ctaExamples: [
      "イベントを一緒に企画したい",
      "取材・掲載について相談したい",
      "ボランティア活動に参加したい",
    ],
  },
};
