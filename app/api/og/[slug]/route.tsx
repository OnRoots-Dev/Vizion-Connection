// app/api/og/[slug]/route.tsx

import { ImageResponse } from "next/og";
import { getPublicProfileBySlug } from "@/features/profile/server/get-profile-by-slug";
import { createElement as h } from "react";

export const runtime = "nodejs";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#C1272D", Trainer: "#1A7A4A", Members: "#B8860B", Business: "#1B3A8C",
};
const ROLE_GRADIENT: Record<string, string> = {
    Athlete: "#2D0000", Trainer: "#001A0A", Members: "#1A0F00", Business: "#000A24",
};
const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
};

function withCache(r: ImageResponse): Response {
    const headers = new Headers(r.headers);
    headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return new Response(r.body, { headers, status: r.status });
}

async function fetchBase64(url: string | null): Promise<string | null> {
    if (!url) return null;
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(url, { signal: ctrl.signal });
        clearTimeout(t);
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        const mime = res.headers.get("content-type") ?? "image/jpeg";
        return `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
    } catch { return null; }
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const format = new URL(req.url).searchParams.get("format") ?? "og";
    const isStories = format === "stories";

    const result = await getPublicProfileBySlug(slug);
    if (!result.success || !result.data.isPublic) {
        const w = isStories ? 1080 : 1200;
        const hh = isStories ? 1920 : 630;
        return withCache(new ImageResponse(
            h("div", { style: { width: `${w}px`, height: `${hh}px`, display: "flex", alignItems: "center", justifyContent: "center", background: "#07070e" } },
                h("span", { style: { fontSize: "13px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "monospace" } }, "VIZION CONNECTION")
            ), { width: w, height: hh }
        ));
    }

    const p = result.data;
    const displayName = p.displayName ?? "Vizion Member";
    const role = p.role ?? "Members";
    const bio = p.bio ?? "";
    const sport = p.sport ?? "";
    const region = p.region ?? "";
    const prefecture = p.prefecture ?? "";
    const stance = p.stance ?? "";
    const cheerCount = p.cheerCount ?? 0;
    const serialId = p.serialId ?? "";
    const isFounding = p.isFoundingMember ?? false;
    const rl = ROLE_COLOR[role] ?? "#a78bfa";
    const bg1 = ROLE_GRADIENT[role] ?? "#1a1a2e";
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const location = [region, prefecture].filter(Boolean).join(" / ");

    const [avatarData, bgData] = await Promise.all([
        fetchBase64(p.avatarUrl ?? p.profileImageUrl ?? null),
        fetchBase64(p.profileImageUrl ?? null),
    ]);

    // ── OG 1200×630 ── DEMOカードのフロント面を忠実再現
    const nameFz = displayName.length > 16 ? (displayName.length > 22 ? "36px" : "46px") : "58px";

    const cardFront = h("div", {
        style: {
            width: "1200px", height: "630px",
            display: "flex", position: "relative",
            overflow: "hidden", fontFamily: "sans-serif",
            background: `linear-gradient(145deg, ${bg1} 0%, color-mix(in srgb, ${bg1} 50%, #000) 55%, #060606 100%)`,
        }
    },
        // ── ベース背景グラデーション
        h("div", { style: { position: "absolute", inset: 0, background: `linear-gradient(145deg, ${bg1} 0%, color-mix(in srgb, ${bg1} 50%, #000) 55%, #060606 100%)`, display: "flex" } }),

        // ── Sheen（光沢）
        h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(128deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.02) 30%,transparent 55%)", display: "flex" } }),

        // ── グロー（右上）
        h("div", { style: { position: "absolute", right: "-10%", top: "-10%", width: "360px", height: "360px", background: `radial-gradient(circle at center, ${rl}30, transparent 70%)`, display: "flex" } }),

        // ── 写真（右側、maskでフェード）
        bgData
            ? h("img", {
                src: bgData,
                style: {
                    position: "absolute", bottom: 0, right: "-8px",
                    width: "65%", height: "105%",
                    objectFit: "cover", objectPosition: "center top",
                    WebkitMaskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 18%,black 42%)",
                    maskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 18%,black 42%)",
                }
            })
            : h("div", {
                style: {
                    position: "absolute", bottom: 0, right: "-8px",
                    width: "65%", height: "116%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "148px", fontWeight: 900, color: `${rl}08`,
                    fontFamily: "monospace",
                    WebkitMaskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 18%,black 42%)",
                    maskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 18%,black 42%)",
                }
            }, initials),

        // ── Watermark
        h("div", { style: { position: "absolute", bottom: "10px", right: "14px", fontFamily: "monospace", fontSize: "6px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.06)", display: "flex" } },
            "VIZION CONNECTION · PROOF OF EXISTENCE"
        ),

        // ── 左テキストエリア（40%幅）
        h("div", {
            style: {
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                padding: "28px 0 24px 28px",
                width: "42%",
            }
        },
            // 上部：Founding badge + location
            h("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } },
                // Founding Member Badge
                h("div", { style: { display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "4px", background: `${rl}22`, border: `1px solid ${rl}55`, alignSelf: "flex-start" } },
                    h("span", { style: { fontSize: "10px", fontWeight: 900, color: rl, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" } }, isFounding ? "● FOUNDING MEMBER" : "● EARLY MEMBER")
                ),
                // location
                location && h("span", { style: { fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.06em", color: "rgba(255,255,255,0.55)" } }, location)
            ),

            // 中部：Role → 名前 → sport → Cheer
            h("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                h("span", { style: { fontSize: "12px", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", fontFamily: "monospace" } }, ROLE_LABEL[role]),
                h("div", { style: { fontSize: nameFz, fontWeight: 900, color: "#ffffff", lineHeight: 1.05, letterSpacing: "-0.01em", display: "flex", textShadow: "0 1px 0 rgba(255,255,255,0.5), 0 -1px 0 rgba(0,0,0,0.75), 0 2px 5px rgba(0,0,0,0.55)" } }, displayName),
                (sport || bio) && h("span", { style: { fontSize: "15px", fontFamily: "monospace", letterSpacing: "0.03em", color: "rgba(255,255,255,0.52)" } }, sport || bio),
                h("div", { style: { display: "flex", alignItems: "center", gap: "5px", marginTop: "4px" } },
                    h("span", { style: { fontSize: "12px", color: "#FFD600" } }, "*"),
                    h("span", { style: { fontSize: "11px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", fontFamily: "monospace" } }, "Cheer"),
                    h("span", { style: { fontSize: "20px", fontWeight: 700, lineHeight: 1, color: "#FFD600", fontFamily: "monospace" } }, cheerCount.toLocaleString())
                )
            ),

            // 下部：serial ID
            h("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                h("span", { style: { fontSize: "15px", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", fontFamily: "monospace", textShadow: "0 1px 0 rgba(255,255,255,0.38), 0 -1px 0 rgba(0,0,0,0.65)" } }, serialId),
                h("div", { style: { display: "flex", alignItems: "center", gap: "5px" } },
                    h("div", { style: { width: "18px", height: "1px", background: "rgba(255,255,255,0.2)", display: "flex" } }),
                    h("span", { style: { fontSize: "8px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", fontFamily: "monospace" } }, "TAP TO SEE PROFILE")
                )
            )
        ),

        // ── ロゴ（右下）
        h("div", { style: { position: "absolute", bottom: "14px", right: "14px", display: "flex" } },
            h("span", { style: { fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.15)", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "monospace" } }, "VIZION CONNECTION")
        )
    );

    if (!isStories) {
        return withCache(new ImageResponse(cardFront, { width: 1200, height: 630 }));
    }

    // ── Stories 1080×1920 ── カードを上に、情報を下に
    const nameFzS = displayName.length > 12 ? (displayName.length > 18 ? "64px" : "80px") : "96px";

    return withCache(new ImageResponse(
        h("div", { style: { width: "1080px", height: "1920px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", fontFamily: "sans-serif", background: `linear-gradient(180deg, ${bg1} 0%, #060606 40%, #07070e 100%)` } },

            // 背景グロー
            h("div", { style: { position: "absolute", top: "100px", left: "50%", width: "1200px", height: "900px", borderRadius: "50%", background: `radial-gradient(circle, ${rl}20 0%, transparent 65%)`, transform: "translateX(-50%)", display: "flex" } }),

            // 左ライン
            h("div", { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", background: `linear-gradient(to bottom, transparent 5%, ${rl} 50%, transparent 95%)`, display: "flex" } }),

            // 上部ブランド
            h("div", { style: { position: "absolute", top: "56px", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" } },
                h("span", { style: { fontSize: "17px", fontWeight: 900, color: "rgba(255,255,255,0.2)", letterSpacing: "0.38em", textTransform: "uppercase", fontFamily: "monospace" } }, "VIZION CONNECTION"),
                h("div", { style: { width: "36px", height: "1px", background: `linear-gradient(90deg, transparent, ${rl}, transparent)`, display: "flex" } })
            ),

            // ── カードビジュアル（縮小・忠実再現）
            h("div", {
                style: {
                    position: "absolute", top: "148px", left: "48px", right: "48px",
                    height: "576px", borderRadius: "16px", overflow: "hidden",
                    boxShadow: `0 24px 80px rgba(0,0,0,0.85), 0 0 48px ${rl}22`,
                    display: "flex",
                    background: `linear-gradient(145deg, ${bg1} 0%, color-mix(in srgb, ${bg1} 50%, #000) 55%, #060606 100%)`,
                }
            },
                // Sheen
                h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(128deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.015) 30%,transparent 55%)", display: "flex" } }),
                // グロー
                h("div", { style: { position: "absolute", right: "-8%", top: "-8%", width: "300px", height: "300px", background: `radial-gradient(circle, ${rl}28, transparent 70%)`, display: "flex" } }),
                // 写真
                bgData
                    ? h("img", { src: bgData, style: { position: "absolute", bottom: 0, right: "-6px", width: "65%", height: "105%", objectFit: "cover", objectPosition: "center top", WebkitMaskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 18%,black 42%)", maskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 18%,black 42%)" } })
                    : h("div", { style: { position: "absolute", bottom: 0, right: "-6px", width: "65%", height: "116%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "120px", fontWeight: 900, color: `${rl}08`, fontFamily: "monospace", WebkitMaskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 18%,black 42%)", maskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 18%,black 42%)" } }, initials),
                // 左テキスト
                h("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "22px 0 20px 22px", width: "42%" } },
                    h("div", { style: { display: "flex", flexDirection: "column", gap: "6px" } },
                        h("div", { style: { display: "flex", alignItems: "center", gap: "5px", padding: "3px 8px", borderRadius: "3px", background: `${rl}22`, border: `1px solid ${rl}50`, alignSelf: "flex-start" } },
                            h("span", { style: { fontSize: "9px", fontWeight: 900, color: rl, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" } }, isFounding ? "● FOUNDING MEMBER" : "● EARLY MEMBER")
                        ),
                        location && h("span", { style: { fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.05em", color: "rgba(255,255,255,0.55)" } }, location)
                    ),
                    h("div", { style: { display: "flex", flexDirection: "column", gap: "3px" } },
                        h("span", { style: { fontSize: "10px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", fontFamily: "monospace" } }, ROLE_LABEL[role]),
                        h("div", { style: { fontSize: "26px", fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.01em", display: "flex", textShadow: "0 1px 0 rgba(255,255,255,0.5),0 -1px 0 rgba(0,0,0,0.75),0 2px 5px rgba(0,0,0,0.55)" } }, displayName),
                        (sport || bio) && h("span", { style: { fontSize: "12px", fontFamily: "monospace", color: "rgba(255,255,255,0.52)" } }, sport || bio),
                        h("div", { style: { display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" } },
                            h("span", { style: { fontSize: "10px", color: "#FFD600" } }, "*"),
                            h("span", { style: { fontSize: "9px", color: "rgba(255,255,255,0.28)", fontFamily: "monospace" } }, "Cheer"),
                            h("span", { style: { fontSize: "17px", fontWeight: 700, color: "#FFD600", fontFamily: "monospace", lineHeight: 1 } }, cheerCount.toLocaleString())
                        )
                    ),
                    h("div", { style: { display: "flex", flexDirection: "column", gap: "3px" } },
                        h("span", { style: { fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" } }, serialId),
                        h("div", { style: { display: "flex", alignItems: "center", gap: "4px" } },
                            h("div", { style: { width: "14px", height: "1px", background: "rgba(255,255,255,0.2)", display: "flex" } }),
                            h("span", { style: { fontSize: "7px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", fontFamily: "monospace" } }, "TAP TO SEE PROFILE")
                        )
                    )
                ),
                // ロゴ
                h("div", { style: { position: "absolute", bottom: "10px", right: "12px", display: "flex" } },
                    h("span", { style: { fontSize: "7px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" } }, "VIZION CONNECTION")
                )
            ),

            // ── 下部：名前・詳細情報
            h("div", { style: { position: "absolute", top: "780px", left: "60px", right: "60px", display: "flex", flexDirection: "column" } },

                // Founding badge
                h("div", { style: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 18px", borderRadius: "40px", background: `${rl}15`, border: `1.5px solid ${rl}50`, marginBottom: "22px", alignSelf: "flex-start" } },
                    h("div", { style: { width: "7px", height: "7px", borderRadius: "50%", background: rl, display: "flex" } }),
                    h("span", { style: { fontSize: "17px", fontWeight: 800, color: rl, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace" } }, isFounding ? "FOUNDING MEMBER" : "EARLY MEMBER")
                ),

                // Role / Sport
                h("span", { style: { fontSize: "19px", fontWeight: 700, color: `${rl}cc`, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "12px" } }, sport || ROLE_LABEL[role]),

                // 名前（大）
                h("div", { style: { fontSize: nameFzS, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.0, marginBottom: "10px", textShadow: `0 0 40px ${rl}25, 0 2px 12px rgba(0,0,0,0.8)`, display: "flex" } }, displayName),

                // @slug · location
                h("span", { style: { fontSize: "21px", color: "rgba(255,255,255,0.45)", fontFamily: "monospace", letterSpacing: "0.03em", marginBottom: "20px" } }, `@${slug}${location ? ` · ${location}` : ""}`),

                // Bio
                bio && h("div", { style: { fontSize: "20px", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, marginBottom: "16px", display: "flex" } }, bio),

                // Stance
                stance && h("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" } },
                    h("div", { style: { width: "4px", height: "4px", borderRadius: "50%", background: rl, display: "flex" } }),
                    h("span", { style: { fontSize: "17px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" } }, stance)
                ),

                // 区切り
                h("div", { style: { width: "56px", height: "1px", background: `linear-gradient(90deg, ${rl}, transparent)`, marginBottom: "28px", display: "flex" } }),

                // Stats
                h("div", { style: { display: "flex", alignItems: "center", gap: "48px" } },
                    h("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                        h("span", { style: { fontSize: "14px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "monospace" } }, "CHEER"),
                        h("span", { style: { fontSize: "56px", fontWeight: 900, color: "#FFD600", fontFamily: "monospace", lineHeight: 1 } }, cheerCount.toLocaleString())
                    ),
                    h("div", { style: { width: "1px", height: "48px", background: "rgba(255,255,255,0.12)", display: "flex" } }),
                    h("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                        h("span", { style: { fontSize: "14px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "monospace" } }, "ROLE"),
                        h("span", { style: { fontSize: "32px", fontWeight: 900, color: rl, fontFamily: "monospace", lineHeight: 1 } }, ROLE_LABEL[role])
                    )
                )
            ),

            // URL
            h("div", { style: { position: "absolute", bottom: "44px", left: 0, right: 0, display: "flex", justifyContent: "center" } },
                h("span", { style: { fontSize: "17px", color: "rgba(255,255,255,0.2)", fontFamily: "monospace", letterSpacing: "0.06em" } }, `vizion-connection.jp/u/${slug}`)
            )
        ),
        { width: 1080, height: 1920 }
    ));
}