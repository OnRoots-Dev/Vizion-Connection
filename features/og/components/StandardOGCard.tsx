import { createElement as h } from "react";
import type { OgProfileData } from "@/features/og/server/og-data-service";

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

    // ── OG 1200×630 ── DEMOカードのフロント面を忠実再現
    const nameFz = displayName.length > 16 ? (displayName.length > 22 ? "36px" : "46px") : "58px";

    return h("div", {
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
                    h("span", { style: { fontSize: "10px", fontWeight: 900, color: rl, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" } }, isFounding ? "FOUNDING MEMBER" : "EARLY MEMBER")
                ),
                // location
                location && h("span", { style: { fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.06em", color: "rgba(255,255,255,0.55)" } }, location)
            ),

            // 中部：Role → 名前 → sport → Cheer
            h("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },
                h("span", { style: { fontSize: "12px", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", fontFamily: "monospace" } }, roleLabel),
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
}
