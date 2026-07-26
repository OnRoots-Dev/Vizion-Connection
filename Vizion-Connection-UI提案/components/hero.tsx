'use client'

import { motion } from 'motion/react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NetworkBackground } from '@/components/network-background'
import { NetworkMap } from '@/components/network-map'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <NetworkBackground />

      <div className="relative mx-auto max-w-5xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex w-fit items-center gap-2 rounded-full border border-lime/30 bg-lime-soft px-3 py-1 font-mono text-xs text-lime"
        >
          <Sparkles className="h-3.5 w-3.5" />
          ネットワーク効果を、目に見える形に
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.15] tracking-tight md:text-6xl"
        >
          4つのロールが、Map上でつながる{' '}
          <span className="relative whitespace-nowrap text-lime">
            ひとつの生きたネットワーク
            <span className="absolute inset-x-0 -bottom-1 h-px bg-lime/50" />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          Vizion
          Connectionは、アスリート・トレーナー・ファン・ビジネスをひとつのつながりに可視化。新しい接続が生まれるたびに、価値が掛け算で広がっていきます。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href="#cta"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'h-11 bg-lime px-5 text-primary-foreground hover:bg-lime/90',
            )}
          >
            Mapに参加する
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#network"
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'h-11 px-5')}
          >
            つながり方を見る
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-16"
        >
          <NetworkMap />
        </motion.div>
      </div>
    </section>
  )
}
