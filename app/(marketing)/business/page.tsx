"use client";

import Link from "next/link";
import { useState } from "react";
import { BUSINESS_PLANS } from "@/features/business/constants";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import JapanMap from "@/components/marketing/JapanMap";

const WHY_ITEMS = [
  { num: "01", title: "Network Infrastructure", desc: "SNSではなく、スポーツ業界の信頼ネットワークそのものを構築するインフラです。" },
  { num: "02", title: "Discovery Engine", desc: "アスリート・トレーナーを検索・フィルタリングできるDiscovery UIで企業の露出を最大化します。" },
  { num: "03", title: "Trust Visibility", desc: "役割と信頼を可視化するプロフィールが、ビジネスとスポーツ人材をつなぐ接点になります。" },
  { num: "04", title: "Local Impact", desc: "地方ブロック単位の広告配信で、地元のアスリート・ファンにダイレクトにリーチできます。" },
];

const FAQS = [
  { q: "Q. 地方プランはどのブロックを選べますか？", a: "北海道・東北 / 関東 / 中部 / 近畿 / 中国・四国 / 九州・沖縄の6ブロックから選択できます。申し込み後の確認メールにてご希望ブロックをお知らせください。" },
  { q: "Q. 複数ブロックに出稿できますか？", a: "可能です。ブロックごとに1プランとしてお申し込みください。" },
  { q: "Q. 決済方法は？", a: "Square決済（クレジットカード）は全プランでご利用いただけます。銀行振込・請求書払いは Signal / Presence / Legacy が対象です。法人請求書が必要な場合は銀行振込をお選びください。" },
  { q: "Q. 特典の詳細は？", a: "全プランで正式版3ヶ月間を月額料金のまま利用できます。" },
  { q: "Q. キャンセルはできますか？", a: "決済後の扱いはプランや決済方法によって異なります。詳細はお問い合わせください。" },
  { q: "Q. 紹介制度はありますか？", a: "紹介いただいた企業が成約した場合、決済額の15%相当のVizion Pointを付与します。" },
];

const TABLE_ROWS = [
  ["単価", "3万円", "10万円", "50万円", "100万円"],
  ["枠数", "120枠", "30枠", "10枠", "5枠"],
  ["表示エリア", "地方ブロック", "全国", "全国", "全国"],
  ["表示サイズ", "small", "medium", "large", "hero"],
  ["Discovery表示", "—", "表示", "優先", "最優先"],
  ["地域広告枠", "—", "—", "1ブロック", "全ブロック"],
  ["月次レポート", "—", "—", "✓", "✓"],
  ["戦略MTG", "—", "—", "—", "✓"],
  ["正式版3ヶ月間 月額料金で利用可能", "✓", "✓", "✓", "✓"],
];

// セルの強調判定
const isAccent = (v: string) => ["✓", "最優先", "優先"].includes(v);

const REGION_COLORS = {
  hokkaidoTohoku: "#00d2ff",
  kanto: "#5ad7ff",
  chubu: "#7c82ff",
  kinki: "#a871ff",
  chugokuShikoku: "#ff8bd6",
  kyushuOkinawa: "#ff7a7a",
};

const REGION_LEGEND = [
  { key: "hokkaidoTohoku", label: "北海道・東北" },
  { key: "kanto", label: "関東" },
  { key: "chubu", label: "中部" },
  { key: "kinki", label: "近畿" },
  { key: "chugokuShikoku", label: "中国・四国" },
  { key: "kyushuOkinawa", label: "九州・沖縄" },
] as const;

