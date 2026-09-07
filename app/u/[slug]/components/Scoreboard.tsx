// app/u/[slug]/components/Scoreboard.tsx
// スコアボード — 実績の4数値（Cheer / Connector / Activities / Together）を1画面にまとめる。
// HeatPanel と同じ「ゲームHUD」表現（FONT.display 大数値＋monoラベル）で統一する。
import { INTERACTION, COLOR } from "@/lib/design/tokens";
import { VP, VP_DISPLAY_FONT, VP_MONO_FONT, vpPanel } from "../profile-theme";

export default function Scoreboard({
    cheerCount,
    connectorCount,
    activityCount,
    togetherCount,
}: {
    cheerCount: number;
    connectorCount: number;
    activityCount: number;
    togetherCount: number;
}) {
    const cells = [
        { label: "Cheer", value: cheerCount, color: COLOR.gold, glow: "0 0 18px rgba(255,214,0,0.35)" },
        { label: "Connector", value: connectorCount, color: VP.neon, glow: VP.textGlow },
        { label: "Activities", value: activityCount, color: VP.neon, glow: VP.textGlow },
        { label: "Together", value: togetherCount, color: VP.neonSoft, glow: "0 0 18px rgba(200,232,0,0.28)" },
    ];

    return (
        <section aria-label="実績">
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 10,
                    padding: 14,
                    ...vpPanel,
                }}
            >
                {cells.map((c) => (
                    <div
                        key={c.label}
                        style={{
                            borderRadius: INTERACTION.radius.card,
                            border: `1px solid ${VP.border}`,
                            background: "rgba(255,255,255,0.02)",
                            padding: "16px 14px 14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            minHeight: 90,
                            justifyContent: "center",
                        }}
                    >
                        <span style={{ fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: VP.faint, fontFamily: VP_MONO_FONT }}>
                            {c.label}
                        </span>
                        <span style={{ fontFamily: VP_DISPLAY_FONT, fontSize: 40, lineHeight: 1, color: c.color, textShadow: c.glow }}>
                            {c.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}