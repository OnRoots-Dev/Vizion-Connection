import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessProfile } from "@/lib/auth/require-business-session";
import { updateBusinessHubAd } from "@/lib/supabase/business-hub";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";

const patchSchema = z.object({
  headline: z.string().min(1).max(80).optional(),
  bodyText: z.string().max(280).optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  linkUrl: z.string().url().optional().nullable().or(z.literal("")),
  prefecture: z.string().max(40).optional().nullable(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
}).strict();

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const csrfError = validateCSRF(req);
  if (csrfError) return csrfError as unknown as NextResponse;

  try {
    const profile = await requireBusinessProfile();
    const { id } = await context.params;

    let body: unknown;
    try {
      body = await readLimitedJson(req);
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
      }
      return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" }, { status: 400 });
    }

    const ad = await updateBusinessHubAd(profile, id, {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl === "" ? null : parsed.data.imageUrl,
      linkUrl: parsed.data.linkUrl === "" ? null : parsed.data.linkUrl,
    });
    return NextResponse.json({ success: true, ad });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
    return NextResponse.json({ success: false, error: message === "広告を更新できませんでした" ? message : "広告の更新に失敗しました" }, { status: 500 });
  }
}
