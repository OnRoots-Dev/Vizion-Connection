'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { Flame, Link2, Radio, Share2, Sparkles, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHeader } from './section-header'
import { cn } from '@/lib/utils'

type Step = {
  step: string
  level: string
  xp: string
  title: string
  body: string
  icon: LucideIcon
  accent: string
  stat: { label: string; value: string }
}

const STEPS: Step[] = [
  {
    step: '01',
    level: 'LV.1',
    xp: '+120 XP',
    title: 'マップに参加',
    body: 'ロールを選んでノードを点灯。あなたの「今」が、ネットワークの起点になる。',
    icon: Zap,
    accent: 'var(--role-athlete)',
    stat: { label: '初期Boost', value: '×1.0' },
  },
  {
    step: '02',
    level: 'LV.2',
    xp: '+340 XP',
    title: 'リンクが形成',
    body: '近接ロール・共通タグが線を引く。最初の1本が、次の出会いを呼び込む。',
    icon: Link2,
    accent: 'var(--lime)',
    stat: { label: '接続率', value: '+68%' },
  },
  {
    step: '03',
    level: 'LV.3',
    xp: '+720 XP',
    title: 'シグナルが脈動',
    body: 'Cheer・Journey・Discovery——活動がリアルタイムで流れ、熱量が可視化される。',
    icon: Radio,
    accent: 'var(--role-trainer)',
    stat: { label: 'Live Feed', value: '24/7' },
  },
  {
    step: '04',
    level: 'MAX',
    xp: 'COMBO',
    title: 'ネットワークが拡張',
    body: '1つのつながりが次を生む。価値は線形ではなく、掛け算で外側へ広がる。',
    icon: Share2,
    accent: 'var(--role-fan)',
    stat: { label: 'Network', value: 'n²' },
  },
]

function NetworkPulse({ activeIndex }: { activeIndex: number }) {
  const nodes = [
    { cx: 80, cy: 80, r: 10, color: 'var(--role-athlete)', label: 'A' },
    { cx: 200, cy: 50, r: 9, color: 'var(--role-trainer)', label: 'T' },
    { cx: 240, cy: 140, r: 9, color: 'var(--role-business)', label: 'B' },
    { cx: 120, cy: 160, r: 9, color: 'var(--role-fan)', label: 'F' },
  ]
  const hub = { cx: 160, cy: 105 }

  const edgesByLevel: [number, number][][] = [
    [],
    [[0, 1], [0, 3]],
    [[0, 1], [0, 3], [1, 2]],
    [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1]],
  ]
  const visibleEdges = edgesByLevel[Math.min(activeIndex, 3)] ?? []

  return (
    <svg viewBox="0 0 320 220" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="connectHub" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="connectFlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--lime)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--lime)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* grid */}
      {[...Array(7)].map((_, i) => (
        <line
          key={`h-${i}`}
          x1={20}
          y1={20 + i * 30}
          x2={300}
          y2={20 + i * 30}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />
      ))}

      {/* hub glow */}
      <circle cx={hub.cx} cy={hub.cy} r={activeIndex >= 1 ? 52 : 28} fill="url(#connectHub)" />

      {/* spokes to hub */}
      {activeIndex >= 1 &&
        nodes.map((n, i) => (
          <line
            key={`spoke-${i}`}
            x1={n.cx}
            y1={n.cy}
            x2={hub.cx}
            y2={hub.cy}
            stroke="var(--lime)"
            strokeWidth={1.5}
            strokeOpacity={0.45}
          />
        ))}

      {/* perimeter edges */}
      {activeIndex >= 1 &&
        visibleEdges.map(([a, b], i) => {
          if (a === b) return null
          const from = nodes[a]
          const to = nodes[b]
          if (!from || !to) return null
          return (
            <g key={`edge-${i}`}>
              <line x1={from.cx} y1={from.cy} x2={to.cx} y2={to.cy} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
              <line
                x1={from.cx}
                y1={from.cy}
                x2={to.cx}
                y2={to.cy}
                stroke="url(#connectFlow)"
                strokeWidth={2}
                strokeDasharray="6 28"
                style={{ animation: `vz-dash-flow ${2.2 + i * 0.2}s linear infinite` }}
              />
            </g>
          )
        })}

      {/* hub */}
      {activeIndex >= 1 && (
        <motion.circle
          cx={hub.cx}
          cy={hub.cy}
          r={22}
          fill="color-mix(in oklch, var(--background) 80%, transparent)"
          stroke="var(--lime)"
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          style={{ transformOrigin: `${hub.cx}px ${hub.cy}px` }}
        />
      )}

      {/* nodes */}
      {nodes.map((n, i) => (
        <motion.g
          key={n.label}
          initial={{ opacity: 0.35, scale: 0.7 }}
          animate={{
            opacity: activeIndex === 0 ? (i === 0 ? 1 : 0.35) : 1,
            scale: activeIndex === 0 ? (i === 0 ? 1.15 : 0.85) : 1,
          }}
          transition={{ duration: 0.45, delay: i * 0.05 }}
          style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
        >
          <circle
            cx={n.cx}
            cy={n.cy}
            r={n.r + 6}
            fill={n.color}
            fillOpacity={0.12}
          />
          <circle
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            fill="color-mix(in oklch, var(--background) 75%, transparent)"
            stroke={n.color}
            strokeWidth={2}
          />
          <text
            x={n.cx}
            y={n.cy + 4}
            textAnchor="middle"
            fill={n.color}
            style={{ fontSize: 10, fontWeight: 800 }}
          >
            {n.label}
          </text>
        </motion.g>
      ))}

      {activeIndex >= 3 && (
        <motion.text
          x={160}
          y={200}
          textAnchor="middle"
          fill="var(--lime)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2 }}
        >
          NETWORK COMBO × n²
        </motion.text>
      )}
    </svg>
  )
}

