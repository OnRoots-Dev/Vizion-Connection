// lib/auth/cookies.ts

import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "vizion_session";

function shouldUseSecureCookie(): boolean {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (baseUrl) return baseUrl.startsWith("https://");
    // next start は production 扱いだが、ローカルHTTP運用もあるためデフォルトは false
    return process.env.NODE_ENV === "production" ? false : false;
}

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7日
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