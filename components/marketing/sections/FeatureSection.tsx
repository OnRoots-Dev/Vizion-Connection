"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─── 60秒でできること ──────────────────────────────────────────────────────────
export function SixtySecondSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const steps = [
    { num: "①", label: "Register", desc: "役割を選び、プロフィールを作成", sub: "Athlete / Trainer / Members / Business から選択" },
    { num: "②", label: "Get Profile URL", desc: "公開プロフィールURLが発行される", sub: "例: vizion.co/u/username" },
    { num: "③", label: "Share Your Card", desc: "プロフィールカードをSNSで共有", sub: "URLを貼るだけでプロフィールカードを共有" },
    { num: "④", label: "Receive Cheer", desc: "応援がCheerとして記録される", sub: "「誰が応援したか」が信頼の履歴に" },
    { num: "⑤", label: "Discovery", desc: "他のユーザーから発見される", sub: "役割・地域・競技で構造的に検索される" },
  ];

  return (
    <section ref={ref} className="bg-[#0B0B0F] border-y border-white/5 px-5 py-20 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-[1200px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-2 font-display text-[11px] uppercase tracking-[0.45em] text-[#FFD600]"
        >
          How It Works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mb-3 font-display text-[clamp(28px,3.5vw,48px)] font-black uppercase tracking-tight text-white"
        >
          60秒で、あなたの役割が証明される。
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-12 max-w-[60ch] font-body text-[clamp(13px,1.3vw,16px)] leading-relaxed text-white/45"
        >
          登録後すぐに<strong className="text-white/80">デジタルプロフィールとカードが発行</strong>されます。
          SNSに共有し、応援や信頼を集めることができます。
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-5">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex flex-col border-b border-white/5 md:border-b-0 md:border-r md:last:border-r-0"
            >
              <div className="px-6 pt-7 pb-3 min-h-[72px] flex items-start">
                <span className="font-display text-[32px] font-black leading-none text-[#FFD600]">{s.num}</span>
              </div>
              <div className="px-6 pb-3 min-h-[40px] flex items-start">
                <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/25">{s.label}</span>
              </div>
              <div className="px-6 pb-3 min-h-[52px] flex items-start">
                <p className="font-body text-[14px] font-bold leading-snug text-white/85">{s.desc}</p>
              </div>
              <div className="px-6 pb-7 min-h-[48px] flex items-start">
                <p className="font-mono text-[10px] leading-relaxed tracking-wide text-white/30">{s.sub}</p>
              </div>
              <div className="h-[2px] w-0 transition-all duration-500 group-hover:w-full" style={{ background: "linear-gradient(90deg, #FFD600, transparent)" }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Profile vs Card 説明 ─────────────────────────────────────────────────────
export function ProfileCardExplainSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-[#0B0B0F] px-5 py-20 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-[1200px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-2 font-display text-[11px] uppercase tracking-[0.45em] text-white/30"
        >
          Your Identity
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mb-10 font-display text-[clamp(28px,3.5vw,48px)] font-black uppercase tracking-tight text-white"
        >
          プロフィールとカード
        </motion.h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="border border-[#FFD600]/25 bg-white/[0.02] p-7 md:p-9"
          >
            <p className="mb-4 font-display text-[11px] uppercase tracking-[0.4em] text-[#FFD600]">Public Profile</p>
            <p className="mb-6 font-display text-[clamp(22px,2.5vw,32px)] font-black uppercase text-white leading-tight">
              あなたの<br />プロフィールページ
            </p>
            <ul className="mb-6 space-y-2 font-body text-[clamp(13px,1.2vw,15px)] text-white/55">
              <li className="flex items-start gap-2"><span className="text-[#FFD600] mt-[2px] shrink-0">—</span>経歴 / SNS / 役割 / Cheer</li>
              <li className="flex items-start gap-2"><span className="text-[#FFD600] mt-[2px] shrink-0">—</span>すべての活動のハブ</li>
              <li className="flex items-start gap-2"><span className="text-[#FFD600] mt-[2px] shrink-0">—</span>あなたの「信頼の歴史」を一覧表示</li>
            </ul>
            <div className="border-t border-white/5 pt-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/20 mb-1">Profile URL</p>
              <p className="font-mono text-[13px] text-[#FFD600]/70 tracking-wider">vizion-connection.jp/u/username</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="border border-[#3282FF]/25 bg-white/[0.02] p-7 md:p-9"
          >
            <p className="mb-4 font-display text-[11px] uppercase tracking-[0.4em] text-[#3282FF]">Profile Card</p>
            <p className="mb-6 font-display text-[clamp(22px,2.5vw,32px)] font-black uppercase text-white leading-tight">
              あなたの<br />プロフィールカード
            </p>
            <ul className="mb-6 space-y-2 font-body text-[clamp(13px,1.2vw,15px)] text-white/55">
              <li className="flex items-start gap-2"><span className="text-[#3282FF] mt-[2px] shrink-0">—</span>役割と信頼を1枚で表示</li>
              <li className="flex items-start gap-2"><span className="text-[#3282FF] mt-[2px] shrink-0">—</span>URLを貼るだけでプロフィールカードを共有</li>
              <li className="flex items-start gap-2"><span className="text-[#3282FF] mt-[2px] shrink-0">—</span>Cheer導線（応援の入口）</li>
            </ul>
            <div className="border-t border-white/5 pt-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/20 mb-1">Card URL</p>
              <p className="font-mono text-[13px] text-[#3282FF]/70 tracking-wider">vizion-connection.jp/card/username</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Cheer & Discovery ────────────────────────────────────────────────────────
export function CheerDiscoverySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-[#0B0B0F] border-t border-white/5 px-5 py-20 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 gap-px bg-white/5 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="bg-[#0B0B0F] p-8 md:p-12"
        >
          <p className="mb-2 font-display text-[11px] uppercase tracking-[0.45em] text-[#FFD600]">Cheer</p>
          <h3 className="mb-4 font-display text-[clamp(24px,3vw,40px)] font-black uppercase tracking-tight text-white leading-none">
            ただの<br />「いいね」ではない。
          </h3>
          <p className="mb-6 font-body text-[clamp(13px,1.2vw,15px)] leading-relaxed text-white/55">
            Cheerは「誰が誰を応援したか」が記録される<strong className="text-white/80">信頼の履歴</strong>です。
          </p>
          <ul className="space-y-3">
            {["誰が応援したか、いつ応援したかを記録", "連打・不正操作は構造的に制限", "信頼スコアの根拠データとして蓄積"].map((item, i) => (
              <li key={i} className="flex items-start gap-3 font-body text-[clamp(12px,1.1vw,14px)] text-white/45">
                <span className="mt-[3px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#FFD600]" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="bg-[#0B0B0F] p-8 md:p-12"
        >
          <p className="mb-2 font-display text-[11px] uppercase tracking-[0.45em] text-[#3282FF]">Discovery</p>
          <h3 className="mb-4 font-display text-[clamp(24px,3vw,40px)] font-black uppercase tracking-tight text-white leading-none">
            偶然ではなく<br />構造的な出会い。
          </h3>
          <p className="mb-6 font-body text-[clamp(13px,1.2vw,15px)] leading-relaxed text-white/55">
            Discoveryでは以下の軸で<strong className="text-white/80">ユーザーを検索・一覧表示</strong>できます。
          </p>
          <ul className="space-y-3">
            {["役割（Athlete / Trainer / Members / Business）", "競技 / 専門分野", "地域", "Cheer数（信頼の可視化）", "Founding Member 認証"].map((item, i) => (
              <li key={i} className="flex items-start gap-3 font-body text-[clamp(12px,1.1vw,14px)] text-white/45">
                <span className="mt-[3px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#3282FF]" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
