import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireMemberProfile } from "@/lib/auth/require-member-session";
import { recordMemberHubEvent } from "@/lib/supabase/member-hub";
import { PayloadTooLargeError, readLimitedJson } from "@/lib/security/body";
import { validateCSRF } from "@/lib/security/csrf";

const schema = z.object({
  eventType: z.enum(["event_join", "referral_link_copied", "referral_link_shared"]),
  targetSlug: z.string().trim().min(1).max(100).optional(),
  label: z.string().trim().max(120).optional(),
}).strict();

export async function POST(req: NextRequest) {
  const csrfError = validateCSRF(req);
  if (csrfError) return csrfError as unknown as NextResponse;

  try {
    const profile = await requireMemberProfile();
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

    await recordMemberHubEvent({
      memberSlug: profile.slug,
      eventType: parsed.data.eventType,
      targetSlug: parsed.data.targetSlug ?? null,
      label: parsed.data.label ?? null,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Membersアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: "行動ログの保存に失敗しました" }, { status: 500 });
  }
}
