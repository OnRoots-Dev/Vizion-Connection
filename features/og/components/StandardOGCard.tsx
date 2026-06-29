import { createElement as h } from "react";
import type { OgProfileData } from "@/features/og/server/og-data-service";

const ACCENT = "#C8E800";

export function StandardOGCard(profile: OgProfileData): React.ReactElement {
    const displayName = profile.displayName;
    const bio = profile.bio;
    const sport = profile.sport;
    const location = profile.location;
    const cheerCount = profile.cheerCount;
    const serialId = profile.serialId;
    const isFounding = profile.isFounding;
    const rl = profile.roleColor;
    const bg1 = profile.roleGradient;
    const initials = profile.initials;
    const bgData = profile.bgData;
    const roleLabel = profile.roleLabel;

    // ── OG 1200×630 ── シャープ版：黒背景・アクセント・ロールバッジ
    const nameFz = displayName.length > 16 ? (displayName.length > 22 ? "42px" : "54px") : "68px";

    return h("div", {
        style: {
            width: "1200px", height: "630px",
            display: "flex", position: "relative",
            overflow: "hidden", fontFamily: "monospace, sans-serif",
            background: "#050508",
        }
    },
        // ── ロールカラーグラデーション（左側）
        h("div", { style: { position: "absolute", inset: 0, background: `linear-gradient(115deg, ${bg1} 0%, rgba(5,5,8,0.85) 45%, #050508 100%)`, display: "flex" } }),

        // ── グリッドライン
        h("div", { style: { position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg, ${ACCENT}05 0px, ${ACCENT}05 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, ${ACCENT}05 0px, ${ACCENT}05 1px, transparent 1px, transparent 80px)`, display: "flex" } }),

        // ── Sheen（光沢）
        h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(128deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.01) 30%,transparent 55%)", display: "flex" } }),

        // ── ロールカラーグロー（右上）
        h("div", { style: { position: "absolute", right: "-8%", top: "-15%", width: "420px", height: "420px", background: `radial-gradient(circle at center, ${rl}28, transparent 68%)`, display: "flex" } }),

        // ── ACCENT グロー（左下）
        h("div", { style: { position: "absolute", left: "-5%", bottom: "-20%", width: "300px", height: "300px", background: `radial-gradient(circle at center, ${ACCENT}10, transparent 65%)`, display: "flex" } }),

        // ── 写真（右側、maskでフェード）
        bgData
            ? h("img", {
                src: bgData,
                style: {
                    position: "absolute", bottom: 0, right: "-8px",
                    width: "60%", height: "105%",
                    objectFit: "cover", objectPosition: "center top",
                    WebkitMaskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 16%,black 38%)",
                    maskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 16%,black 38%)",
                }
            })
            : h("div", {
                style: {
                    position: "absolute", bottom: 0, right: "-8px",
                    width: "60%", height: "116%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "180px", fontWeight: 900, color: `${rl}06`,
                    fontFamily: "monospace",
                    WebkitMaskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 16%,black 38%)",
                    maskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 16%,black 38%)",
                }
            }, initials),

        // ── 左テキストエリア（44%幅）
        h("div", {
            style: {
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                padding: "32px 0 28px 36px",
                width: "46%",
            }
        },
            // 上部：ロールバッジ + founding + location
            h("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } },
                // ロールバッジ（シャープ）
                h("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
                    h("div", {
                        style: {
                            display: "flex", alignItems: "center", gap: "6px",
                            padding: "5px 12px", borderRadius: "3px",
                            background: rl, alignSelf: "flex-start",
                        }
                    },
                        h("span", { style: { fontSize: "11px", fontWeight: 900, color: "#000000", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace" } }, roleLabel)
                    ),
                    isFounding && h("div", {
                        style: {
                            display: "flex", alignItems: "center",
                            padding: "5px 10px", borderRadius: "3px",
                            background: `${ACCENT}18`, border: `1px solid ${ACCENT}55`,
                        }
                    },
                        h("span", { style: { fontSize: "9px", fontWeight: 900, color: ACCENT, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace" } }, "FOUNDING")
                    )
                ),
                // location
                location && h("span", { style: { fontSize: "12px", fontFamily: "monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)" } }, location)
            ),

            // 中部：名前 → sport → Cheer
            h("div", { style: { display: "flex", flexDirection: "column", gap: "6px" } },
                h("div", {
                    style: {
                        fontSize: nameFz, fontWeight: 900, color: "#ffffff",
                        lineHeight: 1.0, letterSpacing: "-0.02em", display: "flex",
                        textShadow: `0 0 40px ${rl}30, 0 2px 8px rgba(0,0,0,0.8)`,
                    }
                }, displayName),
                (sport || bio) && h("span", { style: { fontSize: "14px", fontFamily: "monospace", letterSpacing: "0.06em", color: "rgba(255,255,255,0.45)", marginTop: "2px" } }, sport || bio),
                h("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" } },
                    h("div", { style: { width: "3px", height: "28px", background: "#FFD600", borderRadius: "2px", display: "flex" } }),
                    h("div", { style: { display: "flex", flexDirection: "column", gap: "1px" } },
                        h("span", { style: { fontSize: "8px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)", fontFamily: "monospace", textTransform: "uppercase" } }, "Cheer"),
                        h("span", { style: { fontSize: "26px", fontWeight: 900, lineHeight: 1, color: "#FFD600", fontFamily: "monospace" } }, cheerCount.toLocaleString())
                    )
                )
            ),

            // 下部：serial ID + CTA
            h("div", { style: { display: "flex", flexDirection: "column", gap: "6px" } },
                h("span", { style: { fontSize: "14px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", fontFamily: "monospace" } }, serialId),
                h("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
                    h("div", { style: { width: "20px", height: "1px", background: `${ACCENT}60`, display: "flex" } }),
                    h("span", { style: { fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: `${ACCENT}70`, fontFamily: "monospace" } }, "VIZION CONNECTION")
                )
            )
        ),

        // ── Watermark（右下）
        h("div", { style: { position: "absolute", bottom: "12px", right: "16px", fontFamily: "monospace", fontSize: "7px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.07)", display: "flex" } },
            "PROOF OF EXISTENCE"
        )
    );
}
