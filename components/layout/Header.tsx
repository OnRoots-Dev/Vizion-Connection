"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 z-[100] w-full border-b border-white/[0.06]"
      style={{
        background: "rgba(10, 10, 10, 0.55)",
        backdropFilter: "blur(22px) saturate(180%)",
        WebkitBackdropFilter: "blur(22px) saturate(180%)",
      }}
    >
      {/* scroll-edge: 軽い光のエッジ（material catch light） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(244,193,10,0.22), transparent)" }}
      />
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-2 md:px-10">
        <Link href="/" className="active:scale-[0.97] transition-transform duration-100">
          <Image src="/images/vizion-connection-logo-6-cropped.png" alt="Logo" width={180} height={48} priority className="h-12 w-auto" />
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {/* NOTE: /contact はMVPスコープ外で封印中のためリンク非表示 */}
          <Link href="/login" className="font-display text-[13px] uppercase tracking-[0.2em] text-[#F4C10A] transition-colors hover:text-white active:scale-[0.97]">Login</Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-col gap-1.5 p-2 active:scale-[0.97] transition-transform duration-100 md:hidden"
          aria-label="メニュー"
        >
          <span className={`vc-menu-line bg-white ${open ? "bg-transparent" : ""}`} />
          <span className={`vc-menu-line bg-white ${open ? "translate-y-[5px] rotate-45" : ""}`} />
          <span className={`vc-menu-line bg-white ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu — heavier material than bar */}
      {open && (
        <div
          className="flex flex-col gap-4 border-t border-white/[0.06] px-6 pt-4 pb-6"
          style={{
            background: "rgba(10, 10, 10, 0.88)",
            backdropFilter: "blur(28px) saturate(160%)",
            WebkitBackdropFilter: "blur(28px) saturate(160%)",
          }}
        >
          {/* NOTE: /contact はMVPスコープ外で封印中のためリンク非表示 */}
          <Link href="/login" onClick={() => setOpen(false)} className="font-display text-[15px] font-bold uppercase tracking-[0.2em] text-[#F4C10A] active:scale-[0.97]">Login</Link>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-xl px-5 py-3 text-center text-[13px] font-black uppercase tracking-[0.1em] text-black active:scale-[0.97] transition-transform duration-100"
            style={{ background: "#F4C10A", boxShadow: "0 0 24px rgba(244,193,10,0.35)" }}
          >
            無料で始める
          </Link>
        </div>
      )}
    </header>
  );
}
