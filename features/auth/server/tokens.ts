// features/auth/server/tokens.ts

import { randomBytes } from "crypto";
import { createVerifyToken } from "@/lib/airtable/verify-tokens";
import { env } from "@/lib/env";

export function generateToken(): string {
    return randomBytes(32).toString("hex");
}

// メールリンクは /api/verify に直接送る
export function buildVerifyUrl(token: string): string {
    return `${env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${token}`;
}

export async function issueVerifyToken(
    email: string,
    slug: string
): Promise<{ token: string; verifyUrl: string }> {
    const token = generateToken();
    await createVerifyToken(token, email, slug);
    const verifyUrl = buildVerifyUrl(token);
    return { token, verifyUrl };
}