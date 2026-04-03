"use client";

import { create } from "zustand";
import type { DailyLog, DailyLogListResponse, DailyLogResponse } from "@/features/daily-log/types";

interface DailyLogStore {
  logs: DailyLog[];
  todayLog: DailyLog | null;
  isLoading: boolean;
  isSubmitting: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchLogs: () => Promise<void>;
  submitLog: (input: { content: string; conditionScore: number }) => Promise<boolean>;
}

function getTodayString(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(now);
}

export const useDailyLogStore = create<DailyLogStore>((set) => ({
  logs: [],
  todayLog: null,
  isLoading: false,
  isSubmitting: false,
  hasLoaded: false,
  error: null,
  fetchLogs: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch("/api/daily-log", { cache: "no-store" });
      const data = (await res.json()) as DailyLogListResponse & { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "ログの取得に失敗しました");
      }

      const today = getTodayString();
      const todayLog = (data.logs ?? []).find((log) => log.log_date === today) ?? null;

      set({
        logs: data.logs ?? [],
        todayLog,
        hasLoaded: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        hasLoaded: true,
        error: error instanceof Error ? error.message : "ログの取得に失敗しました",
      });
    }
  },
  submitLog: async ({ content, conditionScore }) => {
    set({ isSubmitting: true, error: null });

    try {
      const res = await fetch("/api/daily-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          condition_score: conditionScore,
        }),
      });

      const data = (await res.json()) as (DailyLogResponse & { error?: string }) | { success?: boolean; error?: string };

      if (!res.ok || !("success" in data) || !data.success || !("data" in data)) {
        throw new Error(("error" in data && data.error) ? data.error : "ログの記録に失敗しました");
      }

      set((state) => {
        const nextLogs = [data.data, ...state.logs.filter((log) => log.log_date !== data.data.log_date)].slice(0, 30);
        return {
          logs: nextLogs,
          todayLog: data.data,
          isSubmitting: false,
          error: null,
        };
      });

      return true;
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : "ログの記録に失敗しました",
      });
      return false;
    }
  },
}));
