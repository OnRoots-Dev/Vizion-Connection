import { supabaseServer as supabase } from "./server";
import type { DailyLog } from "@/features/daily-log/types";

function getTodayJst(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseUserId(userId: string): number {
  const parsed = Number(userId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("invalid_user_id");
  }
  return parsed;
}

export async function upsertDailyLog(input: {
  userId: string;
  content: string;
  conditionScore: number;
}): Promise<DailyLog> {
  const payload = {
    user_id: parseUserId(input.userId),
    log_date: getTodayJst(),
    content: input.content,
    condition_score: input.conditionScore,
  };

  const { data, error } = await supabase
    .from("daily_logs")
    .upsert(payload, { onConflict: "user_id,log_date" })
    .select("id, user_id, log_date, content, condition_score, created_at")
    .single();

  if (error || !data) {
    throw error ?? new Error("daily_log_upsert_failed");
  }

  return data as DailyLog;
}

export async function getDailyLogs(userId: string, limit = 30): Promise<DailyLog[]> {
  const parsedUserId = parseUserId(userId);
  const { data, error } = await supabase
    .from("daily_logs")
    .select("id, user_id, log_date, content, condition_score, created_at")
    .eq("user_id", parsedUserId)
    .order("log_date", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as DailyLog[];
}
