"use client";

import dynamic from "next/dynamic";

const ContactSection = dynamic(
    () => import("@/components/marketing/sections/ContactSection"),
    { ssr: false }
);

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#07070e]">
            <ContactSection />
        </main>
    );
}
