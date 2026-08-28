// lib/supabase/data/stats.server.ts
// 公開集計（LP用）。service role での合計数読み取りのみで、個人情報（PII）は一切返さない。
// 認可の代わりに、返すのは集計値のみであることを保証する（1ユーザーの素性を推測できない）。

import { supabaseServer } from "@/lib/supabase/server";

async function countRole(role: string): Promise<number> {
  const { count, error } = await supabaseServer
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", role)
    .eq("is_deleted", false);
  if (error) return 0;
  return count ?? 0;
}

/**
 * 非削除ユーザーのロール別・合計人数。
 * 公開マーケティングLPに「◯◯人が参加」として表示するための集計のみ。
 */
export async function getPublicMemberStats() {
  const [athletes, trainers, crew, business] = await Promise.all([
    countRole("Athlete"),
    countRole("Trainer"),
    countRole("Crew"),
    countRole("Business"),
  ]);
  return {
    memberCount: athletes + trainers + crew + business,
    athletes,
    trainers,
    crew,
    business,
  };
}
