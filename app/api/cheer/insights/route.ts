// app/api/cheer/insights/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { supabaseServer } from "@/lib/supabase/server";

type UserMeta = {
  slug: string;
  role: string | null;
  region: string | null;
  sport: string | null;
};

function bump(map: Record<string, number>, key: string | null | undefined) {
  const normalized = (key ?? "").trim();
  if (!normalized) return;
  map[normalized] = (map[normalized] ?? 0) + 1;
}

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: cheers, error } = await supabaseServer
      .from("cheers")
      .select("from_slug")
      .eq("to_slug", session.slug)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) {
      return NextResponse.json({ success: false, error: "Cheerの集計に失敗しました" }, { status: 500 });
    }

    const rows = cheers ?? [];
    const fromSlugs = Array.from(
      new Set(
        rows
          .map((row: any) => (row.from_slug as string | null) ?? "")
          .filter((value: string) => Boolean(value)),
      ),
    );

    const anonymous = rows.filter((row: any) => !row.from_slug).length;

    let userMetas: UserMeta[] = [];
    if (fromSlugs.length > 0) {
      const { data: users } = await supabaseServer
        .from("users")
        .select("slug, role, region, sport")
        .in("slug", fromSlugs);
      userMetas = (users ?? []) as unknown as UserMeta[];
    }

    const metaMap = new Map(userMetas.map((u) => [String(u.slug), u]));

    const byRole: Record<string, number> = {};
    const byRegion: Record<string, number> = {};
    const bySport: Record<string, number> = {};

    rows.forEach((row: any) => {
      const fromSlug = (row.from_slug as string | null) ?? null;
      if (!fromSlug) return;
      const meta = metaMap.get(fromSlug);
      if (!meta) return;
      bump(byRole, meta.role);
      bump(byRegion, meta.region);
      bump(bySport, meta.sport);
    });

    return NextResponse.json({
      success: true,
      insights: {
        total: rows.length,
        anonymous,
        byRole,
        byRegion,
        bySport,
      },
    });
  } catch (err) {
    console.error("[GET /api/cheer/insights]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
