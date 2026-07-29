'use client'

import { motion } from 'motion/react'
import { Check, Lock, Zap } from 'lucide-react'
import { SectionHeader } from './section-header'

type Phase = {
  num: string
  label: string
  period: string
  status: 'now' | 'soon' | 'locked'
  tag: string
  desc: string
  color: string
}

const PHASES: Phase[] = [
  {
    num: '01',
    label: 'Ignition',
    period: '2026.6.30 —',
    status: 'now',
    tag: '役割を名乗れ。信頼を刻め。',
    desc: 'プロフィールカード、Cheer、Journey、Discovery——コア機能は本日よりすべて利用可能。',
    color: '#FFD600',
  },
  {
    num: '02',
    label: 'Momentum',
    period: '今後・順次拡張',
    status: 'soon',
    tag: 'つながりに、深さを。',
    desc: 'Synergy 拡張、Discovery 地図・高度検索、スキルタグ、V-Score など。',
    color: '#3282FF',
  },
  {
    num: '03',
    label: 'Ascent',
    period: '2026.9 予定',
    status: 'locked',
    tag: '広がりが、力になる。',
    desc: 'Synergy（コミュニティ）、Arena（イベント）、Trust Score、AI Discovery。',
    color: '#FF4646',
  },
  {
    num: '04',
    label: 'Alliance',
    period: '2027 —',
    status: 'locked',
    tag: '信頼が、共創を生む。',
    desc: 'スポンサー・マッチング、企業コラボ、グローバルスポンサー接続。',
    color: '#28D26E',
  },
  {
    num: '05',
    label: 'Origin',
    period: '2027以降',
    status: 'locked',
    tag: '信頼が、世界の原点になる。',
    desc: '応援証明書（SBT / NFT）、グローバル・コミュニティ、AIキャリア支援。',
    color: '#A855F7',
  },
]

export function RoadmapSection() {
  return (
    <section id="roadmap" className="relative scroll-mt-24 overflow-hidden py-32 md:scroll-mt-28 md:py-40">
      {/* Street-style background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="vz-grid absolute inset-0 opacity-30" />
        <div
          className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
          style={{ background: 'rgba(60, 140, 255, 0.08)' }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        <SectionHeader
          kicker="Roadmap"
          title={
            <>
              進化は、
              <span className="lp-accent">止まらない</span>
            </>
          }
          lead="Vizion Connection は5つのフェーズで拡張していく。今はまだ、最初の点火にすぎない。"
        />

        {/* Phase timeline */}
        <div className="mt-12 relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FFD600] via-[#3282FF] to-[#A855F7] opacity-30 md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-8">
            {PHASES.map((phase, i) => {
              const isNow = phase.status === 'now'
              const isSoon = phase.status === 'soon'
              
              return (
                <motion.div
                  key={phase.num}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative md:grid md:grid-cols-2 md:gap-8"
                >
                  {/* Timeline node */}
                  <div className="absolute left-8 top-6 h-4 w-4 -translate-x-1/2 rounded-full border-2 bg-[#0a0a0f] md:left-1/2 md:-translate-x-1/2"
                    style={{
                      borderColor: phase.color,
                      boxShadow: `0 0 20px ${phase.color}60`,
                    }}
                  >
                    {isNow && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-2 w-2 animate-ping rounded-full bg-[#FFD600]" />
                        <div className="absolute h-2 w-2 rounded-full bg-[#FFD600]" />
                      </div>
                    )}
                  </div>

                  {/* Content card */}
                  <div className={`ml-16 md:ml-0 ${i % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:col-start-2'}`}>
                    <div
                      className="relative overflow-hidden rounded-3xl border-2 p-6 transition-all duration-300 hover:-translate-y-1"
                      style={{
                        borderColor: isNow ? `${phase.color}60` : 'rgba(255,255,255,0.1)',
                        background: isNow ? `${phase.color}10` : 'rgba(255,255,255,0.03)',
                        boxShadow: isNow ? `0 0 40px ${phase.color}20` : 'none',
                      }}
                    >
                      {/* Status badge */}
                      <div className="flex items-center gap-2 mb-4 md:justify-start md:flex-row-reverse">
                        {isNow && (
                          <span className="flex items-center gap-1.5 rounded-full border-2 border-[#FFD600]/50 bg-[#FFD600]/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#FFD600]">
                            <Zap className="h-3 w-3" />
                            Now Live
                          </span>
                        )}
                        {isSoon && (
                          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/60">
                            Coming Soon
                          </span>
                        )}
                        {phase.status === 'locked' && (
                          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/40">
                            <Lock className="h-3 w-3" />
                            Locked
                          </span>
                        )}
                      </div>

                      {/* Phase number */}
                      <div className="font-display text-4xl font-black leading-none"
                        style={{
                          color: phase.color,
                          textShadow: `0 0 24px ${phase.color}40`,
                        }}
                      >
                        {phase.num}
                      </div>

                      {/* Phase label */}
                      <h3 className="mt-2 text-xl font-black md:text-2xl">
                        {phase.label}
                      </h3>

                      {/* Period */}
                      <p className="mt-1 text-sm font-bold text-white/50">
                        {phase.period}
                      </p>

                      {/* Tag */}
                      <p className="mt-3 text-base font-bold leading-relaxed text-white/80">
                        {phase.tag}
                      </p>

                      {/* Description */}
                      <p className="mt-2 text-sm leading-relaxed text-white/50">
                        {phase.desc}
                      </p>

                      {/* Checkmark for completed */}
                      {isNow && (
                        <div className="absolute bottom-4 right-4 md:left-4 md:right-auto">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFD600]">
                            <Check className="h-5 w-5 text-black" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Gamified progress indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 rounded-2xl border-2 border-dashed border-lime/30 bg-lime-soft/20 px-6 py-5 md:px-8"
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-[#FFD600]" />
              <p className="text-base font-black sm:text-lg">
                Phase 01 <span className="text-lime">Ignition</span> 進行中 —
                <span className="text-white/60"> いま参加すれば初期メンバー特典をゲット</span>
              </p>
            </div>
            <a
              href="#cta"
              className="shrink-0 rounded-full border-2 border-[#d91414]/50 bg-[#d91414] px-6 py-3 text-sm font-black tracking-wide text-white transition-all hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(217,20,20,0.5)] active:scale-[0.98]"
            >
              早期参加 →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
