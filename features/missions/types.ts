export type MissionType = "daily" | "weekly" | "monthly";

export interface OnetimeMission {
  label: string;
  done: boolean;
  reward: string;
  desc: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string | null;
  mission_type: MissionType;
  required_action: string;
  required_count: number;
  point_reward: number;
  is_active: boolean;
}

export interface DailyMissionWithProgress extends DailyMission {
  period_key: string;
  current_count: number;
  completed_at: string | null;
  is_completed: boolean;
}
