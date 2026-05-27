import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseProfile } from "@/lib/auth/session";
import { updateUserProfile } from "@/lib/supabase/data/users.server";
import { profileLimiter, getIp } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/security/csrf";

const bodySchema = z.object({
  isPublic: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  const csrfError = validateCSRF(req);
  if (csrfError) return csrfError as unknown as NextResponse;

  const user = await getSupabaseProfile();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { success } = await profileLimiter.limit(getIp(req));
  if (!success) return NextResponse.json({ error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "公開設定の形式が正しくありません" }, { status: 400 });
  }

  if (user.role === "Admin") {
    await updateUserProfile(user.slug, { isPublic: false });
    return NextResponse.json({ error: "Adminアカウントは公開できません" }, { status: 403 });
  }

  await updateUserProfile(user.slug, { isPublic: parsed.data.isPublic });

  return NextResponse.json({ ok: true, isPublic: parsed.data.isPublic });
}
