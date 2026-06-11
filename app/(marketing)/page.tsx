// app/(marketing)/page.tsx

import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/marketing/HeroSection";
import { DynamicBackground } from "@/components/marketing/DynamicBackground";

const RoleBenefitSection = dynamic(() => import("@/components/marketing/sections/RoleBenefitSection").then(m => ({ default: m.RoleBenefitSection })));
const FeatureSection = dynamic(() => import("@/components/marketing/sections/FeatureSection").then(m => ({ default: m.FeatureSection })));
const TrustSection = dynamic(() => import("@/components/marketing/sections/TrustSection").then(m => ({ default: m.TrustSection })));
const BusinessPlanSection = dynamic(() => import("@/components/marketing/sections/BusinessPlanSection").then(m => ({ default: m.BusinessPlanSection })));
const FAQSection = dynamic(() => import("@/components/marketing/sections/FAQSection").then(m => ({ default: m.FAQSection })));
const CTASection = dynamic(() => import("@/components/marketing/sections/CTASection").then(m => ({ default: m.CTASection })));
import FloatingCTAWrapper from "@/components/marketing/sections/FloatingCTAWrapper";

export const dynamic_config = "force-static";

export const metadata: Metadata = {
  title: "Vizion Connection | 本物の努力に、居場所を。",
  description:
    "アスリートの継続と成長を可視化する、スポーツ信頼プラットフォーム。アスリート・トレーナー・サポーター・ビジネスが役割と信頼でつながる。登録無料。",
  alternates: {
    canonical: "https://vizion-connection.jp",
  },
};

export default function Page() {
  return (
    <>
      <Header />
      <DynamicBackground />
      <main className="relative w-full overflow-x-hidden">
        <HeroSection />
        <RoleBenefitSection />
        <FeatureSection />
        <TrustSection />
        <BusinessPlanSection />
        <FAQSection />
        <CTASection />
        <Footer />
        <FloatingCTAWrapper />
      </main>
    </>
  );
}
