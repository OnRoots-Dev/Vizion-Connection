// app/(marketing)/business/page.tsx

import Link from "next/link";
import { BUSINESS_PLANS} from "@/features/business/constants";
import { HeaderLight } from "@/components/layout/HeaderLight";
import { FooterLight } from "@/components/layout/FooterLight";
import { FAQSectionLight } from "@/components/marketing/sections/FAQSectionLight";

export default function BusinessPage() {
  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7", color: "#1d1d1f" }}>
      <HeaderLight />

      <main className="max-w-3xl mx-auto px-8 space-y-36 py-28">

        {/* ── Hero ── */}
        <section className="space-y-8 pb-10">
          <p className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: "#007aff" }}>
            Business Partner Program
          </p>
          <h1 className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight"
            style={{ color: "#1d1d1f" }}>
            スポーツ業界の<br />最初期パートナーへ
          </h1>
          <p className="text-base leading-[1.9] max-w-lg" style={{ color: "#6e6e73" }}>
            Vizion Connection はアスリート・トレーナー・メンバーの
            信頼ネットワークインフラです。先行ポジションを確保した企業は、
            正式リリース後も最優先で露出され続けます。
          </p>
          <Link href="/business/checkout"
            className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-bold transition-all"
            style={{ background: "#1d1d1f", color: "#fff" }}>
            先行ポジションを確認する
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        {/* ── Why ── */}
        <section className="space-y-10 pb-10">
          <div className="space-y-2">
            <p className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(0,0,0,0.25)" }}>
              Why Vizion
            </p>
            <h2 className="text-2xl font-black" style={{ color: "#1d1d1f" }}>なぜ今、参加するのか</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { num: "01", title: "Network Infrastructure", desc: "SNSではなく、スポーツ業界の信頼ネットワークそのものを構築するインフラです。", color: "#ff3b30" },
              { num: "02", title: "Discovery Engine", desc: "アスリート・トレーナーを検索・フィルタリングできるDiscovery UIで企業の露出を最大化します。", color: "#007aff" },
              { num: "03", title: "Trust Visibility", desc: "役割と信頼を可視化するプロフィールが、ビジネスとスポーツ人材をつなぐ接点になります。", color: "#34c759" },
            ].map(({ num, title, desc, color }) => (
              <div key={num} className="space-y-4 p-6 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                }}>
                <span className="text-xs font-mono font-bold" style={{ color }}>{num}</span>
                <p className="text-sm font-bold leading-snug" style={{ color: "#1d1d1f" }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "#6e6e73" }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 先行特典 ── */}
        <section className="rounded-3xl p-10 space-y-4"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.95)",
            boxShadow: "0 4px 40px rgba(0,122,255,0.08)",
          }}>
          <p className=" tracking-[0.15em] uppercase" style={{ color: "#007aff" }}>
            Early Benefit
          </p>
          <p className="text-2xl font-black leading-snug" style={{ color: "#1d1d1f" }}>
            正式版リリース後<br />3ヶ月間を初回料金のみで
          </p>
          <p className="text-sm leading-relaxed max-w-md pt-2" style={{ color: "#6e6e73" }}>
            先行登録期間内に購入したすべてのプランに適用されます。
            早期参加ほど、より長期間・より低コストで Vizion Connection の成長と共に走ることができます。
          </p>
        </section>

        {/* ── Plans ── */}
        <section className="space-y-10 pt-10">
          <div className="space-y-2">
            <p className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(0,0,0,0.25)" }}>
              Plans
            </p>
            <h2 className="text-2xl font-black" style={{ color: "#1d1d1f" }}>先行ポジション</h2>
            <p className="text-sm" style={{ color: "#aeaeb2" }}>全プラン一括払い。座席数限定。</p>
          </div>

          <div className="space-y-4">
            {BUSINESS_PLANS.map((plan, i) => (
              <div key={plan.id}
                className="rounded-3xl overflow-hidden transition-all"
                style={{
                  background: plan.highlight ? "rgba(0,122,255,0.06)" : "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(30px)",
                  WebkitBackdropFilter: "blur(30px)",
                  border: plan.highlight ? "1px solid rgba(0,122,255,0.2)" : "1px solid rgba(255,255,255,0.95)",
                  boxShadow: plan.highlight ? "0 4px 40px rgba(0,122,255,0.1)" : "0 2px 20px rgba(0,0,0,0.05)",
                }}>

                <div className="px-7 pt-7 pb-5 flex items-start justify-between gap-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono" style={{ color: "rgba(0,0,0,0.2)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-base font-bold" style={{ color: "#1d1d1f" }}>{plan.name}</span>
                      {plan.highlight && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: "#007aff", color: "#fff" }}>
                          POPULAR
                        </span>
                      )}
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium"
                        style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.4)" }}>
                        {plan.seats} 枠
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: "#6e6e73" }}>{plan.tagline}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-black" style={{ color: "#1d1d1f" }}>{plan.priceLabel}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#aeaeb2" }}>一括払い</p>
                  </div>
                </div>

                <div style={{ height: "1px", background: "rgba(0,0,0,0.06)", margin: "0 28px" }} />

                <div className="px-7 py-5 grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
                  {plan.benefits.map((b) => (
                    <div key={b} className="flex items-start gap-2.5">
                      <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                        style={{ color: plan.highlight ? "#007aff" : "#aeaeb2" }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs leading-relaxed" style={{ color: "#6e6e73" }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-6">
            <Link href="/business/checkout"
              className="inline-flex items-center gap-3 rounded-full px-10 py-4 text-sm font-bold transition-all"
              style={{ background: "#1d1d1f", color: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
              先行ポジションを申し込む
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <FAQSectionLight />
      </main>

      <FooterLight />
    </div>
  );
}