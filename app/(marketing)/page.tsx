import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Hero } from "@/components/marketing/lp/hero";
import { RealActivitySection } from "@/components/marketing/lp/real-activity-section";
import { CoreLoopSection } from "@/components/marketing/lp/core-loop-section";
import { MomentsSection } from "@/components/marketing/lp/moments-section";
import { RoleInActionSection } from "@/components/marketing/lp/role-in-action";
import { FinalCta } from "@/components/marketing/lp/final-cta";
import { LpBackground } from "@/components/marketing/lp/lp-background";
import { FAQSection } from "@/components/marketing/sections/FAQSection";

export const metadata: Metadata = {
  title: "Vizion Connection — 積み重ねが、見える。応援が、届く。",
  description:
    "スポーツに関わるすべての人が、信頼でつながる場所。日々の記録も、応援も、出会いも——すべてがあなたの証明になる。",
};

/**
 * マーケティング LP — PHASE 3-H Brand / Product Experience。
 * 構成: Hero → Real Activity → Core Loop → Connection → Role in Action → CTA。
 * SHOW > TELL: 説明ではなく、実際のプロダクト体験を可視化する。
 */
export default function MarketingHomePage() {
  return (
    <div className="marketing-lp relative min-h-screen scroll-pt-24 bg-[#09090f] text-foreground md:scroll-pt-28">
      <LpBackground />
      <SiteHeader />
      <main>
        <Hero />
        <RealActivitySection />
        <CoreLoopSection />
        <MomentsSection />
        <RoleInActionSection />
        <FAQSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
