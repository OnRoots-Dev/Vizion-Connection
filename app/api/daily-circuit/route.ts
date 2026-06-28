import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseProfile } from "@/lib/auth/session";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { supabaseServer } from "@/lib/supabase/server";

// DAILY CIRCUIT の永続化（daily_circuits テーブル）。
// RLS 有効テーブルのため読み書きは service role 経由（[[rls-client-write-policy]]）。
// circuit_date は JST 基準。

const bodySchema = z.object({
  action: z.enum(["journey", "cheer", "timeline"]),
});

const COLUMN: Record<"journey" | "cheer" | "timeline", "journey_done" | "cheer_done" | "timeline_done"> = {
  journey: "journey_done",
  cheer: "cheer_done",
  timeline: "timeline_done",
};

function jstDateKey(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

type CircuitRow = {
  journey_done: boolean | null;
  cheer_done: boolean | null;
  timeline_done: boolean | null;
  completed: boolean | null;
};

function shape(row: CircuitRow | null) {
  const journey = !!row?.journey_done;
  const cheer = !!row?.cheer_done;
  const timeline = !!row?.timeline_done;
  return { journey, cheer, timeline, completed: !!row?.completed || (journey && cheer && timeline) };
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getSupabaseProfile();
    if (!session) {
      return NextResponse.json({ circuit: shape(null) }, { status: 401 });
    }

    const { data } = await supabaseServer
      .from("daily_circuits")
      .select("journey_done,cheer_done,timeline_done,completed")
      .eq("user_id", session.id)
      .eq("circuit_date", jstDateKey())
      .maybeSingle();

    return NextResponse.json({ circuit: shape(data as CircuitRow | null) });
  } catch (err) {
    console.error("[GET /api/daily-circuit]", err);
    return NextResponse.json({ circuit: shape(null), error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const csrfError = validateCSRF(req);
  if (csrfError) return csrfError as unknown as NextResponse;

  try {
    const session = await getSupabaseProfile();
    if (!session) {
      return NextResponse.json({ success: false, error: "セッションが無効です" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await readLimitedJson(req);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) {
        return NextResponse.json({ success: false, error: "データが大きすぎます" }, { status: 413 });
      }
      return NextResponse.json({ success: false, error: "リクエストが不正です" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "入力内容を確認してください" }, { status: 400 });
    }

    const circuitDate = jstDateKey();
    const column = COLUMN[parsed.data.action];

    // 当日の行を取得（無ければ全フラグ false 起点）
    const { data: existing } = await supabaseServer
      .from("daily_circuits")
      .select("journey_done,cheer_done,timeline_done")
      .eq("user_id", session.id)
      .eq("circuit_date", circuitDate)
      .maybeSingle();

    const next = {
      journey_done: !!existing?.journey_done,
      cheer_done: !!existing?.cheer_done,
      timeline_done: !!existing?.timeline_done,
    };
    next[column] = true;
    const completed = next.journey_done && next.cheer_done && next.timeline_done;

    const { data, error } = await supabaseServer
      .from("daily_circuits")
      .upsert(
        { user_id: session.id, circuit_date: circuitDate, ...next, completed },
        { onConflict: "user_id,circuit_date" },
      )
      .select("journey_done,cheer_done,timeline_done,completed")
      .single();

    if (error) {
      console.error("[POST /api/daily-circuit] upsert error:", error);
      return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, circuit: shape(data as CircuitRow) });
  } catch (err) {
    console.error("[POST /api/daily-circuit]", err);
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
