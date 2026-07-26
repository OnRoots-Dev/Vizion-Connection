import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { ConnectSection } from '@/components/connect-section'
import { RolesSection } from '@/components/roles-section'
import { NetworkEffectSection } from '@/components/network-effect-section'
import { CtaSection } from '@/components/cta-section'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="relative min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <ConnectSection />
        <RolesSection />
        <NetworkEffectSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  )
}
