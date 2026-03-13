// app/api/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/features/auth/server/login";
import type { LoginInput } from "@/features/auth/types";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body: unknown = await req.json();

        if (!body || typeof body !== "object") {
            return NextResponse.json(
                { success: false, error: "リクエストが不正です" },
                { status: 400 }
            );
        }

        const input = body as LoginInput;
        const result = await loginUser(input);

        if (!result.success) {
            return NextResponse.json(result, { status: 401 });
        }

        // Cookie は loginUser 内で set 済み
        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("[POST /api/login]", err);
        return NextResponse.json(
            {
                success: false,
                error: "サーバーエラーが発生しました。しばらく後にお試しください。",
            },
            { status: 500 }
        );
    }
}