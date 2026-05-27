import { NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { getCollectedCards } from "@/lib/supabase/collections";

export async function GET(): Promise<NextResponse> {
    try {
        const session = await getSupabaseProfile();
        if (!session) return NextResponse.json({ cards: [] });

        const cards = await getCollectedCards(session.slug);
        return NextResponse.json({ cards });
    } catch {
        return NextResponse.json({ cards: [] });
    }
}
