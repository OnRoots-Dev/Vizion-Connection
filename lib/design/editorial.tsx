// lib/design/editorial.ts
// Editorial composition primitives for Vizion Connection — VIZION NATIVE
// Replaces card-grid patterns with activity-first, human-centered layouts
// Principles: LESS UI MORE WORLD — Activity/Place/People/Moment/Connection as hero
// Asymmetry, full-bleed media, map composition, varied rhythm
// DO NOT use this to build Heading→Description→CTA repeated templates.

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { INTERACTION, SPRING_CARD_ENTER } from "./tokens";

/**
 * Editorial Section — Full-width band with breathing room
 * Use for: Role narratives, Feature stories, Brand messages
 * NOT for: KPI cards, Feature lists, Pricing tables
 * Variant controls asymmetric rhythm: bleed allows full-viewport elements
 */
export function EditorialSection({
  children,
  className = "",
  background = "transparent",
  bleed = false,
}: {
  children: React.ReactNode;
  className?: string;
  background?: "transparent" | "surface" | "accent-subtle";
  bleed?: boolean;
}) {
  const bgStyles = {
    transparent: "bg-transparent",
    surface: "bg-[#0D0D12]",
    "accent-subtle": "bg-[#09090f]",
  };

  return (
    <section
      className={`relative overflow-hidden py-20 md:py-28 lg:py-32 ${bgStyles[background]} ${className}`}
    >
      <div className={bleed ? "mx-auto max-w-[1440px] px-0" : "mx-auto max-w-6xl px-4 md:px-6 lg:px-8"}>
        {children}
      </div>
    </section>
  );
}

/**
 * Editorial Heading — Large typography with hierarchy
 * Use for: Section titles, Role statements, Value propositions
 */
export function EditorialHeading({
  label,
  labelColor = "var(--vc-accent)",
  children,
  align = "left",
}: {
  label?: string;
  labelColor?: string;
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) {
  const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={`mb-12 md:mb-16 ${alignStyles[align]}`}>
      {label && (
        <p
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em]"
          style={{ color: labelColor }}
        >
          {label}
        </p>
      )}
      <h2
        className="font-[family-name:var(--font-bebas)] text-[clamp(32px,7vw,64px)] font-normal tracking-wide text-white leading-[1.1]"
      >
        {children}
      </h2>
    </div>
  );
}

/**
 * Role Narrative — Asymmetric editorial layout for roles
 * Use for: Athlete/Trainer/Crew/Business introduction
 * NOT for: 4-card grid, identical role cards
 */
export function RoleNarrative({
  role,
  headline,
  description,
  visual,
  cta,
  reverse = false,
}: {
  role: string;
  headline: string;
  description: string;
  visual: React.ReactNode;
  cta?: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={SPRING_CARD_ENTER}
      className={`grid gap-12 md:gap-16 lg:gap-20 items-center ${
        reverse ? "md:grid-cols-[1fr_1.2fr]" : "md:grid-cols-[1.2fr_1fr]"
      }`}
    >
      <div className={reverse ? "md:order-2" : ""}>
        <div className="mb-6">
          <span className="font-[family-name:var(--font-bebas)] text-5xl md:text-6xl lg:text-7xl tracking-wider text-white/90">
            {role}
          </span>
        </div>
        <h3 className="mb-6 font-[family-name:var(--font-bebas)] text-2xl md:text-3xl tracking-wide text-white">
          {headline}
        </h3>
        <p className="text-[15px] md:text-[16px] leading-[1.9] text-white/60 max-w-xl">
          {description}
        </p>
        {cta && <div className="mt-8">{cta}</div>}
      </div>
      <div className={`${reverse ? "md:order-1" : ""}`}>
        {visual}
      </div>
    </motion.div>
  );
}

/**
 * Activity Story — Focus on human activity, not metrics
 * Use for: Activity feeds, Moments, Real-time updates
 * NOT for: KPI cards, Fake statistics
 */
