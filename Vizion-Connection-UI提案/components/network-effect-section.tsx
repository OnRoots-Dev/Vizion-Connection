'use client'

import { motion } from 'motion/react'
import { Network, TrendingUp, Radio, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Metric = { value: string; label: string }
type Feature = { icon: LucideIcon; title: string; body: string }

const METRICS: Metric[] = [
  { value: '4', label: 'Roles on one map' },
  { value: 'n²', label: 'Value per new node' },
  { value: '24/7', label: 'Live connections' },
]

const FEATURES: Feature[] = [
  {
    icon: Network,
    title: 'Proximity creates synergy',
    body: 'When roles cluster on the map, matching links form automatically — trainers meet athletes, fans meet stories, business meets reach.',
  },
  {
    icon: Radio,
    title: 'Connections pulse and flow',
    body: 'Every active link carries signal. Activity ripples outward in real time, so the graph always feels alive and in motion.',
  },
  {
    icon: TrendingUp,
    title: 'Every node compounds',
    body: 'Each new member raises the value for everyone already connected. Growth is not linear — it multiplies across the network.',
  },
  {
    icon: Globe,
    title: 'The map keeps expanding',
    body: 'Local clusters connect into regions, regions into a global graph. The network is designed to grow, not to plateau.',
  },
]

export function NetworkEffectSection() {
  return (
    <section id="effect" className="relative overflow-hidden py-24">
      <div className="vz-grid absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-lime">Network effect</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            A network that&apos;s worth more with every link
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
