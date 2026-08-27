"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Zap, Dumbbell, HeartHandshake, Building2, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TextScramble } from "./text-scramble";

interface RoleAction {
  icon: LucideIcon;
  label: string;
  labelJa: string;
  color: string;
  headline: string;
  activityType: string;
  activityLabel: string;
  metrics: { label: string; value: string }[];
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

const ROLES: RoleAction[] = [
  {
    icon: Zap,
    label: "ATHLETE",
    labelJa: "アスリート",
    color: "var(--vc-athlete)",
    headline: "積み重ねを、存在感に。",
    activityType: "RUNNING",
    activityLabel: "YOKOHAMA HALF",
    metrics: [
      { label: "DISTANCE", value: "21.1km" },
      { label: "TIME", value: "1:42:15" },
      { label: "PACE", value: "4:51/km" },
    ],
    description: "練習・試合・成果を記録すれば、それ自体があなたのプロフィールになる。",
    ctaLabel: "無料で始める",
    ctaHref: "/register",
  },
  {
    icon: Dumbbell,
    label: "TRAINER",
    labelJa: "トレーナー",
    color: "var(--vc-trainer)",
    headline: "育てた選手が、実績になる。",
    activityType: "TRAINING SESSION",
    activityLabel: "YOUTH ACADEMY",
    metrics: [
      { label: "ATHLETES", value: "6" },
      { label: "SESSIONS", value: "24" },
      { label: "RESULTS", value: "89%" },
    ],
    description: "活動と成果が可視化されるから、あなたの指導も発見されやすい。",
    ctaLabel: "無料で始める",
    ctaHref: "/register",
  },
  {
    icon: HeartHandshake,
    label: "CREW",
    labelJa: "クルー（応援する人）",
    color: "var(--vc-crew)",
    headline: "推しの歩みを、そばで後押し。",
    activityType: "FEED",
    activityLabel: "FOLLOWING 12",
    metrics: [
      { label: "CHEERS", value: "156" },
      { label: "FOLLOWS", value: "24" },
      { label: "COMMENTS", value: "87" },
    ],
    description: "Cheerとコメントが選手に届く。応援が記録に残る新しい応援のかたち。",
    ctaLabel: "無料で始める",
    ctaHref: "/register",
  },
  {
    icon: Building2,
    label: "BUSINESS",
    labelJa: "企業・スポンサー",
    color: "var(--vc-business)",
    headline: "ノイズではなく、シグナルへ支援を。",
    activityType: "CAMPAIGN",
    activityLabel: "YOKOHAMA AREA",
    metrics: [
      { label: "REACH", value: "2.4K" },
      { label: "PARTNERS", value: "18" },
      { label: "EVENTS", value: "6" },
    ],
    description: "地域の活動が見える。熱量あるコミュニティに、直接リーチできる。",
    ctaLabel: "プランを見る",
    ctaHref: "/business",
  },
];

export function RoleInActionSection() {
  const reduce = useReducedMotion();

  return (
    <section id="roles" className="relative overflow-hidden py-20 md:py-28">
      <div className="relative mx-auto max-w-6xl px-4">
        {/* Section header */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--vc-accent)]">
            <TextScramble text="4 ROLES" delay={100} duration={350} />
          </p>
          <h2 className="mt-3 text-balance font-[family-name:var(--font-bebas)] text-4xl font-normal tracking-wide text-white md:text-5xl">
            あなたは、どの役割？
          </h2>
        </motion.div>

        {/* Role cards grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {ROLES.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.article
                key={role.label}
                initial={reduce ? undefined : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 1, 0.5, 1] as const }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)]"
              >
                {/* Role color accent */}
                <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: role.color }} />

                <div className="p-5">
                  {/* Role header */}
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-xl border"
                      style={{ borderColor: `${role.color}40`, background: `${role.color}12` }}
                    >
                      <Icon className="h-4.5 w-4.5" style={{ color: role.color }} strokeWidth={1.9} />
                    </span>
                    <div>
                      <p className="font-[family-name:var(--font-bebas)] text-sm tracking-wider" style={{ color: role.color }}>
                        {role.label}
                      </p>
                      <p className="text-[11px] font-bold text-white/80">{role.labelJa}</p>
                    </div>
                  </div>

                  <h3 className="mt-3 font-[family-name:var(--font-bebas)] text-xl tracking-wide text-white">
                    {role.headline}
                  </h3>

                  {/* Mini Product UI */}
                  <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-wider text-white/40">{role.activityType}</span>
                      <span className="text-[8px] text-white/25">{role.activityLabel}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {role.metrics.map((m) => (
                        <div key={m.label} className="text-center">
                          <p className="font-[family-name:var(--font-bebas)] text-base leading-none text-white">{m.value}</p>
                          <p className="mt-0.5 text-[7px] uppercase tracking-wider text-white/30">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="mt-3 text-[12px] leading-relaxed text-white/55">{role.description}</p>

                  <Link
                    href={role.ctaHref}
                    className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold transition-all group-hover:gap-2"
                    style={{ color: role.color }}
                  >
                    {role.ctaLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