export function ConnectSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: false, margin: '-20% 0px' })
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!inView) return
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % STEPS.length
        setProgress(((next + 1) / STEPS.length) * 100)
        return next
      })
    }, 3200)
    return () => clearInterval(timer)
  }, [inView])

  useEffect(() => {
    setProgress(((activeIndex + 1) / STEPS.length) * 100)
  }, [activeIndex])

  return (
    <section
      ref={sectionRef}
      id="network"
      className="relative scroll-mt-24 overflow-hidden py-24 md:scroll-mt-28 md:py-32"
    >
      {/* street texture overlays */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="vz-grid absolute inset-0 opacity-60" />
        <div
          className="absolute -left-20 top-20 h-64 w-64 rounded-full blur-[100px]"
          style={{ background: 'rgba(217, 20, 20, 0.12)' }}
        />
        <div
          className="absolute -right-16 bottom-10 h-72 w-72 rounded-full blur-[110px]"
          style={{ background: 'rgba(200, 232, 0, 0.08)' }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        <SectionHeader
          kicker="つながり方"
          title={
            <>
              <span className="lp-display">One Node</span>
              ひとつのノードから、
              <span className="lp-accent">生きたネットワーク</span>へ
            </>
          }
          lead="参加 → 接続 → 脈動 → 拡張。Zwiftの達成感、Nikeキャンペーンの熱量——スポーツの「積み重ね」を、遊び心のあるビジュアルで可視化する。"
        />

        {/* Network level bar — gamification header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-12 max-w-3xl rounded-2xl border border-lime/25 bg-card/60 p-4 backdrop-blur-sm md:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="lp-badge">
                <Flame className="h-3.5 w-3.5" />
                Network Quest
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                Step {STEPS[activeIndex].step} / 04
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="lp-stat-num text-lime">{STEPS[activeIndex].level}</span>
              <span className="font-mono text-sm font-bold text-muted-foreground">
                {STEPS[activeIndex].xp}
              </span>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted/80">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#d91414] via-lime to-[#30de1d]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </motion.div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          {/* Live network visualization panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative min-h-[350px] overflow-hidden rounded-3xl border-2 border-lime/30 bg-[#111118]/90 p-5 md:min-h-[450px] md:p-8"
            style={{ boxShadow: '0 0 60px rgba(200,232,0,0.15)' }}
          >
            <div className="absolute left-5 top-5 flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-lime" />
              </span>
              <span className="font-display text-sm font-black uppercase tracking-[0.2em] text-lime">Live Map</span>
            </div>
            <div className="mt-10 h-[280px] md:h-[360px]">
              <NetworkPulse activeIndex={activeIndex} />
            </div>
            <p className="mt-4 text-center font-mono text-xs font-bold uppercase tracking-widest text-white/60">
              {STEPS[activeIndex].title} — シミュレーション
            </p>
          </motion.div>

          {/* Step cards — bento stack */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isActive = activeIndex === i
              return (
                <motion.button
                  key={s.step}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 md:p-5',
                    isActive
                      ? 'border-lime/45 bg-card shadow-[0_0_40px_rgba(200,232,0,0.08)]'
                      : 'border-border bg-card/40 hover:border-border/80 hover:bg-card/70',
                  )}
                  aria-pressed={isActive}
                >
                  {isActive && (
                    <div
                      className="pointer-events-none absolute inset-0 opacity-30"
                      style={{
                        background: `radial-gradient(ellipse 80% 60% at 0% 0%, color-mix(in oklch, ${s.accent} 35%, transparent), transparent 70%)`,
                      }}
                    />
                  )}
                  <div className="relative flex items-start gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                      style={{
                        borderColor: `color-mix(in oklch, ${s.accent} 45%, transparent)`,
                        background: `color-mix(in oklch, ${s.accent} 12%, transparent)`,
                        color: s.accent,
                      }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="font-display text-2xl leading-none tracking-wide"
                          style={{ color: isActive ? s.accent : 'var(--muted-foreground)' }}
                        >
                          {s.step}
                        </span>
                        <span className="lp-badge text-[0.62rem]">{s.level}</span>
                        {isActive && (
                          <Sparkles className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
                        )}
                      </div>
                      <h3 className="mt-1 text-base font-bold tracking-tight md:text-lg">{s.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground md:text-sm">{s.body}</p>
                      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {s.stat.label}
                        </span>
                        <span
                          className="font-display text-lg tracking-wide"
                          style={{ color: s.accent }}
                        >
                          {s.stat.value}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-dashed border-lime/30 bg-lime-soft/40 px-5 py-5 sm:flex-row md:px-8"
        >
          <p className="text-center text-sm font-bold sm:text-left md:text-base">
            最初のノードは、<span className="text-lime">あなた</span>。
            <span className="mt-1 block text-xs font-normal text-muted-foreground sm:mt-0 sm:inline sm:pl-2">
              初期メンバー番号は先着発行 — 今だけの永久欠番。
            </span>
          </p>
          <a
            href="#cta"
            className="shrink-0 rounded-full border border-lime/50 bg-lime px-5 py-2.5 text-sm font-black tracking-wide text-white transition-transform hover:scale-[1.04] active:scale-[0.98]"
          >
            Quest Start →
          </a>
        </motion.div>
      </div>
    </section>
  )
}
