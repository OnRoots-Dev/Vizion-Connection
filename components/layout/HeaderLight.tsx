"use client";

import Link from "next/link";
import { useState } from "react";

export function HeaderLight() {
    const [open, setOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 z-[100] w-full border-b border-black/8 bg-[rgba(245,245,247,0.72)] backdrop-blur-[20px] [backdrop-filter:saturate(180%)_blur(20px)] [-webkit-backdrop-filter:saturate(180%)_blur(20px)]">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-2 md:px-10">
                <Link href="/">
                    <img src="/images/Vizion_Connection_logo-bk.png" alt="Logo" className="h-12 w-auto" />
                </Link>

                {/* Desktop */}
                <nav className="hidden items-center gap-8 md:flex">
                    <Link href="/contact"
                        className="vc-light-link text-[13px] font-semibold uppercase tracking-[0.2em]">
                        Contact
                    </Link>
                    <Link href="/login"
                        className="rounded-full bg-[#1d1d1f] px-4 py-1.5 text-[13px] font-bold text-white transition-all">
                        Login
                    </Link>
                </nav>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setOpen(o => !o)}
                    className="flex md:hidden flex-col gap-1.5 p-2"
                    aria-label="メニュー">
                    <span className={`vc-menu-line bg-[#1d1d1f] ${open ? "bg-transparent" : ""}`} />
                    <span className={`vc-menu-line bg-[#1d1d1f] ${open ? "translate-y-[5px] rotate-45" : ""}`} />
                    <span className={`vc-menu-line bg-[#1d1d1f] ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="flex flex-col gap-4 border-t border-black/6 bg-[rgba(245,245,247,0.97)] px-6 pt-4 pb-6">
                    <Link href="/contact" onClick={() => setOpen(false)}
                        className="text-[15px] font-semibold uppercase tracking-[0.2em] text-black/50">
                        Contact
                    </Link>
                    <Link href="/login" onClick={() => setOpen(false)}
                        className="text-[15px] font-bold text-[#1d1d1f]">
                        Login
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)}
                        className="mt-2 rounded-lg bg-[#1d1d1f] px-5 py-3 text-center text-[13px] font-black uppercase tracking-[0.1em] text-white">
                        先行登録する
                    </Link>
                </div>
            )}
        </header>
    );
}
