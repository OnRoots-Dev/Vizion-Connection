// app/api/career-profile/route.ts
// 既存の認証パターン（getSessionCookie + verifySession）に完全準拠

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import {
  getCareerProfile,
  upsertCareerProfile,
} from "@/lib/supabase/career-profiles";
// usersテーブルのsport/region/bioはウィザードから更新しない
// （既存の /api/profile/update で管理）

// ── GET: 自分のキャリアプロフィール取得 ──────────────────────

export async function GET(): Promise<NextResponse> {
  const token = await getSessionCookie();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getCareerProfile(session.slug);
  // 未作成の場合は null を返す（エラーではない）
  return NextResponse.json(data ?? null);
}

// ── POST: 保存（upsert） ──────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const token = await getSessionCookie();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ok = await upsertCareerProfile(session.slug, {
    tagline:      typeof body.tagline     === "string" ? body.tagline     : undefined,
    bioCareer:    typeof body.bioCareer   === "string" ? body.bioCareer   : undefined,
    countryCode:  typeof body.countryCode === "string" ? body.countryCode : undefined,
    countryName:  typeof body.countryName === "string" ? body.countryName : undefined,
    stats:        Array.isArray(body.stats)     ? body.stats     : undefined,
    episodes:     Array.isArray(body.episodes)  ? body.episodes  : undefined,
    skills:       Array.isArray(body.skills)    ? body.skills    : undefined,
    ctaTitle:     typeof body.ctaTitle    === "string" ? body.ctaTitle    : undefined,
    ctaSub:       typeof body.ctaSub      === "string" ? body.ctaSub      : undefined,
    ctaBtn:       typeof body.ctaBtn      === "string" ? body.ctaBtn      : undefined,
    snsX:         typeof body.snsX        === "string" ? body.snsX        : undefined,
    snsInstagram: typeof body.snsInstagram === "string" ? body.snsInstagram : undefined,
    snsTiktok:    typeof body.snsTiktok   === "string" ? body.snsTiktok   : undefined,
    visibility: (body.visibility === "public" || body.visibility === "members" || body.visibility === "private")
      ? body.visibility
      : undefined,
  });

  if (!ok) {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, slug: session.slug });
}
