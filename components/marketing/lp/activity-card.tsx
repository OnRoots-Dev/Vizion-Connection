"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, MapPin, Heart, MessageCircle, Clock } from "lucide-react";

interface ActivityCardProps {
  athlete?: string;
  sport?: string;
  location?: string;
  activity?: string;
  schedule?: string;
  connections?: string;
  cheers?: number;
  comments?: number;
  delay?: number;
}

export function ActivityCard({
  athlete = "YUKI TANAKA",
  sport = "TRAINING",
  location = "YOKOHAMA",
  activity = "12",
  schedule = "3",
  connections = "9",
  cheers = 24,
  comments = 12,
  delay = 0,
}: ActivityCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 24, rotateX: 4 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 1, 0.5, 1] as const }}
      className="relative w-full max-w-[380px] overflow-hidden rounded-2xl border border-white/10 bg-[#111118]"
      style={{ perspective: 800 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--vc-accent)]/15">
            <Activity className="h-4 w-4 text-[var(--vc-accent)]" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/90">{athlete}</p>
            <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--vc-accent)]">{sport}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/40">
          <MapPin className="h-3 w-3" />
          {location}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 border-b border-white/[0.06]">
        <MetricCell label="ACTIVITY" value={activity} unit="" />
        <MetricCell label="SCHEDULE" value={schedule} unit="" border />
        <MetricCell label="CONN." value={connections} unit="" />
      </div>

      {/* Mini Map Placeholder */}
      <div className="relative h-[140px] overflow-hidden bg-[#0a0a12]">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        {/* Route line */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 380 140" fill="none">
          <path
            d="M 40 110 Q 80 90 120 70 T 200 50 T 280 35 T 340 25"
            stroke="var(--vc-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="6 3"
            opacity="0.7"
          />
          <circle cx="40" cy="110" r="4" fill="var(--vc-accent)" opacity="0.9" />
          <circle cx="340" cy="25" r="5" fill="var(--vc-accent)" opacity="0.9" />
        </svg>
        <div className="absolute bottom-2 left-3 rounded bg-black/60 px-2 py-0.5 font-mono text-[8px] text-white/50 backdrop-blur-sm">
          35°27′N 139°38′E
        </div>
      </div>

      {/* Engagement */}
      <div className="flex items-center gap-4 border-t border-white/[0.06] px-5 py-3">
        <span className="flex items-center gap-1.5 text-[11px] text-white/60">
          <Heart className="h-3.5 w-3.5 text-[var(--vc-accent)]" fill="var(--vc-accent)" />
          <span className="font-bold text-white/80">{cheers}</span> Cheers
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-white/60">
          <MessageCircle className="h-3.5 w-3.5 text-white/40" />
          <span className="font-bold text-white/80">{comments}</span> Comments
        </span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-white/30">
          <Clock className="h-3 w-3" /> 2h ago
        </span>
      </div>
    </motion.div>
  );
}

function MetricCell({ label, value, unit, border }: { label: string; value: string; unit: string; border?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center py-3.5 ${border ? "border-x border-white/[0.06]" : ""}`}>
      <span className="text-[9px] uppercase tracking-[0.15em] text-white/35">{label}</span>
      <span className="mt-0.5 font-[family-name:var(--font-bebas)] text-2xl leading-none tracking-wide text-white">
        {value}
        {unit && <span className="ml-0.5 text-xs text-white/40">{unit}</span>}
      </span>
    </div>
  );
}
