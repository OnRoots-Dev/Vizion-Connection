import { NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { getProfileFromSession } from "@/features/profile/server/get-profile";

export async function GET() {
    const session = await getSupabaseProfile();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await getProfileFromSession();
    if (!result.success) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ profile: result.data.profile });
}
