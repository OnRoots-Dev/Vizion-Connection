export interface DailyLog {
  id: string;
  user_id: number;
  log_date: string;
  content: string;
  condition_score: number | null;
  created_at: string;
}

export interface DailyLogResponse {
  success: boolean;
  data: DailyLog;
}

export interface DailyLogListResponse {
  logs: DailyLog[];
}
