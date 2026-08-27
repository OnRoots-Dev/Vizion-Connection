"use client";

// components/marketing/lp/roles-section.tsx — 4ロール（MVP正: Athlete/Trainer/Crew/Business）
// framer-motion whileInView・reduced-motion対応・GSAP不使用。

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Zap, Dumbbell, HeartHandshake, Building2, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface RoleCard {
  icon: LucideIcon;
  label: string;
  labelJa: string;
  colorVar: string;
  headline: string;
  desc: string;
}

const ROLES: RoleCard[] = [
  {
    icon: Zap,
    label: "Athlete",
    labelJa: "アスリート",
    colorVar: "var(--vc-athlete)",
    headline: "積み重ねを、存在感に。",
    desc: "練習・試合・成果を記録すれば、それ自体があなたのプロフィールになる。",
  },
  {
    icon: Dumbbell,
    label: "Trainer",
    labelJa: "トレーナー",
    colorVar: "var(--vc-trainer)",
    headline: "育てた選手が、実績になる。",
    desc: "活動と成果が可視化されるから、あなたの指導も発見されやすい。",
  },
  {
    icon: HeartHandshake,
    label: "Crew",
    labelJa: "クルー（応援する人）",
    colorVar: "var(--vc-crew)",
    headline: "推しの歩みを、そばで後押し。",
    desc: "Cheerとコメントが選手に届く。応援が記録に残る新しい応援のかたち。",
  },
  {
    icon: Building2,
    label: "Business",
    labelJa: "企業・スポンサー",
    colorVar: "var(--vc-business)",
    headline: "ノイズではなく、シグナルへ支援を。",
    desc: "地域の活動が見える。熱量あるコミュニティに、直接リーチできる。",
  },
];

export function RolesSection() {
  const reduce = useReducedMotion();

  return (
    <section id="roles" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 md:scroll-mt-28 md:py-28">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-lime">4 Roles</p>
        <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-white md:text-4xl">
          あなたは、どの役割？
        </h2>
      </motion.div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {ROLES.map((role, i) => {
          const Icon = role.icon;
          return (
            <motion.article
              key={role.label}
              initial={reduce ? undefined : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20"
            >
              {/* 役割色の縦アクセント */}
              <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: role.colorVar }} />
              <div className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl border"
                  style={{ borderColor: `${role.colorVar}55`, background: `${role.colorVar}14` }}
                >
                  <Icon className="h-5 w-5" style={{ color: role.colorVar }} strokeWidth={1.9} />
                </span>
                <div>
                  <p className="m-0 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: role.colorVar }}>
                    {role.label}
                  </p>
                  <p className="m-0 text-sm font-bold text-white">{role.labelJa}</p>
                </div>
              </div>
              <h3 className="mt-4 font-display text-xl tracking-wide text-white">{role.headline}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/55">{role.desc}</p>

              {role.label === "Business" ? (
                <Link
                  href="/business"
                  className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-lime transition-transform group-hover:translate-x-0.5"
                >
                  プランを見る
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-white/70 transition-all hover:text-lime"
                >
                  無料で始める
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
