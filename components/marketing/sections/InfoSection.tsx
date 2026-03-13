"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { WHO_FOR_TABS } from "../constants";

// ─── Problem Section ──────────────────────────────────────────────────────────
export function ProblemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#0B0B0F] border-y border-white/5 px-5 py-24 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-[1200px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-3 font-display text-[11px] uppercase tracking-[0.45em] text-[#FFD600]"
        >
          Problem
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="mb-12 font-display text-[clamp(32px,5vw,64px)] font-black leading-tight tracking-tight text-white"
        >
          スポーツの世界には<br />
          <span className="text-[#FFD600]">まだ見えない価値</span>が多すぎる
        </motion.h2>

        <div className="grid grid-cols-1 gap-px bg-white/5 md:grid-cols-4">
          {[
            { label: "Athlete", title: "アスリートの努力", color: "#FF4646" },
            { label: "Trainer", title: "トレーナーの知識", color: "#28D26E" },
            { label: "Members", title: "支援する人の想い", color: "#FFD600" },
            { label: "Business", title: "未来を拓く挑戦", color: "#4A9EFF" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.7 }}
              className="bg-[#0B0B0F] p-8 md:p-10"
            >
              <div className="mb-4 h-[2px] w-8" style={{ background: item.color }} />
              <p className="mb-2 font-display text-[10px] uppercase tracking-[0.4em]" style={{ color: item.color }}>{item.label}</p>
              <p className="font-display text-[clamp(20px,2.5vw,30px)] font-black text-white">{item.title}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="mt-12 max-w-[70ch] space-y-4 font-body text-[clamp(14px,1.5vw,18px)] leading-relaxed text-white/60"
        >
          <p>しかしそれらは、十分に<span className="text-white/90 font-bold">可視化されていません</span>。</p>
          <p>Vizion Connectionは、スポーツに関わる人の<span className="text-[#FFD600]">「役割」と「信頼」を可視化</span>します。</p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── What is Vizion Connection ────────────────────────────────────────────────
export function WhatIsVizionSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[#f2f0eb] px-5 py-28 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="mb-3 font-display text-[11px] uppercase tracking-[0.45em] text-black/35"
            >
              What is
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="font-display text-[clamp(32px,4.5vw,60px)] font-black leading-tight tracking-tight text-[#0B0B0F]"
            >
              Vizion<br />Connection
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              className="mt-4 h-[3px] w-16 origin-left bg-[#FFD600]"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="space-y-6 font-body text-[clamp(14px,1.5vw,17px)] leading-relaxed text-black/65"
          >
            <p>Vizion Connectionは、スポーツに関わる人の<strong className="text-[#0B0B0F]">役割と信頼を可視化</strong>し、<br />
              新しいつながりを生み出すプラットフォームです。</p>
            <div className="border-l-2 border-[#FFD600] pl-5 space-y-2">
              <p className="font-display text-[11px] uppercase tracking-[0.3em] text-black/40">「Vizion」は</p>
              <p><span className="font-bold text-[#0B0B0F]">Vision</span>（未来）</p>
              <p><span className="font-bold text-[#0B0B0F]">Visibility</span>（可視化）</p>
              <p className="text-black/45 text-[13px]">という意味を重ねています。</p>
            </div>
            <p>見えることで信頼が生まれる—<br />信頼があることで次の挑戦が生まれる。</p>
            <p className="font-bold text-[#0B0B0F]">その連鎖を作る場所です。</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Who is this for ──────────────────────────────────────────────────────────
export function WhoIsThisForSection() {
  const [activeTab, setActiveTab] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const tab = WHO_FOR_TABS[activeTab];

  return (
    <section ref={ref} className="bg-[#0B0B0F] border-t border-white/5 px-5 py-24 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-[1200px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-2 font-display text-[11px] uppercase tracking-[0.45em] text-white/30"
        >
          Who is this for
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="mb-10 font-display text-[clamp(28px,3.5vw,48px)] font-black uppercase tracking-tight text-white"
        >
          あなたはどのロールですか？
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {WHO_FOR_TABS.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(i)}
              className="relative overflow-hidden rounded-[3px] border px-4 py-3 font-display text-[11px] uppercase tracking-[0.25em] transition-all duration-200"
              style={{
                borderColor: activeTab === i ? t.color : "rgba(255,255,255,0.08)",
                color: activeTab === i ? t.color : "rgba(255,255,255,0.35)",
                background: activeTab === i ? `${t.color}12` : "rgba(255,255,255,0.02)",
                boxShadow: activeTab === i ? `0 0 16px ${t.color}25` : "none",
              }}
            >
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
              {activeTab === i && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 h-[2px] w-full"
                  style={{ background: t.color }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[4px] border p-8 md:p-12"
            style={{
              borderColor: `${tab.color}30`,
              background: `linear-gradient(135deg, ${tab.color}08 0%, transparent 60%)`,
            }}
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <p className="mb-1 font-display text-[10px] uppercase tracking-[0.4em]" style={{ color: tab.color }}>{tab.label}</p>
                <h3 className="mb-4 font-display text-[clamp(24px,3vw,38px)] font-black text-white leading-tight">{tab.subtitle}</h3>
                <p className="font-body text-[clamp(13px,1.3vw,16px)] leading-relaxed text-white/60">{tab.desc}</p>
                <p className="mt-4 font-body text-[clamp(13px,1.2vw,15px)] text-white/40 italic">{tab.body}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="mb-3 font-display text-[9px] uppercase tracking-[0.4em] text-white/25">関連キーワード</p>
                <div className="flex flex-wrap gap-2">
                  {tab.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[2px] border px-3 py-1.5 font-mono text-[11px] tracking-wider"
                      style={{ borderColor: `${tab.color}40`, color: `${tab.color}cc` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
export function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    {
      step: "Step 1",
      title: "プロフィールを作成",
      desc: "役割（Athlete / Trainer / Members / Business）を選択し、あなたのプロフィールを60秒で作成します。",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
      ),
    },
    {
      step: "Step 2",
      title: "プロフィールカードを共有",
      desc: "専用URLが発行されます。SNSに貼るだけで、OGカードとして自動表示。あなたの役割が一目で伝わります。",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" /></svg>
      ),
    },
    {
      step: "Step 3",
      title: "つながりが生まれる",
      desc: "Cheerで応援が積み上がり、Discoveryで発見されます。役割と信頼が可視化され、新しいつながりへの扉が開きます。",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
      ),
    },
  ];

  return (
    <section ref={ref} className="bg-[#0D0D12] border-y border-white/5 px-5 py-24 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-[1200px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-2 font-display text-[11px] uppercase tracking-[0.45em] text-[#FFD600]"
        >
          How it works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="mb-14 font-display text-[clamp(28px,3.5vw,48px)] font-black uppercase tracking-tight text-white"
        >
          3ステップで始まる
        </motion.h2>

        <div className="grid grid-cols-1 gap-px bg-white/5 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.7 }}
              className="group bg-[#0D0D12] p-8 md:p-10"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#FFD600]/30 text-[#FFD600] group-hover:border-[#FFD600]/60 transition-colors">
                  {s.icon}
                </div>
                <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/25">{s.step}</p>
              </div>
              <h3 className="mb-3 font-display text-[clamp(20px,2vw,26px)] font-black text-white">{s.title}</h3>
              <p className="font-body text-[clamp(12px,1.2vw,14px)] leading-relaxed text-white/45">{s.desc}</p>
              <div className="mt-6 h-[1px] w-0 bg-[#FFD600]/40 transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
