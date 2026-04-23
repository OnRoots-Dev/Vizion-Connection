"use client";

// dashboard/views/RoadmapView.tsx
import { motion } from "framer-motion";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { ViewHeader } from "@/app/(app)/dashboard/components/ui";

const PHASES_DATA = [
    {
        id: "early", num: "01", label: "先行登録フェーズ", status: "current" as const,
        period: "2026年 3月 –", tagline: "役割を名乗れ。信頼を刻め。",
        desc: "すべての始まり。プロフィールカードを手に入れた者が、最初の歴史を作る。",
        progress: 100,
        items: [
            { name: "ダッシュボード", done: true },
            { name: "通知", done: true },
            { name: "プロフィール", done: true },
            { name: "Vizionプロフィールカード", done: true },
            { name: "公開プロフィールURL", done: true },
            { name: "初期メンバー番号", done: true },
            { name: "Cheer（応援）", done: true },
            { name: "プロフィール共有", done: true },
            { name: "招待リンク（Vc Boost）", done: true },
            { name: "スケジュール管理", done: true },
            { name: "Career（4ロール対応）", done: true },
            { name: "ミッション", done: true },
            { name: "ロードマップ", done: true },
            { name: "Voice Lab（ご意見BOX）", done: true },
            { name: "News Rooms", done: true },
            { name: "Businessページ", done: true },
            { name: "ユーザーDiscovery（簡易）", done: true },
            { name: "Businessスポンサー枠", done: true },
            { name: "Vz Boost pt（先行付与）", done: true },
            { name: "デイリーログ", done: true },
            { name: "デイリーミッション", done: true },
            { name: "ロードマップ解放カウンター", done: false },
        ],
        accent: "#FFD600", accentDim: "#FFD60020", accentBorder: "#FFD60040",
    },
    {
        id: "beta", num: "02", label: "β版", status: "upcoming" as const,
        period: "2026年 5月 公開予定", tagline: "つながりに、深さを。",
        desc: "Discoveryが進化し、人と人の間に意味ある接続が生まれ始める。",
        progress: 0,
        items: [
            { name: "Discovery拡張検索", done: false },
            { name: "フォロー / Synergy", done: false },
            { name: "Signal投稿（活動発信）", done: false },
            { name: "スキルタグ", done: false },
            { name: "役割バッジ", done: false },
            { name: "プロフィールコメント", done: false },
            { name: "Cheer通知", done: false },
            { name: "Businessページ拡張", done: false },
            { name: "スポンサー企業表示", done: false },
            { name: "メンタル・コンディションログ（アスリート）", done: false },
            { name: "指導実績ポートフォリオ（トレーナー）", done: false },
            { name: "Vizionサークル（メンバーズ）", done: false },
            { name: "バリュー・シミュレーター（ビジネス）", done: false },
            { name: "V-Score（Vizion Score）β", done: false },
            { name: "ユーザーランキング（活動量ベース）", done: false },
        ],
        accent: "#3282FF", accentDim: "#3282FF20", accentBorder: "#3282FF40",
    },
    {
        id: "v1", num: "03", label: "正式版 v1.0", status: "future" as const,
        period: "2026年 9月 リリース予定", tagline: "信頼が、経済になる。",
        desc: "スポーツに関わるすべての人が、信頼を資産として活用できるプラットフォームへ。",
        progress: 0,
        items: [
            { name: "Vc Map（Mapboxリアルマップ）", done: false },
            { name: "Base（個人活動ダッシュボード）", done: false },
            { name: "Synergy（コミュニティ・チームアップ）", done: false },
            { name: "Arena（イベント作成・掲載）", done: false },
            { name: "タイムライン投稿", done: false },
            { name: "スポンサー案件マッチング", done: false },
            { name: "オファー機能", done: false },
            { name: "スポンサー・スマートコントラクト", done: false },
            { name: "スポンサーシップ・ピッチデッキ自動生成", done: false },
            { name: "スキル・マーケットプレイス（トレーナー）", done: false },
            { name: "マルチデバイス・アナリティクス（トレーナー）", done: false },
            { name: "Vizion Quest（メンバーズ）", done: false },
            { name: "スカウティング・フィルター", done: false },
            { name: "コラボレーション・ハブ", done: false },
            { name: "アスリート・リソース・インベントリ（ビジネス）", done: false },
            { name: "VC Business Hub（広告効果測定）", done: false },
            { name: "Trust Score（信頼スコア）正式版", done: false },
            { name: "AI Discovery", done: false },
            { name: "プロフィールAnalytics", done: false },
        ],
        accent: "#FF4646", accentDim: "#FF464620", accentBorder: "#FF464640",
    },
    {
        id: "extra", num: "04", label: "追実装", status: "future" as const,
        period: "2027年以降 順次展開", tagline: "信頼が、世界をつなぐ。",
        desc: "コミュニティの進化と共に、新しいスポーツ経済圏を広げていく。あなたと作っていく。",
        progress: 0,
        items: [
            { name: "FanTrise（ファンクラブ作成）", done: false },
            { name: "ExElog（ヘルスケア管理）", done: false },
            { name: "Rin（アパレルブランド＋トラッキングウェア）", done: false },
            { name: "Buyout Skills（スキルマーケットプレイス）", done: false },
            { name: "VC Insight（アンケート代行）", done: false },
            { name: "VC DataHub（B2Bデータサービス）", done: false },
            { name: "Formless : me（スポーツ医療支援）", done: false },
            { name: "応援証明書（SBT / NFT）発行", done: false },
            { name: "国別コミュニティ", done: false },
            { name: "チーム / クラブページ", done: false },
            { name: "グローバルスポンサー接続", done: false },
            { name: "AIキャリア支援", done: false },
            { name: "Athlete Odyssey（YouTube / Podcast）", done: false },
        ],
        accent: "#28D26E", accentDim: "#28D26E15", accentBorder: "#28D26E35",
    },
] as const;

