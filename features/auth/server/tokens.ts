// features/auth/server/tokens.ts

import { randomBytes } from "crypto";
import { createVerifyToken } from "@/lib/supabase/data/tokens.server";
import { env } from "@/lib/env";

export function generateToken(): string {
    return randomBytes(32).toString("hex");
}

export function buildVerifyUrl(token: string, redirectTo?: string): string { 
    const base = `${env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`; 
    return redirectTo ? `${base}&redirect=${encodeURIComponent(redirectTo)}` : base; 
}

export async function issueVerifyToken(
    email: string,
    slug: string,
    redirectTo?: string 
): Promise<{ token: string; verifyUrl: string }> {
    const token = generateToken();
    await createVerifyToken(token, email, slug);
    const verifyUrl = buildVerifyUrl(token, redirectTo);
    return { token, verifyUrl };
}