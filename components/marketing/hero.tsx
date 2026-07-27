'use client'

import { motion } from 'motion/react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NetworkBackground } from './network-background'
import { NetworkMap } from './network-map'

export function Hero() {
  return (
    <section id="hero" className="relative isolate overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <NetworkBackground />

      {/* Street-style ambient glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
          style={{ background: 'rgba(217, 20, 20, 0.12)' }}
        />
        <div
          className="absolute right-1/4 bottom-1/4 h-[600px] w-[600px] translate-x-1/2 translate-y-1/2 rounded-full blur-[180px]"
          style={{ background: 'rgba(200, 232, 0, 0.08)' }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lp-badge mx-auto w-fit"
        >
          <Sparkles className="h-3.5 w-3.5" />
          ネットワーク効果を、目に見える形に
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.04 }}
          className="mt-5 font-display text-sm uppercase tracking-[0.4em] text-white/40 md:text-base"
          aria-hidden="true"
        >
          Every Effort, Visible.
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mx-auto mt-4 max-w-4xl text-balance font-black leading-[1.08] tracking-tight"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 4.75rem)' }}
        >
          4つのロールが、Map上でつながる
          <span className="mt-3 block">
            <span className="relative whitespace-nowrap text-lime">
              ひとつの生きたネットワーク
              <span className="absolute inset-x-0 -bottom-2 h-1 bg-lime/60" />
            </span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14 }}
          className="mx-auto mt-8 max-w-xl text-pretty text-lg font-bold leading-[1.9] text-white/70 md:text-xl"
        >
          Vizion Connectionは、アスリート・トレーナー・ファン・ビジネスをひとつのつながりに可視化。
          <span className="text-white">新しい接続</span>が生まれるたびに、
          <span style={{ color: '#C8E800', textShadow: '0 0 20px rgba(200,232,0,0.4)' }}>価値が掛け算</span>で広がっていきます。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center"
        >
          <a
            href="#cta"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'lp-cta-primary h-14 w-full px-8 text-lg font-black tracking-wide hover:translate-y-0 hover:shadow-none active:scale-[0.99] sm:w-auto',
            )}
          >
            Mapに参加する
            <ArrowRight className="h-5 w-5" />
          </a>
          <a
            href="#network"
            className={cn(
              buttonVariants({ size: 'lg', variant: 'outline' }),
              'lp-cta-secondary h-14 w-full px-8 text-lg font-black tracking-wide hover:translate-y-0 hover:shadow-none active:scale-[0.99] sm:w-auto border-2 border-white/20 hover:border-[#C8E800]/50',
            )}
          >
            つながり方を見る
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.28 }}
          className="mt-16 md:mt-20"
        >
          <NetworkMap />
        </motion.div>
      </div>
    </section>
  )
}
