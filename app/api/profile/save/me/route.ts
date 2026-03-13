import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { getProfileFromSession } from "@/features/profile/server/get-profile";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = verifySession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await getProfileFromSession();
    if (!result.success) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ profile: result.data.profile });
}