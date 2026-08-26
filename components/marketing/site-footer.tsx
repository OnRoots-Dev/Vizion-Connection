import Image from 'next/image'
import Link from 'next/link'

const FOOTER_GROUPS = [
  {
    title: 'Platform',
    links: [
      { label: 'つながり方', href: '#network' },
      { label: 'プロフィール', href: '#profiles' },
      { label: '4つのロール', href: '#roles' },
      { label: 'ネットワーク効果', href: '#effect' },
    ],
  },
  {
    title: 'Join',
    links: [
      { label: 'Mapに参加', href: '/register' },
      { label: 'ログイン', href: '/login' },
      { label: '企業・スポンサー向け', href: '/business' },
    ],
  },
  // NOTE: Company グループ(/roadmap /company /contact)はMVPスコープ外で封印中のため非表示。
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#111118]/55">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[1.2fr_1.8fr] md:py-16">
        <div>
          <Link href="/" className="inline-flex" aria-label="Vizion Connection トップへ">
            <Image
              src="/images/vizion-connection-logo-6-cropped.png"
              alt="Vizion Connection"
              width={492}
              height={232}
              className="h-auto w-[220px] object-contain sm:w-[260px]"
            />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
            アスリート、トレーナー、ファン、ビジネスがひとつのマップでつながる場所。
            積み重ねを信頼に変え、応援が届く接点を育てます。
          </p>
        </div>

        <nav className="grid gap-8 sm:grid-cols-3" aria-label="Footer menu">
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-lime">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
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

      <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-border px-4 py-5 font-mono text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Vizion Connection</span>
        <span>Street × Sport × Trust — Vizion Connection</span>
      </div>
    </footer>
  )
}
