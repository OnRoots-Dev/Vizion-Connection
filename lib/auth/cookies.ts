// lib/auth/cookies.ts

import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "vizion_session";

function shouldSetCookieDomain(): string | undefined {
    if (process.env.NODE_ENV !== "production") return undefined;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) return ".vizion-connection.jp";

    try {
        const hostname = new URL(baseUrl).hostname;
        if (hostname === "vizion-connection.jp" || hostname.endsWith(".vizion-connection.jp")) {
            return ".vizion-connection.jp";
        }
        return undefined;
    } catch {
        return ".vizion-connection.jp";
    }
}

function shouldUseSecureCookie(): boolean {
    // Local dev runs on http://localhost; secure cookies would be dropped and login would fail.
    // Prefer explicit production flag so .env pointing to the prod domain doesn't force secure locally.
    if (process.env.NODE_ENV !== "production") return false;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (baseUrl) return baseUrl.startsWith("https://");

    // Fallback: production without explicit BASE_URL -> assume https
    return true;
}

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7日
    domain: shouldSetCookieDomain(),
};

export async function setSessionCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);
}

export async function getSessionCookie(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function deleteSessionCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}
