'use client'

import { Waypoints } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'つながり方', href: '#network' },
  { label: 'プロフィール', href: '#profiles' },
  { label: '4つのロール', href: '#roles' },
  { label: 'ネットワーク効果', href: '#effect' },
]

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className="flex w-full max-w-5xl items-center justify-between rounded-full border border-border bg-background/60 px-3 py-2 backdrop-blur-xl">
        <a href="#" className="flex items-center gap-2 pl-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime text-primary-foreground">
            <Waypoints className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <span className="font-mono text-sm font-medium tracking-tight">Vizion Connection</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden sm:inline-flex')}
          >
            ログイン
          </a>
          <a
            href="#cta"
            className={cn(
              buttonVariants({ size: 'sm' }),
              'bg-lime text-primary-foreground hover:bg-lime/90',
            )}
          >
            Mapに参加
          </a>
        </div>
      </div>
    </header>
  )
}
