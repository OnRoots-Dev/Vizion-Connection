'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Flame, Link2, Radio, Share2, Sparkles, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHeader } from './section-header'
import { cn } from '@/lib/utils'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

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
  // activeIndexに応じてノード数・配置を変える
  const getNodeConfig = (index: number) => {
    switch (index) {
      case 0:
        // Step 01: 1ノード（自分）
        return [
          { cx: 160, cy: 110, r: 12, color: 'var(--role-athlete)', label: 'YOU' },
        ]
      case 1:
        // Step 02: 3ノード + 最初の接続
        return [
          { cx: 160, cy: 110, r: 12, color: 'var(--role-athlete)', label: 'YOU' },
          { cx: 100, cy: 70, r: 10, color: 'var(--role-trainer)', label: 'T' },
          { cx: 220, cy: 150, r: 10, color: 'var(--role-fan)', label: 'F' },
        ]
      case 2:
        // Step 03: 6ノード + 脈動
        return [
          { cx: 160, cy: 110, r: 12, color: 'var(--role-athlete)', label: 'YOU' },
          { cx: 100, cy: 70, r: 10, color: 'var(--role-trainer)', label: 'T' },
          { cx: 220, cy: 150, r: 10, color: 'var(--role-fan)', label: 'F' },
          { cx: 240, cy: 60, r: 9, color: 'var(--role-business)', label: 'B' },
          { cx: 80, cy: 160, r: 9, color: 'var(--role-trainer)', label: 'T2' },
          { cx: 200, cy: 180, r: 9, color: 'var(--role-fan)', label: 'F2' },
        ]
      case 3:
        // Step 04: 14ノードが画面全体に拡散
        return [
          { cx: 160, cy: 110, r: 12, color: 'var(--role-athlete)', label: 'YOU' },
          { cx: 100, cy: 70, r: 10, color: 'var(--role-trainer)', label: 'T' },
          { cx: 220, cy: 150, r: 10, color: 'var(--role-fan)', label: 'F' },
          { cx: 240, cy: 60, r: 9, color: 'var(--role-business)', label: 'B' },
          { cx: 80, cy: 160, r: 9, color: 'var(--role-trainer)', label: 'T2' },
          { cx: 200, cy: 180, r: 9, color: 'var(--role-fan)', label: 'F2' },
          // 外側に拡散するノード（8個追加）
          { cx: 40, cy: 50, r: 8, color: 'var(--role-athlete)', label: 'A2' },
          { cx: 280, cy: 40, r: 8, color: 'var(--role-trainer)', label: 'T3' },
          { cx: 300, cy: 120, r: 8, color: 'var(--role-business)', label: 'B2' },
          { cx: 260, cy: 200, r: 8, color: 'var(--role-fan)', label: 'F3' },
          { cx: 120, cy: 210, r: 8, color: 'var(--role-athlete)', label: 'A3' },
          { cx: 30, cy: 130, r: 8, color: 'var(--role-trainer)', label: 'T4' },
          { cx: 60, cy: 90, r: 7, color: 'var(--role-fan)', label: 'F4' },
          { cx: 250, cy: 90, r: 7, color: 'var(--role-business)', label: 'B3' },
        ]
      default:
        return []
    }
  }

  const nodes = getNodeConfig(activeIndex)
  const hub = { cx: 160, cy: 110 }

  // activeIndexに応じて接続密度を変える
  const getEdges = (index: number, nodeCount: number): [number, number][] => {
    if (index === 0) return []
    if (index === 1) return [[0, 1], [0, 2]]
    if (index === 2) return [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5]]
    // Step 04: 高密度接続
    const edges: [number, number][] = []
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = Math.hypot(nodes[i].cx - nodes[j].cx, nodes[i].cy - nodes[j].cy)
        if (dist < 120) edges.push([i, j])
      }
    }
    return edges
  }

  const visibleEdges = getEdges(activeIndex, nodes.length)

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

      {/* hub glow - Step 04で拡大 */}
      <circle cx={hub.cx} cy={hub.cy} r={activeIndex >= 1 ? (activeIndex === 3 ? 70 : 52) : 28} fill="url(#connectHub)" />

      {/* spokes to hub - Step 02以降 */}
      {activeIndex >= 1 &&
        nodes.slice(1).map((n, i) => (
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

      {/* perimeter edges - スクロール進行度に応じて表示 */}
      {visibleEdges.map(([a, b], i) => {
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
              style={{ animation: `vz-dash-flow ${2.2 + i * 0.1}s linear infinite` }}
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

      {/* nodes - activeIndexに応じてフェードイン */}
      {nodes.map((n, i) => (
        <motion.g
          key={n.label}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
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
            style={{ fontSize: i === 0 ? 10 : 8, fontWeight: 800 }}
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
  const pinRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!pinRef.current) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      ScrollTrigger.create({
        trigger: pinRef.current,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        start: 'center center',
        end: () => `+=${window.innerHeight * 3}`,
        onUpdate: (self) => {
          const stepIndex = Math.min(Math.floor(self.progress * 4), 3)
          setActiveIndex(stepIndex)
          setProgress(((stepIndex + 1) / 4) * 100)
        },
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      id="network"
      className="relative scroll-mt-24 overflow-hidden py-32 md:scroll-mt-28 md:py-40"
    >
      {/* street texture overlays */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="vz-grid absolute inset-0 opacity-60" />
        <div
          className="absolute -left-20 top-20 h-64 w-64 rounded-full blur-[100px]"
          style={{ background: 'rgba(48, 222, 29, 0.12)' }}
        />
        <div
          className="absolute -right-16 bottom-10 h-72 w-72 rounded-full blur-[110px]"
          style={{ background: 'rgba(255, 80, 80, 0.08)' }}
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

        <div ref={pinRef} className="mt-12">
          {/* Network level bar — gamification header - 薄く・小さく */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-2xl rounded-xl border border-lime/15 bg-card/40 p-3 backdrop-blur-sm md:p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="lp-badge text-[10px]">
                  <Flame className="h-3 w-3" />
                  Network Quest
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  Step {STEPS[activeIndex].step} / 04
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="lp-stat-num text-sm text-lime">{STEPS[activeIndex].level}</span>
                <span className="font-mono text-[10px] font-bold text-muted-foreground">
                  {STEPS[activeIndex].xp}
                </span>
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/60">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#d91414] via-lime to-[#30de1d]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>

          <div className="mt-6 grid gap-6 md:grid-cols-[0.95fr_1.05fr] md:mt-8 md:gap-8">
            {/* 左カラム: ステップインジケーター + LIVE MAP */}
            <div className="flex flex-col gap-4 md:flex-row md:gap-4">
              {/* ステップインジケーター - PC: 左縦配置、モバイル: 上横並び */}
              <div className="flex items-center justify-center gap-3 md:flex-col md:justify-start md:gap-4">
                {STEPS.map((step, i) => (
                  <button
                    key={step.step}
                    type="button"
                    onClick={() => {
                      setActiveIndex(i)
                      setProgress(((i + 1) / 4) * 100)
                    }}
                    className={cn(
                      'font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300',
                      activeIndex === i
                        ? 'text-lime scale-110'
                        : 'text-muted-foreground/60 hover:text-muted-foreground'
                    )}
                  >
                    <span className="hidden md:inline">{step.step}</span>
                    <span className={cn(
                      'inline-block h-2 w-2 rounded-full md:hidden',
                      activeIndex === i ? 'bg-lime' : 'bg-muted-foreground/60'
                    )} />
                  </button>
                ))}
              </div>

              {/* Live network visualization panel */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative h-[260px] flex-1 overflow-hidden rounded-3xl border-2 border-lime/30 bg-[#111118]/90 p-4 md:h-[340px] md:p-6"
                style={{ boxShadow: '0 0 60px rgba(200,232,0,0.15)' }}
              >
            <div className="absolute left-5 top-5 flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-lime" />
              </span>
              <span className="font-display text-sm font-black uppercase tracking-[0.2em] text-lime">Live Map</span>
            </div>
            <div className="mt-8 h-[220px] md:mt-10 md:h-[280px]">
              <NetworkPulse activeIndex={activeIndex} />
            </div>
            <p className="mt-3 text-center font-mono text-xs font-bold uppercase tracking-widest text-white/60">
              {STEPS[activeIndex].title} — シミュレーション
            </p>
          </motion.div>
            </div>

            {/* 右カラム: 現在のステップカードのみ表示 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex-shrink-0 rounded-2xl border p-5 md:p-6"
                style={{
                  borderColor: `color-mix(in oklch, ${STEPS[activeIndex].accent} 45%, transparent)`,
                  background: `color-mix(in oklch, ${STEPS[activeIndex].accent} 8%, transparent)`,
                  boxShadow: '0 0 40px rgba(200,232,0,0.08)',
                  minHeight: '340px',
                }}
              >
              <div className="relative flex items-start gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border"
                  style={{
                    borderColor: `color-mix(in oklch, ${STEPS[activeIndex].accent} 45%, transparent)`,
                    background: `color-mix(in oklch, ${STEPS[activeIndex].accent} 15%, transparent)`,
                    color: STEPS[activeIndex].accent,
                  }}
                >
                  {(() => {
                    const Icon = STEPS[activeIndex].icon
                    return <Icon className="h-7 w-7" strokeWidth={2.25} />
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="font-display text-3xl leading-none tracking-wide"
                      style={{ color: STEPS[activeIndex].accent }}
                    >
                      {STEPS[activeIndex].step}
                    </span>
                    <span className="lp-badge text-xs">{STEPS[activeIndex].level}</span>
                    <span className="lp-badge text-xs">{STEPS[activeIndex].xp}</span>
                    <Sparkles className="h-4 w-4 text-lime" aria-hidden="true" />
                  </div>
                  <h3 className="mt-2 text-xl font-bold tracking-tight md:text-2xl">{STEPS[activeIndex].title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{STEPS[activeIndex].body}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {STEPS[activeIndex].stat.label}
                    </span>
                    <span
                      className="font-display text-2xl tracking-wide"
                      style={{ color: STEPS[activeIndex].accent }}
                    >
                      {STEPS[activeIndex].stat.value}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
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
