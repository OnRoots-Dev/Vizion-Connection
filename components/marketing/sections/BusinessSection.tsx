"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function NextPhaseSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#0B0B0F] px-5 py-24 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="border border-[#FFD600]/20 bg-[#FFD600]/[0.03] p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FFD600]" />
              <p className="font-display text-[10px] uppercase tracking-[0.5em] text-[#FFD600]">Now Available</p>
            </div>
            <h3 className="mb-6 font-display text-[clamp(22px,2.5vw,32px)] font-black text-white">現在利用できる機能</h3>
            <ul className="space-y-3">
              {[
                "プロフィール作成・公開",
                "プロフィールカード発行・共有",
                "Discovery（アスリート検索・一覧）",
                "ランキングページ",
                "collectカード機能",
                "Cheerによる応援・信頼の可視化",
                "ミッション・ポイントシステム",
                "Business Hub（企業向け広告・効果測定）",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-body text-[clamp(13px,1.2vw,15px)] text-white/65">
                  <span className="font-bold text-[#FFD600]">✔</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-8"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-[40px]" style={{ background: "radial-gradient(circle, rgba(255,214,0,0.15), transparent 70%)" }} />
            <div className="mb-6 flex items-center gap-3">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block h-2 w-2 rounded-full bg-white/40"
              />
              <p className="font-display text-[10px] uppercase tracking-[0.5em] text-white/30">Coming Next</p>
            </div>
            <h3 className="mb-2 font-display text-[clamp(22px,2.5vw,32px)] font-black text-white">次に広がる機能</h3>
            <p className="mb-6 font-mono text-[11px] tracking-wider text-white/30">ROLLING RELEASES</p>
            <ul className="space-y-3">
              {["Voice Lab", "Cheerコメント", "Trainer Hub", "Members Hub"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-body text-[clamp(13px,1.2vw,15px)] text-white/40">
                  <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-white/20" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-white/5 pt-4">
              <p className="font-body text-[12px] leading-relaxed text-white/25">
                Founding Memberはこれらを<span className="text-[#FFD600]/70">最初に体験</span>できます。
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function FoundingBusinessPartnersSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="border-t border-[#3282FF]/10 bg-[#020b18] px-5 py-24 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-[1200px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-2 font-display text-[11px] uppercase tracking-[0.45em] text-[#3282FF]"
        >
          For Business
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="mb-8 font-display text-[clamp(28px,4vw,56px)] font-black uppercase tracking-tight text-white"
        >
          Business Plans
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-14 max-w-[60ch] space-y-4 font-body text-[clamp(13px,1.4vw,16px)] leading-relaxed text-white/55"
        >
          <p>Vizion Connectionでは、企業・チーム・スポンサー向けに実運用ベースのBusinessプランを提供しています。</p>
          <p><span className="text-[#3282FF]">Roots / Roots+</span> は地域密着型、<span className="text-[#3282FF]">Signal以上</span> は全国展開向けです。広告掲載、Discovery露出、効果測定、Business Hub を段階的に解放します。</p>
        </motion.div>
      </div>
    </section>
  );
}

export function SponsorComparisonTable() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const plans = [
    {
      name: "Roots",
      price: "¥30,000",
      color: "#FFD600",
      scope: "地域密着型",
      features: "地方ブロック内表示（small） / ロゴ＋キャッチコピー / PRバッジ",
      seats: "各ブロック20枠（全国120枠）",
    },
    {
      name: "Roots+",
      price: "¥50,000",
      color: "#E2FF7A",
      scope: "地域密着型",
      features: "地方ブロック優先表示（medium） / 画像＋テキスト / Discovery優先表示 / PRバッジ",
      seats: "各ブロック10枠（全国60枠）",
    },
    {
      name: "Signal",
      price: "¥100,000",
      color: "#7EB6FF",
      scope: "全国展開向け",
      features: "全国露出 / ロゴ掲載 / Discovery表示 / Founding Memberへの優先露出",
      seats: "全国30枠",
    },
    {
      name: "Presence",
      price: "¥500,000",
      color: "#42D7A6",
      scope: "全国展開向け",
      features: "Discovery優先表示 / 地域ターゲット広告（1ブロック） / 月次レポート / Business Hub / A/Bテスト",
      seats: "全国10枠",
    },
    {
      name: "Legacy",
      price: "¥1,000,000",
      color: "#FF7A52",
      scope: "全国最上位",
      features: "全国最優先 / 全ブロック地域ターゲット / 月次レポート＋戦略MTG / Legacy認定 / コラボ優先権",
      seats: "全国5枠",
    },
  ];

  return (
    <section ref={ref} className="bg-[#020b18] px-5 pb-28 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-[1200px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-2 font-display text-[11px] uppercase tracking-[0.45em] text-[#3282FF]"
        >
          Sponsor Plans
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="mb-10 font-display text-[clamp(24px,3vw,40px)] font-black uppercase tracking-tight text-white"
        >
          Business Plan Comparison
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.8 }}
          className="mb-8 max-w-[72ch] font-body text-[clamp(13px,1.3vw,15px)] leading-relaxed text-white/55"
        >
          すべてのプランに「正式版3ヶ月間 月額料金で利用可能」の注記が付きます。Roots / Roots+ は地域密着型、Signal以上は全国展開向けの設計です。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-5"
        >
          {plans.map((plan) => (
            <div key={plan.name} className="border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-4">
                <div className="mb-3 h-[2px] w-10" style={{ background: plan.color }} />
                <p className="font-display text-[11px] uppercase tracking-[0.25em] text-white/45">{plan.scope}</p>
                <h3 className="mt-1 font-display text-[28px] font-black uppercase tracking-tight text-white">{plan.name}</h3>
                <p className="mt-1 font-display text-[22px] font-black" style={{ color: plan.color }}>{plan.price}</p>
              </div>
              <ul className="space-y-3 font-body text-[13px] leading-relaxed text-white/65">
                <li>✔ {plan.features}</li>
                <li>✔ 対象枠: {plan.seats}</li>
                <li>✔ 正式版3ヶ月間 月額料金で利用可能</li>
              </ul>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="mt-10 border border-[#FFD600]/20 bg-[#FFD600]/[0.04] p-7"
        >
          <p className="mb-3 font-display text-[10px] uppercase tracking-[0.4em] text-[#FFD600]">紹介インセンティブについて</p>
          <p className="font-body text-[clamp(13px,1.3vw,15px)] leading-relaxed text-white/65">
            紹介企業がスポンサー参加した場合、紹介者には
            <strong className="text-[#FFD600]">決済額の15%相当のVizion Point</strong>を付与。
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {["プロモーション掲載", "Discovery優先表示", "イベント参加"].map((use, i) => (
              <div key={i} className="flex items-center gap-2 font-body text-[13px] text-white/50">
                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#FFD600]/50" />
                Vizion Pointの用途：{use}
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-[10px] tracking-wider text-white/20">※現金化不可</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
        >
          <Link
            href="/business"
            className="inline-block bg-[#3282FF] px-8 py-4 font-display text-[13px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-[#1a6aee] hover:shadow-[0_0_24px_rgba(50,130,255,0.4)]"
            style={{ borderRadius: "2px" }}
          >
            Business登録はこちら
          </Link>
          <p className="font-mono text-[10px] tracking-wider text-white/25">※ 枠数限定 / 受付中 / 現在の実プランに準拠</p>
        </motion.div>
      </div>
    </section>
  );
}
