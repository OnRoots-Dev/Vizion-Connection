"use client";

// @deprecated — Replaced by RoleInActionSection (VIZION NATIVE, 4 entrances with distinct worlds).
// This file kept for reference but is classified as C (AI-template-like). Do not use for new pages. See design-system/COMPONENT_AUDIT.md

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EditorialSection, EditorialHeading, TypographyBand } from "@/lib/design/editorial";

const ROLES = [
  {
    label: "ATHLETE",
    displayName: "アスリート",
    color: "#FF5050",
    headline: "積み重ねを、存在感に。",
    description: "競技に取り組むすべての選手。日々の継続が記録になり、信頼として積み上がる。挑戦が応援と機会につながる。",
  },
  {
    label: "TRAINER",
    displayName: "トレーナー",
    color: "#30de1d",
    headline: "育てた選手が、実績になる。",
    description: "スポーツの指導・サポートをしている専門家。専門性とサポート実績を可視化し、選手・チームとの信頼を育てられる。",
  },
  {
    label: "CREW",
    displayName: "クルー",
    color: "#FFC81E",
    headline: "推しの歩みを、そばで後押し。",
    description: "ファン、家族、友人など、挑戦を支えるすべての人。応援が記録として残り、アスリートの継続を支える力になる。",
  },
  {
    label: "BUSINESS",
    displayName: "ビジネス",
    color: "#3C8CFF",
    headline: "ノイズではなく、シグナルへ支援を。",
    description: "スポーツ界での注目・広告・エリア応援を検討する企業・団体。継続データに基づいて、本物の挑戦者と直接つながれる。",
  },
];

export function RoleBenefitSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <EditorialSection background="surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <EditorialHeading label="ROLES">
          あなたは、どの役割？
        </EditorialHeading>
      </motion.div>

      {/* Typography band as visual anchor */}
      <TypographyBand
        text="4つの入口が、ひとつの場所でつながる。"
        size="md"
        align="center"
      />

      {/* Editorial role narratives - not cards */}
      <div className="mt-20 md:mt-24 space-y-20 md:space-y-28">
        {ROLES.map((role, i) => (
          <motion.div
            key={role.label}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="border-t border-white/10 pt-16 md:pt-20 first:border-t-0"
          >
            <div className="grid gap-8 md:gap-12 lg:grid-cols-[1fr_1.2fr] items-center">
              {/* Role typography as visual element */}
              <div className="order-2 lg:order-1">
                <p className="font-[family-name:var(--font-bebas)] text-[clamp(48px,10vw,96px)] font-normal tracking-wide leading-[1] mb-6" style={{ color: role.color }}>
                  {role.label}
                </p>
                <h3 className="font-[family-name:var(--font-bebas)] text-[clamp(24px,4vw,36px)] font-normal tracking-wide text-white mb-6">
                  {role.headline}
                </h3>
                <p className="text-[15px] md:text-[16px] leading-[1.9] text-white/60 max-w-xl">
                  {role.description}
                </p>
                <Link
                  href={role.label === "BUSINESS" ? "/business" : `/register?role=${role.label}`}
                  className="inline-flex items-center gap-2 mt-8 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:text-white"
                  style={{ color: role.color }}
                >
                  {role.displayName}として始める
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
                    <path d="M13.22 19.03a.75.75 0 010-1.06L18.19 13H3.75a.75.75 0 010-1.5h14.44l-4.97-4.97a.75.75 0 011.06-1.06l6.25 6.25a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 01-1.06 0z" />
                  </svg>
                </Link>
              </div>
              {/* Empty space for future visual/image */}
              <div className="order-1 lg:order-2 h-48 md:h-64 lg:h-80 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/20">
                  {role.label} Visual
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </EditorialSection>
  );
}
