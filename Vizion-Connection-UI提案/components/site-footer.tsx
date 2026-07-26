import { Waypoints } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-primary-foreground">
            <Waypoints className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
          <span className="font-mono text-sm">Vizion Connection</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Where athletes, trainers, fans &amp; business connect on one map.
        </p>
        <p className="font-mono text-xs text-muted-foreground">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}
