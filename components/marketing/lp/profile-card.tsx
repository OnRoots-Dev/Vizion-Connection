"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Trophy, Users, Calendar } from "lucide-react";

interface ProfileCardProps {
  name?: string;
  role?: string;
  location?: string;
  activities?: number;
  cheers?: number;
  connections?: number;
  delay?: number;
}

export function ProfileCard({
  name = "YUKI TANAKA",
  role = "Athlete",
  location = "Yokohama, JP",
  activities = 47,
  cheers = 312,
  connections = 89,
  delay = 0,
}: ProfileCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.25, 1, 0.5, 1] as const }}
      className="w-full max-w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-[#111118]"
    >
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--vc-accent)]/30 bg-[var(--vc-accent)]/10 font-[family-name:var(--font-bebas)] text-lg text-[var(--vc-accent)]">
          YT
        </div>
        <div>
          <p className="text-[12px] font-bold text-white">{name}</p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--vc-accent)]" />
            <span className="text-[9px] uppercase tracking-wider text-[var(--vc-accent)]">{role}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border-t border-white/[0.06]">
        <StatCell icon={Trophy} value={activities} label="Activities" />
        <StatCell icon={Users} value={connections} label="Network" border />
        <StatCell icon={Calendar} value={cheers} label="Cheers" />
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 border-t border-white/[0.06] px-4 py-2">
        <MapPin className="h-3 w-3 text-white/30" />
        <span className="text-[10px] text-white/40">{location}</span>
      </div>
    </motion.div>
  );
}

function StatCell({
  icon: Icon,
  value,
  label,
  border,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  border?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center py-2.5 ${border ? "border-x border-white/[0.06]" : ""}`}>
      <Icon className="mb-0.5 h-3 w-3 text-white/25" />
      <span className="font-[family-name:var(--font-bebas)] text-lg leading-none text-white">{value}</span>
      <span className="mt-0.5 text-[8px] uppercase tracking-wider text-white/30">{label}</span>
    </div>
  );
}
