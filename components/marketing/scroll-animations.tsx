'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * ページ全体のスクロールアニメーションを管理
 * Nike/Strava風のスムーズで力強いモーションを実装
 * イージング: var(--ease-out-expo), 時間: var(--duration-normal)
 */
export function ScrollAnimations() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      // セクションごとのフェードイン・スライドイン（40-60px）
      gsap.utils.toArray<HTMLElement>('.gsap-fade-up').forEach((element) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'var(--ease-out-expo)',
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      // 数字のカウントアップアニメーション（1.2-1.8秒）
      gsap.utils.toArray<HTMLElement>('.gsap-count-up').forEach((element) => {
        const target = parseFloat(element.dataset.value || '0')
        const suffix = element.dataset.suffix || ''
        
        const obj = { value: 0 }
        gsap.to(obj, {
          value: target,
          duration: 1.5,
          ease: 'var(--ease-out-quart)',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            once: true,
          },
          onUpdate: function () {
            element.textContent = Math.round(obj.value) + suffix
          },
        })
      })

      // カードの順次出現（stagger: 0.15s）
      gsap.utils.toArray<HTMLElement>('.gsap-stagger-card').forEach((container) => {
        const cards = container.querySelectorAll<HTMLElement>('.gsap-stagger-item')
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 40,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'var(--ease-out-expo)',
            stagger: 0.15,
            scrollTrigger: {
              trigger: container,
              start: 'top 80%',
            },
          }
        )
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return <div ref={containerRef} className="contents" />
}
