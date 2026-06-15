import { createElement as h } from "react";
import type { OgPortfolioData } from "@/features/og/server/og-portfolio-data";

// Portfolio Stories OG（1080×1920・縦長）。SNSストーリーズ向けに
// 「歩み」を縦構図で伝える。
export function StoriesPortfolioOGCard(d: OgPortfolioData): React.ReactElement {
    const rl = d.roleColor;
    const bg1 = d.roleGradient;
    const nameFz = d.displayName.length > 14 ? (d.displayName.length > 20 ? "52px" : "64px") : "76px";

    const stat = (value: string, label: string, color: string) =>
        h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" } },
            h("span", { style: { display: "flex", fontSize: "64px", fontWeight: 900, lineHeight: 1, color } }, value),
            h("span", { style: { display: "flex", fontSize: "20px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", fontFamily: "monospace" } }, label),
        );

    return h("div", {
        style: {
            width: "1080px", height: "1920px", display: "flex", flexDirection: "column",
            alignItems: "center", position: "relative", overflow: "hidden", fontFamily: "sans-serif",
            background: `linear-gradient(165deg, ${bg1} 0%, color-mix(in srgb, ${bg1} 45%, #000) 50%, #060606 100%)`,
            padding: "120px 80px",
        },
    },
        // グロー（上）
        h("div", { style: { position: "absolute", top: "-6%", left: "50%", marginLeft: "-340px", width: "680px", height: "680px", background: `radial-gradient(circle at center, ${rl}33, transparent 70%)`, display: "flex" } }),
        // 上部アクセントライン
        h("div", { style: { position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: `linear-gradient(90deg, ${rl}, transparent 70%)`, display: "flex" } }),

        // ロゴ / eyebrow
        d.logoData
            ? h("img", { src: d.logoData, height: 54, style: { height: "54px", width: "auto", opacity: 0.95 } })
            : h("span", { style: { display: "flex", fontSize: "30px", fontWeight: 800, letterSpacing: "0.2em", color: "#fff", fontFamily: "monospace" } }, "VIZION"),
        h("span", { style: { display: "flex", marginTop: "20px", fontSize: "24px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: rl, fontFamily: "monospace" } }, `${d.roleLabel} · PORTFOLIO`),

        // アバター
        h("div", {
            style: {
                marginTop: "80px", width: "420px", height: "420px", borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", overflow: "hidden",
                border: `6px solid ${rl}`, background: "#0c0c14", boxShadow: `0 0 0 16px ${rl}1f`,
            },
        },
            d.avatarData
                ? h("img", { src: d.avatarData, width: 420, height: 420, style: { width: "420px", height: "420px", objectFit: "cover" } })
                : h("span", { style: { display: "flex", fontSize: "170px", fontWeight: 900, color: `${rl}cc`, fontFamily: "monospace" } }, d.initials),
        ),

        // 名前
        h("div", { style: { display: "flex", marginTop: "64px", fontSize: nameFz, fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.01em", textAlign: "center", textShadow: "0 2px 10px rgba(0,0,0,0.55)" } }, d.displayName),

        // DAYカウント
        h("div", { style: { display: "flex", alignItems: "flex-end", gap: "18px", marginTop: "40px" } },
            h("span", { style: { display: "flex", fontSize: "40px", fontWeight: 800, color: "rgba(255,255,255,0.5)", paddingBottom: "26px" } }, "DAY"),
            h("span", { style: { display: "flex", fontSize: "200px", fontWeight: 900, lineHeight: 1, color: rl, textShadow: `0 0 60px ${rl}66` } }, String(d.dayCount)),
        ),

        // 統計
        h("div", { style: { display: "flex", alignItems: "center", gap: "80px", marginTop: "70px" } },
            stat(`${d.streak}`, "継続日数", "#fff"),
            stat(`${d.journeyCount}`, "Journey", "#fff"),
            stat(`${d.completion}%`, "完成度", rl),
        ),

        // 下部 CTA
        h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", position: "absolute", bottom: "90px", left: 0, right: 0 } },
            h("span", { style: { display: "flex", fontSize: "22px", fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)" } }, `vizion-connection.jp/u/${d.slug}/portfolio`),
            h("span", { style: { display: "flex", fontSize: "16px", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" } }, "PROOF OF YOUR JOURNEY"),
        ),
    );
}
