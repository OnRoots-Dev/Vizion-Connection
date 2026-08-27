import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const FOOTER_LINKS = {
  platform: {
    title: 'Platform',
    items: [
      { label: 'Activity記録', href: '#activity' },
      { label: 'Core Loop', href: '#loop' },
      { label: '4つのロール', href: '#roles' },
      { label: 'Connection', href: '#moments' },
    ],
  },
  join: {
    title: 'Join',
    items: [
      { label: 'Mapに参加', href: '/register' },
      { label: 'ログイン', href: '/login' },
    ],
  },
  business: {
    title: 'Business',
    items: [
      { label: '企業・スポンサー向け', href: '/business' },
      { label: 'プランを見る', href: '/business' },
    ],
  },
}

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      {/* Top accent line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(200,232,0,0.4) 30%, rgba(60,140,255,0.3) 70%, transparent)',
        }}
      />

      {/* Main footer content */}
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 md:pt-20">
        {/* Top: Logo + tagline + CTA */}
        <div className="flex flex-col items-start gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="inline-flex" aria-label="Vizion Connection トップへ">
              <Image
                src="/images/Vizion_Connection_logo-wt-cropped.png"
                alt="Vizion Connection"
                width={492}
                height={232}
                className="h-auto w-[140px] object-contain sm:w-[160px]"
              />
            </Link>
            <p className="mt-5 text-[13px] leading-[1.9] text-white/50">
              スポーツに関わるすべての人が、信頼でつながる場所。
              <br />
              積み重ねを可視化し、応援を記録に変えます。
            </p>
            {/* CTA button */}
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/[0.08] px-5 py-2.5 text-[13px] font-bold text-lime transition-all hover:bg-lime/[0.14] hover:border-lime/50"
            >
              無料で参加する
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Link columns */}
          <nav className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3" aria-label="Footer menu">
            {Object.values(FOOTER_LINKS).map((group) => (
              <div key={group.title}>
                <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[13px] text-white/55 transition-colors hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="mt-14 h-px bg-white/[0.06]" />

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[10px] text-white/30">
            <span>© {new Date().getFullYear()} Vizion Connection</span>
            <a href="/company" className="transition-colors hover:text-white/60">会社概要</a>
            <a href="/contact" className="transition-colors hover:text-white/60">お問い合わせ</a>
            <a href="/roadmap" className="transition-colors hover:text-white/60">ロードマップ</a>
          </div>
          <p className="font-mono text-[10px] tracking-[0.12em] text-white/20">
            Street × Sport × Trust
          </p>
        </div>
      </div>
    </footer>
  )
}
