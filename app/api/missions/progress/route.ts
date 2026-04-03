import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { recordMissionAction } from "@/lib/missions";

const progressSchema = z.object({
  required_action: z.string().trim().min(1).max(100),
});

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

    const parsed = progressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "入力内容を確認してください" }, { status: 400 });
    }

    const daily = await recordMissionAction({
      userId: session.userId,
      slug: session.slug,
      requiredAction: parsed.data.required_action,
    });

    return NextResponse.json({ success: true, daily });
  } catch (err) {
    console.error("[POST /api/missions/progress]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
