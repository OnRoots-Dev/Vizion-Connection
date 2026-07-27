import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { SiteHeader } from "@/components/marketing/site-header";
import { Hero } from "@/components/marketing/hero";
import { ConnectSection } from "@/components/marketing/connect-section";
import { ProfileCardsDemo } from "@/components/marketing/profile-cards-demo";
import { RolesSection } from "@/components/marketing/roles-section";
import { NetworkEffectSection } from "@/components/marketing/network-effect-section";
import { RoadmapSection } from "@/components/marketing/roadmap-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Vizion Connection — 積み重ねが、見える。応援が、届く。",
  description:
    "スポーツに関わるすべての人が、信頼でつながる場所。日々の記録も、応援も、出会いも——すべてがあなたの証明になる。",
};

const marketingTheme = {
  "--background": "#171716",
  "--foreground": "oklch(0.985 0 0)",
  "--card": "#20201d",
  "--card-foreground": "oklch(0.985 0 0)",
  "--muted": "#2b2b27",
  "--muted-foreground": "#d8d8cf",
  "--border": "rgba(255,255,255,0.14)",
  "--primary-foreground": "#171716",
} as CSSProperties;

/**
 * マーケティング LP — Vizion-Connection-UI提案のデザイン言語を採用。
 * Palette: lime #C8E800 / near-black #171716 / Network map visualization
 */
export default function MarketingHomePage() {
  return (
    <div className="marketing-lp relative min-h-screen scroll-pt-24 bg-[#171716] text-foreground md:scroll-pt-28" style={marketingTheme}>
      <SiteHeader />
      <main>
        <Hero />
        <ConnectSection />
        <ProfileCardsDemo />
        <RolesSection />
        <NetworkEffectSection />
        <RoadmapSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
