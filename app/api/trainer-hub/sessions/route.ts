import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTrainerProfile } from "@/lib/auth/require-trainer-session";
import { createTrainerSession } from "@/lib/supabase/trainer-hub";
import { PayloadTooLargeError, readLimitedJson } from "@/lib/security/body";
import { validateCSRF } from "@/lib/security/csrf";

const schema = z.object({
  clientId: z.string().uuid().optional(),
  clientSlug: z.string().trim().max(100).optional(),
  clientName: z.string().trim().min(1).max(120),
  clientStatus: z.enum(["active", "completed"]).optional(),
  date: z.string().trim().min(1),
  durationMinutes: z.number().int().min(15).max(480),
  summary: z.string().trim().min(1).max(1000),
  status: z.enum(["scheduled", "completed", "cancelled"]),
}).strict();

export async function POST(req: NextRequest) {
  const csrfError = validateCSRF(req);
  if (csrfError) return csrfError as unknown as NextResponse;

  try {
    const profile = await requireTrainerProfile();
    let body: unknown;
    try {
      body = await readLimitedJson(req);
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
      }
      return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" }, { status: 400 });
    }

    const summary = await createTrainerSession(profile, parsed.data);
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Trainerアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: message || "セッション追加に失敗しました" }, { status: 500 });
  }
}
