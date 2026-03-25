// app/api/career-profile/route.ts
// セキュア版: CSRF, バリデーション, サイズ制限を追加

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import {
  getCareerProfile,
  upsertCareerProfile,
} from "@/lib/supabase/career-profiles";

// ────────────────────────────────────────────────────────────
// 設定
const MAX_BODY_BYTES = 60 * 1024; // 60KB
const MAX_EPISODES = 20;
const MAX_SKILLS = 20;
const MAX_STATS = 5;

// 文字列に < > を含めない（簡易 XSS 防止）かつ長さ制限
const safeString = (max: number) =>
  z
    .string()
    .max(max)
    .refine((v) => !/[<>]/.test(v), "HTML tags are not allowed");

// Zod スキーマ
const statSchema = z
  .object({
    value: safeString(50),
    label: safeString(50),
    color: z.enum(["default", "gold", "role"]),
  })
  .strict();

const episodeSchema = z
  .object({
    id: safeString(64).optional(),
    period: safeString(60),
    role: safeString(120),
    org: safeString(120),
    desc: safeString(800),
    milestone: safeString(120).optional(),
    tags: z.array(safeString(32)).max(6),
    isCurrent: z.boolean().optional(),
  })
  .strict();

const skillSchema = z
  .object({
    name: safeString(80),
    level: z.number().int().min(0).max(100),
    isHighlight: z.boolean().optional(),
  })
  .strict();

const bodySchema = z
  .object({
    tagline: safeString(140).optional(),
    bioCareer: safeString(2000).optional(),
    countryCode: safeString(10).optional(),
    countryName: safeString(100).optional(),
    stats: z.array(statSchema).max(MAX_STATS).optional(),
    episodes: z.array(episodeSchema).max(MAX_EPISODES).optional(),
    skills: z.array(skillSchema).max(MAX_SKILLS).optional(),
    ctaTitle: safeString(140).optional(),
    ctaSub: safeString(300).optional(),
    ctaBtn: safeString(60).optional(),
    snsX: safeString(200).optional(),
    snsInstagram: safeString(200).optional(),
    snsTiktok: safeString(200).optional(),
    visibility: z.enum(["public", "members", "private"]).optional(),
  })
  .strict();

// ────────────────────────────────────────────────────────────
// 共通ヘルパー

function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  return origin === req.nextUrl.origin;
}

async function readLimitedJson(req: NextRequest): Promise<unknown> {
  const lengthHeader = req.headers.get("content-length");
  if (lengthHeader && Number(lengthHeader) > MAX_BODY_BYTES) {
    throw new RequestEntityTooLargeError();
  }

  const text = await req.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    throw new RequestEntityTooLargeError();
  }

  return JSON.parse(text);
}

class RequestEntityTooLargeError extends Error {}

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
  return NextResponse.json(data ?? null);
}

// ── POST: 保存（upsert） ──────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!originAllowed(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = await getSessionCookie();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    const json = await readLimitedJson(req);
    const result = bodySchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.format() },
        { status: 400 }
      );
    }
    parsed = result.data;
  } catch (err) {
    if (err instanceof RequestEntityTooLargeError) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ok = await upsertCareerProfile(session.slug, {
    ...parsed,
    episodes: parsed.episodes?.map((ep) => ({
      ...ep,
      id: ep.id ?? "",
    })),
  });

  if (!ok) {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, slug: session.slug });
}

// App Router 向けのリクエストサイズ制限（静的設定がないため注意喚起用）
export const maxDuration = 30;
