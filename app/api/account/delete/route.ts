// app/api/account/delete/route.ts
import { NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { deactivateUser } from "@/lib/supabase/data/users.server";
import { accountLimiter, getIp } from "@/lib/ratelimit";
import { validateCSRF } from "@/lib/security/csrf";

export async function POST(req: Request) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const { success } = await accountLimiter.limit(getIp(req));
    if (!success) return NextResponse.json({ error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await deactivateUser(user.slug);

    return NextResponse.json({ ok: true });
}
