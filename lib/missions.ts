import { supabaseServer as supabase } from "@/lib/supabase/server";
import { addPointsToUser } from "@/lib/supabase/data/users.server";
import type { DailyMission, DailyMissionWithProgress, MissionType, OnetimeMission } from "@/features/missions/types";

interface UserMissionProgressRow {
  id: string;
  user_id: number;
  mission_id: string;
  period_key: string;
  current_count: number;
  completed_at: string | null;
}

interface MissionDefinitionRow {
  id: string;
  title: string;
  description: string | null;
  mission_type: MissionType;
  required_action: string;
  required_count: number;
  point_reward: number;
  is_active: boolean;
}

function parseUserId(userId: string): number {
  const parsed = Number(userId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("invalid_user_id");
  }
  return parsed;
}

function getTokyoDateParts() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
}

export function getMissionPeriodKey(type: MissionType): string {
  const parts = getTokyoDateParts();
  const year = Number(parts.find((part) => part.type === "year")?.value ?? "0");
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  if (type === "monthly") {
    return `${year}-${month}`;
  }

  if (type === "weekly") {
    const date = new Date(`${year}-${month}-${day}T00:00:00+09:00`);
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNum = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
    const isoYear = utcDate.getUTCFullYear();
    const yearStart = new Date(Date.UTC(isoYear, 0, 1));
    const weekNo = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${isoYear}-W${String(weekNo).padStart(2, "0")}`;
  }

  return `${year}-${month}-${day}`;
}

export function buildOnetimeMissions(params: {
  verified: boolean;
  hasShared: boolean;
  referralCount: number;
  hasProfileDetails: boolean;
}): OnetimeMission[] {
  return [
    { label: "先行登録完了", done: true, reward: "+1000pt", desc: "Vizion Connectionへの登録" },
    { label: "メール認証完了", done: params.verified, reward: "+200pt", desc: "メールアドレスを認証する" },
    { label: "SNSで共有", done: params.hasShared, reward: "+300pt", desc: "プロフィールをSNSでシェア" },
    { label: "3人招待する", done: params.referralCount >= 3, reward: "+1500pt", desc: "招待リンクから3人を招待" },
    { label: "プロフィール編集", done: params.hasProfileDetails, reward: "+200pt", desc: "Bio・スポーツ・地域を入力" },
  ];
}

export async function getActiveDailyMissions(): Promise<DailyMission[]> {
  const { data, error } = await supabase
    .from("mission_definitions")
    .select("id, title, description, mission_type, required_action, required_count, point_reward, is_active")
    .eq("mission_type", "daily")
    .eq("is_active", true)
    .order("point_reward", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DailyMission[];
}

export async function getDailyMissionsWithProgress(userId: string): Promise<DailyMissionWithProgress[]> {
  const parsedUserId = parseUserId(userId);
  const periodKey = getMissionPeriodKey("daily");
  const missions = await getActiveDailyMissions();

  if (missions.length === 0) return [];

  const missionIds = missions.map((mission) => mission.id);
  const { data, error } = await supabase
    .from("user_mission_progress")
    .select("id, user_id, mission_id, period_key, current_count, completed_at")
    .eq("user_id", parsedUserId)
    .eq("period_key", periodKey)
    .in("mission_id", missionIds);

  if (error) throw error;

  const progressMap = new Map<string, UserMissionProgressRow>(
    ((data ?? []) as UserMissionProgressRow[]).map((row) => [row.mission_id, row]),
  );

  return missions.map((mission) => {
    const progress = progressMap.get(mission.id);
    const currentCount = progress?.current_count ?? 0;
    const completedAt = progress?.completed_at ?? null;
    return {
      ...mission,
      period_key: periodKey,
      current_count: currentCount,
      completed_at: completedAt,
      is_completed: completedAt !== null || currentCount >= mission.required_count,
    };
  });
}

export async function recordMissionAction(params: {
  userId: string;
  slug: string;
  requiredAction: string;
}): Promise<DailyMissionWithProgress[]> {
  const parsedUserId = parseUserId(params.userId);
  const missions = await getActiveDailyMissions();
  const matchingMissions = missions.filter((mission) => mission.required_action === params.requiredAction);

  if (matchingMissions.length === 0) {
    return getDailyMissionsWithProgress(params.userId);
  }

  for (const mission of matchingMissions) {
    const periodKey = getMissionPeriodKey(mission.mission_type);
    const { data: existing, error: selectError } = await supabase
      .from("user_mission_progress")
      .select("id, user_id, mission_id, period_key, current_count, completed_at")
      .eq("user_id", parsedUserId)
      .eq("mission_id", mission.id)
      .eq("period_key", periodKey)
      .maybeSingle();

    if (selectError) throw selectError;

    const current = (existing as UserMissionProgressRow | null)?.current_count ?? 0;
    const alreadyCompleted = Boolean((existing as UserMissionProgressRow | null)?.completed_at);
    if (alreadyCompleted) continue;

    const nextCount = Math.min(current + 1, mission.required_count);
    const justCompleted = nextCount >= mission.required_count;
    const payload = {
      user_id: parsedUserId,
      mission_id: mission.id,
      period_key: periodKey,
      current_count: nextCount,
      completed_at: justCompleted ? new Date().toISOString() : null,
    };

    const { error: upsertError } = await supabase
      .from("user_mission_progress")
      .upsert(payload, { onConflict: "user_id,mission_id,period_key" });

    if (upsertError) throw upsertError;

    if (justCompleted) {
      const pointOk = await addPointsToUser(params.slug, mission.point_reward);
      if (!pointOk) {
        throw new Error("mission_reward_failed");
      }
    }
  }

  return getDailyMissionsWithProgress(params.userId);
}
