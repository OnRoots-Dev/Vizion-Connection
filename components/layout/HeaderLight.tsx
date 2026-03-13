"use client";

import Link from "next/link";
import { useState } from "react";

export function HeaderLight() {
    const [open, setOpen] = useState(false);

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

                {/* Desktop */}
                <nav className="hidden items-center gap-8 md:flex">
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
                </nav>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setOpen(o => !o)}
                    className="flex md:hidden flex-col gap-1.5 p-2"
                    aria-label="メニュー">
                    <span style={{ width: 22, height: 2, background: open ? "transparent" : "#1d1d1f", display: "block", transition: "all 0.2s" }} />
                    <span style={{ width: 22, height: 2, background: "#1d1d1f", display: "block", transform: open ? "rotate(45deg) translateY(5px)" : "none", transition: "all 0.2s" }} />
                    <span style={{ width: 22, height: 2, background: "#1d1d1f", display: "block", transform: open ? "rotate(-45deg) translateY(-5px)" : "none", transition: "all 0.2s" }} />
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div style={{
                    background: "rgba(245,245,247,0.97)",
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                    padding: "16px 24px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}>
                    <Link href="/discover" onClick={() => setOpen(false)}
                        className="text-[15px] uppercase tracking-[0.2em] font-semibold"
                        style={{ color: "rgba(0,0,0,0.5)" }}>
                        Discovery
                    </Link>
                    <Link href="/contact" onClick={() => setOpen(false)}
                        className="text-[15px] uppercase tracking-[0.2em] font-semibold"
                        style={{ color: "rgba(0,0,0,0.5)" }}>
                        Contact
                    </Link>
                    <Link href="/login" onClick={() => setOpen(false)}
                        className="text-[15px] font-bold"
                        style={{ color: "#1d1d1f" }}>
                        Login
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)}
                        style={{
                            marginTop: 8,
                            padding: "12px 20px",
                            background: "#1d1d1f",
                            color: "#fff",
                            fontWeight: 900,
                            fontSize: 13,
                            textAlign: "center",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            borderRadius: 8,
                        }}>
                        先行登録する
                    </Link>
                </div>
            )}
        </header>
    );
}