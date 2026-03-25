// app/api/logout/route.ts

import { NextResponse } from "next/server";
import { deleteSessionCookie } from "@/lib/auth/cookies";
import { validateCSRF } from "@/lib/security/csrf";

export async function POST(req: Request): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;
    await deleteSessionCookie();
    return NextResponse.json({ ok: true });
}
