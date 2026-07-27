"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Flame, Dumbbell, Heart, Building2 } from "lucide-react";

const roles = [
  {
    label: "Athlete",
    displayName: "アスリート",
    color: "#FF5050",
    Icon: Flame,
    desc: "競技に取り組むすべての選手。競技歴・レベル・プロアマ問わず。",
    benefit: "日々の継続が記録になり、信頼として積み上がる。挑戦が応援と機会につながる。",
  },
  {
    label: "Trainer",
    displayName: "トレーナー",
    color: "#30de1d",
    Icon: Dumbbell,
    desc: "スポーツの指導・サポートをしている専門家。",
    benefit: "専門性とサポート実績を可視化し、選手・チームとの信頼を育てられる。",
  },
  {
    label: "Crew",
    displayName: "サポーター",
    color: "#FFC81E",
    Icon: Heart,
    desc: "ファン、家族、友人など、挑戦を支えるすべての人。",
    benefit: "応援が記録として残り、アスリートの継続を支える力になる。",
  },
  {
    label: "Business",
    displayName: "ビジネス",
    color: "#3C8CFF",
    Icon: Building2,
    desc: "スポーツ界での注目・広告・エリア応援を検討する企業・団体。",
    benefit: "継続データに基づいて、本物の挑戦者と直接つながれる。",
  },
];

export function RoleBenefitSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="border-y border-white/5 bg-[#0B0B0F] px-5 py-16 md:px-10 md:py-24 lg:px-16">
      <div className="mx-auto max-w-[1200px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-3 font-display text-[11px] uppercase tracking-[0.45em]"
          style={{ color: "var(--electric)" }}
        >
          Roles
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mb-10 font-display text-[clamp(26px,6vw,44px)] font-black tracking-tight text-white"
        >
          4つの役割が、ひとつの場所でつながる。
        </motion.h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, i) => (
            <motion.div
              key={role.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                y: -6,
                boxShadow: "0 0 36px var(--electric-glow)",
                borderColor: "rgba(0,194,255,0.5)",
              }}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors"
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: `${role.color}18`, border: `1px solid ${role.color}40` }}
              >
                <role.Icon size={20} style={{ color: role.color }} />
              </div>
              <p className="font-display text-[11px] font-black uppercase tracking-[0.24em]" style={{ color: role.color }}>
                {role.label}
              </p>
              <h3 className="mt-1 font-display text-[20px] font-black text-white">{role.displayName}</h3>
              <p className="mt-3 font-body text-[13px] leading-relaxed text-white/45">{role.desc}</p>
              <p className="mt-4 border-t border-white/8 pt-4 font-body text-[13px] font-medium leading-relaxed text-white/70">
                {role.benefit}
              </p>
              <Link
                href={`/register?role=${role.label}`}
                className="mt-5 inline-flex items-center gap-1.5 font-display text-[12px] font-bold tracking-[0.14em] transition-opacity hover:opacity-75"
                style={{ color: "var(--electric)" }}
              >
                {role.displayName}として始める
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
                  <path d="M13.22 19.03a.75.75 0 010-1.06L18.19 13H3.75a.75.75 0 010-1.5h14.44l-4.97-4.97a.75.75 0 011.06-1.06l6.25 6.25a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 01-1.06 0z" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
