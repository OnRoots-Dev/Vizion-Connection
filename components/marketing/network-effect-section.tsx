'use client'

import { motion } from 'motion/react'
import { Network, TrendingUp, Radio, Globe, Zap, Flame } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHeader } from './section-header'

type Metric = { value: string; label: string; color: string }
type Feature = { icon: LucideIcon; title: string; body: string; accent: string }

const METRICS: Metric[] = [
  { value: '4', label: 'ロールがMap上で交差', color: '#FFD600' },
  { value: 'n²', label: 'ノードごとの価値が複利成長', color: '#C8E800' },
  { value: '24/7', label: 'ライブ接続で脈動', color: '#3C8CFF' },
]

const FEATURES: Feature[] = [
  {
    icon: Network,
    title: '近接性が相乗効果を生む',
    body: 'マップ上でロールが集まると、マッチングするリンクが自動的に形成される — トレーナーはアスリートに出会い、ファンはストーリーに出会い、ビジネスはリーチに出会う。',
    accent: '#FFD600',
  },
  {
    icon: Radio,
    title: 'つながりが脈動し、流れる',
    body: 'すべてのアクティブなリンクがシグナルを運ぶ。活動がリアルタイムで外側へと広がり、グラフは常に生きていて動いていると感じられる。',
    accent: '#C8E800',
  },
  {
    icon: TrendingUp,
    title: 'すべてのノードが複利で成長する',
    body: '新しいメンバーが参加するたびに、すでに接続している全員の価値が上がる。成長は線形ではない — ネットワーク全体で掛け算される。',
    accent: '#30de1d',
  },
  {
    icon: Globe,
    title: 'マップは拡大し続ける',
    body: 'ローカルなクラスターが地域に接続し、地域がグローバルなグラフに接続する。ネットワークは成長するように設計されており、停滞するようには作られていない。',
    accent: '#3C8CFF',
  },
]

export function NetworkEffectSection() {
  return (
    <section id="effect" className="relative scroll-mt-24 overflow-hidden py-24 md:scroll-mt-28 md:py-32">
      {/* Street-style background effects */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="vz-grid absolute inset-0 opacity-40" />
        <div
          className="absolute -left-32 top-20 h-96 w-96 rounded-full blur-[120px]"
          style={{ background: 'rgba(217, 20, 20, 0.15)' }}
        />
        <div
          className="absolute -right-24 bottom-20 h-[28rem] w-[28rem] rounded-full blur-[140px]"
          style={{ background: 'rgba(200, 232, 0, 0.1)' }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        <SectionHeader
          kicker="ネットワーク効果"
          title={
            <>
              リンクが増えるほど
              <span className="lp-accent">価値が高まる</span>ネットワーク
            </>
          }
        />

        {/* Gamified metrics bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 rounded-3xl border-2 border-lime/20 bg-[#0d0d12]/80 p-6 backdrop-blur-sm md:p-8"
          style={{ boxShadow: '0 0 60px rgba(200, 232, 0, 0.08)' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Flame className="h-5 w-5 text-[#FFD600]" />
            <span className="font-display text-sm uppercase tracking-[0.2em] text-lime">
              Network Stats
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
                style={{
                  boxShadow: `0 0 30px ${m.color}20`,
                }}
              >
                <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 50% 0%, ${m.color}, transparent 70%)` }} />
                <span
                  className="lp-stat-num block"
                  style={{
                    color: m.color,
                    textShadow: `0 0 24px ${m.color}60`,
                  }}
                >
                  {m.value}
                </span>
                <span className="mt-3 block max-w-[12rem] text-xs font-bold leading-relaxed text-white/70 md:text-sm">
                  {m.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-3xl border-2 border-white/10 bg-[#0d0d12]/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
                style={{
                  boxShadow: `0 0 40px ${f.accent}15`,
                }}
              >
                {/* Accent glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(ellipse 80% 60% at 0% 0%, ${f.accent}25, transparent 70%)`,
                  }}
                />
                
                <div className="relative flex gap-5">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2"
                    style={{
                      borderColor: `${f.accent}60`,
                      background: `${f.accent}20`,
                      color: f.accent,
                      boxShadow: `0 0 20px ${f.accent}40`,
                    }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-xl font-black tracking-tight md:text-2xl"
                      style={{ color: f.accent }}
                    >
                      {f.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/60 md:text-base">
                      {f.body}
                    </p>
                  </div>
                </div>
                
                {/* Decorative corner accent */}
                <div
                  className="absolute bottom-0 right-0 h-16 w-16 opacity-30"
                  style={{
                    background: `linear-gradient(135deg, ${f.accent}40, transparent 60%)`,
                    clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                  }}
                />
              </motion.div>
            )
          })}
        </div>
        
        {/* Gamified CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-2xl border-2 border-dashed border-lime/30 bg-lime-soft/30 px-6 py-5 md:px-8"
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-[#FFD600]" />
              <p className="text-base font-black sm:text-lg">
                ネットワークに参加し、
                <span className="text-lime">価値の掛け算</span>
                を体験する
              </p>
            </div>
            <a
              href="#cta"
              className="shrink-0 rounded-full border-2 border-lime/50 bg-lime px-6 py-3 text-sm font-black tracking-wide text-[#171716] transition-all hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(200,232,0,0.5)] active:scale-[0.98]"
            >
              今すぐ参加 →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
