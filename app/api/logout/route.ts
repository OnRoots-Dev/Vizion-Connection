// app/api/logout/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateCSRF } from "@/lib/security/csrf";

export async function POST(req: Request): Promise<NextResponse> {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
}
