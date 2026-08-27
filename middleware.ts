// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware-client";
import { findSealedTopLevelPath, isSealedApiPath } from "@/config/mvp-scope";

// 認証が必要なパス
const PROTECTED_PATHS = [
  "/dashboard",
  "/dashboard/business/checkout",
  "/business/complete",
  "/news-rooms",
  "/onboarding",
];

// 認証済みユーザーがアクセスできないパス（ログイン済みならアプリのトップへ）
const AUTH_PATHS = ["/login", "/register"];

const MARKETING_PATHS = ["/"]; // LPの実際のパスに合わせて調整済みのものを維持

const APP_PATHS = [
  "/dashboard",
  "/news-rooms",
  "/business",
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
            "next-router-segment-prefetch",
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

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const host = getRequestHost(req);
    const isApp = host === "app.vizion-connection.jp" || host.startsWith("app.");
    const isInternalRequest = isNextInternalRequest(req);
    const isLocalDevHost = host === "localhost" || host === "127.0.0.1";

    if (req.method === "OPTIONS") {
        return applyCors(req, new NextResponse(null, { status: 204 }));
    }

    // Cookie Domain=.vizion-connection.jp / SameSite=None; Secure は
    // createMiddlewareClient → cookie-options.ts で付与される。
    // getUser() 呼び出し時にセッション Cookie が再発行され、両サブドメインで共有される。
    const { supabase, getResponse } = createMiddlewareClient(req);

    // Avoid cross-origin redirects for App Router internals such as RSC and prefetch.
    if (isInternalRequest) {
        // 内部リクエストでもセッション更新は行う（Cookie 再適用ののため）
        await supabase.auth.getUser();
        return applyCors(req, getResponse());
    }

    // MVPスコープガード: 封印ルートへの直接アクセスはMVP画面へリダイレクト
    const sealedPath = findSealedTopLevelPath(pathname);
    if (sealedPath) {
        const toDashboard = ["/pulse", "/timeline", "/discovery", "/business-hub", "/news-rooms"];
        return applyCors(req, NextResponse.redirect(new URL(toDashboard.includes(sealedPath) ? "/dashboard" : "/", req.nextUrl)));
    }

    // MVPスコープガード: 封印APIは存在しないものとして404（Webhook/Auth配下は対象外）
    if (isSealedApiPath(pathname)) {
        return applyCors(req, new NextResponse(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        }));
    }

    // Local development should stay on the same host.
    // Otherwise it becomes impossible to test login flows locally.
    if (process.env.NODE_ENV !== "production" || isLocalDevHost) {
        await supabase.auth.getUser();
        return applyCors(req, getResponse());
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

    const {
        data: { user },
    } = await supabase.auth.getUser();
    const session = user
        ? { slug: user.user_metadata.slug as string | undefined, role: user.user_metadata.role as string | undefined }
        : null;

    // 保護ルートへの未認証アクセス → /loginへリダイレクト
    const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
    if (isProtected && !session) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return applyCors(req, NextResponse.redirect(url));
    }

    // ログイン済みで /login・/register へ来た場合:
    // メール認証直後の新規が dashboard に落ちるのを防ぐため、直接 /dashboard へ送る。
    // CareerWizardModal が初回ユーザーに自動表示される。
    const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));
    if (isAuthPath && session) {
        const dashboardUrl = req.nextUrl.clone();
        dashboardUrl.pathname = "/dashboard";
        dashboardUrl.search = "";
        return applyCors(req, NextResponse.redirect(dashboardUrl));
    }

    return applyCors(req, getResponse());
}

export const config = {
    matcher: [
        "/",
        "/dashboard/:path*",
        "/business/:path*",
        "/business-hub/:path*",
        "/news-rooms/:path*",
        "/news/:path*",
        "/api/:path*",
        "/pulse",
        "/timeline",
        "/ranking",
        "/discovery",
        "/roadmap",
        "/voicelab",
        "/demo",
        "/company",
        "/contact",
        "/r/:path*",
        "/login",
        "/register",
        "/reset-password",
        "/thanks",
        "/auth/confirm",
    ],
};
