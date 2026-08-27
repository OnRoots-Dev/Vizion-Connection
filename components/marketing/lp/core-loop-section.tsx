"use client";

// components/marketing/lp/core-loop-section.tsx
// Core Loop（Activity → Place → Moment → Cheer/Connection → Viz Map）を図解する。
// 「何をすればいいか」がUIから伝わること自体がLPの目的。

import { motion, useReducedMotion } from "framer-motion";
import { Activity, MapPin, Camera, Heart, Map } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TextScramble } from "./text-scramble";

const STEPS: { icon: LucideIcon; title: string; ja: string; desc: string }[] = [
  { icon: Activity, title: "Activity", ja: "記録", desc: "練習・試合・イベントを場所と一緒に記録" },
  { icon: MapPin, title: "Place", ja: "場所", desc: "活動の舞台が地図に座標を持つ" },
  { icon: Camera, title: "Moment", ja: "公開", desc: "成果の瞬間を写真と共に公開" },
  { icon: Heart, title: "Cheer / Connection", ja: "反応・つながり", desc: "応援とコメントが届き、人が繋がる" },
  { icon: Map, title: "Viz Map", ja: "発見", desc: "マップから新しい人・場所・活動に出会う" },
];

export function CoreLoopSection() {
  const reduce = useReducedMotion();

  return (
    <section id="loop" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-lime">
            <TextScramble text="THE CORE LOOP" delay={150} duration={400} />
          </p>
          <h2 className="mt-3 text-balance font-[family-name:var(--font-bebas)] text-3xl font-normal tracking-wide text-white md:text-4xl">
            ひとつの行動が、循環しはじめる。
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-[1.9] text-white/60">
            記録した活動は場所を持ち、Momentとして公開され、応援とつながりを生み、マップで再発見される。
            このループそのものが、Vizion Connectionの使い方です。
          </p>
        </motion.div>

        <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.title}
                initial={reduce ? undefined : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]"
              >
                <span aria-hidden className="absolute right-3 top-3 font-mono text-[10px] text-white/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-lime/30 bg-lime/[0.06]">
                  <Icon className="h-5 w-5 text-lime" strokeWidth={1.8} />
                </span>
                <p className="m-0 font-[family-name:var(--font-bebas)] text-lg tracking-wider text-white">{step.title}</p>
                <p className="m-0 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">{step.ja}</p>
                <p className="m-0 text-[12.5px] leading-relaxed text-white/60">{step.desc}</p>
              </motion.li>
            );
          })}
        </ol>

        <motion.p
          initial={reduce ? undefined : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center font-mono text-[11px] tracking-[0.14em] text-white/35"
        >
          LOOP → ACTIVITY → PLACE → MOMENT → CHEER → MAP → …
        </motion.p>
      </div>
    </section>
  );
}
