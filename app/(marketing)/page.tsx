"use client";

/**
 * SEO / OGP メタデータは app/layout.tsx または別の page メタデータファイルに追加してください。
 */

import { DynamicBackground }       from "@/components/marketing/DynamicBackground";
import { Header }                   from "@/components/layout/Header";
import { Footer }                   from "@/components/layout/Footer";
import { HeroSection }              from "@/components/marketing/HeroSection";
import { ViralLoopSection }         from "@/components/marketing/sections/ViralLoopSection";
import {
  ProblemSection,
  WhatIsVizionSection,
  WhoIsThisForSection,
  HowItWorksSection,
} from "@/components/marketing/sections/InfoSection";
import {
  SixtySecondSection,
  ProfileCardExplainSection,
  CheerDiscoverySection,
} from "@/components/marketing/sections/FeatureSection";
import {
  NowNextSection,
  EarlyMembersSection,
  WhyNowSection,
  WhatSection,
  FoundingSection,
} from "@/components/marketing/sections/CommunitySection";
import {
  NextPhaseSection,
  FoundingBusinessPartnersSection,
  SponsorComparisonTable,
} from "@/components/marketing/sections/BusinessSection";
import {
  CTASection,
  FloatingCTA,
} from "@/components/marketing/sections/CTASection";
import { FAQSection } from "@/components/marketing/sections/FAQSection";

// ─── グローバルスタイル ────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+JP:wght@300;400;700;900&display=swap');

  :root {
    --font-display: 'Bebas Neue', 'Noto Sans JP', sans-serif;
    --font-body: 'Noto Sans JP', sans-serif;
  }

  .font-display { font-family: var(--font-display); }
  .font-body    { font-family: var(--font-body); }

  html { scroll-behavior: smooth; }
  * { box-sizing: border-box; }

  .v12-shim { background:linear-gradient(108deg,transparent 22%,rgba(255,255,255,0.08) 50%,transparent 78%); background-size:200% 100%; pointer-events:none; }
  .v12-wrap:hover .v12-shim { animation:v12-shim 1.1s ease-in-out; opacity:1 !important; }
  .v12-face { transition:box-shadow .35s; }
  .v12-wrap:hover .v12-face { box-shadow:0 26px 70px rgba(0,0,0,0.88), 0 0 44px var(--rg-val); }
  .flip-hint::before { content:''; display:inline-block; width:12px; height:1px; background:rgba(255,255,255,0.15); margin-right:4px; }
  @keyframes v12-shim { from{background-position:-100% 0} to{background-position:230% 0} }
`;

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Page() {
  return (
    <>
      <style>{globalStyles}</style>

      <Header />
      <DynamicBackground />

      <main className="relative w-full overflow-x-hidden pt-[70px]">
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
        <FloatingCTA />
      </main>
    </>
  );
}
