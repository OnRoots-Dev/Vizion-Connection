"use client";

import dynamic from "next/dynamic";

const FloatingCTA = dynamic(
    () => import("@/components/marketing/sections/CTASection").then(m => ({ default: m.FloatingCTA })),
    { ssr: false }
);

export default function FloatingCTAWrapper() {
    return <FloatingCTA />;
}