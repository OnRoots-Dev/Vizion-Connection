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

const CORS_ALLOWED_ORIGINS = new Set([
    "https://vizion-connection.jp",
    "https://app.vizion-connection.jp",
    "http://localhost:3000",
]);

function normalizeOrigin(value: string | null | undefined): string {
    if (!value) return "";
    try {
        return new URL(value).origin;
    } catch {
        return value.trim();
    }
}

function applyCors(req: NextRequest, res: NextResponse): NextResponse {
    const origin = normalizeOrigin(req.headers.get("origin"));
    if (!origin || !CORS_ALLOWED_ORIGINS.has(origin)) return res;

    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Vary", "Origin");
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.headers.set(
        "Access-Control-Allow-Headers",
        [
            "rsc",
            "next-router-state-tree",
            "next-router-prefetch",
            "next-url",
            "content-type",
            "x-requested-with",
        ].join(",")
    );
    return res;
}

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

    if (req.method === "OPTIONS") {
        return applyCors(req, new NextResponse(null, { status: 204 }));
    }

    // Avoid cross-origin redirects for App Router internals such as RSC and prefetch.
    if (isInternalRequest) {
        return applyCors(req, NextResponse.next());
    }

    if (isApp) {
        const isMarketing = MARKETING_PATHS.some((p) => pathname === p);
        if (isMarketing) {
            return applyCors(req, NextResponse.redirect(new URL("https://vizion-connection.jp" + pathname)));
        }
    } else {
        const isAppPath = APP_PATHS.some((p) => pathname.startsWith(p));
        if (isAppPath) {
            return applyCors(
                req,
                NextResponse.redirect(
                    new URL("https://app.vizion-connection.jp" + pathname + req.nextUrl.search)
                )
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
        return applyCors(req, NextResponse.redirect(url));
    }

    // ログイン済みで/login・/registerへのアクセス → /dashboardへ
    const isAuthPath = AUTH_PATHS.some(p => pathname.startsWith(p));
    if (isAuthPath && session) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return applyCors(req, NextResponse.redirect(url));
    }

    return applyCors(req, NextResponse.next());
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
