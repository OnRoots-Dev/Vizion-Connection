'use client'

import { motion } from 'motion/react'
import { Zap, Dumbbell, HeartHandshake, Briefcase } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
    <section id="roles" className="relative mx-auto max-w-6xl px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-lime">4つのロール</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          各ロールは何かを提供し — それ以上を受け取る
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          マップ上で、価値は一方向に流れることはない。すべてのつながりは双方向の交換であり、ネットワーク全体を強くする。
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((role, i) => {
          const Icon = role.icon
          return (
            <motion.article
              key={role.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-lime/40"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl border"
                style={{
                  borderColor: `color-mix(in oklch, ${role.color} 40%, transparent)`,
                  background: `color-mix(in oklch, ${role.color} 12%, transparent)`,
                }}
              >
                <Icon className="h-5 w-5" style={{ color: role.color }} />
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <h3 className="text-lg font-medium">{role.label}</h3>
                <span className="text-xs text-muted-foreground">{role.labelJa}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{role.headline}</p>

              <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    提供するもの
                  </dt>
                  <dd className="mt-1 leading-snug">{role.gives}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-lime">
                    受け取るもの
                  </dt>
                  <dd className="mt-1 leading-snug">{role.gets}</dd>
                </div>
              </dl>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
