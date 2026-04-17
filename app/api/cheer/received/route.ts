import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { supabaseServer } from "@/lib/supabase/server";

type CheerReceivedItem = {
    id: string;
    fromSlug: string;
    fromDisplayName: string;
    role?: string | null;
    region?: string | null;
    prefecture?: string | null;
    sport?: string | null;
    avatarUrl?: string | null;
    profileImageUrl?: string | null;
    comment?: string | null;
    createdAt?: string | null;
};

export async function GET(req: Request): Promise<NextResponse> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (!token) return NextResponse.json({ items: [] });

        const session = verifySession(token);
        if (!session) return NextResponse.json({ items: [] });

        const url = new URL(req.url);
        const limitParam = Number(url.searchParams.get("limit") ?? "30");
        const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 30;

        const { data: cheers, error } = await supabaseServer
            .from("cheers")
            .select("id, from_slug, comment, created_at")
            .eq("to_slug", session.slug)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error || !cheers) return NextResponse.json({ items: [] });

        const fromSlugs = Array.from(new Set(
            cheers
                .map((row) => (row.from_slug as string | null) ?? "")
                .filter((slug) => Boolean(slug)),
        ));

        const userMap = new Map<string, {
            displayName: string;
            role: string | null;
            region: string | null;
            prefecture: string | null;
            sport: string | null;
            avatarUrl: string | null;
            profileImageUrl: string | null;
        }>();

        if (fromSlugs.length > 0) {
            const { data: users } = await supabaseServer
                .from("users")
                .select("slug, display_name, role, region, prefecture, sport, avatar_url, profile_image_url")
                .in("slug", fromSlugs);

            (users ?? []).forEach((u) => {
                const slug = String((u as any).slug);
                userMap.set(slug, {
                    displayName: String((u as any).display_name ?? slug),
                    role: ((u as any).role ?? null) as string | null,
                    region: ((u as any).region ?? null) as string | null,
                    prefecture: ((u as any).prefecture ?? null) as string | null,
                    sport: ((u as any).sport ?? null) as string | null,
                    avatarUrl: ((u as any).avatar_url ?? null) as string | null,
                    profileImageUrl: ((u as any).profile_image_url ?? null) as string | null,
                });
            });
        }

        const items: CheerReceivedItem[] = (cheers ?? []).map((row) => {
            const fromSlug = String((row as any).from_slug ?? "anonymous");
            const fromMeta = userMap.get(fromSlug);
            return {
                id: String((row as any).id),
                fromSlug,
                fromDisplayName: fromMeta?.displayName ?? fromSlug,
                role: fromMeta?.role ?? null,
                region: fromMeta?.region ?? null,
                prefecture: fromMeta?.prefecture ?? null,
                sport: fromMeta?.sport ?? null,
                avatarUrl: fromMeta?.avatarUrl ?? null,
                profileImageUrl: fromMeta?.profileImageUrl ?? null,
                comment: (((row as any).comment ?? null) as string | null) ?? null,
                createdAt: (((row as any).created_at ?? null) as string | null) ?? null,
            };
        });

        return NextResponse.json({ items });
    } catch {
        return NextResponse.json({ items: [] });
    }
}
