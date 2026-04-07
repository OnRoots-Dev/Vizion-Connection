import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { recordDiscoveryEvent } from "@/lib/supabase/discovery-events";

const schema = z.object({
  eventType: z.enum(["impression", "detail_open", "search"]),
  targetSlug: z.string().trim().min(1).max(100).optional(),
  queryText: z.string().trim().max(200).optional(),
  source: z.string().trim().max(50).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "bad_request" }, { status: 400 });
    }

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySession(token) : null;

    await recordDiscoveryEvent({
      viewerSlug: session?.slug ?? null,
      targetSlug: parsed.data.targetSlug ?? null,
      queryText: parsed.data.queryText ?? null,
      eventType: parsed.data.eventType,
      source: parsed.data.source ?? "dashboard",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/discovery/track]", err);
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
