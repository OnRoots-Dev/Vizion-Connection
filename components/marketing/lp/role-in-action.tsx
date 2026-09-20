"use client";

// Role In Action — VIZION NATIVE: 4 entrances, not 4 cards
// Each role has distinct worldview, activity, connection, density, layout, motion.
// No repeating Heading→Description→CTA template.

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EditorialSection, EditorialHeading, VizionRule } from "@/lib/design/editorial";

export function RoleInActionSection() {
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
          <EditorialHeading label="4 ENTRANCES">あなたは、どの入口から入る？</EditorialHeading>
          <p className="mt-4 max-w-2xl text-[14px] leading-[1.9] text-white/55">Vizionは4つの役割から同じ世界に入る。見るもの、残すもの、つながり方が違う — それが、同じ地図で出会う理由。</p>
        </motion.div>
      </div>

      {/* ATHLETE — Left heavy, Activity as hero, dense ledger */}
      <motion.section
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="mt-10 md:mt-14 border-t border-white/10"
      >
        <div className="grid lg:grid-cols-[1.18fr_0.82fr]">
          {/* Media — bleeds to left edge */}
          <div className="relative overflow-hidden bg-[#1a0a0a] min-h-[380px] lg:min-h-[460px] border-r border-white/10">
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2D0000 0%, #1a0a0a 55%, #0a0a0f 100%)" }} />
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="absolute left-6 top-6 font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">ATHLETE · DAY 47 · 横浜</div>
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
              <p className="font-[family-name:var(--font-bebas)] text-[clamp(56px,10vw,96px)] leading-none tracking-wide text-white">ATHLETE</p>
              <div className="mt-6 max-w-sm rounded-xl border border-white/10 bg-black/40 backdrop-blur p-4">
                <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-white/30">LAST 7 DAYS</p>
                <div className="mt-3 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between"><span className="text-white/60">05.12 Session</span><span className="text-white">横浜 · 完了</span></div>
                  <div className="flex justify-between"><span className="text-white/60">05.10 Match</span><span className="text-[#FF5050]">▲ Cheer 18</span></div>
                  <div className="flex justify-between"><span className="text-white/60">05.07 Training</span><span className="text-white/40">Together ×2</span></div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF5050]" />
          </div>
          {/* Text — narrow, breathing */}
          <div className="px-6 md:px-8 lg:px-10 py-10 md:py-12 flex flex-col justify-center bg-[#0D0D12]">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#FF5050]">Athlete — 積み重ねを、存在感に</p>
            <p className="mt-4 font-[family-name:var(--font-bebas)] text-[clamp(26px,4vw,34px)] leading-none tracking-wide text-white">日々の継続が、<br />そのまま証明になる。</p>
            <p className="mt-5 text-[14px] leading-[1.9] text-white/60">練習・試合・成果がタイムラインに残り、コーチや仲間、企業と自然に出会える。続けることが、見つけてもらうことになる。</p>
            <Link href="/register?role=Athlete" className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-[#FF5050] hover:text-white transition-colors">アスリートとして入る <ArrowRight className="h-3 w-3" /></Link>
          </div>
        </div>
      </motion.section>

      {/* TRAINER — Right heavy, People & Connection as hero */}
      <motion.section
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="border-y border-white/10"
      >
        <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
          <div className="px-6 md:px-8 lg:px-10 py-10 md:py-12 flex flex-col justify-center bg-[#09090f] order-2 lg:order-1">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#30de1d]">Trainer — 育てた選手が、実績になる</p>
            <p className="mt-4 font-[family-name:var(--font-bebas)] text-[clamp(26px,4vw,34px)] leading-none tracking-wide text-white">指導が、<br />可視化される。</p>
            <p className="mt-5 text-[14px] leading-[1.9] text-white/60">選手のActivityがあなたの指導の証になる。専門性が地図とタイムラインで読まれ、次の教え子とつながる。</p>
            <Link href="/register?role=Trainer" className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-[#30de1d] hover:text-white transition-colors">トレーナーとして入る <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="relative overflow-hidden bg-[#08140a] min-h-[360px] lg:min-h-[440px] border-l border-white/10 order-1 lg:order-2">
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #082a06 0%, #0a0a0f 60%, #111118 100%)" }} />
            <div className="absolute left-6 top-6 font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">TRAINER · Connection</div>
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="w-full max-w-[360px] rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-5">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full bg-[#30de1d]/15 border border-[#30de1d]/30 grid place-items-center font-bold text-[#30de1d]">T</span>
                  <div><p className="text-sm font-bold text-white">WATANABE AKI</p><p className="font-mono text-[10px] tracking-wide text-white/30">Trainer · 横浜</p></div>
                  <span className="ml-auto font-mono text-[10px] tracking-wide text-[#30de1d]">育成中</span>
                </div>
                <div className="mt-5 flex gap-2">
                  {["YUKI", "RINA", "KEI"].map((n) => (
                    <span key={n} className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-center font-mono text-[10px] tracking-wide text-white/60">{n}</span>
                  ))}
                </div>
                <p className="mt-3 text-center font-mono text-[9px] tracking-[0.14em] uppercase text-white/20">3名とConnection · Together 12回</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#30de1d]" />
          </div>
        </div>
      </motion.section>

      {/* CREW — Full-bleed map + moment strip, low density, BeReal / Instagram feel */}
      <motion.section
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="relative overflow-hidden border-b border-white/10 bg-[#0a0a0f]"
      >
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#FFC81E]">Crew — 推しの歩みを、そばで後押し</p>
              <p className="mt-4 font-[family-name:var(--font-bebas)] text-[clamp(42px,7vw,64px)] leading-none tracking-wide text-white">CREW</p>
              <p className="mt-4 font-[family-name:var(--font-bebas)] text-[clamp(22px,3.5vw,28px)] leading-none tracking-wide text-white/90">見守るが、参加になる。</p>
              <p className="mt-5 text-[14px] leading-[1.9] text-white/60 max-w-md">Cheerとコメントが選手に届く。現地で、地図で、タイムラインで — 応援が記録として残り、継続を支える。</p>
              <Link href="/register?role=Crew" className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-[#FFC81E] hover:text-white transition-colors">クルーとして入る <ArrowRight className="h-3 w-3" /></Link>
            </div>
            <div className="relative rounded-2xl border border-white/10 bg-[#0e0e14] p-4 md:p-5">
              <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.16em] uppercase text-white/25"><span>横浜スタジアム</span><span className="h-px flex-1 bg-white/10" /><span className="text-[#FFC81E]">LIVE</span></div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Cheer", val: "♥ 18", accent: "#FFD600" },
                  { label: "Together", val: "2 回参加", accent: "var(--vc-accent)" },
                  { label: "Place", val: "現地観戦", accent: "white" },
                ].map((b) => (
                  <div key={b.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                    <p className="font-mono text-[9px] tracking-wide text-white/30">{b.label}</p>
                    <p className="mt-1 text-sm font-bold" style={{ color: b.accent === "white" ? "white" : b.accent }}>{b.val}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-[#FFC81E]/10 p-3">
                <p className="text-[12px] leading-relaxed text-white/80">「今日の走り、現地で見た。次のレースも行くよ。」</p>
                <p className="mt-1 font-mono text-[10px] tracking-wide text-white/30">KATO RYO · 5時間前 · 横浜</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFC81E]" />
      </motion.section>

      {/* BUSINESS — Place & Presence as hero, not pricing */}
      <motion.section
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="relative overflow-hidden"
      >
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden bg-[#080c14] min-h-[380px] lg:min-h-[420px]">
            <svg viewBox="0 0 600 420" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
              <rect width="600" height="420" fill="#080c14" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
              <line x1="0" y1="280" x2="600" y2="280" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
              <line x1="200" y1="0" x2="200" y2="420" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="400" y1="0" x2="400" y2="420" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              {[
                { x: 120, y: 110, label: "横浜" },
                { x: 360, y: 80, label: "東京" },
                { x: 480, y: 180, label: "名古屋" },
                { x: 160, y: 310, label: "大阪" },
              ].map((p) => (
                <g key={p.label}>
                  <circle cx={p.x} cy={p.y} r={7} fill="#3C8CFF" stroke="white" strokeWidth={1.5} />
                  <circle cx={p.x} cy={p.y} r={18} fill="none" stroke="#3C8CFF" opacity={0.22} />
                </g>
              ))}
            </svg>
            <div className="absolute left-4 top-4 rounded-full border border-[#3C8CFF]/30 bg-black/55 px-3 py-1 font-mono text-[9px] tracking-[0.16em] uppercase text-[#3C8CFF]">PLACE · PRESENCE</div>
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-black/55 backdrop-blur px-4 py-3">
              <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-white/30">Your business exists where activity happens</p>
              <p className="mt-1 text-sm font-bold text-white">活動が起きる場所に、企業が存在する</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#3C8CFF]" />
          </div>
          <div className="px-6 md:px-8 lg:px-10 py-10 md:py-12 flex flex-col justify-center bg-[#0D0D12]">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#3C8CFF]">Business — ノイズではなく、シグナルへ</p>
            <p className="mt-4 font-[family-name:var(--font-bebas)] text-[clamp(26px,4vw,34px)] leading-none tracking-wide text-white">広告枠ではなく、<br />街の中に存在する。</p>
            <p className="mt-5 text-[14px] leading-[1.9] text-white/60">熱量あるコミュニティに、地図とタイムラインを通じて出会える。エリアに根ざし、継続データで本物の挑戦者とつながる。</p>
            <div className="mt-6 flex flex-wrap gap-2 font-mono text-[10px] tracking-wide">
              <span className="rounded-full border border-[#3C8CFF]/20 bg-[#3C8CFF]/10 px-3 py-1 text-[#3C8CFF]">PLACE · 地域</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/50">PEOPLE · 出会う</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/50">ACTIVITY · 支える</span>
            </div>
            <Link href="/business" className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-[#3C8CFF] hover:text-white transition-colors">ビジネスとして入る <ArrowRight className="h-3 w-3" /></Link>
          </div>
        </div>
      </motion.section>

      <div className="px-4 md:px-6 lg:px-8 mx-auto max-w-6xl">
        <VizionRule label="4 ENTRANCES · 1 WORLD" />
      </div>
    </EditorialSection>
  );
}
