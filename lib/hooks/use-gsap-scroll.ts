'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * GSAP ScrollTriggerを使用したスクロールアニメーションフック
 * Nike/Strava風のスムーズで力強いモーションを実装
 */
export function useGsapScroll() {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      // セクションごとのフェードイン・スライドイン
      gsap.utils.toArray<HTMLElement>('.gsap-fade-up').forEach((element) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 60,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      // 数字のカウントアップアニメーション
      gsap.utils.toArray<HTMLElement>('.gsap-count-up').forEach((element) => {
        const target = parseFloat(element.dataset.value || '0')
        const suffix = element.dataset.suffix || ''
        
        const obj = { value: 0 }
        gsap.to(obj, {
          value: target,
          duration: 2,
          ease: 'power2.out',
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
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return containerRef
}
