"use client";

// Business — Presence, not SaaS pricing. VIZION NATIVE.
// Pricing is secondary to Position / Place / People. Each tier has distinct presence.

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EditorialSection, EditorialHeading, VizionRule } from "@/lib/design/editorial";

const PLANS = [
  {
    name: "ROOTS",
    pos: "地元で、同じ場所に立つ。",
    desc: "1つの地方ブロックで、活動のすぐそばに存在する。地域の熱を、最も近くで支える。",
    meta: "PLACE · 1 Block",
    price: "¥30,000 / 4ヶ月",
    color: "#30de1d",
    bleed: "left" as const,
  },
  {
    name: "SIGNAL",
    pos: "全国で、見つけてもらう。",
    desc: "全国に存在し、Discoveryで優先的に出会われる。広く、継続的に届く。",
    meta: "PRESENCE · National",
    price: "¥100,000 / 4ヶ月",
    color: "#C8E800",
    bleed: "right" as const,
  },
  {
    name: "PRESENCE",
    pos: "街の中で、記憶に残る。",
    desc: "専任サポートとレポートで、街の活動とともにブランドが記憶される。効果が可視化される。",
    meta: "ACTIVITY · Report + Support",
    price: "¥300,000 / 4ヶ月",
    color: "#FFC81E",
    bleed: "left" as const,
  },
  {
    name: "LEGACY",
    pos: "文化を、共に創る。",
    desc: "共同開発と独占ポジションで、スポーツ文化そのものを長期で支える。未来を共に設計する。",
    meta: "CONNECTION · Co-creation",
    price: "個別見積",
    color: "#FF5050",
    bleed: "right" as const,
  },
] as const;

export function BusinessPlanSection() {
  const reduce = useReducedMotion();

  return (
    <EditorialSection background="accent-subtle" bleed>
      <div className="px-4 md:px-6 lg:px-8 mx-auto max-w-6xl">
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
        >
          <EditorialHeading label="BUSINESS — PRESENCE">ビジネスとして、挑戦を支える。</EditorialHeading>
          <p className="mt-4 font-[family-name:var(--font-bebas)] text-[clamp(24px,4.5vw,40px)] leading-none tracking-wide text-white/80">どの場所で、どの人々と、どの活動に関わるか</p>
        </motion.div>
      </div>

      {/* Varied rhythm: ROOTS as local map strip, SIGNAL as full glow, etc. */}
      <div className="mt-10 md:mt-14">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: i * 0.04 }}
            className={`border-t border-white/10 ${i === 0 ? "border-t-0" : ""}`}
          >
            <div className={`grid items-stretch ${plan.bleed === "left" ? "lg:grid-cols-[1.1fr_0.9fr]" : "lg:grid-cols-[0.9fr_1.1fr]"}`}>
              {/* Visual */}
              <div className={`${plan.bleed === "right" ? "lg:order-2" : ""} relative min-h-[260px] md:min-h-[320px] overflow-hidden border-white/10 ${plan.bleed === "left" ? "lg:border-r" : "lg:border-l"} bg-[#0a0a0f]`}>
                <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${plan.color}22, transparent 70%)` }} />
                {plan.name === "ROOTS" && (
                  <svg viewBox="0 0 400 320" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
                    <rect width="400" height="320" fill="#0e0e14" />
                    <line x1="0" y1="160" x2="400" y2="160" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                    <line x1="200" y1="0" x2="200" y2="320" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <circle cx="200" cy="160" r={28} fill={plan.color} opacity={0.14} />
                    <circle cx="200" cy="160" r={9} fill={plan.color} stroke="white" strokeWidth={1.5} />
                    <text x="200" y="200" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="rgba(255,255,255,0.35)">YOKOHAMA · 1 BLOCK</text>
                  </svg>
                )}
                {plan.name === "SIGNAL" && (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 font-mono text-[11px] tracking-[0.18em] uppercase text-white/60">SIGNAL · 全国 · Discovery優先</div>
                  </div>
                )}
                {plan.name === "PRESENCE" && (
                  <div className="absolute inset-0 p-6 flex flex-col justify-center gap-3">
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[68%] rounded-full" style={{ background: plan.color }} /></div>
                    <p className="font-mono text-[10px] tracking-wide text-white/40">月次レポート · 効果可視化 · 専任サポート</p>
                  </div>
                )}
                {plan.name === "LEGACY" && (
                  <div className="absolute inset-0 grid place-items-center p-6">
                    <p className="font-[family-name:var(--font-bebas)] text-[48px] leading-none tracking-wide" style={{ color: plan.color }}>∞</p>
                  </div>
                )}
                <p className="absolute left-4 top-4 font-mono text-[9px] tracking-[0.2em] uppercase text-white/30">{plan.meta}</p>
                <p className="absolute right-4 bottom-4 font-[family-name:var(--font-bebas)] text-[40px] leading-none tracking-wide opacity-10" style={{ color: plan.color }}>{plan.name}</p>
              </div>
              {/* Text */}
              <div className={`${plan.bleed === "right" ? "lg:order-1" : ""} px-6 md:px-8 lg:px-10 py-8 md:py-10 flex flex-col justify-center bg-[#0D0D12]`}>
                <p className="font-[family-name:var(--font-bebas)] text-[clamp(32px,5vw,44px)] leading-none tracking-wide text-white">{plan.name}</p>
                <p className="mt-2 font-mono text-[10px] tracking-[0.16em] uppercase" style={{ color: plan.color }}>{plan.pos}</p>
                <p className="mt-4 text-[14px] leading-[1.85] text-white/60">{plan.desc}</p>
                <div className="mt-6 flex items-center gap-4">
                  <span className="font-[family-name:var(--font-bebas)] text-xl" style={{ color: plan.color }}>{plan.price}</span>
                  <Link href="/business" className="font-mono text-[11px] tracking-[0.16em] uppercase text-white/50 hover:text-white transition-colors">詳細 →</Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-4 md:px-6 lg:px-8 mx-auto max-w-6xl">
        <VizionRule label="PRESENCE IS POSITION" />
        <p className="font-mono text-[10px] leading-relaxed tracking-wide text-white/25 max-w-2xl">料金は1ヶ月分で4ヶ月利用（1＋ボーナス3）。枠は各Tierで限定。詳細は /business へ。ビジネスが街の中に存在する体験を、まず地図で確かめる。</p>
      </div>
    </EditorialSection>
  );
}