export function ActivityStory({
  who,
  what,
  where,
  when,
  visual,
  engagement,
}: {
  who: string;
  what: string;
  where: string;
  when: string;
  visual: React.ReactNode;
  engagement?: React.ReactNode;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={SPRING_CARD_ENTER}
      className="relative"
    >
      <div className="mb-6">
        {visual}
      </div>
      <div className="space-y-2">
        <p className="font-[family-name:var(--font-bebas)] text-xl text-white">
          {who}
        </p>
        <p className="text-[15px] text-white/70">
          {what}
        </p>
        <div className="flex items-center gap-4 text-[13px] text-white/40">
          <span>{where}</span>
          <span>·</span>
          <span>{when}</span>
        </div>
      </div>
      {engagement && <div className="mt-4">{engagement}</div>}
    </motion.article>
  );
}


/**
 * Typography Band — Full-width typography as visual element
 * Use for: Brand statements, Section dividers, Editorial transitions
 * `bleed` pushes text to edge for asymmetry; `tone` varies weight/opacity
 */
export function TypographyBand({
  text,
  size = "md",
  align = "center",
  tone = "strong",
  bleed = false,
}: {
  text: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center" | "right";
  tone?: "strong" | "faint" | "accent";
  bleed?: boolean;
}) {
  const sizes = {
    sm: "text-[clamp(24px,5vw,48px)]",
    md: "text-[clamp(32px,7vw,64px)]",
    lg: "text-[clamp(48px,10vw,96px)]",
  };

  const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const toneStyles = {
    strong: "text-white/90",
    faint: "text-white/[0.07]",
    accent: "text-[var(--vc-accent)]",
  };

  return (
    <div className={`${bleed ? "mx-[-5vw] overflow-hidden" : ""} py-10 md:py-16 ${alignStyles[align]}`}>
      <p
        className={`font-[family-name:var(--font-bebas)] font-normal tracking-[0.02em] leading-[0.9] whitespace-nowrap ${sizes[size]} ${toneStyles[tone]}`}
        style={bleed ? { transform: "translateX(-2vw)" } : undefined}
      >
        {text}
      </p>
    </div>
  );
}

/**
 * Vizion Rule — heavy horizontal rule with label, used as section rhythm breaker
 */
export function VizionRule({ label, align = "left" }: { label: string; align?: "left" | "right" | "center" }) {
  return (
    <div className={`flex items-center gap-4 py-6 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
      <span className="h-px flex-1 max-w-[120px] bg-white/10" aria-hidden />
      <span className="font-mono text-[9px] tracking-[0.28em] uppercase text-white/25">{label}</span>
      <span className="h-px flex-1 bg-white/10" aria-hidden />
    </div>
  );
}

/**
 * Place Strip — thin map-like strip with pins, for PLACE as visual hero
 * Pure CSS/SVG, no external image dependency
 */
export function PlaceStrip({ places }: { places: Array<{ name: string; prefecture: string; x: number }> }) {
  return (
    <div className="relative h-[96px] overflow-hidden rounded-xl border border-white/10 bg-[#0a0a12]">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 96" preserveAspectRatio="none" aria-hidden>
        <line x1="0" y1="48" x2="1000" y2="48" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        {places.map((p) => (
          <g key={p.name}>
            <circle cx={p.x} cy={48} r={5} fill="var(--vc-accent)" stroke="white" strokeWidth={1.5} />
            <circle cx={p.x} cy={48} r={10} fill="none" stroke="var(--vc-accent)" strokeWidth={1} opacity={0.25} />
          </g>
        ))}
      </svg>
      <div className="absolute bottom-1.5 left-2 right-2 flex justify-between">
        {places.map((p) => (
          <span key={p.name} className="font-mono text-[8px] tracking-[0.14em] uppercase text-white/30">{p.prefecture}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * Activity Ledger — vertical activity line, for ACTIVITY as hero (not KPI)
 */
export function ActivityLedger({ items }: { items: Array<{ date: string; label: string; place?: string; accent?: boolean }> }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" aria-hidden />
      <div className="space-y-5">
        {items.map((it) => (
          <div key={it.label + it.date} className="relative flex gap-4">
            <span className="absolute -left-[18px] top-[5px] h-2 w-2 rounded-full border border-white/20" style={{ background: it.accent ? "var(--vc-accent)" : "rgba(255,255,255,0.4)" }} aria-hidden />
            <span className="font-mono text-[10px] tracking-wide text-white/25 shrink-0 pt-0.5">{it.date}</span>
            <div>
              <p className="text-[13px] font-bold leading-tight text-white/85">{it.label}</p>
              {it.place && <p className="font-mono text-[10px] tracking-wide text-white/30 mt-0.5">{it.place}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
