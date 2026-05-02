// lib/auth/session.ts

import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

export interface SessionPayload {
    userId: string;
    slug: string;
    role: string;
    exp: number; // UNIX timestamp（秒）
}

const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7日

export function signSession(
    payload: Omit<SessionPayload, "exp">
): string {
    const fullPayload: SessionPayload = {
        ...payload,
        exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC,
    };
    const encoded = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
    const sig = createHmac("sha256", env.SESSION_SECRET)
        .update(encoded)
        .digest("hex");
    return `${encoded}.${sig}`;
}

export function verifySession(token: string): SessionPayload | null {
    try {
        const dotIndex = token.lastIndexOf(".");
        if (dotIndex === -1) return null;

        const encoded = token.slice(0, dotIndex);
        const sig = token.slice(dotIndex + 1);

        const expectedSig = createHmac("sha256", env.SESSION_SECRET)
            .update(encoded)
            .digest("hex");

        if (
            !timingSafeEqual(
                Buffer.from(sig, "utf8"),
                Buffer.from(expectedSig, "utf8")
            )
        ) {
            return null;
        }

        const json = Buffer.from(encoded, "base64url").toString("utf8");
        const payload = JSON.parse(json) as SessionPayload;

        // 型チェック
        if (
            typeof payload.userId !== "string" ||
            typeof payload.slug !== "string" ||
            typeof payload.role !== "string" ||
            typeof payload.exp !== "number"
        ) {
            return null;
        }

        // 有効期限チェック
        if (Math.floor(Date.now() / 1000) > payload.exp) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}