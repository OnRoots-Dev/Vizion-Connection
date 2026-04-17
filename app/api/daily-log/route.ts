import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { addPointsToUser } from "@/lib/supabase/data/users.server";
import { getCurrentJstHour, getDailyLogs, getTodayDailyLog, upsertDailyLog } from "@/lib/supabase/daily-logs";
import { recordMissionAction } from "@/lib/missions";

const dailyLogSchema = z.object({
  content: z.string().trim().min(1, "内容を入力してください").max(200, "200文字以内で入力してください"),
  condition_score: z.number().int().min(1).max(5),
});

const MORNING_BONUS_POINTS = 10;
const MORNING_BONUS_START_HOUR = 4;
const MORNING_BONUS_END_HOUR = 10;

export async function GET(): Promise<NextResponse> {
  try {
    const token = await getSessionCookie();
    if (!token) {
      return NextResponse.json({ logs: [] }, { status: 401 });
    }

    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ logs: [] }, { status: 401 });
    }

    const logs = await getDailyLogs(session.userId, 30);
    return NextResponse.json({ logs });
  } catch (err) {
    console.error("[GET /api/daily-log]", err);
    return NextResponse.json({ logs: [], error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const csrfError = validateCSRF(req);
  if (csrfError) return csrfError as unknown as NextResponse;

  try {
    const token = await getSessionCookie();
    if (!token) {
      return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    }

    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ success: false, error: "セッションが無効です" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await readLimitedJson(req);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) {
        return NextResponse.json({ success: false, error: "データが大きすぎます" }, { status: 413 });
      }
      return NextResponse.json({ success: false, error: "リクエストが不正です" }, { status: 400 });
    }

    const parsed = dailyLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "入力内容を確認してください" }, { status: 400 });
    }

    const existingLog = await getTodayDailyLog(session.userId);
    const log = await upsertDailyLog({
      userId: session.userId,
      content: parsed.data.content,
      conditionScore: parsed.data.condition_score,
    });

    const currentJstHour = getCurrentJstHour();
    const morningBonusAwarded =
      !existingLog &&
      currentJstHour >= MORNING_BONUS_START_HOUR &&
      currentJstHour < MORNING_BONUS_END_HOUR;

    if (morningBonusAwarded) {
      await addPointsToUser(session.slug, MORNING_BONUS_POINTS).catch((error) => {
        console.error("[POST /api/daily-log morning bonus]", error);
      });
    }

    await recordMissionAction({
      userId: session.userId,
      slug: session.slug,
      requiredAction: "daily_log",
    }).catch((error) => {
      console.error("[POST /api/daily-log mission progress]", error);
    });

    return NextResponse.json({
      success: true,
      data: log,
      reward: {
        morningBonusAwarded,
        points: morningBonusAwarded ? MORNING_BONUS_POINTS : 0,
      },
    });
  } catch (err) {
    console.error("[POST /api/daily-log]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
