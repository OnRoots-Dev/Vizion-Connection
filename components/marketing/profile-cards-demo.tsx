'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { Zap, Dumbbell, HeartHandshake, Briefcase, MapPin, Link2, BadgeCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHeader } from './section-header'

type Stat = { label: string; value: string }

type Profile = {
  id: string
  name: string
  roleJa: string
  roleEn: string
  icon: LucideIcon
  color: string
  avatar: string
  location: string
  bio: string
  stats: Stat[]
  connections: string[]
}

const PROFILES: Profile[] = [
  {
    id: 'athlete',
    name: '田中 玲奈',
    roleJa: 'アスリート',
    roleEn: 'Athlete',
    icon: Zap,
    color: 'var(--role-athlete)',
    avatar: '/avatars/athlete.png',
    location: '東京 / 陸上・長距離',
    bio: '練習の記録とストーリーを共有し、応援してくれる仲間とつながる。',
    stats: [
      { label: '今月の距離', value: '284km' },
      { label: 'フォロワー', value: '12.4k' },
      { label: '連携ロール', value: '3' },
    ],
    connections: ['trainer', 'fan', 'business'],
  },
  {
    id: 'trainer',
    name: '佐藤 健',
    roleJa: 'トレーナー',
    roleEn: 'Trainer',
    icon: Dumbbell,
    color: 'var(--role-trainer)',
    avatar: '/avatars/trainer.png',
    location: '大阪 / S&Cコーチ',
    bio: '実データに基づくプログラムで、担当アスリートの成長を可視化。',
    stats: [
      { label: '担当選手', value: '28名' },
      { label: '継続率', value: '92%' },
      { label: '紹介経由', value: '+41%' },
    ],
    connections: ['athlete', 'business'],
  },
  {
    id: 'fan',
    name: '山田 美咲',
    roleJa: 'ファン',
    roleEn: 'Fan',
    icon: HeartHandshake,
    color: 'var(--role-fan)',
    avatar: '/avatars/fan.png',
    location: '名古屋 / 応援歴 6年',
    bio: '推しの成長を追いかけ、コミュニティで熱量を共有する。',
    stats: [
      { label: '応援中', value: '17名' },
      { label: '参加イベント', value: '34' },
      { label: 'コミュ貢献', value: 'Lv.8' },
    ],
    connections: ['athlete'],
  },
  {
    id: 'business',
    name: 'Vizion Sports 株式会社',
    roleJa: 'ビジネス',
    roleEn: 'Business',
    icon: Briefcase,
    color: 'var(--role-business)',
    avatar: '/avatars/business.png',
    location: '東京 / スポンサー・ブランド',
    bio: '熱量の高いオーディエンスへ、本質的なスポンサーシップを届ける。',
    stats: [
      { label: '支援選手', value: '9名' },
      { label: 'リーチ', value: '480k' },
      { label: 'ROI', value: '3.2x' },
    ],
    connections: ['athlete', 'trainer'],
  },
]

const ROLE_LABEL: Record<string, string> = {
  athlete: 'アスリート',
  trainer: 'トレーナー',
  fan: 'ファン',
  business: 'ビジネス',
}

export function ProfileCardsDemo() {
  return (
    <section id="profiles" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 md:scroll-mt-28 md:py-32">
      <SectionHeader
        kicker="プロフィールデモ"
        title={
          <>
            Map上で出会う、
            <span className="lp-accent">4つのプロフィール</span>
          </>
        }
        lead="各ロールはそれぞれのプロフィールカードを持ち、つながることで価値を交換します。これはデモ用のサンプルカードです。"
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 gsap-stagger-card">
        {PROFILES.map((p, i) => {
          const Icon = p.icon
          const isAthlete = p.id === 'athlete'
          return (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-lime/40 gsap-stagger-item"
              style={
                isAthlete
                  ? { boxShadow: '0 0 32px rgba(217, 20, 20, 0.12)' }
                  : undefined
              }
            >
              <div className="relative h-20 w-full overflow-hidden">
                <Image
                  src="/moments/cover.png"
                  alt=""
                  fill
                  className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                {isAthlete && (
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      background: 'linear-gradient(135deg, rgba(217,20,20,0.35) 0%, transparent 60%)',
                    }}
                  />
                )}
                <span
                  className="absolute right-3 top-3 flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold"
                  style={{
                    borderColor: `color-mix(in oklch, ${p.color} 45%, transparent)`,
                    background: `color-mix(in oklch, ${p.color} 14%, transparent)`,
                    color: p.color,
                  }}
                >
                  <Icon className="h-3 w-3" />
                  {p.roleJa}
                </span>
              </div>

              <div className="-mt-8 flex flex-col px-5">
                <div
                  className="relative h-16 w-16 overflow-hidden rounded-2xl border-2"
                  style={{ borderColor: `color-mix(in oklch, ${p.color} 55%, transparent)` }}
                >
                  <Image src={p.avatar} alt={`${p.name}のプロフィール写真`} fill className="object-cover" />
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <h3 className="text-xl font-black leading-tight md:text-2xl">{p.name}</h3>
                  <BadgeCheck className="h-4 w-4 shrink-0 text-lime" aria-label="認証済み" />
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {p.location}
                </p>
                <p className="mt-2 text-base leading-relaxed text-white/70 md:text-lg">{p.bio}</p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-1 border-t border-border px-3 py-3">
                {p.stats.map((s) => (
                  <div key={s.label} className="flex flex-col items-center text-center">
                    <span
                      className="text-2xl tracking-wide md:text-3xl gsap-count-up"
                      style={isAthlete ? { color: p.color, fontFamily: 'var(--font-mono)' } : { color: 'var(--foreground)', fontFamily: 'var(--font-mono)' }}
                      data-value={s.value.replace(/[^0-9.]/g, '')}
                      data-suffix={s.value.replace(/[0-9.]/g, '')}
                    >
                      {s.value}
                    </span>
                    <span className="mt-1 text-xs font-bold leading-tight text-white/50">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 border-t border-border px-5 py-3">
                <Link2 className="h-3.5 w-3.5 shrink-0 text-lime" />
                <div className="flex flex-wrap gap-1">
                  {p.connections.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {ROLE_LABEL[c]}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
