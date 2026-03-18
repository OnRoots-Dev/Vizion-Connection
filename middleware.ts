// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifySessionEdge } from "@/lib/auth/session-edge";

// 認証が必要なパス
const PROTECTED_PATHS = ["/dashboard"];

// 認証済みユーザーがアクセスできないパス（ログイン済みなら/dashboardへ）
const AUTH_PATHS = ["/login", "/register"];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionEdge(token) : null;

    // 保護ルートへの未認証アクセス → /loginへリダイレクト
    const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
    if (isProtected && !session) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    // ログイン済みで/login・/registerへのアクセス → /dashboardへ
    const isAuthPath = AUTH_PATHS.some(p => pathname.startsWith(p));
    if (isAuthPath && session) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/login",
        "/register",
    ],
};