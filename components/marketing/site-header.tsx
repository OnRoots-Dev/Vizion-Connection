'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  href: string
  sectionId: string | null
  business?: boolean
}

const NAV: readonly NavItem[] = [
  { label: 'つながり方', href: '#network', sectionId: 'network' },
  { label: 'プロフィール', href: '#profiles', sectionId: 'profiles' },
  { label: '4つのロール', href: '#roles', sectionId: 'roles' },
  { label: 'ネットワーク効果', href: '#effect', sectionId: 'effect' },
  { label: 'ロードマップ', href: '#roadmap', sectionId: 'roadmap' },
  { label: '企業向け', href: '/business', sectionId: null, business: true },
]

const SECTION_IDS = NAV.filter((item) => item.sectionId).map((item) => item.sectionId!)

export function SiteHeader() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id)
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.15, 0.35, 0.55] },
    )

    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen, closeMobile])

  const navLinkProps = (item: (typeof NAV)[number]) => ({
    href: item.href,
    className: 'lp-nav-link',
    'data-active': item.sectionId ? activeSection === item.sectionId : undefined,
    'data-business': item.business ? true : undefined,
    onClick: item.sectionId ? closeMobile : undefined,
  })

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4',
          'transition-[padding] duration-300',
        )}
      >
        <div
          className={cn(
            'flex w-full max-w-7xl items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 backdrop-blur-xl sm:rounded-full sm:px-5 sm:py-3',
            scrolled
              ? 'border-lime/30 bg-[#0a0a0f]/95 shadow-[0_8px_32px_rgba(0,0,0,0.35)]'
              : 'border-border/40 bg-[#0a0a0f]/80',
          )}
        >
          <a href="#" className="flex min-w-0 shrink-0 items-center pl-0.5 sm:pl-1" aria-label="Vizion Connection トップへ">
            <Image
              src="/images/vizion-connection-logo-6-cropped.png"
              alt="Vizion Connection"
              width={492}
              height={232}
              priority
              className="h-8 w-auto object-contain sm:h-9 lg:h-10"
            />
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="ページ内ナビゲーション">
            {NAV.map((item) => (
              <a key={item.href} {...navLinkProps(item)}>
                <span className="relative">
                  {item.label}
                  {item.sectionId && activeSection === item.sectionId && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-lime shadow-[0_0_12px_var(--lime)]" />
                  )}
                </span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href="/login"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden shrink-0 sm:inline-flex')}
            >
              ログイン
            </a>
            <a
              href="#cta"
              className={cn(
                buttonVariants({ size: 'sm' }),
                'lp-cta-primary hidden min-h-11 shrink-0 px-4 hover:translate-y-0 hover:shadow-none active:scale-[0.99] sm:inline-flex sm:px-5 font-black tracking-wide',
              )}
            >
              Mapに参加
            </a>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="lp-mobile-nav"
              aria-label={mobileOpen ? 'メニューを閉じる' : 'メニューを開く'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        id="lp-mobile-nav"
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={cn(
            'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          aria-label="メニューを閉じる"
          onClick={closeMobile}
        />
        <nav
          className={cn(
            'absolute right-3 top-[4.5rem] w-[min(100%,20rem)] rounded-2xl border border-border bg-background/95 p-3 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:right-4',
            mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
          )}
          aria-label="モバイルナビゲーション"
        >
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  {...navLinkProps(item)}
                  className="lp-nav-link block w-full px-4 py-3 text-base"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            <a
              href="/login"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}
              onClick={closeMobile}
            >
              ログイン
            </a>
            <a
              href="#cta"
              className={cn(buttonVariants({ size: 'lg' }), 'lp-cta-primary w-full hover:translate-y-0 hover:shadow-none font-black tracking-wide')}
              onClick={closeMobile}
            >
              Mapに参加
            </a>
          </div>
        </nav>
      </div>
    </>
  )
}
