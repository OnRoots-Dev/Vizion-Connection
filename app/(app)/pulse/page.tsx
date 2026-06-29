import type { Metadata } from "next";
import PulseClient from "./PulseClient";
import { getSupabaseProfile } from "@/lib/auth/session";
import { supabaseServer } from "@/lib/supabase/server";
import { computeStreak, computePulseScore } from "@/lib/pulse-stats";
import { env } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  const user = await getSupabaseProfile();
  if (!user) {
    return {
      title: "Pulse Score | Vizion Connection",
      description: "あなたのPulse Scoreを確認しよう",
    };
  }

  const slug = user.slug;
  const since365 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  const [journeysRes, userRes, followsRes] = await Promise.all([
    supabaseServer
      .from("journeys")
      .select("created_at")
      .eq("user_slug", slug)
      .gte("created_at", since365),
    supabaseServer
      .from("users")
      .select("cheer_count")
      .eq("slug", slug)
      .single(),
    supabaseServer
      .from("user_follows")
      .select("id", { count: "exact", head: true })
      .eq("following_slug", slug),
  ]);

  const streak = computeStreak(
    (journeysRes.data ?? []).map((r) => r.created_at as string),
  );
  const cheerCount = (userRes.data?.cheer_count as number | null) ?? 0;
  const bondCount = followsRes.count ?? 0;
  const score = computePulseScore(streak, cheerCount, bondCount);
  const ogImageUrl = `${env.NEXT_PUBLIC_BASE_URL}/api/og/pulse?slug=${slug}`;

  return {
    title: `${slug}のPulse Score — ${score} | Vizion Connection`,
    description: `継続${streak}日 / Cheer${cheerCount} / Bond${bondCount}`,
    openGraph: {
      title: `${slug}のPulse Score — ${score}`,
      description: `継続${streak}日 / Cheer${cheerCount} / Bond${bondCount}`,
      images: [ogImageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: `${slug}のPulse Score — ${score}`,
      description: `継続${streak}日 / Cheer${cheerCount} / Bond${bondCount}`,
      images: [ogImageUrl],
    },
  };
}

export default function PulsePage() {
  return <PulseClient />;
}
