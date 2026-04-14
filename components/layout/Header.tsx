"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-[100] w-full bg-[#0B0B0F]/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-2 md:px-10">
        <Link href="/">
          <Image src="/images/Vizion_Connection_logo-wt.png" alt="Logo" width={180} height={48} priority className="h-12 w-auto" />
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/contact" className="font-display text-[13px] uppercase tracking-[0.2em] text-white/50 hover:text-[#FFD600] transition-colors">Contact</Link>
          <Link href="/login" className="font-display text-[13px] uppercase tracking-[0.2em] text-[#FFD600] hover:text-white transition-colors">Login</Link>
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(o => !o)} className="flex md:hidden flex-col gap-1.5 p-2" aria-label="メニュー">
          <span className={`vc-menu-line bg-white ${open ? "bg-transparent" : ""}`} />
          <span className={`vc-menu-line bg-white ${open ? "translate-y-[5px] rotate-45" : ""}`} />
          <span className={`vc-menu-line bg-white ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="flex flex-col gap-4 border-t border-white/6 bg-[rgba(11,11,15,0.97)] px-6 pt-4 pb-6">
          <Link href="/contact" onClick={() => setOpen(false)} className="font-display text-[15px] uppercase tracking-[0.2em] text-white/60">Contact</Link>
          <Link href="/login" onClick={() => setOpen(false)} className="font-display text-[15px] uppercase tracking-[0.2em] text-[#FFD600] font-bold">Login</Link>
          <Link href="/register" onClick={() => setOpen(false)}
            className="mt-2 bg-[#FFD600] px-5 py-3 text-center text-[13px] font-black uppercase tracking-[0.1em] text-black">
            今すぐ登録する
          </Link>
        </div>
      )}
    </header>
  );
}
