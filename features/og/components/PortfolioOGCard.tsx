import { createElement as h } from "react";
import type { OgPortfolioData } from "@/features/og/server/og-portfolio-data";

// Portfolio 専用 OG（1200×630）: 「この人の歩み」を一目で伝える。
// 左にロール/名前/DAYカウント、下に継続・記録・完成度、右にアバター。
export function PortfolioOGCard(d: OgPortfolioData): React.ReactElement {
    const rl = d.roleColor;
    const bg1 = d.roleGradient;
    const nameFz = d.displayName.length > 16 ? (d.displayName.length > 22 ? "40px" : "52px") : "64px";

    const stat = (value: string, label: string, color: string) =>
        h("div", { style: { display: "flex", flexDirection: "column", gap: "2px" } },
            h("span", { style: { display: "flex", fontSize: "44px", fontWeight: 900, lineHeight: 1, color } }, value),
            h("span", { style: { display: "flex", fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)", fontFamily: "monospace" } }, label),
        );

    return h("div", {
        style: {
            width: "1200px", height: "630px", display: "flex", position: "relative", overflow: "hidden",
            fontFamily: "sans-serif",
            background: `linear-gradient(145deg, ${bg1} 0%, color-mix(in srgb, ${bg1} 45%, #000) 55%, #060606 100%)`,
        },
    },
        // グロー（右上 / role color）
        h("div", { style: { position: "absolute", right: "-8%", top: "-12%", width: "440px", height: "440px", background: `radial-gradient(circle at center, ${rl}33, transparent 70%)`, display: "flex" } }),
        // 上部アクセントライン
        h("div", { style: { position: "absolute", top: 0, left: 0, right: 0, height: "5px", background: `linear-gradient(90deg, ${rl}, transparent 70%)`, display: "flex" } }),

        // ── 右: アバター ──
        h("div", { style: { position: "absolute", right: "70px", top: "0px", bottom: "0px", display: "flex", alignItems: "center" } },
            h("div", {
                style: {
                    width: "300px", height: "300px", borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center", overflow: "hidden",
                    border: `4px solid ${rl}`, background: "#0c0c14",
                    boxShadow: `0 0 0 10px ${rl}1f`,
                },
            },
                d.avatarData
                    ? h("img", { src: d.avatarData, width: 300, height: 300, style: { width: "300px", height: "300px", objectFit: "cover" } })
                    : h("span", { style: { display: "flex", fontSize: "120px", fontWeight: 900, color: `${rl}cc`, fontFamily: "monospace" } }, d.initials),
            ),
        ),

        // ── 左: テキスト ──
        h("div", {
            style: {
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                justifyContent: "space-between", padding: "56px 0 48px 64px", width: "62%",
            },
        },
            // eyebrow
            h("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
                h("span", { style: { display: "flex", fontSize: "15px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: rl, fontFamily: "monospace" } }, d.roleLabel),
                h("span", { style: { display: "flex", fontSize: "15px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontFamily: "monospace" } }, "· PORTFOLIO"),
            ),

            // 名前 + DAYカウント
            h("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } },
                h("div", { style: { display: "flex", fontSize: nameFz, fontWeight: 900, color: "#fff", lineHeight: 1.02, letterSpacing: "-0.01em", textShadow: "0 2px 8px rgba(0,0,0,0.55)" } }, d.displayName),
                h("div", { style: { display: "flex", alignItems: "flex-end", gap: "12px" } },
                    h("span", { style: { display: "flex", fontSize: "26px", fontWeight: 800, color: "rgba(255,255,255,0.5)", paddingBottom: "16px" } }, "DAY"),
                    h("span", { style: { display: "flex", fontSize: "120px", fontWeight: 900, lineHeight: 1, color: rl, textShadow: `0 0 40px ${rl}55` } }, String(d.dayCount)),
                ),
            ),

            // 下部: 統計 + ロゴ
            h("div", { style: { display: "flex", flexDirection: "column", gap: "22px" } },
                h("div", { style: { display: "flex", alignItems: "center", gap: "48px" } },
                    stat(`${d.streak}`, "継続日数", "#fff"),
                    stat(`${d.journeyCount}`, "Journey", "#fff"),
                    stat(`${d.completion}%`, "完成度", rl),
                ),
                d.logoData
                    ? h("img", { src: d.logoData, height: 30, style: { height: "30px", width: "auto", opacity: 0.92 } })
                    : h("span", { style: { display: "flex", fontSize: "16px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)", fontFamily: "monospace" } }, "VIZION CONNECTION"),
            ),
        ),
    );
}
