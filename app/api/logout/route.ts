// app/api/logout/route.ts

import { NextResponse } from "next/server";
import { deleteSessionCookie } from "@/lib/auth/cookies";

export async function POST(): Promise<NextResponse> {
    await deleteSessionCookie();
    return NextResponse.json({ ok: true });
}