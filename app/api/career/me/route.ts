// app/api/career/me/route.ts
import { NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { getCareerProfile } from "@/lib/supabase/career-profiles";

export async function GET() {
    const session = await getSupabaseProfile();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const careerProfile = await getCareerProfile(session.slug);
    return NextResponse.json({ careerProfile });
}