export function RoadmapView({ t, roleColor, setView }: {
    t: ThemeColors; roleColor: string; setView: (v: DashboardView) => void;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Roadmap" sub="スポーツの未来を、段階的に解放していく。" onBack={() => setView("home")} t={t} roleColor={roleColor} />

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {PHASES_DATA.map(p => (
                    <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
                        <div style={{ height: 4, width: "100%", borderRadius: 99, background: p.accent, opacity: p.status === "current" ? 1 : 0.2 }} />
                        <span style={{ fontSize: 8, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: p.status === "current" ? p.accent : t.sub, opacity: p.status === "current" ? 1 : 0.4 }}>{p.num}</span>
                    </div>
                ))}
            </motion.div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {PHASES_DATA.map((phase, index) => {
                    const isCurrent = phase.status === "current";
                    const isUpcoming = phase.status === "upcoming";
                    return (
                        <motion.div key={phase.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 + index * 0.08, ease: [0.16, 1, 0.3, 1] }} style={{ position: "relative" }}>
                            {index < PHASES_DATA.length - 1 && (
                                <div style={{ position: "absolute", left: 24, top: "100%", width: 1, height: 16, zIndex: 1, background: `linear-gradient(to bottom, ${phase.accent}, transparent)` }} />
                            )}
                            <div style={{ borderRadius: 18, overflow: "hidden", position: "relative", background: isCurrent ? "linear-gradient(135deg, #0B0B0F 0%, #1a1500 100%)" : "rgba(255,255,255,0.025)", border: `1px solid ${isCurrent ? phase.accentBorder : "rgba(255,255,255,0.08)"}`, boxShadow: isCurrent ? `0 0 0 1px ${phase.accentBorder}, 0 16px 48px ${phase.accentDim}` : "none" }}>
                                {isCurrent && <div style={{ position: "absolute", right: -60, top: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${phase.accent}20, transparent 70%)`, pointerEvents: "none" }} />}

                                <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                                        <div style={{ position: "relative", flexShrink: 0 }}>
                                            <span className="font-display" style={{ fontSize: "clamp(40px,8vw,72px)", fontWeight: 900, lineHeight: 1, color: isCurrent ? phase.accent : "rgba(255,255,255,0.08)", WebkitTextStroke: isCurrent ? "0" : `1px ${phase.accent}30`, display: "block" }}>
                                                {phase.num}
                                            </span>
                                            {isCurrent && (
                                                <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.35, 0, 0.35] }} transition={{ duration: 2.5, repeat: Infinity }}
                                                    style={{ position: "absolute", inset: -8, borderRadius: "50%", background: `radial-gradient(circle, ${phase.accent}25, transparent 70%)` }} />
                                            )}
                                        </div>
                                        <div style={{ paddingTop: 4 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                                                {isCurrent && (
                                                    <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                                                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 99, fontSize: 9, fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", background: `${phase.accent}20`, color: phase.accent, border: `1px solid ${phase.accent}45` }}>
                                                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: phase.accent, display: "inline-block" }} />
                                                        Live Now
                                                    </motion.span>
                                                )}
                                                {isUpcoming && (
                                                    <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 9, fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", background: "rgba(50,130,255,0.1)", color: "#3282FF", border: "1px solid rgba(50,130,255,0.25)" }}>Coming Next</span>
                                                )}
                                                <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: isCurrent ? phase.accent + "80" : t.sub, opacity: isCurrent ? 1 : 0.4 }}>{phase.period}</span>
                                            </div>
                                            <h3 className="font-display" style={{ fontSize: "clamp(16px,3vw,26px)", fontWeight: 900, color: isCurrent ? "#fff" : t.sub, margin: "0 0 3px", opacity: isCurrent ? 1 : 0.6 }}>{phase.label}</h3>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: phase.accent, margin: 0, opacity: isCurrent ? 1 : 0.5 }}>{phase.tagline}</p>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 11, color: isCurrent ? "rgba(255,255,255,0.4)" : t.sub, opacity: isCurrent ? 1 : 0.4, maxWidth: 200, lineHeight: 1.6, flexShrink: 0, textAlign: "right" }}>{phase.desc}</p>
                                </div>

                                {isCurrent && (
                                    <div style={{ margin: "0 20px 14px" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                            <span style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)" }}>Progress</span>
                                            <span className="font-display" style={{ fontSize: 18, color: phase.accent }}>{phase.progress}%</span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${phase.progress}%` }} transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${phase.accent}, ${phase.accent}88)` }} />
                                        </div>
                                    </div>
                                )}
                                <div style={{ height: 1, margin: "0 20px 14px", background: isCurrent ? `linear-gradient(90deg, ${phase.accentBorder}, transparent)` : "rgba(255,255,255,0.06)" }} />
                                <div style={{ padding: "0 20px 18px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 7 }}>
                                    {phase.items.map(item => (
                                        <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 9, background: item.done ? `${phase.accent}10` : isCurrent ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.015)", border: `1px solid ${item.done ? phase.accentBorder : isCurrent ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)"}`, opacity: phase.status === "future" ? 0.55 : 1 }}>
                                            <div style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: item.done ? phase.accent : isCurrent ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)" }}>
                                                {item.done
                                                    ? <svg viewBox="0 0 12 12" width={9} height={9} fill="none"><path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                    : <div style={{ width: 4, height: 4, borderRadius: "50%", background: isCurrent ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)" }} />
                                                }
                                            </div>
                                            <span style={{ fontSize: 10, color: item.done ? (isCurrent ? "#fff" : t.text) : isCurrent ? "rgba(255,255,255,0.4)" : t.sub, fontWeight: item.done ? 600 : 400, lineHeight: 1.3 }}>{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
