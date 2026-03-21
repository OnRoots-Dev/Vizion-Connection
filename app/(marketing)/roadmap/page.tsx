"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// ─── データ ───────────────────────────────────────────────────────────────────
const PHASES = [
    {
        id: "early",
        num: "01",
        label: "先行登録フェーズ",
        status: "current" as const,
        period: "2026 Mar –",
        tagline: "役割を名乗れ。信頼を刻め。",
        desc: "すべての始まり。プロフィールカードを手に入れた者が、最初の歴史を作る。",
        progress: 80,
        items: [
            { name: "Vizionプロフィールカード", done: true },
            { name: "公開プロフィールURL", done: true },
            { name: "初期メンバー番号", done: true },
            { name: "Cheer（応援）", done: true },
            { name: "プロフィール共有", done: true },
            { name: "招待リンク", done: true },
            { name: "ユーザーDiscovery（簡易）", done: false },
            { name: "Businessスポンサー枠", done: false },
            { name: "Vz Boost pt（先行付与）", done: false },
        ],
        accent: "#FFD600",
        accentDim: "#FFD60020",
        accentBorder: "#FFD60040",
        numColor: "#FFD600",
    },

    {
        id: "beta",
        num: "02",
        label: "β版",
        status: "upcoming" as const,
        period: "2026年 5月 公開予定",
        tagline: "つながりに、深さを。",
        desc: "Discoveryが進化し、人と人の間に意味ある接続が生まれ始める。",
        progress: 20,
        items: [
            { name: "Discovery拡張検索", done: false },
            { name: "フォロー / Synergy", done: false },
            { name: "Signal投稿（活動発信）", done: false },
            { name: "Cheer通知", done: false },
            { name: "スキルタグ", done: false },
            { name: "役割バッジ", done: false },
            { name: "Businessページ", done: false },
            { name: "スポンサー企業表示", done: false },
            { name: "プロフィールコメント", done: false },
            { name: "ユーザーランキング", done: false },
        ],
        accent: "#3282FF",
        accentDim: "#3282FF20",
        accentBorder: "#3282FF40",
        numColor: "#3282FF",
    },

    {
        id: "v1",
        num: "03",
        label: "正式版 v1.0",
        status: "future" as const,
        period: "2026年 9月 リリース予定",
        tagline: "信頼が、経済になる。",
        desc: "スポーツに関わるすべての人が、信頼を資産として活用できるプラットフォームへ。",
        progress: 0,
        items: [
            { name: "VZ Boost pt", done: false },
            { name: "Trust Score（信頼スコア）", done: false },
            { name: "Athlete Vote", done: false },
            { name: "AI Discovery", done: false },
            { name: "Athlete × Trainer マッチング", done: false },
            { name: "スポンサー案件投稿", done: false },
            { name: "スポンサー募集", done: false },
            { name: "VZ Market（商品 / サービス）", done: false },
            { name: "Athlete支援", done: false },
            { name: "イベント作成", done: false },
            { name: "コミュニティ機能", done: false },
            { name: "VZ MAP（スポーツ施設 / 人材）", done: false },
            { name: "プロフィールAnalytics", done: false },
            { name: "ビジネス案件マッチング", done: false },
        ],
        accent: "#FF4646",
        accentDim: "#FF464620",
        accentBorder: "#FF464640",
        numColor: "#FF4646",
    },

    {
        id: "extra",
        num: "04",
        label: "追実装",
        status: "future" as const,
        period: "2027年以降 順次展開",
        tagline: "信頼が、世界をつなぐ。",
        desc: "コミュニティの進化と共に、新しいスポーツ経済圏を広げていく。あなたと作っていく。",
        progress: 0,
        items: [
            { name: "国別コミュニティ", done: false },
            { name: "チーム / クラブページ", done: false },
            { name: "スポンサー分析ツール", done: false },
            { name: "試合 / 大会データ連携", done: false },
            { name: "NFT / デジタル証明", done: false },
            { name: "AIキャリア支援", done: false },
            { name: "グローバルスポンサー接続", done: false },
        ],
        accent: "#28D26E",
        accentDim: "#28D26E15",
        accentBorder: "#28D26E35",
        numColor: "#28D26E",
    },
] as const;

