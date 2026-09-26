import { getFoundingMemberNumber, FOUNDING_MEMBER_NUMBER_BASE } from "@/lib/founding-member-number";

// Dev preview for founding member number verification (id=2,232,233,234)
// No auth required — for visual confirmation of "創設メンバー番号:1" for id=2
export default function FoundingPreviewPage() {
    const ids = [2, 232, 233, 234, 235];
    return (
        <div style={{ minHeight: "100vh", background: "#09090f", color: "#f0f0f5", padding: 24, fontFamily: "monospace" }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Founding Member Number Preview (BASE={FOUNDING_MEMBER_NUMBER_BASE})</h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 16 }}>
                id=2は特例で1、id=232以降は id - 230。重複なしを目視確認。
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
                {ids.map((id) => {
                    const n = getFoundingMemberNumber(id);
                    const isSpecial = id === 2;
                    return (
                        <div
                            key={id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "10px 14px",
                                borderRadius: 10,
                                background: isSpecial ? "rgba(255,214,0,0.12)" : "rgba(255,255,255,0.04)",
                                border: `1px solid ${isSpecial ? "rgba(255,214,0,0.3)" : "rgba(255,255,255,0.08)"}`,
                            }}
                        >
                            <span style={{ minWidth: 80, fontWeight: 700 }}>id={id}</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: isSpecial ? "#FFD600" : "#C8E800" }}>創設メンバー番号:{n}</span>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>(id - {isSpecial ? "special" : FOUNDING_MEMBER_NUMBER_BASE} = {n})</span>
                            {id === 2 ? <span style={{ marginLeft: "auto", fontSize: 11, color: "#FFD600", fontWeight: 700 }}>★ 特例</span> : null}
                        </div>
                    );
                })}
            </div>

            {/* BASE画面のVizion IDセクション相当の再現 (id=2) */}
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>BASE画面プレビュー (id=2)</h2>
            <div
                style={{
                    background: "#111118",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    maxWidth: 600,
                }}
            >
                <p style={{ margin: 0, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>Vizion ID</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.06em", color: "#f0f0f5", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px" }}>
                        VZ-2026-000002
                    </span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>@test-user-2</span>
                    <span style={{ padding: "4px 8px", borderRadius: 999, fontSize: 10, fontWeight: 800, background: "rgba(200,232,0,0.08)", color: "#C8E800", border: "1px solid rgba(200,232,0,0.22)" }}>Verified</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 10, background: "rgba(255,214,0,0.08)", border: "1px solid rgba(255,214,0,0.18)", alignSelf: "flex-start" }}>
                    <span style={{ fontSize: 11, color: "#FFD600", fontWeight: 800 }}>創設メンバー番号:{getFoundingMemberNumber(2)}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>(id=2 → 1)</span>
                </div>
            </div>

            {/* Join Stamp 画像相当 */}
            <h2 style={{ fontSize: 16, fontWeight: 800, marginTop: 24, marginBottom: 12 }}>Join Stamp 画像プレビュー (id=2)</h2>
            <div
                style={{
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    border: "3px solid #FFD600",
                    background: "radial-gradient(circle at 30% 30%, #fff8c0, #FFD600 60%, #c8940c 100%)",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 0 20px rgba(255,214,0,0.35), inset 0 0 12px rgba(255,255,255,0.6)",
                    marginLeft: 12,
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "#5a4000", fontWeight: 800 }}>No.</span>
                    <span style={{ fontSize: 48, fontWeight: 900, color: "#1a1200", lineHeight: 1 }}>{getFoundingMemberNumber(2)}</span>
                    <span style={{ fontSize: 10, color: "#5a4000" }}>創設メンバー番号:{getFoundingMemberNumber(2)}</span>
                </div>
            </div>
            <p style={{ marginTop: 8, marginLeft: 12, fontSize: 11, color: "#FFD600", fontWeight: 800 }}>創設メンバー番号:1 — Join Stamp id=2</p>
        </div>
    );
}
