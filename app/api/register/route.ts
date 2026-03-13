// app/api/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/features/auth/server/register";
import type { RegisterInput } from "@/features/auth/types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "リクエストが不正です" },
        { status: 400 }
      );
    }

    const input = body as RegisterInput;
    const result = await registerUser(input);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    // 詳細エラーをログに出す
    console.error("[POST /api/register] 詳細エラー:", err);
    console.error("[POST /api/register] スタック:", err instanceof Error ? err.stack : err);

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "サーバーエラーが発生しました",
      },
      { status: 500 }
    );
  }
}