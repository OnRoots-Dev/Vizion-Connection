import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { getCollectedCards } from "@/lib/supabase/collections";

export async function GET(): Promise<NextResponse> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (!token) return NextResponse.json({ cards: [] });

        const session = verifySession(token);
        if (!session) return NextResponse.json({ cards: [] });

        const cards = await getCollectedCards(session.slug);
        return NextResponse.json({ cards });
    } catch {
        return NextResponse.json({ cards: [] });
    }
}

