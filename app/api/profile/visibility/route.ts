import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug, updateUserProfile } from "@/lib/supabase/data/users.server";

const bodySchema = z.object({
  isPublic: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await findUserBySlug(session.slug);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

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
