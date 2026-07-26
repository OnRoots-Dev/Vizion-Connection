'use client'

import { motion } from 'motion/react'
import { Network, TrendingUp, Radio, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Metric = { value: string; label: string }
type Feature = { icon: LucideIcon; title: string; body: string }

const METRICS: Metric[] = [
  { value: '4', label: 'ひとつのマップ上のロール' },
  { value: 'n²', label: '新しいノードごとの価値' },
  { value: '24/7', label: 'ライブ接続' },
]

const FEATURES: Feature[] = [
  {
    icon: Network,
    title: '近接性が相乗効果を生む',
    body: 'マップ上でロールが集まると、マッチングするリンクが自動的に形成される — トレーナーはアスリートに出会い、ファンはストーリーに出会い、ビジネスはリーチに出会う。',
  },
  {
    icon: Radio,
    title: 'つながりが脈動し、流れる',
    body: 'すべてのアクティブなリンクがシグナルを運ぶ。活動がリアルタイムで外側へと広がり、グラフは常に生きていて動いていると感じられる。',
  },
  {
    icon: TrendingUp,
    title: 'すべてのノードが複利で成長する',
    body: '新しいメンバーが参加するたびに、すでに接続している全員の価値が上がる。成長は線形ではない — ネットワーク全体で掛け算される。',
  },
  {
    icon: Globe,
    title: 'マップは拡大し続ける',
    body: 'ローカルなクラスターが地域に接続し、地域がグローバルなグラフに接続する。ネットワークは成長するように設計されており、停滞するようには作られていない。',
  },
]

export function NetworkEffectSection() {
  return (
    <section id="effect" className="relative overflow-hidden py-24">
      <div className="vz-grid absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-lime">ネットワーク効果</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            リンクが増えるほど価値が高まるネットワーク
          </h2>
        </div>

        <div className="mt-12 grid gap-4 rounded-3xl border border-border bg-card/50 p-4 sm:grid-cols-3">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col items-center rounded-2xl bg-background/60 px-6 py-8 text-center"
            >
              <span className="font-mono text-4xl font-semibold text-lime md:text-5xl">
                {m.value}
              </span>
              <span className="mt-2 text-sm text-muted-foreground">{m.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="group relative flex gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-lime/40"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-soft text-lime">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
