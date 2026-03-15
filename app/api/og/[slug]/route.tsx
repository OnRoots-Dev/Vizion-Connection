// app/api/og/[slug]/route.tsx
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
    const serialId = p.serialId ?? "";
    const isFounding = p.isFoundingMember ?? false;
    const avatarUrl = p.avatarUrl ?? p.profileImageUrl ?? null;
    const bgPhotoUrl = p.profileImageUrl ?? null;
    const rl = ROLE_COLOR[role] ?? "#a78bfa";
    const bg1 = ROLE_GRADIENT[role] ?? "#1a1a2e";
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

    // ── Stories: 1080×1920 縦長 ───────────────────────────────────────────────
    if (isStories) {
        const nameFz = displayName.length > 16 ? (displayName.length > 22 ? "72px" : "88px") : "108px";
        return new ImageResponse(
            h("div", { style: { width: "1080px", height: "1920px", display: "flex", flexDirection: "column", background: "#07070e", fontFamily: "sans-serif", overflow: "hidden", position: "relative" } },

                // 背景写真（フルブリード・暗め）
                bgPhotoUrl && h("img", { src: bgPhotoUrl, alt: displayName, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.10 } }),

                // 背景グラデーションオーバーレイ（上下を暗く、中央も締める）
                h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(7,7,14,0.82) 0%, rgba(7,7,14,0.55) 30%, rgba(7,7,14,0.55) 70%, rgba(7,7,14,0.92) 100%)" } }),

                // ロールカラーのグロー（背景）
                h("div", { style: { position: "absolute", top: "200px", left: "50%", width: "900px", height: "900px", borderRadius: "50%", background: `radial-gradient(circle, ${rl}20, transparent 65%)`, transform: "translateX(-50%)" } }),

                // 左ライン
                h("div", { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: "8px", background: `linear-gradient(to bottom, transparent 5%, ${rl} 50%, transparent 95%)` } }),

                // ── 上部：ロゴ + ブランド ──
                h("div", { style: { position: "absolute", top: "80px", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", zIndex: 2 } },
                    h("span", { style: { fontSize: "22px", fontWeight: 900, color: "rgba(255,255,255,0.18)", letterSpacing: "0.35em", textTransform: "uppercase", fontFamily: "monospace" } }, "VIZION CONNECTION"),
                    h("div", { style: { width: "40px", height: "2px", background: `linear-gradient(90deg, transparent, ${rl}, transparent)` } })
                ),

                // ── メインコンテンツ（縦中央より少し上） ──
                h("div", { style: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 90px", zIndex: 2 } },

                    // アバター（大きく）
                    h("div", { style: { width: "280px", height: "280px", borderRadius: "50%", overflow: "hidden", border: `6px solid ${rl}90`, background: `linear-gradient(145deg, ${bg1}, #111)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 80px ${rl}50, 0 0 160px ${rl}20`, marginBottom: "52px" } },
                        avatarUrl
                            ? h("img", { src: avatarUrl, alt: displayName, style: { width: "100%", height: "100%", objectFit: "cover" } })
                            : h("span", { style: { fontSize: "100px", fontWeight: 900, color: `${rl}90`, fontFamily: "monospace" } }, initials)
                    ),

                    // Founding / Early バッジ
                    h("div", { style: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 28px", borderRadius: "40px", background: `${rl}18`, border: `1.5px solid ${rl}60`, marginBottom: "28px" } },
                        h("div", { style: { width: "10px", height: "10px", borderRadius: "50%", background: rl, boxShadow: `0 0 8px ${rl}` } }),
                        h("span", { style: { fontSize: "22px", fontWeight: 800, color: rl, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace" } }, isFounding ? "FOUNDING MEMBER" : "EARLY MEMBER"),
                    ),

                    // Role / Sport
                    h("div", { style: { fontSize: "26px", fontWeight: 700, color: `${rl}cc`, letterSpacing: "0.35em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "20px" } }, sport || ROLE_LABEL[role]),

                    // 名前（最大に）
                    h("div", { style: { fontSize: nameFz, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.0, textAlign: "center", marginBottom: "16px", textShadow: `0 0 60px ${rl}40` } }, displayName),

                    // @slug · region
                    h("div", { style: { fontSize: "28px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", letterSpacing: "0.04em", marginBottom: "48px" } }, `@${slug}${region ? ` · ${region}` : ""}`),

                    // Bio
                    bio && h("div", { style: { fontSize: "26px", color: "rgba(255,255,255,0.5)", lineHeight: 1.75, textAlign: "center", maxWidth: "860px", marginBottom: "56px", padding: "0 20px" } }, bio),

                    // 区切り
                    h("div", { style: { width: "80px", height: "2px", marginBottom: "52px", background: `linear-gradient(90deg, transparent, ${rl}, transparent)` } }),

                    // Stats（大きく）
                    h("div", { style: { display: "flex", alignItems: "center", gap: "80px" } },
                        h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" } },
                            h("span", { style: { fontSize: "20px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace" } }, "CHEER"),
                            h("span", { style: { fontSize: "72px", fontWeight: 900, color: "#FFD600", fontFamily: "monospace", lineHeight: 1, textShadow: "0 0 30px rgba(255,214,0,0.5)" } }, cheerCount.toLocaleString())
                        ),
                        h("div", { style: { width: "1px", height: "60px", background: "rgba(255,255,255,0.12)" } }),
                        h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" } },
                            h("span", { style: { fontSize: "20px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace" } }, "ROLE"),
                            h("span", { style: { fontSize: "40px", fontWeight: 800, color: rl, fontFamily: "monospace", lineHeight: 1 } }, ROLE_LABEL[role])
                        )
                    )
                ),

                // ── 下部：URL + serial ──
                h("div", { style: { position: "absolute", bottom: "80px", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", zIndex: 2 } },
                    serialId && h("span", { style: { fontSize: "18px", color: "rgba(255,255,255,0.2)", fontFamily: "monospace", letterSpacing: "0.12em" } }, serialId),
                    h("span", { style: { fontSize: "22px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace", letterSpacing: "0.06em" } }, `vizion-connection.jp/u/${slug}`)
                )
            ),
            { width: 1080, height: 1920 }
        );
    }

    // ── OG: 1200×630 横長 ──────────────────────────────────────────────────────
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