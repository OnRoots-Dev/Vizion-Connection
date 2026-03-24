// app/(app)/dashboard/career/page.tsx
// 認証パターン: get-profile.ts と完全に同じ
// getSessionCookie + verifySession + findUserBySlug

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug } from "@/lib/supabase/users";
import { getCareerProfile } from "@/lib/supabase/career-profiles";
import CareerDashboardClient from "./CareerDashboardClient";

export const metadata: Metadata = {
  title: "キャリアページ | Vizion Connection",
  robots: { index: false, follow: false },
};

export default async function CareerDashboardPage() {
  // ── Auth（get-profile.ts と同一パターン）──────────────────
  const token = await getSessionCookie();
  if (!token) redirect("/login");

  const session = verifySession(token);
  if (!session) redirect("/login");

  const user = await findUserBySlug(session.slug);
  if (!user || user.isDeleted) redirect("/login");

  // ── career_profiles 取得（未作成なら null）────────────────
  const careerProfile = await getCareerProfile(user.slug);

  // ── クライアントコンポーネントへ渡すデータを整形 ──────────
  const userForClient = {
    slug:         user.slug,
    displayName:  user.displayName,
    role:         user.role,
    sport:        user.sport        ?? "",
    region:       user.region       ?? "",
    instagram:    user.instagram    ?? "",
    xUrl:         user.xUrl         ?? "",
    tiktok:       user.tiktok       ?? "",
    cheerCount:   user.cheerCount   ?? 0,
    avatarUrl:    user.avatarUrl    ?? null,
  };

  return (
    <CareerDashboardClient
      user={userForClient}
      careerProfile={careerProfile}
    />
  );
}
