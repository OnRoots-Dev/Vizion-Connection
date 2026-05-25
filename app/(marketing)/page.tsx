// app/(marketing)/page.tsx

import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/marketing/HeroSection";
import { DynamicBackground } from "@/components/marketing/DynamicBackground";

const FeatureSection = dynamic(() => import("@/components/marketing/sections/FeatureSection").then(m => ({ default: m.FeatureSection })));
const RoleBenefitSection = dynamic(() => import("@/components/marketing/sections/RoleBenefitSection").then(m => ({ default: m.RoleBenefitSection })));
const EarlyMembersSection = dynamic(() => import("@/components/marketing/sections/CommunitySection").then(m => ({ default: m.EarlyMembersSection })));
import FloatingCTAWrapper from "@/components/marketing/sections/FloatingCTAWrapper";
const FAQSection = dynamic(() => import("@/components/marketing/sections/FAQSection").then(m => ({ default: m.FAQSection })));

export const dynamic_config = "force-static";

export const metadata: Metadata = {
  title: "Vizion Connection | Beyond the Limit, Connect the Trust.",
  description:
    "スポーツの「信頼」を新しい時代の資産に。アスリート・トレーナー・スポンサーが役割と信頼でつながるプラットフォーム。登録受付中。",
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
        {/* <Link
          href="/business"
          className="flex w-full items-center justify-center gap-2 bg-[#3C8CFF] px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white animate-pulse" />
          <span>🏢 Businessプラン 受付中</span>
          <span className="ml-1 underline underline-offset-2">詳細を見る →</span>
        </Link> */}
        <HeroSection />
        <FeatureSection />
        <RoleBenefitSection />
        <EarlyMembersSection />
        <FAQSection />
        <Footer />
        <FloatingCTAWrapper />
      </main>
    </>
  );
}
