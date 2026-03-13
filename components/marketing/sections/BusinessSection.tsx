"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─── Next Phase Section ───────────────────────────────────────────────────────
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
              {["プロフィール作成", "プロフィールカード", "公開プロフィール"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-body text-[clamp(13px,1.2vw,15px)] text-white/65">
                  <span className="text-[#FFD600] font-bold">✔</span>
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
              <p className="font-display text-[10px] uppercase tracking-[0.5em] text-white/30">Next Phase</p>
            </div>
            <h3 className="mb-2 font-display text-[clamp(22px,2.5vw,32px)] font-black text-white">明日12:00解放</h3>
            <p className="mb-6 font-mono text-[11px] text-white/30 tracking-wider">UNLOCKING TOMORROW 12:00</p>
            <ul className="space-y-3">
              {["Discovery", "Openlab", "Cheerコメント"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-body text-[clamp(13px,1.2vw,15px)] text-white/40">
                  <span className="h-[5px] w-[5px] rounded-full bg-white/20 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-white/5 pt-4">
              <p className="font-body text-[12px] text-white/25 leading-relaxed">
                Foundingメンバーはこれらを<span className="text-[#FFD600]/70">最初に体験</span>できます。
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Founding Business Partners ───────────────────────────────────────────────
export function FoundingBusinessPartnersSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#020b18] border-t border-[#3282FF]/10 px-5 py-24 md:px-10 lg:px-16 xl:px-20">
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
          Founding Business<br />Partners
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-14 max-w-[60ch] space-y-4 font-body text-[clamp(13px,1.4vw,16px)] leading-relaxed text-white/55"
        >
          <p>Vizion Connectionでは、創業期の企業パートナーを<strong className="text-white/80">限定募集</strong>しています。</p>
          <p>スポーツコミュニティに直接つながるスポンサー体験。アスリート・トレーナー・コミュニティとの<span className="text-[#3282FF]">共創の機会</span>を提供します。</p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Sponsor Comparison Table ─────────────────────────────────────────────────
export function SponsorComparisonTable() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const plans = [
    { name: "Entry Supporter", price: "5万円", color: "#ffffff" },
    { name: "Starter Position", price: "10万円", color: "#28D26E" },
    { name: "Impact Partner", price: "30万円", color: "#FFD600" },
    { name: "Prime Sponsor", price: "50万円", color: "#FF8C00" },
    { name: "Champion Partner", price: "100万円", color: "#FF4646" },
  ];

  const rows = [
    { label: "掲載ロゴサイズ", values: ["小", "中", "中〜大", "大", "最大"] },
    { label: "掲載場所", values: ["一覧枠", "一覧＋詳細", "一覧＋特集", "特集", "最上位"] },
    { label: "PR掲載", values: ["社名", "ロゴ", "ロゴ＋紹介", "特集掲載", "プレス枠"] },
    { label: "アプリ内特典", values: ["バッジ", "先行表示", "インパクト枠", "主要スポンサー", "チャンピオン"] },
    { label: "アスリート連携", values: ["任意", "任意", "軽い連携", "コラボ可能", "コラボ保証"] },
    { label: "紹介導線", values: ["なし", "あり", "強化", "強化", "最大"] },
    { label: "紹介インセンティブ", values: ["20%", "20%", "20%", "20%", "20%"] },
    { label: "枠数", values: ["30", "20", "15", "10", "5"] },
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

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="overflow-x-auto pb-2"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-[#020b18] p-4 text-left">
                  <span className="font-display text-[9px] uppercase tracking-[0.4em] text-white/20">項目</span>
                </th>
                {plans.map((plan, i) => (
                  <th key={i} className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-[2px] w-8 mx-auto mb-2" style={{ background: plan.color }} />
                      <p className="font-display text-[10px] uppercase tracking-[0.15em] text-white/50">{plan.name}</p>
                      <p className="font-display text-[18px] font-black" style={{ color: plan.color }}>{plan.price}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"}>
                  <td className="sticky left-0 z-10 bg-inherit p-4">
                    <span className="font-body text-[12px] text-white/40 whitespace-nowrap">{row.label}</span>
                  </td>
                  {row.values.map((val, vi) => (
                    <td key={vi} className="p-4 text-center">
                      <span
                        className="font-mono text-[11px] font-bold"
                        style={{ color: val === "20%" ? "#FFD600" : plans[vi].color + "cc" }}
                      >
                        {val}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
          <p className="mt-4 font-mono text-[10px] text-white/20 tracking-wider">※現金化不可</p>
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
          <p className="font-mono text-[10px] text-white/25 tracking-wider">※ 枠数限定 / 先着順</p>
        </motion.div>
      </div>
    </section>
  );
}