export default function BusinessPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:.2} }
        .anim-fade-up { animation:fadeUp .7s ease both; }
        .anim-blink   { animation:dotBlink 1.8s ease infinite; }
        /* グリッド背景 */
        .grid-bg::before {
          content:''; position:fixed; inset:0;
          background-image:
            linear-gradient(rgba(0,210,255,.022) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,210,255,.022) 1px,transparent 1px);
          background-size:60px 60px;
          pointer-events:none; z-index:0;
        }
      `}</style>

      <div className="grid-bg relative min-h-screen overflow-x-hidden bg-[#07080f] text-[#e8eaf0]">
        <div className="relative z-10">
          <Header />

          <main className="mx-auto max-w-5xl space-y-20 px-6 py-24 md:px-10">

            {/* ── Hero ── */}
            <section className="space-y-6 pt-8">
              <div className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-[#00d2ff]/20 bg-[#00d2ff]/6 px-4 py-1.5">
                <span className="anim-blink h-1.5 w-1.5 rounded-full bg-[#00d2ff]" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-[#00d2ff]">
                  Business Partner Program
                </span>
              </div>
              <h1 className="anim-fade-up text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-white [animation-delay:.1s]">
                スポーツ業界の<br />
                <span className="bg-gradient-to-r from-[#00d2ff] to-[#7c82ff] bg-clip-text text-transparent">
                  最初期パートナー
                </span>へ。
              </h1>
              <p className="anim-fade-up max-w-xl text-[.9rem] font-light leading-[1.9] text-[#5a6070] [animation-delay:.2s]">
                Vizion Connection は、アスリート・トレーナー・クルーの信頼ネットワークインフラです。
                Roots は地域密着型、Signal以上は全国展開向け。広告掲載、Discovery露出、Business Hub、効果測定まで実装済みの範囲から利用できます。
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="anim-fade-up inline-flex items-center gap-2.5 rounded-md bg-[#00d2ff] px-7 py-3.5 text-[.85rem] font-bold tracking-[.04em] text-[#07080f] shadow-[0_0_28px_rgba(0,210,255,0.3)] transition-all hover:bg-white hover:shadow-[0_0_40px_rgba(0,210,255,0.5)] [animation-delay:.3s]"
              >
                プランを選ぶ
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </section>

            {/* separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#00d2ff]/12 to-transparent" />

            {/* ── Why Vizion ── */}
            <section className="space-y-5">
              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-[.22em] text-[#3a3f50]">Why Vizion</p>
                <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold tracking-[-0.02em] text-white">
                  インフラになる、プラットフォームではなく。
                </h2>
              </div>
              {/* 2×2 grid with 1px gap / shared border effect */}
              <div className="grid grid-cols-1 gap-px bg-white/6 overflow-hidden rounded-xl border border-white/6 sm:grid-cols-2">
                {WHY_ITEMS.map((item) => (
                  <article key={item.num} className="bg-[#0e1018] p-7 transition-colors hover:bg-[#13151f]">
                    <p className="mb-2.5 font-mono text-[11px] tracking-[.1em] text-[#00d2ff]/70">{item.num}</p>
                    <h3 className="mb-2 text-[1rem] font-bold text-white">{item.title}</h3>
                    <p className="text-[.82rem] font-light leading-[1.85] text-[#5a6070]">{item.desc}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* ── Early Benefit ── */}
            <section className="relative overflow-hidden rounded-xl border border-[#00d2ff]/14 bg-gradient-to-br from-[#00d2ff]/7 to-[#7c82ff]/4 p-9 md:p-11">
              {/* glow blob */}
              <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-[#00d2ff]/7 blur-3xl" />
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[.2em] text-[#00d2ff]">Plan Benefit</p>
              <h2 className="text-[clamp(1.4rem,3.5vw,2.2rem)] font-extrabold leading-[1.2] tracking-[-0.01em] text-white">
                正式版3ヶ月間を<br />月額料金で利用可能。
              </h2>
              <p className="mt-4 max-w-2xl text-[.85rem] font-light leading-[1.9] text-[#5a6070]">
                Roots から Legacy まで、現在提供中のすべてのBusinessプランに適用されます。
                地域密着で始めたい企業も、全国で存在感を取りたい企業も、現状に合うプランから参加できます。
              </p>
            </section>

            {/* ── Plans ── */}
            <section className="space-y-5">
              <div>
                <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[.22em] text-[#3a3f50]">Plans</p>
                <h2 className="text-[clamp(1.6rem,4vw,2.6rem)] font-extrabold tracking-[-0.02em] text-white">Businessプラン</h2>
                <p className="mt-1 font-mono text-[.78rem] tracking-[.05em] text-[#3a3f50]">全プラン一括払い — 座席数限定</p>
              </div>
              <div className="flex flex-col gap-3">
                {BUSINESS_PLANS.map((plan) => (
                  <article
                    key={plan.id}
                    className="overflow-hidden rounded-xl border border-white/6 bg-[#0e1018] transition-all hover:border-[#00d2ff]/20 hover:shadow-[0_0_30px_rgba(0,210,255,0.05)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 px-8 pt-6 pb-5">
                      <div>
                        <p className="text-[1.35rem] font-extrabold tracking-[-0.01em] text-white">{plan.name}</p>
                        <p className="mt-1 text-[.78rem] font-light text-[#5a6070]">{plan.tagline}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[1.5rem] font-extrabold text-white">{plan.priceLabel}</p>
                        <p className="mt-0.5 font-mono text-[.7rem] tracking-[.05em] text-[#00d2ff]/70">全国{plan.seats}枠限定</p>
                      </div>
                    </div>
                    <div className="mx-8 h-px bg-white/6" />
                    <div className="grid grid-cols-1 gap-x-6 gap-y-2 px-8 py-5 sm:grid-cols-2">
                      {plan.benefits.map((b) => (
                        <p key={b} className="flex items-start gap-2 text-[.78rem] font-light text-[#7a8494]">
                          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00d2ff]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {b}
                        </p>
                      ))}
                    </div>
                    <div className="px-8 pb-6">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlan(plan.id);
                          setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-md bg-[#00d2ff] px-6 py-2.5 text-[.82rem] font-bold tracking-[.04em] text-[#07080f] shadow-[0_0_20px_rgba(0,210,255,0.25)] transition-all hover:bg-white"
                      >
                        {plan.amount === 0 ? "個別相談する" : "このプランで申し込む"}
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <p className="font-mono text-[9px] uppercase tracking-[.22em] text-[#3a3f50]">Coverage Area</p>
              <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold tracking-[-0.02em] text-white">
                地方別プラン対象エリア
              </h2>
              <JapanMap />
            </section>

            {/* ── Comparison table ── */}
            <section>
              <p className="mb-4 font-mono text-[9px] uppercase tracking-[.22em] text-[#00d2ff]">Plan Comparison</p>
              <div className="overflow-x-auto rounded-xl border border-white/6 bg-[#0e1018]">
                <table className="w-full min-w-[780px] border-collapse text-[.78rem]">
                  <thead>
                    <tr className="border-b border-white/6">
                      <th className="px-5 py-3.5 text-left font-mono text-[.72rem] font-normal tracking-[.05em] text-[#3a3f50]">項目</th>
                      {["Roots", "Signal", "Presence", "Legacy"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left font-extrabold text-white">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TABLE_ROWS.map((row, ri) => (
                      <tr key={ri} className="border-b border-white/3 last:border-0">
                        <td className="px-5 py-2.5 text-[#9099b0]">{row[0]}</td>
                        {row.slice(1).map((col, ci) => (
                          <td key={ci} className={[
                            "px-5 py-2.5 font-mono text-[.72rem] tracking-[.02em]",
                            isAccent(col) ? "text-[#00d2ff]" : "text-[#5a6070]",
                          ].join(" ")}>{col}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Incentive + Payment ── */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                {
                  tag: "Referral", title: "紹介インセンティブ",
                  body: <>紹介企業がスポンサー参加した場合、紹介者には<strong className="font-semibold text-[#c8cdd8]"> 決済額の15%相当のVizion Point </strong>を付与。プロモーション掲載の延長・Discovery優先表示の強化・イベント参加権として活用できます（現金化不可）。</>,
                },
                {
                  tag: "Payment", title: "決済方法",
                  body: <>
                    <strong className="font-semibold text-[#c8cdd8]">Square決済</strong>（クレジットカード）→ 即時確定・今すぐ申込可能
                    <br /><br />
                    <strong className="font-semibold text-[#c8cdd8]">銀行振込</strong>（請求書発行可能）→ 法人経費での処理に対応（Signal / Presence / Legacy が対象）
                    <br /><br />
                    <span className="font-semibold text-[#c8cdd8]">銀行振込先</span>
                    <br />
                    ・お問い合わせ後、運営より口座情報を記載した案内メールをお送りします（Signal / Presence / Legacy が対象）
                    <br />
                    ・振込名義は「申込企業名」でお願いいたします
                    <br />
                    ・請求書が必要な場合は備考欄にご記載ください
                  </>,
                },
              ].map(({ tag, title, body }) => (
                <div key={tag} className="rounded-xl border border-white/6 bg-[#0e1018] p-7">
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-[.2em] text-[#00d2ff]">{tag}</p>
                  <h3 className="mb-3.5 text-[1.1rem] font-extrabold text-white">{title}</h3>
                  <p className="text-[.8rem] font-light leading-[1.95] text-[#5a6070]">{body}</p>
                </div>
              ))}
            </section>

            {/* ── CTA ── */}
            <section className="relative overflow-hidden rounded-2xl border border-[#00d2ff]/12 bg-gradient-to-br from-[#00d2ff]/6 to-[#7c82ff]/4 py-12 px-8 text-center">
              <div className="pointer-events-none absolute -bottom-12 left-1/2 h-32 w-72 -translate-x-1/2 rounded-full bg-[#00d2ff]/10 blur-3xl" />
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[.2em] text-[#00d2ff]">Limited Seats Available</p>
              <h2 className="mb-4 text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold tracking-[-0.02em] text-white">
                Businessプランを申し込む
              </h2>
              <p className="mb-8 text-[.82rem] font-light text-[#5a6070]">現在受付中です。プランを選択してそのままお申し込みいただけます。</p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2.5 rounded-md bg-[#00d2ff] px-8 py-3.5 text-[.85rem] font-bold tracking-[.04em] text-[#07080f] shadow-[0_0_28px_rgba(0,210,255,0.3)] transition-all hover:bg-white hover:shadow-[0_0_40px_rgba(0,210,255,0.5)]"
              >
                プランを選ぶ
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </section>

            {/* ── FAQ ── */}
            <section className="space-y-4">
              <p className="font-mono text-[9px] uppercase tracking-[.22em] text-[#3a3f50]">FAQ</p>
              <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold tracking-[-0.02em] text-white">よくある質問</h2>
              <div className="flex flex-col gap-2">
                {FAQS.map((item) => (
                  <article key={item.q} className="rounded-xl border border-white/6 bg-[#0e1018] px-6 py-5 transition-colors hover:border-[#00d2ff]/12">
                    <p className="mb-2 text-[.83rem] font-semibold text-[#d0d4de]">{item.q}</p>
                    <p className="text-[.78rem] font-light leading-[1.85] text-[#5a6070]">{item.a}</p>
                  </article>
                ))}
              </div>
            </section>

            <p className="pb-2 text-center font-mono text-[10px] tracking-[.12em] text-[#3a3f50]">
              © 2026 VIZION CONNECTION. ALL RIGHTS RESERVED.
            </p>
          </main>

          {modalOpen && (
            <div
              onClick={() => setModalOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "24px",
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "#0e1018",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 20,
                  padding: "40px 36px",
                  maxWidth: 440,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#00d2ff",
                    marginBottom: 12,
                  }}
                >
                  Business Account
                </p>

                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: 12,
                    lineHeight: 1.3,
                  }}
                >
                  申し込みにはアカウントが必要です
                </h2>

                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.8,
                    marginBottom: 32,
                  }}
                >
                  Businessアカウントを無料で作成して、
                  そのままプランを購入できます。
                  {selectedPlan && (
                    <span
                      style={{
                        display: "block",
                        marginTop: 8,
                        color: "#00d2ff",
                        fontWeight: 700,
                      }}
                    >
                      選択中：{selectedPlan}
                    </span>
                  )}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <a
                    href={`/register?role=Business${selectedPlan ? `&plan=${selectedPlan}` : ""}`}
                    style={{
                      display: "block",
                      padding: "14px 24px",
                      background: "#00d2ff",
                      color: "#07080f",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    無料登録して申し込む →
                  </a>

                  <a
                    href={`/login?redirect=${encodeURIComponent(
                      `/dashboard/business/checkout${selectedPlan ? `?plan=${selectedPlan}` : ""}`
                    )}`}
                    style={{
                      display: "block",
                      padding: "14px 24px",
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.6)",
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: 13,
                      textDecoration: "none",
                    }}
                  >
                    すでにアカウントをお持ちの方
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    marginTop: 20,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.3)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  閉じる
                </button>
              </div>
            </div>
          )}

          <Footer />
        </div>
      </div>
    </>
  );
}
