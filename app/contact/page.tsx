"use client";

import dynamic from "next/dynamic";

const ContactSection = dynamic(
    () => import("@/components/marketing/sections/ContactSection"),
    { ssr: false }
);

export default function ContactPage() {
    return (
        <main style={{ minHeight: "100vh", background: "#07070e" }}>
            <ContactSection />
        </main>
    );
}