'use client'

import { useEffect, useRef } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NetworkBackground } from './network-background'
import { NetworkMap } from './network-map'
import { gsap } from 'gsap'

/**
 * Heroセクション - Billboard Live風のテキストアニメーション
 * 大きなワードが順番に現れる演出を実装
 */
export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      // Badge: フェードイン
      gsap.fromTo(
        badgeRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'var(--ease-out-expo)', delay: 0.2 }
      )

      // Subtitle: フェードイン
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'var(--ease-out-expo)', delay: 0.4 }
      )

      // Title: Billboard Live風 - スケール 1.1 → 1.0 + フェードイン
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll('.hero-word')
        gsap.fromTo(
          words,
          { opacity: 0, y: 60, scale: 1.1 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'var(--ease-out-expo)',
            stagger: 0.15,
            delay: 0.6,
          }
        )

        // スクロール時: キャッチがスケールダウン + 上に移動
        gsap.to(titleRef.current, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
          scale: 0.85,
          y: -50,
          opacity: 0.8,
          ease: 'none',
        })
      }

      // サブコピーとCTA: 遅れて出現（stagger）
      const subElements = [subtitleRef.current, ctaRef.current]
      gsap.fromTo(
        subElements.filter(Boolean),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'var(--ease-out-expo)',
          stagger: 0.12,
          delay: 1.0,
        }
      )

      // NetworkMap: スケールアップ
      gsap.fromTo(
        mapRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1, ease: 'var(--ease-out-expo)', delay: 1.2 }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])
  return (
    <section id="hero" ref={containerRef} className="relative isolate overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <NetworkBackground />

      {/* Street-style ambient glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
          style={{ background: 'rgba(255, 80, 80, 0.12)' }}
        />
        <div
          className="absolute right-1/4 bottom-1/4 h-[600px] w-[600px] translate-x-1/2 translate-y-1/2 rounded-full blur-[180px]"
          style={{ background: 'rgba(48, 222, 29, 0.1)' }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center">
        <div
          ref={badgeRef}
          className="lp-badge mx-auto w-fit"
        >
          <Sparkles className="h-3.5 w-3.5" />
          ネットワーク効果を、目に見える形に
        </div>

        <p
          ref={subtitleRef}
          className="mt-5 font-display text-sm uppercase tracking-[0.4em] text-white/40 md:text-base"
          aria-hidden="true"
        >
          Every Effort, Visible.
        </p>

        <h1
          ref={titleRef}
          className="mx-auto mt-4 max-w-4xl text-balance font-display leading-[1.08] tracking-tight"
          style={{ fontSize: 'var(--text-hero)' }}
        >
          <span className="hero-word block">積み重ねが、</span>
          <span className="hero-word block">
            <span className="relative whitespace-nowrap text-lime">
              武器になる。
              <span className="absolute inset-x-0 -bottom-2 h-1 bg-lime/60" />
            </span>
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-xl text-pretty font-body leading-[1.9] text-white/70" style={{ fontSize: 'var(--text-body)' }}>
          アスリート・トレーナー・ファン・ビジネス。
          <span className="text-white">スポーツに関わるすべての役割を、</span>
          ひとつのマップで可視化する。
        </p>

        <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-white/40" style={{ fontFamily: 'var(--font-mono)' }}>
          Vizion Connection — スポーツの信頼を可視化するプラットフォーム
        </p>

        <div
          ref={ctaRef}
          className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center"
        >
          <a
            href="#cta"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'lp-cta-primary h-14 w-full px-8 text-lg font-black tracking-wide hover:translate-y-0 hover:shadow-none active:scale-[0.99] sm:w-auto',
            )}
          >
            今すぐマップに参加する（無料）
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
        </div>

        <div
          ref={mapRef}
          className="mt-16 md:mt-20"
        >
          <NetworkMap />
        </div>
      </div>
    </section>
  )
}
