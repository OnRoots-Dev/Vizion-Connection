"use client";

// Core Loop — VIZION NATIVE rewrite
// Not Heading→Description repetition. Each stage has distinct structure, density, and visual anchor.
// Activity / Place / People / Moment / Map are protagonists.

import { motion, useReducedMotion } from "framer-motion";
import { EditorialSection, EditorialHeading, TypographyBand, VizionRule, ActivityLedger, PlaceStrip } from "@/lib/design/editorial";

export function CoreLoopSection() {
  const reduce = useReducedMotion();

  return (
    <EditorialSection background="transparent" bleed>
      <div className="px-4 md:px-6 lg:px-8 mx-auto max-w-6xl">
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
        >
          <EditorialHeading label="THE CORE LOOP">ひとつの行動が、循環しはじめる。</EditorialHeading>
        </motion.div>
      </div>

      <TypographyBand text="ACTIVITY — PLACE — MOMENT — CONNECTION — DISCOVERY" size="sm" align="left" tone="faint" bleed />

      {/* 01 ACTIVITY — left ledger, right narrative. Asymmetric 58/42 */}
      <div className="px-4 md:px-6 lg:px-8 mx-auto max-w-6xl">
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] items-start border-t border-white/10 pt-12 md:pt-16"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e14] p-6 md:p-8">
            <p className="font-mono text-[9px] tracking-[0.28em] uppercase text-white/30 mb-6">RECENT ACTIVITY</p>
            <ActivityLedger
              items={[
                { date: "05.12", label: "Morning session", place: "横浜 · 港北", accent: true },
                { date: "05.10", label: "Training · 2h", place: "川崎 · とどろき" },
                { date: "05.07", label: "Match — vs Central", place: "横浜スタジアム" },
                { date: "05.03", label: "Recovery + Review", place: "横浜 · 日吉" },
              ]}
            />
            <span aria-hidden className="absolute -right-8 -top-8 font-[family-name:var(--font-bebas)] text-[140px] leading-none text-white/[0.04] select-none">01</span>
          </div>
          <div className="lg:pl-6">
            <p className="font-[family-name:var(--font-bebas)] text-[clamp(36px,6vw,56px)] leading-none tracking-wide text-white">ACTIVITY</p>
            <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--vc-accent)]">行動が、すべての始まり</p>
            <p className="mt-6 text-[15px] leading-[1.9] text-white/60">練習・試合・イベントを記録する。場所とともに残り、次の発見へつながる最小単位。</p>
          </div>
        </motion.div>
      </div>

      {/* 02 PROFILE — opposite asymmetry, people stack bleed to right */}
      <div className="px-4 md:px-6 lg:px-8 mx-auto max-w-6xl">
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] items-center border-t border-white/10 pt-12 md:pt-16 mt-12 md:mt-16"
        >
          <div>
            <p className="font-[family-name:var(--font-bebas)] text-[clamp(36px,6vw,56px)] leading-none tracking-wide text-white">PROFILE</p>
            <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-white/30">積み重ねが、見える化される</p>
            <p className="mt-6 text-[15px] leading-[1.9] text-white/60">経歴・場所・公開範囲がプロフィールに反映。あなたが何を重ねてきたかが、地図とタイムラインで読める。</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7 lg:ml-4">
            <div className="flex items-end gap-3">
              <div className="h-20 w-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-[family-name:var(--font-bebas)] text-2xl tracking-widest text-white/40">YT</div>
              <div className="flex -space-x-2">
                {["#30de1d", "#FF5050", "#FFC81E"].map((c, i) => (
                  <span key={c} className="h-8 w-8 rounded-full border-2 border-[#0e0e14]" style={{ background: c, transform: `translateY(${i * 2}px)` }} />
                ))}
              </div>
              <span className="ml-auto font-mono text-[10px] tracking-wide text-white/20">+ Connection</span>
            </div>
            <div className="mt-6 h-px bg-white/10" />
            <div className="mt-4 flex gap-6 font-mono text-[10px] tracking-[0.14em] uppercase">
              <span className="text-white/60">Yokohama</span><span className="text-white/20">·</span><span className="text-white/60">ATHLETE</span><span className="text-white/20">·</span><span className="text-[var(--vc-accent)]">公開中</span>
            </div>
            <span aria-hidden className="absolute -right-6 bottom-0 font-[family-name:var(--font-bebas)] text-[120px] leading-none text-white/[0.03] select-none">02</span>
          </div>
        </motion.div>
      </div>

      {/* 03 MOMENT — full-bleed image + typography overlapping */}
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.08 }}
        className="mt-12 md:mt-16 border-y border-white/10"
      >
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative h-[320px] md:h-[420px] overflow-hidden bg-[#0a0a0f]">
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1a1a24 0%, #0a0a0f 60%, #111118 100%)" }} />
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-[family-name:var(--font-bebas)] text-[clamp(40px,9vw,88px)] leading-none tracking-wide text-white/10">MOMENT</p>
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-black/55 backdrop-blur px-4 py-3">
              <p className="text-sm leading-relaxed text-white/85">「今朝の練習、最後の一本で掴めた感覚。ここからまた積み上げる。」</p>
              <p className="mt-1 font-mono text-[10px] tracking-wide text-white/30">YOKOHAMA · 2h ago · ♥ 18</p>
            </div>
          </div>
          <div className="px-6 md:px-10 py-10 md:py-14 flex flex-col justify-center bg-[#0D0D12]">
            <p className="font-[family-name:var(--font-bebas)] text-[clamp(36px,6vw,56px)] leading-none tracking-wide text-white">MOMENT</p>
            <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--vc-accent)]">活動が、ストーリーになる</p>
            <p className="mt-6 text-[15px] leading-[1.9] text-white/60 max-w-md">成果や想いを写真と言葉で残す。Momentは活動に紐づき、場所とともに地図へ現れる。</p>
            <span className="mt-6 font-mono text-[9px] tracking-[0.2em] uppercase text-white/20">03 — IMAGE + TYPOGRAPHY</span>
          </div>
        </div>
      </motion.div>

      {/* 04 CHEER / CONNECTION — people as hero, place strip, converging */}
      <div className="px-4 md:px-6 lg:px-8 mx-auto max-w-6xl">
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] items-start border-t border-white/10 pt-12 md:pt-16 mt-12 md:mt-16"
        >
          <div>
            <p className="font-[family-name:var(--font-bebas)] text-[clamp(32px,6vw,48px)] leading-none tracking-wide text-white">CHEER / CONNECTION</p>
            <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#FFD600]">応援が、信頼になる</p>
            <p className="mt-6 text-[15px] leading-[1.9] text-white/60">Cheerとコメントが届き、Connectionとして残る。関わりは単発で消えない、関係の記録へ。</p>
            <div className="mt-8">
              <PlaceStrip places={[{ name: "Yokohama", prefecture: "神奈川", x: 120 }, { name: "Kawasaki", prefecture: "東京", x: 420 }, { name: "Shibuya", prefecture: "千葉", x: 720 }]} />
            </div>
          </div>
          <div className="relative rounded-2xl border border-white/10 bg-[#0e0e14] p-6 md:p-8 overflow-hidden">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-full bg-[#FFD600]/15 border border-[#FFD600]/30 grid place-items-center text-[#FFD600] text-sm">★</span>
              <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-white/40">People → People</span>
              <span className="ml-auto h-px flex-1 bg-white/10" />
            </div>
            <div className="mt-6 space-y-3 font-mono text-[11px] leading-relaxed">
              <p className="text-white/70">SATO → <span className="text-white">YUKI</span> <span className="text-[#FFD600]">Cheer</span></p>
              <p className="text-white/70">WATANABE → <span className="text-white">YUKI</span> <span className="text-white/40">Connection</span></p>
              <p className="text-white/70">KATO → <span className="text-white">YUKI</span> <span className="text-[#FFD600]">Cheer + Comment</span></p>
            </div>
            <p className="mt-6 font-mono text-[9px] tracking-[0.2em] uppercase text-white/20">CONNECTION IS MUTUAL</p>
            <span aria-hidden className="absolute -right-2 -bottom-2 font-[family-name:var(--font-bebas)] text-[120px] leading-none text-white/[0.03] select-none">04</span>
          </div>
        </motion.div>
      </div>

      {/* 05 VIZ MAP — map as hero, full bleed strip */}
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.08 }}
        className="mt-12 md:mt-16"
      >
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <VizionRule label="DISCOVERY" />
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] items-end">
            <div>
              <p className="font-[family-name:var(--font-bebas)] text-[clamp(36px,6vw,56px)] leading-none tracking-wide text-white">VIZ MAP</p>
              <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--vc-accent)]">発見が、次の行動につながる</p>
              <p className="mt-6 text-[15px] leading-[1.9] text-white/60">地域や興味から、人・活動・場所に出会う。地図は活動の集合 — ズームするほど、人の熱が近づく。</p>
            </div>
            <div className="relative h-[180px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] lg:translate-y-2">
              <svg viewBox="0 0 600 180" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
                <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                <line x1="150" y1="0" x2="150" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                <line x1="350" y1="0" x2="350" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                {[
                  { x: 80, y: 64 },
                  { x: 210, y: 98 },
                  { x: 380, y: 42 },
                  { x: 520, y: 110 },
                ].map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r={6} fill="var(--vc-accent)" stroke="white" strokeWidth={1.5} />
                    {!reduce && <circle cx={p.x} cy={p.y} r={14} fill="none" stroke="var(--vc-accent)" strokeWidth={1} opacity={0.18} style={{ animation: `vcRing 2.4s ease-out ${i * 0.4}s infinite` }} />}
                  </g>
                ))}
                <circle cx={350} cy={90} r={18} fill="var(--vc-accent)" opacity={0.95} />
                <text x="350" y="95" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="black" fontWeight="800">12</text>
              </svg>
              <span className="absolute left-3 top-3 rounded-full border border-lime/30 bg-black/60 px-2.5 py-1 font-mono text-[9px] tracking-widest text-lime">VIZ MAP · LIVE</span>
              <span className="absolute right-3 bottom-3 font-mono text-[9px] tracking-wide text-white/25">横浜 · 川崎 · 渋谷</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <p className="mt-10 font-mono text-[10px] tracking-[0.14em] text-white/25 text-left">この循環が、Vizion Connectionの基本ループ。活動から始まり、地図へ還る。</p>
      </div>
    </EditorialSection>
  );
}
