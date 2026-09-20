"use client";

// Moments / Connection — VIZION NATIVE
// People, Activity, Place are protagonists, not quotes.
// Structure: asymmetric media + map, not 3 equal quote cards.

import { motion, useReducedMotion } from "framer-motion";
import { EditorialSection, EditorialHeading, VizionRule } from "@/lib/design/editorial";

export function MomentsSection() {
  const reduce = useReducedMotion();

  return (
    <EditorialSection background="surface" bleed>
      <div className="px-4 md:px-6 lg:px-8 mx-auto max-w-6xl">
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
        >
          <EditorialHeading label="CONNECTION">人と人が、つながる。</EditorialHeading>
          <p className="mt-6 max-w-2xl text-[14px] leading-[1.9] text-white/55">応援はその場の反応ではなく、活動への参加と信頼のきっかけとして残る。地図とタイムラインに、関係が刻まれる。</p>
        </motion.div>
      </div>

      {/* Row 1 — LEFT heavy: Activity + Moment image overlap */}
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="mt-10 md:mt-14 mx-auto max-w-6xl px-4 md:px-6 lg:px-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] items-start"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f] h-[360px] md:h-[420px]">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #111118 0%, #0a0a0f 55%, #1a1a24 100%)" }} />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
          <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-1 font-mono text-[9px] tracking-[0.16em] uppercase text-white/60">YOKOHAMA · MORNING SESSION</div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%] rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur p-4">
            <p className="font-[family-name:var(--font-bebas)] text-[22px] tracking-wide text-white">最後の一本で掴めた感覚</p>
            <p className="mt-2 text-[13px] leading-[1.7] text-white/60">今日の練習、最後のインターバルで掴めた。ここからまた積み上げる。次の試合で試す。</p>
            <div className="mt-3 flex items-center gap-2 font-mono text-[10px] tracking-wide text-white/30">
              <span>横浜 · 港北</span><span>·</span><span>2h ago</span><span className="ml-auto text-[#FFD600]">★ 24 Cheer</span>
            </div>
          </div>
          <div className="absolute bottom-3 left-4 flex gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--vc-accent)]" /><span className="h-2 w-6 rounded-full bg-white/15" /><span className="h-2 w-2 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="lg:pl-4 py-2">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/25">MOMENT AT PLACE</p>
          <h3 className="mt-3 font-[family-name:var(--font-bebas)] text-[clamp(28px,4vw,38px)] leading-none tracking-wide text-white">場所に、瞬間が残る。</h3>
          <p className="mt-4 text-[14px] leading-[1.9] text-white/60">Momentは活動に紐づき、地図に現れる。どこで何が起きたかが、人の物語になる。</p>
          <div className="mt-6 flex items-center gap-3 text-[11px] font-mono tracking-wide">
            <span className="text-white/50">横浜</span><span className="text-white/15">—</span><span className="text-white/50">川崎</span><span className="text-white/15">—</span><span className="text-[var(--vc-accent)]">渋谷</span>
          </div>
        </div>
      </motion.div>

      {/* Row 2 — RIGHT heavy: People → People connection visual */}
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.06 }}
        className="mt-10 md:mt-12 mx-auto max-w-6xl px-4 md:px-6 lg:px-8 grid gap-8 lg:grid-cols-[0.75fr_1.25fr] items-center"
      >
        <div className="order-2 lg:order-1">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#FFD600]/70">PEOPLE → PEOPLE</p>
          <h3 className="mt-3 font-[family-name:var(--font-bebas)] text-[clamp(28px,4vw,38px)] leading-none tracking-wide text-white">応援が、関係になる。</h3>
          <p className="mt-4 text-[14px] leading-[1.9] text-white/60">Cheerはスタンプで終わらない。コメントが届き、Connectionとして残る。次のActivityで再会する。</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#FFD600]/20 bg-[#FFD600]/10 px-3 py-1.5 font-mono text-[10px] tracking-wide text-[#FFD600]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD600]" /> 相互Connection = 信頼の記録
          </div>
        </div>
        <div className="order-1 lg:order-2 relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e14] p-6 md:p-7">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/10 border border-white/15 grid place-items-center font-[family-name:var(--font-bebas)] text-white/60">S</div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-white">Connectionが生まれた</p>
              <p className="font-mono text-[11px] tracking-wide text-white/30">SATO YUKI → WATANABE AKI</p>
            </div>
            <span className="rounded-full bg-[var(--vc-accent)] px-3 py-1 font-mono text-[10px] font-bold text-black">相互</span>
          </div>
          <svg className="mt-6 h-[64px] w-full" viewBox="0 0 400 64" aria-hidden>
            <line x1="40" y1="32" x2="360" y2="32" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle cx="40" cy="32" r={8} fill="white" opacity={0.9} />
            <circle cx="200" cy="32" r={6} fill="var(--vc-accent)" stroke="white" strokeWidth={1.5} />
            <circle cx="360" cy="32" r={8} fill="white" opacity={0.9} />
            <text x="40" y="58" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="rgba(255,255,255,0.35)">SATO</text>
            <text x="200" y="58" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="var(--vc-accent)">Together</text>
            <text x="360" y="58" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="rgba(255,255,255,0.35)">WATANABE</text>
          </svg>
          <p className="mt-2 text-center font-mono text-[9px] tracking-[0.18em] uppercase text-white/20">Activityを一緒にする → Connectionが残る</p>
        </div>
      </motion.div>

      {/* Full-bleed moment strip — horizontal, image+typography */}
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.08 }}
        className="mt-10 md:mt-12 border-y border-white/10 bg-[#08080e]"
      >
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {[
              { place: "横浜", body: "今週の振り返り — 継続が力に", cheer: 12 },
              { place: "川崎", body: "次のセッションへ — 計画が見える", cheer: 8 },
              { place: "渋谷", body: "応援が届いた — 次は一緒に", cheer: 31 },
            ].map((m) => (
              <div key={m.place} className="flex-shrink-0 w-[280px] rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-white/30">{m.place} · MOMENT</p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/80">{m.body}</p>
                <p className="mt-3 font-mono text-[10px] tracking-wide text-[#FFD600]">♥ {m.cheer} Cheer</p>
              </div>
            ))}
            <div className="flex-shrink-0 w-[200px] grid place-items-center rounded-xl border border-dashed border-white/15 p-4">
              <p className="font-mono text-[11px] tracking-wide text-white/30 text-center">あなたの<br />Momentを重ねる</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 md:px-6 lg:px-8 mx-auto max-w-6xl">
        <VizionRule label="TRUST IS VISIBLE" />
        <p className="font-mono text-[10px] leading-relaxed tracking-wide text-white/25 max-w-2xl">応援はその場の反応ではなく、活動への参加と信頼のきっかけとして残る。その声が、次の関わりや発信につながる。</p>
      </div>
    </EditorialSection>
  );
}
