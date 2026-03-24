// lib/supabase/career-profiles.ts
// 既存の client.ts / users.ts と完全に同じパターンで実装

import { supabase } from "./client";

// ─── 型定義 ───────────────────────────────────────────────

export interface CareerStat {
  value: string;
  label: string;
  color: "default" | "gold" | "role";
}

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
  level: number;
  isHighlight?: boolean;
}

export interface CareerProfileRow {
  id: number;
  user_slug: string;
  tagline: string | null;
  bio_career: string | null;
  country_code: string;
  country_name: string | null;
  stats: CareerStat[];
  episodes: CareerEpisode[];
  skills: CareerSkill[];
  cta_title: string | null;
  cta_sub: string | null;
  cta_btn: string | null;
  sns_x: string | null;
  sns_instagram: string | null;
  sns_tiktok: string | null;
  visibility: "public" | "members" | "private";
  created_at: string;
  updated_at: string;
}

// ─── 取得 ─────────────────────────────────────────────────

export async function getCareerProfile(
  userSlug: string
): Promise<CareerProfileRow | null> {
  const { data, error } = await supabase
    .from("career_profiles")
    .select("*")
    .eq("user_slug", userSlug)
    .single();

  if (error) {
    // PGRST116 = row not found（初回は正常）
    if (error.code !== "PGRST116") {
      console.error("[getCareerProfile]", error);
    }
    return null;
  }
  return data as CareerProfileRow;
}

// ─── 保存（upsert） ────────────────────────────────────────

export async function upsertCareerProfile(
  userSlug: string,
  payload: {
    tagline?: string;
    bioCareer?: string;
    countryCode?: string;
    countryName?: string;
    stats?: CareerStat[];
    episodes?: CareerEpisode[];
    skills?: CareerSkill[];
    ctaTitle?: string;
    ctaSub?: string;
    ctaBtn?: string;
    snsX?: string;
    snsInstagram?: string;
    snsTiktok?: string;
    visibility?: "public" | "members" | "private";
  }
): Promise<boolean> {
  const { error } = await supabase
    .from("career_profiles")
    .upsert(
      {
        user_slug:    userSlug,
        tagline:      payload.tagline      ?? null,
        bio_career:   payload.bioCareer    ?? null,
        country_code: payload.countryCode  ?? "JP",
        country_name: payload.countryName  ?? null,
        stats:        payload.stats        ?? [],
        episodes:     payload.episodes     ?? [],
        skills:       payload.skills       ?? [],
        cta_title:    payload.ctaTitle     ?? null,
        cta_sub:      payload.ctaSub       ?? null,
        cta_btn:      payload.ctaBtn       ?? null,
        sns_x:        payload.snsX         ?? null,
        sns_instagram: payload.snsInstagram ?? null,
        sns_tiktok:   payload.snsTiktok    ?? null,
        visibility:   payload.visibility   ?? "public",
        updated_at:   new Date().toISOString(),
      },
      { onConflict: "user_slug" }
    );

  if (error) {
    console.error("[upsertCareerProfile]", error);
    return false;
  }
  return true;
}

// ─── 削除 ─────────────────────────────────────────────────

export async function deleteCareerProfile(userSlug: string): Promise<boolean> {
  const { error } = await supabase
    .from("career_profiles")
    .delete()
    .eq("user_slug", userSlug);

  if (error) {
    console.error("[deleteCareerProfile]", error);
    return false;
  }
  return true;
}

// ─── 公開プロフィール一覧（将来のランキング等に使用） ───────

export async function getPublicCareerProfiles(params: {
  limit?: number;
  offset?: number;
}): Promise<CareerProfileRow[]> {
  const { data, error } = await supabase
    .from("career_profiles")
    .select("*")
    .eq("visibility", "public")
    .order("updated_at", { ascending: false })
    .range(
      params.offset ?? 0,
      (params.offset ?? 0) + (params.limit ?? 20) - 1
    );

  if (error) {
    console.error("[getPublicCareerProfiles]", error);
    return [];
  }
  return (data ?? []) as CareerProfileRow[];
}
