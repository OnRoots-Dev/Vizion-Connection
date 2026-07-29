'use client'

import { motion } from 'motion/react'
import { ArrowRight, Zap, Flame } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CtaSection() {
  return (
    <section id="cta" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 pb-36 pt-16 md:scroll-mt-28">
      {/* Street-style background effects */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="vz-grid absolute inset-0 opacity-40" />
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
          style={{ background: 'rgba(255, 200, 30, 0.15)' }}
        />
        <div
          className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full blur-[120px]"
          style={{ background: 'rgba(48, 222, 29, 0.1)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border-2 border-lime/30 bg-[#0d0d12]/90 px-6 py-16 text-center md:px-12 md:py-24"
        style={{
          boxShadow: '0 0 80px rgba(200,232,0,0.15)',
        }}
      >
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, var(--lime-soft), transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative">
          {/* Gamified badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lp-badge mx-auto"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Join the Vizion</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-balance font-black leading-[1.15] tracking-tight"
            style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4rem)' }}
          >
            自分をマップに
            <span className="relative inline-block lp-accent">
              置こう
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-lg text-pretty text-lg font-bold leading-[1.85] text-white/70 md:text-xl"
          >
            Vizion Connectionに参加し、自分のロール —{' '}
            <span style={{ color: '#d91414' }}>アスリート</span>、トレーナー、ファン、ビジネス — を
            <span className="text-white"> ネットワーク全体と共に成長するノード</span>
            に変えよう。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-10 flex flex-col items-stretch justify-center gap-4 md:flex-row md:items-center"
          >
            <a
              href="/register"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'lp-cta-primary h-14 w-full px-8 text-lg font-black tracking-wide hover:translate-y-0 hover:shadow-none active:scale-[0.99] md:w-auto',
              )}
            >
              <Zap className="h-5 w-5" />
              マップに参加
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#roles"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'lp-cta-secondary h-14 w-full px-8 text-lg font-black tracking-wide hover:translate-y-0 hover:shadow-none active:scale-[0.99] md:w-auto border-2 border-white/20 hover:border-[#C8E800]/50',
              )}
            >
              ロールを探る
            </a>
            <a
              href="/business"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'lp-cta-business h-14 w-full px-8 text-lg font-black tracking-wide hover:translate-y-0 hover:shadow-none active:scale-[0.99] md:w-auto border-2 border-[#3C8CFF]/30 hover:border-[#3C8CFF]/60',
              )}
            >
              企業・スポンサーの方へ
            </a>
          </motion.div>

          {/* Gamified urgency text */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 text-sm font-bold text-white/40"
          >
            ⚡ 初期メンバー番号は先着発行 — いま参加した人だけの永久欠番
          </motion.p>
        </div>
      </motion.div>
    </section>
  )
}
