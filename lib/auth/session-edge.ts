// lib/auth/session-edge.ts
// Edge Runtime compatible session verification (no Node "crypto" import).

import { env } from "@/lib/env";
import type { SessionPayload } from "@/lib/auth/session";

function base64UrlToBytes(input: string): Uint8Array {
    // base64url -> base64
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padLen);

    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function bytesToHex(bytes: ArrayBuffer): string {
    const arr = new Uint8Array(bytes);
    let out = "";
    for (const b of arr) out += b.toString(16).padStart(2, "0");
    return out;
}

async function hmacSha256Hex(key: string, message: string): Promise<string> {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        enc.encode(key),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
    return bytesToHex(sig);
}

function isValidPayload(payload: any): payload is SessionPayload {
    return (
        payload &&
        typeof payload === "object" &&
        typeof payload.userId === "string" &&
        typeof payload.slug === "string" &&
        typeof payload.role === "string" &&
        typeof payload.exp === "number"
    );
}

export async function verifySessionEdge(token: string): Promise<SessionPayload | null> {
    try {
        const dotIndex = token.lastIndexOf(".");
        if (dotIndex === -1) return null;

        const encoded = token.slice(0, dotIndex);
        const sig = token.slice(dotIndex + 1);

        const expectedSig = await hmacSha256Hex(env.SESSION_SECRET, encoded);
        if (sig.length !== expectedSig.length) return null;
        if (sig !== expectedSig) return null;

        const json = new TextDecoder().decode(base64UrlToBytes(encoded));
        const payload = JSON.parse(json);
        if (!isValidPayload(payload)) return null;

        if (Math.floor(Date.now() / 1000) > payload.exp) return null;
        return payload;
    } catch {
        return null;
    }
}

