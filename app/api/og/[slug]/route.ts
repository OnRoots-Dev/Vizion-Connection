// app/api/og/[slug]/route.ts
//
// ?format=og      → 1200×630  OGP / X用（デフォルト）
// ?format=stories → 1080×1920 Instagram Stories用

import { ImageResponse } from "next/og";
import { getPublicProfileBySlug } from "@/features/profile/server/get-profile-by-slug";
import { createElement as h } from "react";

export const runtime = "edge";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};
const ROLE_GRADIENT: Record<string, string> = {
    Athlete: "#6b0000", Trainer: "#003d1a", Members: "#5a4200", Business: "#001f5a",
};
const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
};

function fallback(w: number, hh: number) {
    return new ImageResponse(
        h("div", { style: { width: `${w}px`, height: `${hh}px`, display: "flex", alignItems: "center", justifyContent: "center", background: "#07070e" } },
            h("span", { style: { fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "monospace" } }, "VIZION CONNECTION")
        ),
        { width: w, height: hh }
    );
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const format = new URL(req.url).searchParams.get("format") ?? "og";
    const isStories = format === "stories";

    const result = await getPublicProfileBySlug(slug);
    if (!result.success || !result.data.isPublic) return fallback(isStories ? 1080 : 1200, isStories ? 1920 : 630);

    const p = result.data;
    const displayName = p.displayName ?? "Vizion Member";
    const role = p.role ?? "Members";
    const bio = p.bio ?? "";
    const sport = p.sport ?? "";
    const region = p.region ?? "Japan";
    const cheerCount = p.cheerCount ?? 0;
    const serialId = p.serialId ? `#${String(p.serialId).padStart(4, "0")}` : "";
    const isFounding = p.isFoundingMember ?? false;
    const avatarUrl = p.avatarUrl ?? p.profileImageUrl ?? null;
    const bgPhotoUrl = p.profileImageUrl ?? null;
    const rl = ROLE_COLOR[role] ?? "#a78bfa";
    const bg1 = ROLE_GRADIENT[role] ?? "#1a1a2e";
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

    // ── Stories: 1080×1920 縦長 ───────────────────────────────────────────────
    if (isStories) {
        const nameFz = displayName.length > 16 ? (displayName.length > 22 ? "48px" : "58px") : "68px";
        return new ImageResponse(
            h("div", { style: { width: "1080px", height: "1920px", display: "flex", flexDirection: "column", background: "#07070e", fontFamily: "sans-serif", overflow: "hidden", position: "relative" } },
                // 背景写真
                bgPhotoUrl && h("img", { src: bgPhotoUrl, alt: displayName, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.22 } }),
                // グロー
                h("div", { style: { position: "absolute", top: "-100px", left: "-100px", width: "700px", height: "700px", borderRadius: "50%", background: `radial-gradient(circle, ${rl}28, transparent 65%)` } }),
                h("div", { style: { position: "absolute", bottom: "-100px", right: "-100px", width: "600px", height: "600px", borderRadius: "50%", background: `radial-gradient(circle, ${bg1}70, transparent 65%)` } }),
                // グラデーションオーバーレイ
                h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(7,7,14,0.65) 0%, rgba(7,7,14,0.25) 40%, rgba(7,7,14,0.25) 60%, rgba(7,7,14,0.88) 100%)" } }),
                // 左ライン
                h("div", { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", background: `linear-gradient(to bottom, transparent, ${rl}, transparent)` } }),

                // メインコンテンツ
                h("div", { style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 80px", position: "relative", zIndex: 1 } },
                    // アバター
                    h("div", { style: { width: "200px", height: "200px", borderRadius: "50%", overflow: "hidden", border: `5px solid ${rl}80`, background: `linear-gradient(145deg, ${bg1}, #111)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 60px ${rl}45`, marginBottom: "48px" } },
                        avatarUrl
                            ? h("img", { src: avatarUrl, alt: displayName, style: { width: "100%", height: "100%", objectFit: "cover" } })
                            : h("span", { style: { fontSize: "72px", fontWeight: 900, color: `${rl}90`, fontFamily: "monospace" } }, initials)
                    ),
                    // バッジ
                    h("div", { style: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "30px", background: `${rl}18`, border: `1px solid ${rl}50`, marginBottom: "24px" } },
                        h("div", { style: { width: "8px", height: "8px", borderRadius: "50%", background: rl } }),
                        h("span", { style: { fontSize: "14px", fontWeight: 700, color: rl, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace" } }, isFounding ? "FOUNDING MEMBER" : "EARLY MEMBER"),
                        serialId && h("span", { style: { fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginLeft: "4px" } }, serialId)
                    ),
                    // Role
                    h("div", { style: { fontSize: "16px", fontWeight: 600, color: rl, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "16px" } }, sport || ROLE_LABEL[role]),
                    // 名前
                    h("div", { style: { fontSize: nameFz, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.05, textAlign: "center", marginBottom: "12px" } }, displayName),
                    // slug + region
                    h("div", { style: { fontSize: "20px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", letterSpacing: "0.03em", marginBottom: "40px" } }, `@${slug}${region ? ` · ${region}` : ""}`),
                    // Bio
                    bio && h("div", { style: { fontSize: "20px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, textAlign: "center", maxWidth: "800px", marginBottom: "48px" } }, bio),
                    // 区切り
                    h("div", { style: { width: "60px", height: "2px", marginBottom: "40px", background: `linear-gradient(90deg, transparent, ${rl}, transparent)` } }),
                    // Stats
                    h("div", { style: { display: "flex", alignItems: "center", gap: "60px" } },
                        h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" } },
                            h("span", { style: { fontSize: "14px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" } }, "Cheer"),
                            h("span", { style: { fontSize: "48px", fontWeight: 900, color: "#FFD600", fontFamily: "monospace", lineHeight: 1 } }, cheerCount.toLocaleString())
                        ),
                        h("div", { style: { width: "1px", height: "48px", background: "rgba(255,255,255,0.1)" } }),
                        h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" } },
                            h("span", { style: { fontSize: "14px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" } }, "Role"),
                            h("span", { style: { fontSize: "28px", fontWeight: 800, color: rl, fontFamily: "monospace", lineHeight: 1 } }, ROLE_LABEL[role])
                        )
                    )
                ),
                // 下部 URL + ロゴ
                h("div", { style: { position: "absolute", bottom: "80px", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", zIndex: 1 } },
                    h("span", { style: { fontSize: "18px", color: "rgba(255,255,255,0.2)", fontFamily: "monospace", letterSpacing: "0.05em" } }, `vizion-connection.jp/u/${slug}`),
                    h("span", { style: { fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.12)", letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "monospace" } }, "VIZION CONNECTION")
                )
            ),
            { width: 1080, height: 1920 }
        );
    }

    // ── OG: 1200×630 横長（既存と同じ）──────────────────────────────────────
    const nameFz = displayName.length > 16 ? (displayName.length > 22 ? "34px" : "42px") : "52px";
    return new ImageResponse(
        h("div", { style: { width: "1200px", height: "630px", display: "flex", background: "#07070e", fontFamily: "sans-serif", overflow: "hidden", position: "relative" } },
            h("div", { style: { width: "420px", height: "630px", flexShrink: 0, position: "relative", display: "flex", background: `linear-gradient(145deg, ${bg1} 0%, #060606 100%)`, overflow: "hidden" } },
                h("div", { style: { position: "absolute", top: "-60px", left: "-60px", width: "320px", height: "320px", background: `radial-gradient(circle, ${rl}35, transparent 65%)` } }),
                bgPhotoUrl
                    ? h("img", { src: bgPhotoUrl, alt: displayName, style: { position: "absolute", bottom: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 } })
                    : h("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "120px", fontWeight: 900, color: `${rl}18`, fontFamily: "monospace" } }, initials),
                h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 50%, #07070e 100%)" } }),
                h("div", { style: { position: "absolute", bottom: 0, left: 0, right: 0, height: "160px", background: "linear-gradient(to top, #07070e, transparent)" } }),
                h("div", { style: { position: "absolute", bottom: "28px", left: "28px", width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", border: `3px solid ${rl}80`, background: `linear-gradient(145deg, ${bg1}, #111)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 24px ${rl}50` } },
                    avatarUrl
                        ? h("img", { src: avatarUrl, alt: displayName, style: { width: "100%", height: "100%", objectFit: "cover" } })
                        : h("span", { style: { fontSize: "28px", fontWeight: 900, color: `${rl}90`, fontFamily: "monospace" } }, initials)
                )
            ),
            h("div", { style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 56px 48px 40px", position: "relative" } },
                h("div", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" } },
                    h("div", { style: { display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "20px", background: `${rl}15`, border: `1px solid ${rl}40` } },
                        h("div", { style: { width: "6px", height: "6px", borderRadius: "50%", background: rl } }),
                        h("span", { style: { fontSize: "11px", fontWeight: 700, color: rl, letterSpacing: "0.15em", fontFamily: "monospace", textTransform: "uppercase" } }, isFounding ? "FOUNDING MEMBER" : "EARLY MEMBER")
                    ),
                    serialId && h("span", { style: { fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.18)", fontFamily: "monospace", letterSpacing: "0.1em", marginLeft: "8px" } }, serialId)
                ),
                h("div", { style: { fontSize: "13px", fontWeight: 600, color: rl, letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "10px" } }, sport || ROLE_LABEL[role]),
                h("div", { style: { fontSize: nameFz, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: "8px" } }, displayName),
                h("div", { style: { fontSize: "16px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", marginBottom: "20px", letterSpacing: "0.03em" } }, `@${slug}${region ? ` · ${region}` : ""}`),
                bio && h("div", { style: { fontSize: "16px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "28px", maxWidth: "520px" } }, bio),
                h("div", { style: { width: "48px", height: "2px", background: `linear-gradient(90deg, ${rl}, transparent)`, marginBottom: "24px" } }),
                h("div", { style: { display: "flex", alignItems: "center", gap: "32px" } },
                    h("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                        h("span", { style: { fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" } }, "Cheer"),
                        h("span", { style: { fontSize: "28px", fontWeight: 900, color: "#FFD600", fontFamily: "monospace", lineHeight: 1 } }, cheerCount.toLocaleString())
                    ),
                    h("div", { style: { width: "1px", height: "36px", background: "rgba(255,255,255,0.08)" } }),
                    h("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                        h("span", { style: { fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" } }, "Role"),
                        h("span", { style: { fontSize: "18px", fontWeight: 800, color: rl, fontFamily: "monospace", lineHeight: 1 } }, ROLE_LABEL[role])
                    )
                ),
                h("div", { style: { position: "absolute", bottom: "36px", right: "56px" } },
                    h("span", { style: { fontSize: "12px", color: "rgba(255,255,255,0.2)", fontFamily: "monospace", letterSpacing: "0.05em" } }, `vizion-connection.jp/u/${slug}`)
                )
            ),
            h("div", { style: { position: "absolute", top: "28px", right: "56px" } },
                h("span", { style: { fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace" } }, "VIZION CONNECTION")
            ),
            h("div", { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: `linear-gradient(to bottom, transparent, ${rl}, transparent)` } })
        ),
        { width: 1200, height: 630 }
    );
}