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
    headline: 'Turn performance into presence',
    gives: 'Real training data, stories, moments',
    gets: 'Coaching, fans, sponsorship reach',
  },
  {
    icon: Dumbbell,
    label: 'Trainer',
    labelJa: 'トレーナー',
    color: 'var(--role-trainer)',
    headline: 'Grow a roster that grows itself',
    gives: 'Programs, expertise, accountability',
    gets: 'Discoverable athletes & referrals',
  },
  {
    icon: HeartHandshake,
    label: 'Fan',
    labelJa: 'ファン',
    color: 'var(--role-fan)',
    headline: 'Follow the journey, fuel the rise',
    gives: 'Attention, support, community energy',
    gets: 'Access, belonging, shared wins',
  },
  {
    icon: Briefcase,
    label: 'Business',
    labelJa: 'ビジネス',
    color: 'var(--role-business)',
    headline: 'Sponsor signal, not noise',
    gives: 'Funding, gear, opportunities',
    gets: 'Authentic audiences & attribution',
  },
]

export function RolesSection() {
  return (
    <section id="roles" className="relative mx-auto max-w-6xl px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-lime">Four roles</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          Each role gives something — and gets more back
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          On the map, value never flows one way. Every connection is a two-way exchange that makes
          the whole network stronger.
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
                    Gives
                  </dt>
                  <dd className="mt-1 leading-snug">{role.gives}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-lime">
                    Gets
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
