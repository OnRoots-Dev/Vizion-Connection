// app/api/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/features/auth/server/verify";
import { setSessionCookie } from "@/lib/auth/cookies";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const token = req.nextUrl.searchParams.get("token");

    // 1. トークンがない場合（JSONでエラーを返す）
    if (!token) {
        return NextResponse.json(
            { success: false, error: "認証トークンが見つかりません。" },
            { status: 400 }
        );
    }

    // 2. サーバーサイドロジックの実行（service_roleによるDB更新を含む）
    const result = await verifyEmailToken(token);

    // 3. 認証失敗時（JSONでエラーメッセージを返す）
    if (!result.success) {
        return NextResponse.json(
            { success: false, error: result.error },
            { status: 400 }
        );
    }

    // 4. 成功時：セッションクッキーをセット
    await setSessionCookie(result.sessionToken);

    // 5. 成功レスポンスを返す
    // VerifyContent 側が期待する role や slug を含めて返却します
    return NextResponse.json({
        success: true,
        role: result.role,
        slug: result.slug
    });
}