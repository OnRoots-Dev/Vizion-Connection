import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Hero } from "@/components/marketing/lp/hero";
import { CoreLoopSection } from "@/components/marketing/lp/core-loop-section";
import { RolesSection } from "@/components/marketing/lp/roles-section";
import { FinalCta } from "@/components/marketing/lp/final-cta";

export const metadata: Metadata = {
  title: "Vizion Connection — 積み重ねが、見える。応援が、届く。",
  description:
    "スポーツに関わるすべての人が、信頼でつながる場所。日々の記録も、応援も、出会いも——すべてがあなたの証明になる。",
};

/**
 * マーケティング LP — PHASE 3-C 全面刷新。
 * 構成: Map-first Hero → Core Loop → 4 Roles → Final CTA（MarketingTemplate準拠）。
 * アニメは framer-motion のみ（GSAP廃止・A7）。MVP外（Roadmap等）は訴求しない。
 */
export default function MarketingHomePage() {
  return (
    <div className="marketing-lp relative min-h-screen scroll-pt-24 bg-[#09090f] text-foreground md:scroll-pt-28">
      <SiteHeader />
      <main>
        <Hero />
        <CoreLoopSection />
        <RolesSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
