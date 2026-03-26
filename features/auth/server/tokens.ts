// features/auth/server/tokens.ts

import { randomBytes } from "crypto";
import { createVerifyToken } from "@/lib/supabase/data/tokens.server";
import { env } from "@/lib/env";

export function generateToken(): string {
    return randomBytes(32).toString("hex");
}

// メールリンクは /api/verify に直接送る
export function buildVerifyUrl(token: string, redirectTo?: string): string { // ← 修正
    const base = `${env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${token}`; // ← 修正
    return redirectTo ? `${base}&redirect=${encodeURIComponent(redirectTo)}` : base; // ← 修正
}

export async function issueVerifyToken(
    email: string,
    slug: string,
    redirectTo?: string // ← 修正
): Promise<{ token: string; verifyUrl: string }> {
    const token = generateToken();
    await createVerifyToken(token, email, slug);
    const verifyUrl = buildVerifyUrl(token, redirectTo); // ← 修正
    return { token, verifyUrl };
}