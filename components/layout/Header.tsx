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
          <span style={{ width: 22, height: 2, background: open ? "transparent" : "#fff", display: "block", transition: "all 0.2s" }} />
          <span style={{ width: 22, height: 2, background: "#fff", display: "block", transform: open ? "rotate(45deg) translateY(5px)" : "none", transition: "all 0.2s" }} />
          <span style={{ width: 22, height: 2, background: "#fff", display: "block", transform: open ? "rotate(-45deg) translateY(-5px)" : "none", transition: "all 0.2s" }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: "rgba(11,11,15,0.97)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Link href="/contact" onClick={() => setOpen(false)} className="font-display text-[15px] uppercase tracking-[0.2em] text-white/60">Contact</Link>
          <Link href="/login" onClick={() => setOpen(false)} className="font-display text-[15px] uppercase tracking-[0.2em] text-[#FFD600] font-bold">Login</Link>
          <Link href="/register" onClick={() => setOpen(false)}
            style={{ marginTop: 8, padding: "12px 20px", background: "#FFD600", color: "#000", fontWeight: 900, fontSize: 13, textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            今すぐ登録する
          </Link>
        </div>
      )}
    </header>
  );
}
