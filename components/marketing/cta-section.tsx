'use client'

import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CtaSection() {
  return (
    <section id="cta" className="relative mx-auto max-w-6xl px-4 pb-28 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-lime/25 bg-card px-6 py-16 text-center md:px-12 md:py-20"
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_50%_0%,var(--lime-soft),transparent_70%)]"
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            自分をマップに置こう
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            Vizion Connectionに参加し、自分のロール — アスリート、トレーナー、ファン、ビジネス — をネットワーク全体と共に成長するノードに変えよう。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/register"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-11 bg-lime px-6 text-primary-foreground hover:bg-lime/90',
              )}
            >
              マップに参加
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#roles"
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'h-11 px-6')}
            >
              ロールを探る
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
