// app/api/og/[slug]/route.tsx
//
// ?format=og      → 1200×630  OGP / X用（デフォルト）
// ?format=stories → 1080×1920 Instagram Stories用

import { ImageResponse } from "next/og";
import { getPublicProfileBySlug } from "@/features/profile/server/get-profile-by-slug";
import { createElement as h } from "react";

export const runtime = "nodejs";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};
const ROLE_GRADIENT: Record<string, string> = {
    Athlete: "#6b0000", Trainer: "#003d1a", Members: "#5a4200", Business: "#001f5a",
};
const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
};

// キャッシュ付きImageResponseを返す
function withCache(imageResponse: ImageResponse): Response {
    const headers = new Headers(imageResponse.headers);
    headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return new Response(imageResponse.body, { headers, status: imageResponse.status });
}

function fallback(w: number, hh: number) {
    return withCache(new ImageResponse(
        h("div", { style: { width: `${w}px`, height: `${hh}px`, display: "flex", alignItems: "center", justifyContent: "center", background: "#07070e" } },
            h("span", { style: { fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "monospace" } }, "VIZION CONNECTION")
        ),
        { width: w, height: hh }
    ));
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const format = new URL(req.url).searchParams.get("format") ?? "og";
    const isStories = format === "stories";

    const result = await getPublicProfileBySlug(slug);
    if (!result.success || !result.data.isPublic) return fallback(isStories ? 1080 : 1200, isStories ? 1920 : 630);

    const p = result.data;

    // 画像をタイムアウト付きで取得（2秒以内に取れなければnull）
    async function fetchImageAsDataUrl(url: string | null): Promise<string | null> {
        if (!url) return null;
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            if (!res.ok) return null;
            const buf = await res.arrayBuffer();
            const mime = res.headers.get("content-type") ?? "image/jpeg";
            const b64 = Buffer.from(buf).toString("base64");
            return `data:${mime};base64,${b64}`;
        } catch { return null; }
    }

    const [avatarDataUrl, bgDataUrl] = await Promise.all([
        fetchImageAsDataUrl(p.avatarUrl ?? p.profileImageUrl ?? null),
        fetchImageAsDataUrl(p.profileImageUrl ?? null),
    ]);
    const displayName = p.displayName ?? "Vizion Member";
    const role = p.role ?? "Members";
    const bio = p.bio ?? "";
    const sport = p.sport ?? "";
    const region = p.region ?? "";
    const cheerCount = p.cheerCount ?? 0;
    const serialId = p.serialId ?? "";
    const isFounding = p.isFoundingMember ?? false;
    const avatarUrl = avatarDataUrl;
    const bgPhotoUrl = bgDataUrl;
    const rl = ROLE_COLOR[role] ?? "#a78bfa";
    const bg1 = ROLE_GRADIENT[role] ?? "#1a1a2e";
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

    // ── Stories: 1080×1920 ────────────────────────────────────────────────────
    if (isStories) {
        const nameFz = displayName.length > 14 ? (displayName.length > 20 ? "80px" : "96px") : "116px";

        return withCache(new ImageResponse(
            h("div", {
                style: {
                    width: "1080px", height: "1920px",
                    display: "flex", flexDirection: "column",
                    background: "#07070e",
                    fontFamily: "sans-serif",
                    overflow: "hidden",
                    position: "relative",
                }
            },
                // ── 背景写真（極暗）
                bgPhotoUrl && h("img", {
                    src: bgPhotoUrl,
                    style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.07 }
                }),

                // ── 背景グロー（ロールカラー）
                h("div", {
                    style: {
                        position: "absolute", top: "400px", left: "50%",
                        width: "1200px", height: "1200px", borderRadius: "50%",
                        background: `radial-gradient(circle, ${rl}22 0%, transparent 65%)`,
                        transform: "translateX(-50%)",
                        display: "flex",
                    }
                }),

                // ── 暗めオーバーレイ（上下）
                h("div", {
                    style: {
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to bottom, rgba(7,7,14,0.85) 0%, rgba(7,7,14,0.45) 35%, rgba(7,7,14,0.45) 65%, rgba(7,7,14,0.92) 100%)",
                        display: "flex",
                    }
                }),

                // ── 左ライン（ロールカラー）
                h("div", {
                    style: {
                        position: "absolute", left: 0, top: 0, bottom: 0, width: "8px",
                        background: `linear-gradient(to bottom, transparent 8%, ${rl} 50%, transparent 92%)`,
                        display: "flex",
                    }
                }),

                // ── 右ライン（薄め）
                h("div", {
                    style: {
                        position: "absolute", right: 0, top: 0, bottom: 0, width: "2px",
                        background: `linear-gradient(to bottom, transparent 8%, ${rl}40 50%, transparent 92%)`,
                        display: "flex",
                    }
                }),

                // ── メインコンテンツ
                h("div", {
                    style: {
                        position: "absolute", inset: 0,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "space-between",
                        padding: "160px 80px 160px",
                    }
                },
                    // ブランド（上部）
                    h("div", {
                        style: {
                            display: "flex", flexDirection: "column", alignItems: "center",

                        }
                    },
                        h("span", {
                            style: {
                                fontSize: "18px", fontWeight: 900,
                                color: "rgba(255,255,255,0.18)",
                                letterSpacing: "0.4em", textTransform: "uppercase",
                                fontFamily: "monospace",
                            }
                        }, "VIZION CONNECTION"),
                        h("div", {
                            style: {
                                width: "48px", height: "1px", marginTop: "12px",
                                background: `linear-gradient(90deg, transparent, ${rl}, transparent)`,
                                display: "flex",
                            }
                        })
                    ),

                    // アバター（大）
                    h("div", {
                        style: {
                            width: "240px", height: "240px", borderRadius: "50%",
                            overflow: "hidden",
                            border: `5px solid ${rl}70`,
                            background: `linear-gradient(145deg, ${bg1}, #0a0a0a)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 0 80px ${rl}40, 0 0 160px ${rl}15`,
                        }
                    },
                        avatarUrl
                            ? h("img", { src: avatarUrl, style: { width: "100%", height: "100%", objectFit: "cover" } })
                            : h("span", { style: { fontSize: "88px", fontWeight: 900, color: `${rl}80`, fontFamily: "monospace" } }, initials)
                    ),

                    // Founding / Early バッジ
                    h("div", {
                        style: {
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "10px 28px", borderRadius: "40px",
                            background: `${rl}15`, border: `1.5px solid ${rl}55`,
                        }
                    },
                        h("div", {
                            style: {
                                width: "9px", height: "9px", borderRadius: "50%",
                                background: rl, boxShadow: `0 0 8px ${rl}`,
                                display: "flex",
                            }
                        }),
                        h("span", {
                            style: {
                                fontSize: "20px", fontWeight: 800, color: rl,
                                letterSpacing: "0.22em", textTransform: "uppercase",
                                fontFamily: "monospace",
                            }
                        }, isFounding ? "FOUNDING MEMBER" : "EARLY MEMBER"),
                        serialId && h("span", {
                            style: {
                                fontSize: "16px", color: "rgba(255,255,255,0.2)",
                                fontFamily: "monospace", marginLeft: "8px",
                            }
                        }, serialId)
                    ),

                    // Role / Sport
                    h("span", {
                        style: {
                            fontSize: "22px", fontWeight: 700,
                            color: `${rl}cc`, letterSpacing: "0.35em",
                            textTransform: "uppercase", fontFamily: "monospace",
                            marginBottom: "20px",
                        }
                    }, sport || ROLE_LABEL[role]),

                    // 名前（メイン）
                    h("div", {
                        style: {
                            fontSize: nameFz, fontWeight: 900, color: "#ffffff",
                            letterSpacing: "-0.025em", lineHeight: 1.0,
                            textAlign: "center", marginBottom: "16px",
                            textShadow: `0 0 60px ${rl}35, 0 2px 8px rgba(0,0,0,0.8)`,
                            display: "flex",
                        }
                    }, displayName),

                    // @slug · region
                    h("span", {
                        style: {
                            fontSize: "26px", color: "rgba(255,255,255,0.32)",
                            fontFamily: "monospace", letterSpacing: "0.04em",
                            marginBottom: bio ? "40px" : "52px",
                        }
                    }, `@${slug}${region ? ` · ${region}` : ""}`),

                    // Bio
                    bio && h("div", {
                        style: {
                            fontSize: "24px", color: "rgba(255,255,255,0.48)",
                            lineHeight: 1.75, textAlign: "center",
                            maxWidth: "880px", marginBottom: "52px",
                            display: "flex",
                        }
                    }, bio),

                    // 区切りライン
                    h("div", {
                        style: {
                            width: "80px", height: "1px", marginBottom: "48px",
                            background: `linear-gradient(90deg, transparent, ${rl}, transparent)`,
                            display: "flex",
                        }
                    }),

                    // Stats（Cheer / Role）
                    h("div", {
                        style: {
                            display: "flex", alignItems: "center", gap: "72px",
                        }
                    },
                        h("div", {
                            style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }
                        },
                            h("span", {
                                style: {
                                    fontSize: "17px", color: "rgba(255,255,255,0.25)",
                                    letterSpacing: "0.22em", textTransform: "uppercase",
                                    fontFamily: "monospace",
                                }
                            }, "CHEER"),
                            h("span", {
                                style: {
                                    fontSize: "72px", fontWeight: 900, color: "#FFD600",
                                    fontFamily: "monospace", lineHeight: 1,
                                    textShadow: "0 0 30px rgba(255,214,0,0.45)",
                                }
                            }, cheerCount.toLocaleString())
                        ),
                        h("div", {
                            style: {
                                width: "1px", height: "64px",
                                background: "rgba(255,255,255,0.1)",
                                display: "flex",
                            }
                        }),
                        h("div", {
                            style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }
                        },
                            h("span", {
                                style: {
                                    fontSize: "17px", color: "rgba(255,255,255,0.25)",
                                    letterSpacing: "0.22em", textTransform: "uppercase",
                                    fontFamily: "monospace",
                                }
                            }, "ROLE"),
                            h("span", {
                                style: {
                                    fontSize: "38px", fontWeight: 900, color: rl,
                                    fontFamily: "monospace", lineHeight: 1,
                                }
                            }, ROLE_LABEL[role])
                        )
                    )
                ),

                // ── 下部URL
                h("div", {
                    style: {
                        position: "absolute", bottom: "72px", left: 0, right: 0,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "0px",
                    }
                },
                    h("span", {
                        style: {
                            fontSize: "21px", color: "rgba(255,255,255,0.2)",
                            fontFamily: "monospace", letterSpacing: "0.06em",
                        }
                    }, `vizion-connection.jp/u/${slug}`)
                )
            ),
            { width: 1080, height: 1920 }
        ));
    }

    // ── OG: 1200×630 横長 ────────────────────────────────────────────────────
    const nameFz = displayName.length > 16 ? (displayName.length > 22 ? "34px" : "42px") : "52px";
    return withCache(new ImageResponse(
        h("div", {
            style: {
                width: "1200px", height: "630px", display: "flex",
                background: "#07070e", fontFamily: "sans-serif",
                overflow: "hidden", position: "relative",
            }
        },
            // 左パネル（写真）
            h("div", {
                style: {
                    width: "420px", height: "630px", flexShrink: 0,
                    position: "relative", display: "flex",
                    background: `linear-gradient(145deg, ${bg1} 0%, #060606 100%)`,
                    overflow: "hidden",
                }
            },
                h("div", { style: { position: "absolute", top: "-60px", left: "-60px", width: "320px", height: "320px", background: `radial-gradient(circle, ${rl}35, transparent 65%)`, display: "flex" } }),
                bgPhotoUrl
                    ? h("img", { src: bgPhotoUrl, style: { position: "absolute", bottom: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 } })
                    : h("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "120px", fontWeight: 900, color: `${rl}18`, fontFamily: "monospace" } }, initials),
                h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 50%, #07070e 100%)", display: "flex" } }),
                h("div", { style: { position: "absolute", bottom: 0, left: 0, right: 0, height: "160px", background: "linear-gradient(to top, #07070e, transparent)", display: "flex" } }),
                // アバター（左下）
                h("div", {
                    style: {
                        position: "absolute", bottom: "28px", left: "28px",
                        width: "80px", height: "80px", borderRadius: "50%",
                        overflow: "hidden", border: `3px solid ${rl}80`,
                        background: `linear-gradient(145deg, ${bg1}, #111)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 0 24px ${rl}50`,
                    }
                },
                    avatarUrl
                        ? h("img", { src: avatarUrl, style: { width: "100%", height: "100%", objectFit: "cover" } })
                        : h("span", { style: { fontSize: "28px", fontWeight: 900, color: `${rl}90`, fontFamily: "monospace" } }, initials)
                )
            ),

            // 右パネル（情報）
            h("div", {
                style: {
                    flex: 1, display: "flex", flexDirection: "column",
                    justifyContent: "center", padding: "48px 56px 48px 40px",
                    position: "relative",
                }
            },
                // バッジ
                h("div", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" } },
                    h("div", {
                        style: {
                            display: "flex", alignItems: "center", gap: "6px",
                            padding: "5px 12px", borderRadius: "20px",
                            background: `${rl}15`, border: `1px solid ${rl}40`,
                        }
                    },
                        h("div", { style: { width: "6px", height: "6px", borderRadius: "50%", background: rl, display: "flex" } }),
                        h("span", { style: { fontSize: "11px", fontWeight: 700, color: rl, letterSpacing: "0.15em", fontFamily: "monospace", textTransform: "uppercase" } }, isFounding ? "FOUNDING MEMBER" : "EARLY MEMBER")
                    ),
                    serialId && h("span", { style: { fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.18)", fontFamily: "monospace", letterSpacing: "0.1em", marginLeft: "8px" } }, serialId)
                ),
                h("div", { style: { fontSize: "13px", fontWeight: 600, color: rl, letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "10px" } }, sport || ROLE_LABEL[role]),
                h("div", { style: { fontSize: nameFz, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: "8px" } }, displayName),
                h("div", { style: { fontSize: "16px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", marginBottom: "20px", letterSpacing: "0.03em" } }, `@${slug}${region ? ` · ${region}` : ""}`),
                bio && h("div", { style: { fontSize: "16px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "28px", maxWidth: "520px" } }, bio),
                h("div", { style: { width: "48px", height: "2px", background: `linear-gradient(90deg, ${rl}, transparent)`, marginBottom: "24px", display: "flex" } }),
                h("div", { style: { display: "flex", alignItems: "center", gap: "32px" } },
                    h("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                        h("span", { style: { fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" } }, "Cheer"),
                        h("span", { style: { fontSize: "28px", fontWeight: 900, color: "#FFD600", fontFamily: "monospace", lineHeight: 1 } }, cheerCount.toLocaleString())
                    ),
                    h("div", { style: { width: "1px", height: "36px", background: "rgba(255,255,255,0.08)", display: "flex" } }),
                    h("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                        h("span", { style: { fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" } }, "Role"),
                        h("span", { style: { fontSize: "18px", fontWeight: 800, color: rl, fontFamily: "monospace", lineHeight: 1 } }, ROLE_LABEL[role])
                    )
                ),
                h("div", { style: { position: "absolute", bottom: "36px", right: "56px" } },
                    h("span", { style: { fontSize: "12px", color: "rgba(255,255,255,0.2)", fontFamily: "monospace", letterSpacing: "0.05em" } }, `vizion-connection.jp/u/${slug}`)
                )
            ),

            // VIZION CONNECTION ラベル（右上）
            h("div", { style: { position: "absolute", top: "28px", right: "56px", display: "flex" } },
                h("span", { style: { fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace" } }, "VIZION CONNECTION")
            ),

            // 左ライン
            h("div", { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: `linear-gradient(to bottom, transparent, ${rl}, transparent)`, display: "flex" } })
        ),
        { width: 1200, height: 630 }
    ));
}