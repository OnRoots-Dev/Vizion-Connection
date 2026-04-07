import { addPointsToUser } from "@/lib/supabase/data/users.server";
import { supabaseServer as supabase } from "@/lib/supabase/server";

export const ONETIME_MISSION_DEFINITIONS = {
  register_complete: { label: "先行登録完了", points: 1000 },
  email_verified: { label: "メール認証完了", points: 200 },
  profile_shared: { label: "SNSで共有", points: 300 },
  invite_three: { label: "3人招待する", points: 1500 },
  profile_completed: { label: "プロフィール編集", points: 200 },
} as const;

export type OnetimeMissionKey = keyof typeof ONETIME_MISSION_DEFINITIONS;

export async function hasMissionRewarded(userSlug: string, missionKey: OnetimeMissionKey): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_onetime_mission_rewards")
    .select("id")
    .eq("user_slug", userSlug)
    .eq("mission_key", missionKey)
    .maybeSingle();

  if (error) {
    console.error("[hasMissionRewarded]", error);
    return false;
  }

  return Boolean(data);
}

export async function rewardOnetimeMission(userSlug: string, missionKey: OnetimeMissionKey): Promise<boolean> {
  const alreadyRewarded = await hasMissionRewarded(userSlug, missionKey);
  if (alreadyRewarded) return false;

  const mission = ONETIME_MISSION_DEFINITIONS[missionKey];
  const pointOk = await addPointsToUser(userSlug, mission.points);
  if (!pointOk) return false;

  const { error } = await supabase.from("user_onetime_mission_rewards").insert({
    user_slug: userSlug,
    mission_key: missionKey,
    points_awarded: mission.points,
  });

  if (error) {
    console.error("[rewardOnetimeMission]", error);
    return false;
  }

  return true;
}