// ─── フェーズカード ────────────────────────────────────────────────────────────
function PhaseCard({ phase, index }: { phase: (typeof PHASES)[number]; index: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    const isCurrent = phase.status === "current";
    const isUpcoming = phase.status === "upcoming";

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 60 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
        >
            {/* フェーズ間コネクター */}
            {index < PHASES.length - 1 && (
                <div className="absolute left-[clamp(20px,5vw,48px)] top-full z-10 flex h-12 w-px flex-col items-center">
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={inView ? { scaleY: 1 } : {}}
                        transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                        className="h-full w-px origin-top"
                        style={{ background: `linear-gradient(to bottom, ${phase.accent}, transparent)` }}
                    />
                    <div className="h-2 w-2 -mt-1 rotate-45 border-b-2 border-r-2" style={{ borderColor: PHASES[index + 1].accent }} />
                </div>
            )}

            <div
                className="relative overflow-hidden rounded-[20px] border transition-all duration-500"
                style={{
                    background: isCurrent
                        ? `linear-gradient(135deg, #0B0B0F 0%, #1a1500 100%)`
                        : `#FAFAFA`,
                    borderColor: isCurrent ? phase.accentBorder : "#E5E5E5",
                    boxShadow: isCurrent
                        ? `0 0 0 1px ${phase.accentBorder}, 0 24px 60px ${phase.accentDim}, 0 4px 20px rgba(0,0,0,0.4)`
                        : `0 2px 16px rgba(0,0,0,0.06)`,
                }}
            >
                {/* 背景グロー（currentのみ） */}
                {isCurrent && (
                    <div
                        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[80px]"
                        style={{ background: `radial-gradient(circle, ${phase.accent}25, transparent 70%)` }}
                    />
                )}

                {/* ── ヘッダー行 ── */}
                <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between md:p-8 lg:p-10">
                    {/* 左: 番号 + ラベル */}
                    <div className="flex items-start gap-4 sm:gap-6">
                        {/* 大きな番号 */}
                        <div className="relative flex-shrink-0">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={inView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="font-display block font-black leading-none tracking-tighter"
                                style={{
                                    fontSize: "clamp(48px, 8vw, 96px)",
                                    color: isCurrent ? phase.accent : "#E5E5E5",
                                    WebkitTextStroke: isCurrent ? "0" : `1px ${phase.accent}40`,
                                }}
                            >
                                {phase.num}
                            </motion.span>
                            {/* パルス（current） */}
                            {isCurrent && (
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -inset-2 rounded-full"
                                    style={{ background: `radial-gradient(circle, ${phase.accent}30, transparent 70%)` }}
                                />
                            )}
                        </div>

                        <div className="pt-1">
                            {/* ステータスバッジ */}
                            <div className="mb-2 flex items-center gap-2">
                                {isCurrent && (
                                    <motion.span
                                        animate={{ opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider"
                                        style={{ background: `${phase.accent}20`, color: phase.accent, border: `1px solid ${phase.accent}50` }}
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: phase.accent }} />
                                        Live Now
                                    </motion.span>
                                )}
                                {isUpcoming && (
                                    <span className="rounded-full border border-[#3282FF]/40 bg-[#3282FF]/15 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#3282FF]/90">
                                        🔜 Coming Next — 5月公開
                                    </span>
                                )}
                            </div>

                            {/* 🗓 日程バッジ（大きく目立つ位置） */}
                            <div
                                className="mb-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 font-mono font-bold"
                                style={{
                                    fontSize: "clamp(12px, 1.6vw, 15px)",
                                    background: isCurrent ? `${phase.accent}18` : isUpcoming ? "rgba(50,130,255,0.08)" : "rgba(0,0,0,0.04)",
                                    border: `1.5px solid ${isCurrent ? phase.accentBorder : isUpcoming ? "rgba(50,130,255,0.3)" : "#DEDEDE"}`,
                                    color: isCurrent ? phase.accent : isUpcoming ? "#3282FF" : "#999999",
                                }}
                            >
                                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}>
                                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" />
                                </svg>
                                {phase.period}
                            </div>

                            <h2
                                className="font-display font-black leading-tight tracking-tight"
                                style={{
                                    fontSize: "clamp(18px, 3vw, 32px)",
                                    color: isCurrent ? "#FFFFFF" : "#111111",
                                }}
                            >
                                {phase.label}
                            </h2>
                            <p
                                className="mt-1 font-bold"
                                style={{
                                    fontSize: "clamp(13px, 1.5vw, 16px)",
                                    color: phase.accent,
                                }}
                            >
                                {phase.tagline}
                            </p>
                        </div>
                    </div>

                    {/* 右: 説明文 */}
                    <p
                        className="max-w-[320px] leading-relaxed"
                        style={{
                            fontSize: "clamp(12px, 1.2vw, 14px)",
                            color: isCurrent ? "rgba(255,255,255,0.45)" : "#888888",
                        }}
                    >
                        {phase.desc}
                    </p>
                </div>

                {/* ── 進捗バー（currentのみ） ── */}
                {isCurrent && (
                    <div className="mx-6 mb-6 md:mx-8 lg:mx-10">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-white/25">Progress</span>
                            <span className="font-display text-[20px] font-black" style={{ color: phase.accent }}>
                                {phase.progress}%
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={inView ? { width: `${phase.progress}%` } : {}}
                                transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${phase.accent}, ${phase.accent}99)` }}
                            />
                        </div>
                    </div>
                )}

                {/* ── セパレーター ── */}
                <div
                    className="mx-6 mb-6 h-px md:mx-8 lg:mx-10"
                    style={{ background: isCurrent ? `linear-gradient(90deg, ${phase.accentBorder}, transparent)` : "#EEEEEE" }}
                />

                {/* ── 機能グリッド ── */}
                <div className="px-6 pb-8 md:px-8 lg:px-10">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                        {phase.items.map((item, i) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: 12 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.3 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                                className="group flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 transition-all duration-200"
                                style={{
                                    background: item.done
                                        ? `${phase.accent}12`
                                        : isCurrent
                                            ? "rgba(255,255,255,0.03)"
                                            : "rgba(0,0,0,0.02)",
                                    border: `1px solid ${item.done ? phase.accentBorder : isCurrent ? "rgba(255,255,255,0.06)" : "#EBEBEB"}`,
                                }}
                            >
                                {/* アイコン */}
                                <div
                                    className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                                    style={{
                                        background: item.done ? phase.accent : isCurrent ? "rgba(255,255,255,0.08)" : "#EEEEEE",
                                    }}
                                >
                                    {item.done ? (
                                        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                                            <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <div className="h-1 w-1 rounded-full" style={{ background: isCurrent ? "rgba(255,255,255,0.3)" : "#CCCCCC" }} />
                                    )}
                                </div>

                                <span
                                    className="font-body leading-snug"
                                    style={{
                                        fontSize: "11px",
                                        color: item.done
                                            ? isCurrent ? "#FFFFFF" : "#111111"
                                            : isCurrent ? "rgba(255,255,255,0.4)" : "#999999",
                                        fontWeight: item.done ? 600 : 400,
                                    }}
                                >
                                    {item.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── ページヘッダー ────────────────────────────────────────────────────────────
function PageHeader() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    return (
        <div ref={ref} className="relative overflow-hidden pb-16 pt-10 text-center">
            {/* 背景の装飾文字 */}
            <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
                aria-hidden
            >
                <span
                    className="font-display font-black uppercase tracking-tighter text-[#F0F0F0]"
                    style={{ fontSize: "clamp(80px, 20vw, 220px)", lineHeight: 1 }}
                >
                    ROAD
                </span>
            </div>

            <div className="relative z-10">
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-3 font-mono text-[11px] uppercase tracking-[0.5em] text-black/30"
                >
                    Vizion Connection
                </motion.p>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="font-display font-black uppercase tracking-tight text-[#0B0B0F]"
                    style={{ fontSize: "clamp(36px, 6vw, 72px)" }}
                >
                    Roadmap
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.7, delay: 0.25 }}
                    className="mt-3 font-body text-[clamp(13px,1.3vw,16px)] text-black/45"
                >
                    スポーツの未来を、段階的に解放していく。
                </motion.p>

                {/* フェーズ数カウント */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-8 flex items-center justify-center gap-6"
                >
                    {PHASES.map((p) => (
                        <div key={p.id} className="flex flex-col items-center gap-1">
                            <div className="h-1.5 w-8 rounded-full" style={{ background: p.accent, opacity: p.status === "current" ? 1 : 0.25 }} />
                            <span className="font-mono text-[8px] uppercase tracking-widest text-black/30">{p.num}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

// ─── ページ本体 ───────────────────────────────────────────────────────────────
export default function RoadmapPage() {
    return (
        <>
            <Header />
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+JP:wght@300;400;600;700;900&display=swap');
        .font-display { font-family: 'Bebas Neue', 'Noto Sans JP', sans-serif; }
        .font-body    { font-family: 'Noto Sans JP', sans-serif; }
        .font-mono    { font-family: 'SF Mono', 'Fira Code', monospace; }
        html { scroll-behavior: smooth; }
      `}</style>

            <div className="min-h-screen bg-white">
                {/* ヘッダー分のオフセット（Header コンポーネントが fixed 想定） */}
                <div className="pt-[70px]">
                    <div className="mx-auto max-w-[860px] px-4 sm:px-6 lg:px-8">

                        {/* ページヘッダー */}
                        <PageHeader />

                        {/* フェーズカード一覧 */}
                        <div className="flex flex-col gap-12 pb-24">
                            {PHASES.map((phase, i) => (
                                <PhaseCard key={phase.id} phase={phase} index={i} />
                            ))}
                        </div>

                        {/* フッターCTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="mb-24 flex flex-col items-center gap-4 text-center"
                        >
                            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-black/25">
                                最初の一歩を踏み出す
                            </p>
                            <Link
                                href="/register"
                                className="group inline-flex items-center gap-3 bg-[#eee417] px-8 py-4 font-display text-[14px] uppercase tracking-[0.2em] text-black transition-all hover:bg-[#d4c912] "
                                style={{ borderRadius: "4px" }}
                            >
                                先行登録する
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current transition-transform group-hover:translate-x-1">
                                    <path d="M13.22 19.03a.75.75 0 010-1.06L18.19 13H3.75a.75.75 0 010-1.5h14.44l-4.97-4.97a.75.75 0 011.06-1.06l6.25 6.25a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 01-1.06 0z" />
                                </svg>
                            </Link>
                            <p className="font-body py-3 text-[11px] text-black/25">Founding Member 枠 · 無料<br />随時、追加や変更がある可能性がございます。予めご了承ください。</p>
                        </motion.div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}