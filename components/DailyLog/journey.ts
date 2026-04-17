import type { DailyLog } from "@/features/daily-log/types";

export const CONDITION_OPTIONS = [
  { score: 1, emoji: "😫", label: "かなりきつい" },
  { score: 2, emoji: "😕", label: "少し重い" },
  { score: 3, emoji: "😐", label: "ふつう" },
  { score: 4, emoji: "🙂", label: "いい感じ" },
  { score: 5, emoji: "💪", label: "かなり良い" },
] as const;

const JOURNEY_HYPE_MESSAGES = [
  "Your Hype: いい積み上げ。小さな一歩でも、未来から見るとちゃんと前進です。",
  "Your Hype: 今日の一言が、明日の自分の背中を押してくれます。",
  "Your Hype: 続けている時点で強いです。その継続が武器になります。",
  "Your Hype: 今の記録は、あとで振り返ったときに確かな軌跡になります。",
  "Your Hype: 調子の波も含めてあなたのJourneyです。残せているのが素晴らしいです。",
  "Your Hype: 言葉にした瞬間、経験はちゃんと資産になります。",
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
