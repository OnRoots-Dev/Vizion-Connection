// app/api/og/[slug]/route.ts

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

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const result = await getPublicProfileBySlug(slug);

    if (!result.success || !result.data.isPublic) {
        return new ImageResponse(
            h("div", {
                style: {
                    width: "1200px", height: "630px",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: "#07070e", fontFamily: "sans-serif",
                }
            },
                h("div", {
                    style: {
                        fontSize: "13px", fontWeight: 700,
                        color: "rgba(255,255,255,0.2)",
                        letterSpacing: "0.3em", textTransform: "uppercase",
                        fontFamily: "monospace",
                    }
                }, "VIZION CONNECTION")
            ),
            { width: 1200, height: 630 }
        );
    }

    const profile = result.data;
    const displayName = profile.displayName ?? "Vizion Member";
    const role = profile.role ?? "Members";
    const bio = profile.bio ?? "";
    const sport = profile.sport ?? "";
    const region = profile.region ?? "Japan";
    const cheerCount = profile.cheerCount ?? 0;
    const serialId = profile.serialId ? `#${String(profile.serialId).padStart(4, "0")}` : "";
    const isFoundingMember = profile.isFoundingMember ?? false;
    const avatarUrl = profile.avatarUrl ?? profile.profileImageUrl ?? null;
    const bgPhotoUrl = profile.profileImageUrl ?? null;
    const rl = ROLE_COLOR[role] ?? "#a78bfa";
    const bg1 = ROLE_GRADIENT[role] ?? "#1a1a2e";
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const nameFontSize = displayName.length > 16 ? (displayName.length > 22 ? "34px" : "42px") : "52px";

    return new ImageResponse(
        h("div", {
            style: {
                width: "1200px", height: "630px",
                display: "flex", background: "#07070e",
                fontFamily: "sans-serif", overflow: "hidden", position: "relative",
            }
        },
            // ── Left: Photo / Initials ──
            h("div", {
                style: {
                    width: "420px", height: "630px", flexShrink: 0,
                    position: "relative", display: "flex",
                    background: `linear-gradient(145deg, ${bg1} 0%, #060606 100%)`,
                    overflow: "hidden",
                }
            },
                // Glow
                h("div", { style: { position: "absolute", top: "-60px", left: "-60px", width: "320px", height: "320px", background: `radial-gradient(circle, ${rl}35, transparent 65%)` } }),

                // 背景
                bgPhotoUrl
                    ? h("img", { src: bgPhotoUrl, alt: displayName, style: { position: "absolute", bottom: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 } })
                    : h("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "120px", fontWeight: 900, color: `${rl}18`, fontFamily: "monospace" } }, initials),

                // Right fade
                h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 50%, #07070e 100%)" } }),

                // Bottom fade
                h("div", { style: { position: "absolute", bottom: 0, left: 0, right: 0, height: "160px", background: "linear-gradient(to top, #07070e, transparent)" } }),

                // Avatar circle
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
                        ? h("img", { src: avatarUrl, alt: displayName, style: { width: "100%", height: "100%", objectFit: "cover" } })
                        : h("span", { style: { fontSize: "28px", fontWeight: 900, color: `${rl}90`, fontFamily: "monospace" } }, initials)
                )
            ),

            // ── Right: Info ──
            h("div", {
                style: {
                    flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
                    padding: "48px 56px 48px 40px", position: "relative",
                }
            },
                // Badge
                h("div", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" } },
                    h("div", { style: { display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "20px", background: `${rl}15`, border: `1px solid ${rl}40` } },
                        h("div", { style: { width: "6px", height: "6px", borderRadius: "50%", background: rl } }),
                        h("span", { style: { fontSize: "11px", fontWeight: 700, color: rl, letterSpacing: "0.15em", fontFamily: "monospace", textTransform: "uppercase" } },
                            isFoundingMember ? "FOUNDING MEMBER" : "EARLY MEMBER"
                        )
                    ),
                    serialId && h("span", { style: { fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.18)", fontFamily: "monospace", letterSpacing: "0.1em", marginLeft: "8px" } }, serialId)
                ),

                // Role label
                h("div", { style: { fontSize: "13px", fontWeight: 600, color: rl, letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "10px" } },
                    sport || ROLE_LABEL[role]
                ),

                // Name
                h("div", { style: { fontSize: nameFontSize, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: "8px" } },
                    displayName
                ),

                // slug + region
                h("div", { style: { fontSize: "16px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", marginBottom: "20px", letterSpacing: "0.03em" } },
                    `@${slug}${region ? ` · ${region}` : ""}`
                ),

                // Bio
                bio && h("div", { style: { fontSize: "16px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "28px", maxWidth: "520px" } }, bio),

                // Divider
                h("div", { style: { width: "48px", height: "2px", background: `linear-gradient(90deg, ${rl}, transparent)`, marginBottom: "24px" } }),

                // Stats
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

                // Bottom URL
                h("div", { style: { position: "absolute", bottom: "36px", right: "56px", display: "flex", alignItems: "center", gap: "10px" } },
                    h("span", { style: { fontSize: "12px", color: "rgba(255,255,255,0.2)", fontFamily: "monospace", letterSpacing: "0.05em" } },
                        `vizion-connection.jp/u/${slug}`
                    )
                )
            ),

            // ── Logo top-right ──
            h("div", { style: { position: "absolute", top: "28px", right: "56px", display: "flex", alignItems: "center", gap: "8px" } },
                h("span", { style: { fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace" } },
                    "VIZION CONNECTION"
                )
            ),

            // ── Role color accent line ──
            h("div", { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: `linear-gradient(to bottom, transparent, ${rl}, transparent)` } })
        ),
        { width: 1200, height: 630 }
    );
}