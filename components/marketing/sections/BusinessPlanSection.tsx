"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const PLANS = [
  {
    name: "Roots",
    price: "¥30,000",
    regularPrice: "¥120,000",
    period: "1ヶ月料金で4ヶ月利用",
    target: "地域密着型スポーツビジネス",
    features: ["プロフィール掲載", "Journey閲覧", "Discovery掲載"],
    color: "#30de1d",
  },
  {
    name: "Signal",
    price: "¥100,000",
    regularPrice: "¥400,000",
    period: "1ヶ月料金で4ヶ月利用",
    target: "全国展開を目指すブランド",
    features: ["Roots全機能", "Discovery優先表示", "効果測定レポート"],
    color: "var(--electric)",
  },
  {
    name: "Presence",
    price: "¥300,000",
    regularPrice: "¥1,200,000",
    period: "1ヶ月料金で4ヶ月利用",
    target: "スポーツ業界のリーディングカンパニー",
    features: ["Signal全機能", "専任サポート", "カスタム施策"],
    color: "var(--flame)",
  },
  {
    name: "Legacy",
    price: "個別見積",
    regularPrice: "",
    period: "",
    target: "長期パートナーシップを検討する企業",
    features: ["全機能", "共同開発権", "独占ポジション"],
    color: "#FF5050",
  },
] as const;

export function BusinessPlanSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="business" ref={ref} className="border-t border-white/5 bg-[#020b18] px-5 py-24 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-[1200px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-3 font-display text-[11px] uppercase tracking-[0.45em]"
          style={{ color: "var(--electric)" }}
        >
          Business Plans
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="mb-3 font-display text-[clamp(28px,4vw,56px)] font-black tracking-tight text-white"
        >
          ビジネスとして、挑戦を支える。
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.18, duration: 0.7 }}
          className="mb-14 font-body text-[clamp(13px,1.3vw,15px)] text-white/45"
        >
          スポーツに関わる企業・団体のためのプラン
        </motion.p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + index * 0.07, duration: 0.7 }}
              className="flex flex-col border border-white/10 bg-white/[0.02] p-6"
              style={{ borderRadius: 2 }}
            >
              <div className="mb-5 h-[2px] w-8" style={{ background: plan.color }} />
              <h3 className="mb-1 font-display text-[28px] font-black uppercase tracking-tight text-white">
                {plan.name}
              </h3>
              <div className="mb-1">
                {plan.regularPrice && (
                  <p className="mb-0.5 font-mono text-[11px] text-white/35 line-through">
                    通常 {plan.regularPrice}
                  </p>
                )}
                <span className="font-display text-[22px] font-black" style={{ color: plan.color }}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="ml-1.5 font-body text-[11px] text-white/45">{plan.period}</span>
                )}
              </div>
              <p className="mb-5 font-body text-[11px] leading-relaxed text-white/40">{plan.target}</p>
              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 font-body text-[13px] text-white/60">
                    <span className="mt-0.5 font-bold" style={{ color: plan.color }}>✔</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="block border border-white/15 py-3 text-center font-display text-[11px] font-black uppercase tracking-[0.2em] text-white/60 transition-all hover:border-white/30 hover:text-white"
                style={{ borderRadius: 2 }}
              >
                お問い合わせ
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-6 font-mono text-[10px] leading-relaxed tracking-wider text-white/25"
        >
          ※ 1ヶ月分の料金で合計4ヶ月利用可能（1ヶ月＋ボーナス3ヶ月）／キャンペーン期間：2026年7月19日〜7月31日
          <br />
          ※ 4ヶ月の利用期間終了後は、解約の申し出がない限り同額で自動継続されます。通常価格は月額×4の換算表示です。
          <br />
          ※ 料金・プラン内容の詳細は /business またはお問い合わせください
        </motion.p>
      </div>
    </section>
  );
}
