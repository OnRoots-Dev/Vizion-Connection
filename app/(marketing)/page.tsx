import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { Hero } from "@/components/marketing/hero";
import { ConnectSection } from "@/components/marketing/connect-section";
import { ProfileCardsDemo } from "@/components/marketing/profile-cards-demo";
import { RolesSection } from "@/components/marketing/roles-section";
import { NetworkEffectSection } from "@/components/marketing/network-effect-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Vizion Connection — 積み重ねが、見える。応援が、届く。",
  description:
    "スポーツに関わるすべての人が、信頼でつながる場所。日々の記録も、応援も、出会いも——すべてがあなたの証明になる。",
};

/**
 * マーケティング LP — Vizion-Connection-UI提案のデザイン言語を採用。
 * Palette: lime #C8E800 / near-black #050608 / Network map visualization
 */
export default function MarketingHomePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <ConnectSection />
        <ProfileCardsDemo />
        <RolesSection />
        <NetworkEffectSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
