import type { DailyLog } from "@/features/daily-log/types";

export const JOURNEY_MAX_CHARS = 100;

export const CONDITION_OPTIONS = [
  { score: 1, emoji: "🌧️", label: "低調（立て直し中）" },
  { score: 2, emoji: "🌥️", label: "やや重い（調整フェーズ）" },
  { score: 3, emoji: "🌤️", label: "安定（通常状態）" },
  { score: 4, emoji: "🔥", label: "好調（パフォーマンス高）" },
  { score: 5, emoji: "⚡️", label: "覚醒（ピーク状態）" },
] as const;

const JOURNEY_HYPE_MESSAGES = [
  "Your Hype: 小さな一歩は、未来から見れば大きな前進だ。",
  "Your Hype: 続けた者だけが、自分の変化に出会える。",
  "Your Hype: 記録は、過去ではなく未来への投資だ。",
  "Your Hype: 迷いながらでも進むこと、それ自体が価値になる。",
  "Your Hype: 完璧より継続。継続がすべてを変える。",
  "Your Hype: 今日の行動が、未来の自分の評価になる。",
  "Your Hype: 言葉にした瞬間、経験は資産になる。",
  "Your Hype: 積み上げは静かに、だが確実に人生を変える。",
  "Your Hype: 止まらなければ、それは後退ではない。",
  "Your Hype: 今の一歩が、やがて確かな軌跡になる。",

  "Your Hype: 千里の道も一歩から。— 老子",
  "Your Hype: 継続は力なり。— 格言",
  "Your Hype: 為せば成る、為さねば成らぬ何事も。— 上杉鷹山",
  "Your Hype: 意志あるところに道は開ける。— 西洋のことわざ",
  "Your Hype: 幸運は準備された心に宿る。— ルイ・パスツール",
  "Your Hype: 偉大な仕事をする唯一の方法は、自分のしていることを愛することだ。— スティーブ・ジョブズ",
  "Your Hype: 成功とは、小さな努力を日々積み重ねたものである。— ロバート・コリアー",
  "Your Hype: それは達成されるまで不可能に見えるものだ。— ネルソン・マンデラ",
  "Your Hype: 自分ならできると信じれば、すでに半分は達成している。— セオドア・ルーズベルト",
  "Your Hype: 良い始まりは半ばの成功である。— アリストテレス",
] as const;

export function getTodayString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function getConditionMeta(score: number | null | undefined) {
  return CONDITION_OPTIONS.find((option) => option.score === score) ?? null;
}

function hashSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getJourneyHype(todayLog: DailyLog | null) {
  if (!todayLog) {
    return "Your Hype: 今日の一言を残して、あなたのJourneyを前に進めましょう。";
  }

  const seed = `${todayLog.log_date}:${todayLog.id}:${todayLog.content}`;
  return JOURNEY_HYPE_MESSAGES[hashSeed(seed) % JOURNEY_HYPE_MESSAGES.length];
}

type JourneyTemplateRole = "Athlete" | "Trainer" | "Members" | "Business";

const JOURNEY_TEMPLATES: Record<JourneyTemplateRole, readonly string[]> = {
  Athlete: [
    "今日のテーマ：基礎を丁寧に積む。",
    "練習で意識したこと：フォームの再現性。",
    "うまくいった点：集中が途切れなかった。",
    "課題：終盤のスタミナ配分。",
    "改善策：ウォームアップの質を上げる。",
    "今日の学び：小さな修正が大きな差になる。",
    "明日の目標：前半からペースを作る。",
    "体の状態：疲労はあるが動きは良い。",
    "メンタル：プレッシャーを楽しめた。",
    "感謝：支えてくれる人へ一言。",
  ],
  Trainer: [
    "今日の指導テーマ：基礎動作の定着。",
    "観察した変化：姿勢が安定してきた。",
    "伝えたキーワード：『ゆっくり正確に』。",
    "うまくいった点：声かけのタイミング。",
    "課題：説明が長くなりがち。",
    "次回の改善：1つだけに絞って伝える。",
    "選手の強み：継続力がある。",
    "リスク管理：疲労サインに注意。",
    "学び：成功体験の設計が大事。",
    "明日のアクション：メニューを再設計する。",
  ],
  Members: [
    "今日やったこと：まずは5分だけ動いた。",
    "良かったこと：やる前より気分が軽い。",
    "続けたい習慣：同じ時間に始める。",
    "課題：スマホを見すぎた。",
    "改善：タイマーで区切る。",
    "学び：小さく始めると続く。",
    "明日の目標：『1つだけ』やり切る。",
    "体の状態：少しだるいので早寝する。",
    "気持ち：焦らず積み上げる。",
    "感謝：今日助けてくれた人に一言。",
  ],
  Business: [
    "今日の優先事項：最重要タスクから着手。",
    "前進したこと：意思決定を1つ完了。",
    "課題：会議が長引いた。",
    "改善：議題と結論を先に置く。",
    "学び：小さく検証して早く回す。",
    "明日の目標：アウトプットを1つ出す。",
    "チーム：相手の状況を確認して進めた。",
    "数字：今日は1つだけ指標を追った。",
    "コミュニケーション：結論→理由→依頼。",
    "感謝：協力してくれた人へ一言。",
  ],
};

function pickRandomUnique<T>(items: readonly T[], count: number): T[] {
  if (items.length <= count) return [...items];
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export function getJourneyTemplatesForRole(role: string | null | undefined): readonly string[] {
  const key = (role ?? "Members") as JourneyTemplateRole;
  return JOURNEY_TEMPLATES[key] ?? JOURNEY_TEMPLATES.Members;
}

export function getRandomJourneyTemplateSuggestions(role: string | null | undefined, count = 3): string[] {
  return pickRandomUnique(getJourneyTemplatesForRole(role), count);
}
