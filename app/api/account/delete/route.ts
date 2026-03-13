// app/api/account/delete/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { findUserBySlug, deactivateUser } from "@/lib/airtable/users";

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifySession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await findUserBySlug(session.slug);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await deactivateUser(user.id);

    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({ ok: true });
}