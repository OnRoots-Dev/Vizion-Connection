// app/api/og/pulse/route.tsx
import { ImageResponse } from "next/og";
import { createElement as h } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import { computeStreak, computePulseScore } from "@/lib/pulse-stats";
import { withCache } from "@/lib/og/response-helper";

export const runtime = "nodejs";

const ACCENT = "#C8E800";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") ?? "";

    let score = 0, streak = 0, cheerCount = 0, bondCount = 0, displayName = slug;

    if (slug) {
        try {
            const since365 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
            const [journeysRes, userRes, followsRes] = await Promise.all([
                supabaseServer
                    .from("journeys")
                    .select("created_at")
                    .eq("user_slug", slug)
                    .gte("created_at", since365),
                supabaseServer
                    .from("users")
                    .select("cheer_count, display_name")
                    .eq("slug", slug)
                    .single(),
                supabaseServer
                    .from("user_follows")
                    .select("id", { count: "exact", head: true })
                    .eq("following_slug", slug),
            ]);
            streak = computeStreak((journeysRes.data ?? []).map((r) => r.created_at as string));
            cheerCount = (userRes.data?.cheer_count as number | null) ?? 0;
            bondCount = followsRes.count ?? 0;
            score = computePulseScore(streak, cheerCount, bondCount);
            displayName = (userRes.data as { display_name?: string } | null)?.display_name ?? slug;
        } catch { /* サイレント */ }
    }

    const element = h("div", {
        style: {
            width: "1200px", height: "630px",
            display: "flex", position: "relative",
            background: "#050508",
            overflow: "hidden",
            fontFamily: "monospace, sans-serif",
        }
    },
        // グリッドライン
        h("div", { style: { position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg, ${ACCENT}08 0px, ${ACCENT}08 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, ${ACCENT}08 0px, ${ACCENT}08 1px, transparent 1px, transparent 60px)`, display: "flex" } }),

        // 右上グロー
        h("div", { style: { position: "absolute", right: "-10%", top: "-20%", width: "500px", height: "500px", background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 65%)`, display: "flex" } }),

        // 左下グロー
        h("div", { style: { position: "absolute", left: "-5%", bottom: "-20%", width: "400px", height: "400px", background: `radial-gradient(circle, ${ACCENT}10 0%, transparent 65%)`, display: "flex" } }),

        // 左テキストエリア
        h("div", {
            style: {
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: "52%", display: "flex", flexDirection: "column",
                justifyContent: "center", padding: "56px 48px",
            }
        },
            h("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" } },
                h("div", { style: { width: "32px", height: "2px", background: ACCENT, display: "flex" } }),
                h("span", { style: { fontSize: "11px", fontWeight: 900, letterSpacing: "0.32em", textTransform: "uppercase", color: ACCENT, fontFamily: "monospace" } }, "PULSE SCORE")
            ),
            h("div", { style: { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "32px" } },
                h("span", { style: { fontSize: "11px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", fontFamily: "monospace", fontWeight: 700 } }, `@${displayName}`),
                h("div", { style: { fontSize: "140px", fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.04em", display: "flex", textShadow: `0 0 60px ${ACCENT}40` } }, String(score))
            ),
            // 3要素
            h("div", { style: { display: "flex", gap: "24px" } },
                ...[
                    { label: "継続", value: `${streak}日`, color: ACCENT },
                    { label: "Cheer", value: String(cheerCount), color: "#FFD600" },
                    { label: "Bond", value: `${bondCount}人`, color: "rgba(255,255,255,0.7)" },
                ].map(item =>
                    h("div", { key: item.label, style: { display: "flex", flexDirection: "column", gap: "4px" } },
                        h("span", { style: { fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" } }, item.label),
                        h("span", { style: { fontSize: "28px", fontWeight: 900, color: item.color, lineHeight: 1 } }, item.value)
                    )
                )
            )
        ),

        // 右: 28日ドットグリッド
        h("div", {
            style: {
                position: "absolute", right: "56px", top: "50%",
                transform: "translateY(-50%)",
                display: "flex", flexDirection: "column", gap: "6px",
                alignItems: "center",
            }
        },
            h("span", { style: { fontSize: "8px", fontFamily: "monospace", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: "10px", display: "flex" } }, "28 DAYS"),
            h("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px", width: "180px", justifyContent: "flex-start" } },
                ...Array.from({ length: 28 }, (_, i) =>
                    h("div", {
                        key: i,
                        style: {
                            width: "16px", height: "16px", borderRadius: "50%",
                            background: i >= 28 - streak ? ACCENT : "rgba(255,255,255,0.08)",
                            display: "flex",
                        }
                    })
                )
            )
        ),

        // ロゴ（左下）
        h("div", { style: { position: "absolute", bottom: "20px", left: "48px", display: "flex", alignItems: "center", gap: "6px" } },
            h("div", { style: { width: "8px", height: "8px", borderRadius: "50%", background: ACCENT, display: "flex" } }),
            h("span", { style: { fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", fontFamily: "monospace" } }, "VIZION CONNECTION")
        ),

        // 右下 watermark
        h("div", { style: { position: "absolute", bottom: "20px", right: "56px", display: "flex" } },
            h("span", { style: { fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.1)", fontFamily: "monospace" } }, "PROOF OF PULSE")
        )
    );

    return withCache(new ImageResponse(element, { width: 1200, height: 630 }));
}
