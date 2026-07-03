// app/u/[slug]/BondAudience.tsx
// Bond（観客席）UI — 50席グリッド + 解放/特典バナー。
// 純presentational（hookなし）。globals.css の vcRing / vcPulse を再利用するため
// 追加の keyframes 定義は不要。data は親が算出済みの bondCount / isBonded を渡す。
// 脈動の演出に Lottie（pulse-line）を組み込む。

import { LottieAnim } from "@/components/ui/LottieAnim";
import { IconBond } from "@/lib/design/icons";

const BOND_ACCENT = "#a78bfa";
const SEAT_TOTAL = 50;

export default function BondAudience({
    bondCount,
    isBonded = false,
    accent = BOND_ACCENT,
}: {
    bondCount: number;
    isBonded?: boolean;
    accent?: string;
}) {
    const filled = Math.min(bondCount, SEAT_TOTAL);

    return (
        <div
            style={{
                padding: 20,
                background: "#111118",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            {/* Bond済み特典バナー */}
            {isBonded && (
                <div
                    style={{
                        padding: "10px 16px",
                        background: `${accent}1a`,
                        border: `1px solid ${accent}40`,
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#c4b5fd",
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <span aria-hidden style={{ display: "inline-flex", color: accent }}><IconBond size={13} /></span>
                    <span>Bond済み · 詳細Portfolioを閲覧できます</span>
                </div>
            )}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 16,
                }}
            >
                <span
                    style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        fontFamily: "'Space Mono', monospace",
                        color: "rgba(255,255,255,0.55)",
                    }}
                >
                    Bond · 観客席
                </span>
                {/* 脈動アクセント（Lottie） */}
                <span style={{ width: 64, height: 18, opacity: 0.6, flexShrink: 0 }} aria-hidden>
                    <LottieAnim src="/lottie/pulse-line.json" loop keepLastFrame={false} />
                </span>
            </div>

            {/* 席のグリッド（最大50席） */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(10, 1fr)",
                    gap: 4,
                    marginBottom: 12,
                }}
            >
                {Array.from({ length: SEAT_TOTAL }).map((_, i) => {
                    const isFilled = i < filled;
                    // 直近に埋まった3席を脈動させ「今まさに集まっている」感を出す
                    const isLeadingEdge = isFilled && i >= filled - 3;
                    return (
                        <div
                            key={i}
                            style={{
                                width: "100%",
                                aspectRatio: "1",
                                borderRadius: 3,
                                background: isFilled ? accent : "rgba(255,255,255,0.06)",
                                transition: "background 0.3s",
                                animation: isLeadingEdge ? "vcPulse 1.8s ease-in-out infinite" : undefined,
                            }}
                        />
                    );
                })}
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                }}
            >
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                    席が埋まるほど関係が深まる
                </span>
                <span
                    style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: accent,
                        fontFamily: "'Space Mono', monospace",
                    }}
                >
                    {bondCount.toLocaleString()}
                </span>
            </div>
        </div>
    );
}
