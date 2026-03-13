"use client";

import { motion } from "framer-motion";

// ─── Mockup Placeholder ───────────────────────────────────────────────────────
export function MockupPlaceholder({
  label = "IMAGE / MOCKUP",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center border border-dashed border-white/10 bg-white/[0.02] ${className}`}
    >
      <span className="font-display text-[11px] uppercase tracking-[0.4em] text-white/15">
        {label}
      </span>
    </div>
  );
}

// ─── Registration Steps ───────────────────────────────────────────────────────
export function RegistrationSteps() {
  const steps = [
    { id: "01", label: "Role Select", desc: "役割を宣言" },
    { id: "02", label: "SNS Link", desc: "信頼をつなぐ" },
    { id: "03", label: "Get URL", desc: "証明を発行" },
  ];

  return (
    <div className="relative mb-12 flex w-full max-w-2xl items-start justify-between px-4">
      {/* 接続ライン */}
      <div className="absolute top-[20px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent md:top-[25px]" />

      {steps.map((step, i) => (
        <div key={i} className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#FFD600] bg-[#0B0B0F] text-[14px] font-bold text-[#FFD600] shadow-[0_0_15px_rgba(255,214,0,0.2)] md:h-12 md:w-12">
            {step.id}
          </div>
          <p className="font-display text-[10px] uppercase tracking-widest text-white md:text-[12px]">{step.label}</p>
          <p className="mt-1 text-[9px] text-white/40 md:text-[11px]">{step.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─── SNS Icon ─────────────────────────────────────────────────────────────────
export function SnsIcon({ label, path, color, href = "#" }: { label: string; path: string; color: string; href?: string }) {
  return (
    <a
      href={href}
      target={href !== "#" ? "_blank" : undefined}
      rel={href !== "#" ? "noopener noreferrer" : undefined}
      aria-label={label}
      className="relative z-30 flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[4px] border border-white/30 bg-white/10 text-white/90 transition-all duration-150 hover:border-transparent pointer-events-auto"
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = color;
        (e.currentTarget as HTMLElement).style.color = "#000";
        (e.currentTarget as HTMLElement).style.borderColor = color;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "";
        (e.currentTarget as HTMLElement).style.color = "";
        (e.currentTarget as HTMLElement).style.borderColor = "";
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] fill-current"><path d={path} /></svg>
    </a>
  );
}

// ─── Founding Member Badge ────────────────────────────────────────────────────
export function FoundingMemberBadge() {
  return (
    <motion.div
      initial={{ opacity: 0.9 }}
      whileHover={{ opacity: 1 }}
      className="relative inline-flex items-center gap-[5px] rounded-[2px] py-[4px] pl-[6px] pr-[9px] font-mono text-[6.5px] font-[800] uppercase tracking-[0.2em] text-[#fff5c0] overflow-hidden cursor-default shadow-[0_0_0_1px_rgba(100,75,0,0.7),inset_0_0_0_1px_rgba(255,215,60,0.18),inset_0_1px_0_rgba(255,235,100,0.35),inset_0_-1px_0_rgba(0,0,0,0.5),0_0_10px_rgba(180,130,5,0.22),0_0_24px_rgba(180,130,5,0.08)]"
      style={{
        background: `
          linear-gradient(170deg, rgba(255,245,160,0.07) 0%, rgba(255,255,255,0.04) 30%, transparent 60%),
          linear-gradient(105deg, #1a1200 0%, #362800 15%, #7a5c00 30%, #c8940c 42%, #f5dc5a 50%, #c8940c 58%, #7a5c00 70%, #362800 85%, #1a1200 100%)
        `,
        backgroundSize: "100% 100%, 280% 100%",
        textShadow: "0 1px 0 rgba(0,0,0,0.9), 0 -1px 0 rgba(255,220,40,0.3), 0 0 6px rgba(255,200,20,0.5), 0 0 14px rgba(255,180,0,0.2)",
      }}
    >
      <motion.div
        animate={{ backgroundPosition: ["160% 0", "-60% 0"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: "linear-gradient(112deg, transparent 35%, rgba(255,255,200,0.28) 47%, rgba(255,255,255,0.45) 50%, rgba(255,255,200,0.28) 53%, transparent 65%)",
          backgroundSize: "300% 100%",
        }}
      />

      <svg className="z-[3] h-[9px] w-[9px] shrink-0 overflow-visible" style={{ filter: "drop-shadow(0 0 2px rgba(255,220,40,0.9)) drop-shadow(0 0 5px rgba(255,180,0,0.5))" }} viewBox="0 0 14 11" fill="none">
        <path d="M1 9 L3.5 3 L7 6.5 L10.5 3 L13 9" stroke="#f5dc5a" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
        <line x1="1" y1="9" x2="13" y2="9" stroke="#f5dc5a" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="1" cy="9" r="1" fill="#ffe566" />
        <circle cx="7" cy="6.5" r="1" fill="#ffe566" />
        <circle cx="13" cy="9" r="1" fill="#ffe566" />
      </svg>

      <span className="relative z-[3]">Founding Member</span>

      {/* エングレービング（点線）枠 */}
      <div className="absolute inset-[2px] z-[4] rounded-[1px] border border-dashed border-[#ffd22826] pointer-events-none" />
    </motion.div>
  );
}
