// app/roadmap/page.tsx

import { Header } from "@/components/layout/Header";
import { motion } from "framer-motion";
import { Footer } from "@/components/layout/Footer";

const roleColor = "#a78bfa";

const PHASES = [
    {
        id: "early",
        label: "先行登録フェーズ",
        status: "current" as const,
        items: ["Vizionプロフィールカード", "公開プロフィールURL", "Cheer（応援）", "ユーザーDiscovery", "招待リンク", "Businessスポンサー"],
        progress: 80,
    },
    {
        id: "beta",
        label: "β版",
        status: "upcoming" as const,
        items: ["Discovery拡張検索", "フォロー / Synergy", "Signal投稿", "Cheer通知", "スキルタグ", "Businessページ"],
        progress: 0,
    },
    {
        id: "v1",
        label: "正式版",
        status: "future" as const,
        items: ["VZ Boost pt", "Athlete Vote", "Trust Score", "AI Discovery", "Athlete×Trainerマッチング", "スポンサー案件投稿","VZ Market", "Athlete支援", "イベント作成", "コミュニティ機能", "VZ MAP", "プロフィールAnalytics"],
        progress: 0,
    },
    {
        id: "extra",
        label: "追実装",
        status: "future" as const,
        items: ["Comming soon..."],
        progress: 0,
    },
];

const STATUS_CONFIG = {
    current: { color: roleColor, bg: `${roleColor}15`, border: `${roleColor}40`, badge: "NOW", dotPulse: true },
    upcoming: { color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.12)", badge: "NEXT", dotPulse: false },
    future: { color: "rgba(255,255,255,0.2)", bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.06)", badge: null, dotPulse: false },
};

export default function RoadmapPage() {
    return (
        <div className="space-y-10">
            <Header />
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-center">Roadmap</h1>
                <p className="mt-1 text-sm text-slate-400 text-center">Vizion Connection の開発フェーズと今後の予定</p>
            </div>

            {/* Timeline */}
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "0" }}>

               {/* 縦ライン */}
                <div style={{
                    position: "absolute", left: "clamp(80px, 20vw, 119px)", top: "12px", bottom: "12px", width: "1px",
                    background: "linear-gradient(to bottom, rgba(167,139,250,0.6), rgba(255,255,255,0.06) 60%, transparent)",
                }} />

                {PHASES.map((phase, i) => {
                    const cfg = STATUS_CONFIG[phase.status];
                    return (
                        <div key={phase.id} style={{ display: "flex", gap: "0", alignItems: "flex-start", marginBottom: i < PHASES.length - 1 ? "32px" : "0" }}>

                            {/* 左カラム：フェーズ名 */}
                            <div style={{ width: "clamp(72px, 20vw, 120px)", flexShrink: 0, paddingTop: "2px", paddingRight: "12px", textAlign: "right" }}>
                                <span style={{
                                    fontSize: "9px", fontWeight: 800, letterSpacing: "0.15em",
                                    textTransform: "uppercase", fontFamily: "monospace",
                                    color: cfg.color, lineHeight: 1.4,
                                    display: "block",
                                }}>
                                    <span className="hidden sm:inline">{phase.label}</span>
                                    <span className="sm:hidden">{phase.label.replace("フェーズ", "").replace("先行登録", "先行").trim()}</span>
                                </span>
                                {cfg.badge && (
                                    <span style={{
                                        display: "inline-block", marginTop: "4px",
                                        fontSize: "8px", fontWeight: 900, padding: "2px 6px",
                                        borderRadius: "4px", letterSpacing: "0.12em",
                                        background: `${roleColor}20`, color: roleColor,
                                        border: `1px solid ${roleColor}40`,
                                    }}>
                                        {cfg.badge}
                                    </span>
                                )}
                            </div>

                            {/* ドット */}
                            <div style={{ position: "relative", flexShrink: 0, width: "20px", display: "flex", justifyContent: "center", paddingTop: "3px" }}>
                                {cfg.dotPulse && (
                                    <div style={{
                                        position: "absolute", width: "16px", height: "16px",
                                        borderRadius: "50%", background: `${roleColor}20`,
                                        top: "0px", left: "2px",
                                        animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                                    }} />
                                )}
                                <div style={{
                                    width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0,
                                    background: phase.status === "current" ? roleColor : cfg.color,
                                    border: `2px solid ${phase.status === "current" ? roleColor : "rgba(255,255,255,0.15)"}`,
                                    boxShadow: phase.status === "current" ? `0 0 10px ${roleColor}60` : "none",
                                    position: "relative", zIndex: 1,
                                }} />
                            </div>

                            {/* 右カラム：カード */}
                            <div style={{
                                flex: 1, marginLeft: "12px", marginRight: "2vw", minWidth: 0,
                                background: cfg.bg,
                                border: `1px solid ${cfg.border}`,
                                borderRadius: "14px", padding: "16px 18px",
                            }}>
                                {/* 進捗バー（currentのみ） */}
                                {phase.status === "current" && (
                                    <div style={{ marginBottom: "14px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Progress</span>
                                            <span style={{ fontSize: "10px", fontWeight: 800, color: roleColor }}>{phase.progress}%</span>
                                        </div>
                                        <div style={{ height: "3px", borderRadius: "99px", background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                                            <div style={{
                                                height: "100%", borderRadius: "99px",
                                                width: `${phase.progress}%`,
                                                background: `linear-gradient(90deg, ${roleColor}, ${roleColor}cc)`,
                                                transition: "width 1s ease",
                                            }} />
                                        </div>
                                    </div>
                                )}

                                {/* アイテムグリッド */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "5px" }}>
                                    {phase.items.map(item => (
                                        <div key={item} style={{
                                            display: "flex", alignItems: "center", gap: "7px",
                                            padding: "7px 10px", borderRadius: "8px",
                                            background: phase.status === "current" ? `${roleColor}06` : "rgba(255,255,255,0.02)",
                                        }}>
                                            {phase.status === "current" ? (
                                                <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke={roleColor} strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <div style={{ width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0, background: cfg.color }} />
                                            )}
                                            <span style={{ fontSize: "11px", color: cfg.color, lineHeight: 1.3 }}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ping アニメーション用CSS */}
            <style>{`
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
        <Footer />
        </div>
    );
}