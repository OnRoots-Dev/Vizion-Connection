// app/(marketing)/page.tsx

import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/marketing/HeroSection";
import { DynamicBackground } from "@/components/marketing/DynamicBackground";

const ViralLoopSection = dynamic(() => import("@/components/marketing/sections/ViralLoopSection").then(m => ({ default: m.ViralLoopSection })));
const ProblemSection = dynamic(() => import("@/components/marketing/sections/InfoSection").then(m => ({ default: m.ProblemSection })));
const WhatIsVizionSection = dynamic(() => import("@/components/marketing/sections/InfoSection").then(m => ({ default: m.WhatIsVizionSection })));
const WhoIsThisForSection = dynamic(() => import("@/components/marketing/sections/InfoSection").then(m => ({ default: m.WhoIsThisForSection })));
const HowItWorksSection = dynamic(() => import("@/components/marketing/sections/InfoSection").then(m => ({ default: m.HowItWorksSection })));
const SixtySecondSection = dynamic(() => import("@/components/marketing/sections/FeatureSection").then(m => ({ default: m.SixtySecondSection })));
const ProfileCardExplainSection = dynamic(() => import("@/components/marketing/sections/FeatureSection").then(m => ({ default: m.ProfileCardExplainSection })));
const CheerDiscoverySection = dynamic(() => import("@/components/marketing/sections/FeatureSection").then(m => ({ default: m.CheerDiscoverySection })));
const NowNextSection = dynamic(() => import("@/components/marketing/sections/CommunitySection").then(m => ({ default: m.NowNextSection })));
const EarlyMembersSection = dynamic(() => import("@/components/marketing/sections/CommunitySection").then(m => ({ default: m.EarlyMembersSection })));
const WhyNowSection = dynamic(() => import("@/components/marketing/sections/CommunitySection").then(m => ({ default: m.WhyNowSection })));
const WhatSection = dynamic(() => import("@/components/marketing/sections/CommunitySection").then(m => ({ default: m.WhatSection })));
const FoundingSection = dynamic(() => import("@/components/marketing/sections/CommunitySection").then(m => ({ default: m.FoundingSection })));
const NextPhaseSection = dynamic(() => import("@/components/marketing/sections/BusinessSection").then(m => ({ default: m.NextPhaseSection })));
const FoundingBusinessPartnersSection = dynamic(() => import("@/components/marketing/sections/BusinessSection").then(m => ({ default: m.FoundingBusinessPartnersSection })));
const SponsorComparisonTable = dynamic(() => import("@/components/marketing/sections/BusinessSection").then(m => ({ default: m.SponsorComparisonTable })));
const CTASection = dynamic(() => import("@/components/marketing/sections/CTASection").then(m => ({ default: m.CTASection })));
import FloatingCTAWrapper from "@/components/marketing/sections/FloatingCTAWrapper";
const FAQSection = dynamic(() => import("@/components/marketing/sections/FAQSection").then(m => ({ default: m.FAQSection })));

export const dynamic_config = "force-static";

export const metadata: Metadata = {
  title: "Vizion Connection | Beyond the Limit, Connect the Trust.",
  description:
    "スポーツの「信頼」を新しい時代の資産に。アスリート・トレーナー・スポンサーが役割と信頼でつながるプラットフォーム。先行登録受付中。",
  alternates: {
    canonical: "https://vizion-connection.jp",
  },
};

export default function Page() {
  return (
    <>
      <Header />
      <DynamicBackground />
      <main className="relative w-full overflow-x-hidden pt-17.5">
        {/* ビジネス動線バナー */}
        <Link
          href="/business"
          className="flex items-center justify-center gap-2 py-2 px-4 text-xs font-bold text-white hover:opacity-90 transition-opacity w-full"
          style={{ background: "#3C8CFF", display: "flex" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
          <span>🏢 ビジネス先行枠 受付中 — 3/31 TUE 23:59 締切</span> {/* ← 修正 */}
          <span className="ml-1 underline underline-offset-2">詳細を見る →</span>
        </Link>
        <HeroSection />
        <ProblemSection />
        <WhatIsVizionSection />
        <CTASection />
        <WhoIsThisForSection />
        <HowItWorksSection />
        <SixtySecondSection />
        <NowNextSection />
        <EarlyMembersSection />
        <WhyNowSection />
        <ProfileCardExplainSection />
        <WhatSection />
        <CheerDiscoverySection />
        <NextPhaseSection />
        <FoundingSection />
        <FoundingBusinessPartnersSection />
        <SponsorComparisonTable />
        <CTASection />
        <FAQSection />
        <Footer />
        <FloatingCTAWrapper />
      </main>
    </>
  );
}