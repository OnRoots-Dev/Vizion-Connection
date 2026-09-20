"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Zap, Dumbbell, HeartHandshake, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TextScramble } from "./text-scramble";

interface RoleAction {
  icon: LucideIcon;
  number: string;
  label: string;
  labelJa: string;
  color: string;
  headline: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

const ROLES: RoleAction[] = [
  {
    icon: Zap,
    number: "01",
    label: "ATHLETE",
    labelJa: "アスリート",
    color: "var(--vc-athlete)",
    headline: "積み重ねを、存在感に。",
    description: "練習・試合・成果を記録し、歩みそのものをプロフィールへ。",
    ctaLabel: "アスリートとして始める",
    ctaHref: "/register",
  },
  {
    icon: Dumbbell,
    number: "02",
    label: "TRAINER",
    labelJa: "トレーナー",
    color: "var(--vc-trainer)",
    headline: "育てた選手が、実績になる。",
    description: "指導、セッション、選手との歩みを可視化して、次の出会いへ。",
    ctaLabel: "トレーナーとして始める",
    ctaHref: "/register",
  },
  {
    icon: HeartHandshake,
    number: "03",
    label: "CREW",
    labelJa: "クルー（応援する人）",
    color: "var(--vc-crew)",
    headline: "推しの歩みを、そばで後押し。",
    description: "観る、参加する、応援する。その一つひとつが選手との接点になる。",
    ctaLabel: "クルーとして始める",
    ctaHref: "/register",
  },
  {
    icon: Building2,
    number: "04",
    label: "BUSINESS",
    labelJa: "企業・スポンサー",
    color: "var(--vc-business)",
    headline: "ノイズではなく、シグナルへ支援を。",
    description: "地域の活動、人、熱量を見つけ、自社の関わり方をつくる。",
    ctaLabel: "Businessプランを見る",
    ctaHref: "/business",
  },
];

export function RoleInActionSection() {
  const reduce = useReducedMotion();

  return (
    <section id="roles" className="relative overflow-hidden py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
            className="self-start lg:sticky lg:top-28"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--vc-accent)]">
              <TextScramble text="CHOOSE YOUR PLACE" delay={100} duration={350} />
            </p>
            <h2 className="mt-5 max-w-xl text-balance font-[family-name:var(--font-bebas)] text-5xl font-normal leading-[0.92] tracking-wide text-white md:text-7xl">
              あなたは、<br />どこから<br />この世界に入る？
            </h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-white/60 md:text-base">
              スポーツをする人。育てる人。応援する人。関わる企業。
              入口は違っても、同じ場所で活動とつながりが続いていく。
            </p>
          </motion.div>

          <div className="border-t border-white/10">
            {ROLES.map((role, i) => {
              const Icon = role.icon;
              return (
                <motion.article
                  key={role.label}
                  initial={reduce ? undefined : { opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
                  className="group relative border-b border-white/10"
                >
                  <Link
                    href={role.ctaHref}
                    className="relative flex min-h-[150px] items-center gap-5 py-7 outline-none transition-colors duration-300 focus-visible:bg-white/[0.03] md:min-h-[170px] md:gap-8 md:py-8"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100"
                      style={{ background: role.color }}
                    />

                    <span className="w-10 shrink-0 font-mono text-[11px] tracking-[0.2em] text-white/30 md:w-12">
                      {role.number}
                    </span>

                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 transition-colors duration-300 group-hover:border-white/20"
                      style={{ color: role.color }}
                      aria-hidden
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.7} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span
                          className="font-[family-name:var(--font-bebas)] text-xl tracking-[0.08em] transition-colors duration-300 md:text-2xl"
                          style={{ color: role.color }}
                        >
                          {role.label}
                        </span>
                        <span className="text-xs font-bold text-white/70">{role.labelJa}</span>
                      </span>
                      <span className="mt-1 block font-[family-name:var(--font-bebas)] text-2xl leading-tight tracking-wide text-white md:text-3xl">
                        {role.headline}
                      </span>
                      <span className="mt-2 block max-w-xl text-[13px] leading-6 text-white/50 transition-colors duration-300 group-hover:text-white/70 md:text-sm">
                        {role.description}
                      </span>
                    </span>

                    <span className="hidden shrink-0 items-center gap-2 text-xs font-bold text-white/40 transition-colors duration-300 group-hover:text-white md:flex">
                      <span>{role.ctaLabel}</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
