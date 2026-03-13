"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 z-[100] w-full bg-[#0B0B0F]/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-2 md:px-10">
        <Link href="/" className="font-display uppercase tracking-widest">
          <img src="/images/Vizion_Connection_logo-wt.png" alt="Logo" className="h-12 w-auto" />
        </Link>

        <nav className="flex items-center gap-8">
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/discover" className="font-display text-[13px] uppercase tracking-[0.2em] text-white/50 hover:text-[#FFD600] transition-colors">Discovery</Link>
            <Link href="/contact" className="font-display text-[13px] uppercase tracking-[0.2em] text-white/50 hover:text-[#FFD600] transition-colors">Contact</Link>
            <Link href="/login" className="font-display text-[13px] uppercase tracking-[0.2em] text-[#FFD600] hover:text-white transition-colors">Login</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
