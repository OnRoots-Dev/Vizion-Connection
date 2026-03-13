// components/layout/HeaderLight.tsx

"use client";

import Link from "next/link";

export function HeaderLight() {
    return (
        <header className="fixed top-0 left-0 z-[100] w-full"
            style={{
                background: "rgba(245,245,247,0.72)",
                backdropFilter: "saturate(180%) blur(20px)",
                WebkitBackdropFilter: "saturate(180%) blur(20px)",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
            }}>
            <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-2 md:px-10">
                <Link href="/">
                    <img src="/images/Vizion_Connection_logo-bk.png" alt="Logo" className="h-12 w-auto" />
                </Link>

                <nav className="flex items-center gap-6 md:gap-8">
                    <div className="hidden items-center gap-8 md:flex">
                        <Link href="/discover"
                            className="text-[13px] uppercase tracking-[0.2em] font-semibold transition-colors"
                            style={{ color: "rgba(0,0,0,0.4)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#007aff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.4)")}>
                            Discovery
                        </Link>
                        <Link href="/contact"
                            className="text-[13px] uppercase tracking-[0.2em] font-semibold transition-colors"
                            style={{ color: "rgba(0,0,0,0.4)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#007aff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.4)")}>
                            Contact
                        </Link>
                        <Link href="/login"
                            className="text-[13px] font-bold px-4 py-1.5 rounded-full transition-all"
                            style={{ background: "#1d1d1f", color: "#fff" }}>
                            Login
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    );
}