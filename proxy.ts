// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifySessionEdge } from "@/lib/auth/session-edge";

// 認証が必要なパス
const PROTECTED_PATHS = ["/dashboard", "/news-rooms"];

// 認証済みユーザーがアクセスできないパス（ログイン済みなら/dashboardへ）
const AUTH_PATHS = ["/login", "/register", "/reset-password", "/verify", "/thanks"];

const MARKETING_PATHS = ["/"]; // LPの実際のパスに合わせて調整済みのものを維持

const APP_PATHS = [
  "/dashboard",
  "/news-rooms",
  "/login",
  "/register",
  "/reset-password",
  "/verify",
  "/thanks",
];

function normalizeHost(value: string | null | undefined): string {
    if (!value) return "";
    return value.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
}

function getRequestHost(req: NextRequest): string {
    return normalizeHost(
        req.headers.get("x-forwarded-host") ??
        req.headers.get("host") ??
        req.nextUrl.host
    );
}

function isNextInternalRequest(req: NextRequest): boolean {
    const purpose = req.headers.get("purpose") ?? req.headers.get("sec-purpose") ?? "";
    return (
        req.nextUrl.searchParams.has("_rsc") ||
        req.headers.has("rsc") ||
        req.headers.has("next-router-state-tree") ||
        req.headers.has("next-router-prefetch") ||
        purpose.toLowerCase().includes("prefetch")
    );
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const host = getRequestHost(req);
    const isApp = host === "app.vizion-connection.jp" || host.startsWith("app.");
    const isInternalRequest = isNextInternalRequest(req);

    // Avoid cross-origin redirects for App Router internals such as RSC and prefetch.
    if (isInternalRequest) {
        return NextResponse.next();
    }

    if (isApp) {
        const isMarketing = MARKETING_PATHS.some((p) => pathname === p);
        if (isMarketing) {
            return NextResponse.redirect(new URL("https://vizion-connection.jp" + pathname));
        }
    } else {
        const isAppPath = APP_PATHS.some((p) => pathname.startsWith(p));
        if (isAppPath) {
            return NextResponse.redirect(
                new URL("https://app.vizion-connection.jp" + pathname + req.nextUrl.search)
            );
        }
    }

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
        "/",
        "/dashboard/:path*",
        "/news-rooms/:path*",
        "/login",
        "/register",
        "/reset-password",
        "/verify",
        "/thanks",
    ],
};
