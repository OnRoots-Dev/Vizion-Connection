import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { createElement as h } from "react";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug } from "@/lib/supabase/data/users.server";

export const runtime = "nodejs";

function withCache(r: ImageResponse): Response {
    const headers = new Headers(r.headers);
    headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return new NextResponse(r.body, { headers, status: r.status });
}

export async function GET(req: Request) {
    try {
        const qs = new URL(req.url).searchParams;
        const ref = qs.get("ref");

        let foundingNumber: number | null = null;

        if (ref) {
            const user = await findUserBySlug(ref);
            foundingNumber = user?.foundingNumber ?? null;
        } else {
            const cookieStore = await cookies();
            const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
            const session = token ? verifySession(token) : null;
            if (session?.slug) {
                const user = await findUserBySlug(session.slug);
                foundingNumber = user?.foundingNumber ?? null;
            }
        }

        const label = foundingNumber
            ? `Founding Member #${String(foundingNumber).padStart(4, "0")}`
            : "Vizion Connection";

        const w = 1200;
        const hh = 630;

        const el = h(
            "div",
            {
                style: {
                    width: `${w}px`,
                    height: `${hh}px`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "56px",
                    background: "radial-gradient(circle at 15% 20%, rgba(255,214,0,0.15), transparent 60%), radial-gradient(circle at 80% 0%, rgba(124,58,237,0.18), transparent 55%), linear-gradient(145deg, #07070e 0%, #0b0906 55%, #07070e 100%)",
                    color: "#fff",
                    fontFamily: "sans-serif",
                },
            },
            h(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: "10px" } },
                h(
                    "div",
                    {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 14px",
                            borderRadius: "999px",
                            border: "1px solid rgba(255,214,0,0.45)",
                            background: "rgba(255,214,0,0.12)",
                            alignSelf: "flex-start",
                        },
                    },
                    h("span", { style: { fontSize: "12px", letterSpacing: "0.22em", fontFamily: "monospace", fontWeight: 900, color: "#FFD600" } }, "REFERRAL")
                ),
                h(
                    "div",
                    { style: { fontSize: "64px", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.05, textShadow: "0 12px 40px rgba(0,0,0,0.45)" } },
                    label
                ),
                h(
                    "div",
                    { style: { fontSize: "18px", color: "rgba(255,255,255,0.65)", fontFamily: "monospace", letterSpacing: "0.08em" } },
                    "Join via invite link"
                )
            ),
            h(
                "div",
                { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" } },
                h(
                    "div",
                    { style: { display: "flex", flexDirection: "column", gap: "6px" } },
                    h("div", { style: { fontSize: "10px", letterSpacing: "0.28em", color: "rgba(255,255,255,0.35)", fontFamily: "monospace" } }, "VIZION CONNECTION"),
                    h("div", { style: { fontSize: "12px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.18)", fontFamily: "monospace" } }, "vzion.jp")
                ),
                h(
                    "div",
                    { style: { fontSize: "12px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", fontFamily: "monospace" } },
                    "Share · Invite · Earn"
                )
            )
        );

        return withCache(new ImageResponse(el, { width: w, height: hh }));
    } catch (err) {
        console.error("[GET /api/og/referral]", err);
        const w = 1200;
        const hh = 630;
        return withCache(
            new ImageResponse(
                h(
                    "div",
                    { style: { width: `${w}px`, height: `${hh}px`, display: "flex", alignItems: "center", justifyContent: "center", background: "#07070e", color: "rgba(255,255,255,0.6)", fontFamily: "monospace" } },
                    "VIZION CONNECTION"
                ),
                { width: w, height: hh }
            )
        );
    }
}
