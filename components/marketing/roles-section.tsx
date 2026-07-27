'use client'

import { motion } from 'motion/react'
import { Zap, Dumbbell, HeartHandshake, Briefcase } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHeader } from './section-header'

type RoleCard = {
  icon: LucideIcon
  label: string
  labelJa: string
  color: string
  headline: string
  gives: string
  gets: string
}

const ROLES: RoleCard[] = [
  {
    icon: Zap,
    label: 'Athlete',
    labelJa: 'アスリート',
    color: 'var(--role-athlete)',
    headline: 'パフォーマンスを存在感に変える',
    gives: 'リアルなトレーニングデータ、ストーリー、瞬間',
    gets: 'コーチング、ファン、スポンサーシップのリーチ',
  },
  {
    icon: Dumbbell,
    label: 'Trainer',
    labelJa: 'トレーナー',
    color: 'var(--role-trainer)',
    headline: '自ら成長するロスターを育てる',
    gives: 'プログラム、専門知識、責任感',
    gets: '発見可能なアスリートと紹介',
  },
  {
    icon: HeartHandshake,
    label: 'Fan',
    labelJa: 'ファン',
    color: 'var(--role-fan)',
    headline: '旅路を追い、成長を後押しする',
    gives: '注目、応援、コミュニティの熱量',
    gets: 'アクセス、帰属感、共有された勝利',
  },
  {
    icon: Briefcase,
    label: 'Business',
    labelJa: 'ビジネス',
    color: 'var(--role-business)',
    headline: 'ノイズではなく、シグナルを支援する',
    gives: '資金、ギア、機会',
    gets: '本物のオーディエンスと帰属',
  },
]

export function RolesSection() {
  return (
    <section id="roles" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-24 md:scroll-mt-28 md:py-32">
      {/* Street-style background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="vz-grid absolute inset-0 opacity-30" />
        <div
          className="absolute left-1/4 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
          style={{ background: 'rgba(217, 20, 20, 0.1)' }}
        />
      </div>

      <SectionHeader
        kicker="4つのロール"
        title={
          <>
            各ロールは何かを提供し —
            <br />
            <span className="lp-accent">それ以上の価値</span>を受け取る
          </>
        }
        lead="マップ上で、価値は一方向に流れることはない。すべてのつながりは双方向の交換であり、ネットワーク全体を強くする。"
      />

      <div className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((role, i) => {
          const Icon = role.icon
          const isAthlete = role.label === 'Athlete'
          return (
            <motion.article
              key={role.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 bg-[#0d0d12]/80 p-6 transition-all duration-300 hover:-translate-y-2"
              style={{
                borderColor: isAthlete ? '#d91414' : 'rgba(255,255,255,0.1)',
                boxShadow: isAthlete ? '0 0 50px rgba(217,20,20,0.25)' : '0 0 30px rgba(255,255,255,0.05)',
              }}
            >
              {/* Accent glow background */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${role.color}20, transparent 70%)`,
                }}
              />
              
              {/* Top accent line */}
              <div
                className="absolute left-0 right-0 top-0 h-1"
                style={{
                  background: role.color,
                  boxShadow: `0 0 20px ${role.color}`,
                }}
              />

              <div className="relative">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border-2"
                  style={{
                    borderColor: `${role.color}60`,
                    background: `${role.color}20`,
                    color: role.color,
                    boxShadow: `0 0 20px ${role.color}40`,
                  }}
                >
                  <Icon className="h-7 w-7" strokeWidth={2.5} />
                </div>

                <div className="mt-5 flex items-baseline gap-2">
                  <h3
                    className="font-display text-4xl uppercase tracking-wide md:text-5xl"
                    style={{
                      color: role.color,
                      textShadow: `0 0 24px ${role.color}40`,
                    }}
                  >
                    {role.label}
                  </h3>
                  <span className="text-base font-bold text-white/50 md:text-lg">{role.labelJa}</span>
                </div>
                <p className="mt-4 text-xl font-black leading-relaxed text-white md:text-2xl">
                  {role.headline}
                </p>

                <dl className="mt-8 flex-1 space-y-5 border-t border-white/10 pt-6">
                  <div>
                    <dt className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                      提供するもの
                    </dt>
                    <dd className="mt-3 leading-relaxed text-white/60 font-bold text-base md:text-lg">{role.gives}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs font-semibold uppercase tracking-[0.2em]"
                      style={{ color: role.color }}
                    >
                      受け取るもの
                    </dt>
                    <dd className="mt-3 leading-relaxed text-white/90 font-black text-base md:text-lg">{role.gets}</dd>
                  </div>
                </dl>
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
