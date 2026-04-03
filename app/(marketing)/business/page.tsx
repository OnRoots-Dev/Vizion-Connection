"use client";

import Link from "next/link";
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
  { q: "Q. 決済方法は？", a: "Square決済（クレジットカード）または銀行振込に対応しています。法人請求書が必要な場合は銀行振込をお選びください。" },
  { q: "Q. 先行特典の詳細は？", a: "正式版リリース後3ヶ月間、追加料金なしで同プランを継続利用できます。" },
  { q: "Q. キャンセルはできますか？", a: "先行登録期間中のキャンセルは原則承っておりません。詳細はお問い合わせください。" },
  { q: "Q. 紹介制度はありますか？", a: "紹介いただいた企業が成約した場合、決済額の15%相当のVizion Pointを付与します。" },
];

const TABLE_ROWS = [
  ["単価", "3万円", "5万円", "10万円", "50万円", "100万円"],
  ["枠数", "120枠", "60枠", "30枠", "10枠", "5枠"],
  ["表示エリア", "地方ブロック", "地方ブロック", "全国", "全国", "全国"],
  ["表示サイズ", "small", "medium", "medium", "large", "hero"],
  ["Discovery表示", "—", "優先", "通常", "優先", "最優先"],
  ["地域広告枠", "—", "—", "—", "1ブロック", "全ブロック"],
  ["月次レポート", "—", "—", "—", "✓", "✓"],
  ["戦略MTG", "—", "—", "—", "—", "✓"],
  ["正式版3ヶ月無料", "✓", "✓", "✓", "✓", "✓"],
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
                Vizion Connection は、アスリート・トレーナー・メンバーの信頼ネットワークインフラです。
                先行ポジションを確保した企業は、正式リリース後も最優先で露出され続けます。
              </p>
              <Link
                href="/business/checkout"
                className="anim-fade-up inline-flex items-center gap-2.5 rounded-md bg-[#00d2ff] px-7 py-3.5 text-[.85rem] font-bold tracking-[.04em] text-[#07080f] shadow-[0_0_28px_rgba(0,210,255,0.3)] transition-all hover:bg-white hover:shadow-[0_0_40px_rgba(0,210,255,0.5)] [animation-delay:.3s]"
              >
                先行ポジションを確認する
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
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
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[.2em] text-[#00d2ff]">Early Benefit</p>
              <h2 className="text-[clamp(1.4rem,3.5vw,2.2rem)] font-extrabold leading-[1.2] tracking-[-0.01em] text-white">
                正式版リリース後 3ヶ月間を<br />初回料金のみで利用可能。
              </h2>
              <p className="mt-4 max-w-2xl text-[.85rem] font-light leading-[1.9] text-[#5a6070]">
                先行登録期間内に購入したすべてのプランに適用されます。
                早期参加ほど、より長期間・より低コストで Vizion Connection の成長と共に走ることができます。
              </p>
            </section>

            {/* ── Plans ── */}
            <section className="space-y-5">
              <div>
                <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[.22em] text-[#3a3f50]">Plans</p>
                <h2 className="text-[clamp(1.6rem,4vw,2.6rem)] font-extrabold tracking-[-0.02em] text-white">先行ポジション</h2>
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
                        <p className="mt-0.5 font-mono text-[.7rem] tracking-[.05em] text-[#3a3f50]">{plan.seats} seats</p>
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
                  </article>
                ))}
              </div>
            </section>

            <div className="bg-black min-h-screen">
              <h1 className="text-white mb-8">地方別プラン対象エリア</h1>
              <JapanMap />
            </div>

            {/* ── Comparison table ── */}
            <section>
              <p className="mb-4 font-mono text-[9px] uppercase tracking-[.22em] text-[#00d2ff]">Plan Comparison</p>
              <div className="overflow-x-auto rounded-xl border border-white/6 bg-[#0e1018]">
                <table className="w-full min-w-[780px] border-collapse text-[.78rem]">
                  <thead>
                    <tr className="border-b border-white/6">
                      <th className="px-5 py-3.5 text-left font-mono text-[.72rem] font-normal tracking-[.05em] text-[#3a3f50]">項目</th>
                      {["Roots", "Roots+", "Signal", "Presence", "Legacy"].map((h) => (
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
                    <strong className="font-semibold text-[#c8cdd8]">銀行振込</strong>（請求書発行可能）→ 法人経費での処理に対応
                    <br /><br />
                    <span className="font-semibold text-[#c8cdd8]">銀行振込先</span>
                    <br />
                    ・口座情報はお申し込み完了後の自動返信メールに記載されます
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
                先行ポジションを申し込む
              </h2>
              <p className="mb-8 text-[.82rem] font-light text-[#5a6070]">締切を過ぎると先行特典は失効します。</p>
              <Link
                href="/business/checkout"
                className="inline-flex items-center gap-2.5 rounded-md bg-[#00d2ff] px-8 py-3.5 text-[.85rem] font-bold tracking-[.04em] text-[#07080f] shadow-[0_0_28px_rgba(0,210,255,0.3)] transition-all hover:bg-white hover:shadow-[0_0_40px_rgba(0,210,255,0.5)]"
              >
                今すぐ申し込む
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
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

          <Footer />
        </div>
      </div>
    </>
  );
}
