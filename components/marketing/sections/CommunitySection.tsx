"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { RevealLine, FeatureCard } from "../AnimatedComponents";

export function NowNextSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-white py-20 text-[#0B0B0F]">
      <div className="mx-auto w-full max-w-[1200px] px-6 sm:px-10 lg:px-16">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="font-display text-[clamp(32px,4.4vw,56px)] font-black tracking-tight"
        >
          今は、ここから始める。
        </motion.h2>

        <p className="mt-4 max-w-[75ch] text-[clamp(14px,1.5vw,18px)] leading-relaxed text-black/70">
          登録したその日から、役割を名乗り、見つけ合い、信頼を積み上げられます。
          待機ではなく、すでに使える場所としてアップデートを続けています。
        </p>

        <div className="mt-10 flex flex-col gap-6">
          <div className="rounded-3xl border border-black/10 bg-white p-7">
            <p className="text-xs font-bold tracking-[0.35em] text-black/50">NOW</p>
            <p className="mt-3 text-lg font-bold">現在利用できる機能</p>
            <ul className="mt-4 space-y-2 text-black/75">
              <li>・プロフィール作成・公開</li>
              <li>・プロフィールカード発行・共有</li>
              <li>・Discovery（アスリート検索・一覧）</li>
              <li>・ランキングページ</li>
              <li>・collectカード機能</li>
              <li>・Voice Lab</li>
              <li>・Cheerによる応援・信頼の可視化</li>
              <li>・ミッション・ポイントシステム</li>
              <li>・Business Hub（企業向け広告・効果測定）</li>
            </ul>
            <div className="flex items-center justify-between">
              <p className="mt-3 text-lg font-bold">Founding Memberで得られること</p>
              <span className="rounded-full bg-[#FFD600] px-3 py-1 text-[10px] font-bold">先着100名限定</span>
            </div>
            <ul className="mt-4 space-y-3 font-medium text-black/75">
              {[
                { title: "Founding Member認定バッジ", desc: "プロフィールと公開カードに通し番号つきで永続表示。" },
                { title: "Founder価格保証", desc: "将来の有料プランも登録時点の価格で永久固定。" },
                { title: "Discovery永続優先表示", desc: "検索・一覧で長期的な優位性を確保。" },
                { title: "新機能への最優先アクセス", desc: "Trainer Hub / Members Hubなどの新機能を最初に利用可能。" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#FFD600]">✔</span>
                  <span><b>{item.title}</b>：{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-7">
            <p className="text-xs font-bold tracking-[0.35em] text-black/50">NEXT</p>
            <p className="mt-3 text-lg font-bold">この先、解放していくこと</p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-10 flex justify-center"
            >
              <Link
                href="/roadmap"
                className="group inline-flex items-center gap-2 border border-black/15 bg-black/[0.04] px-6 py-3 font-display text-[11px] uppercase tracking-[0.3em] text-black/50 transition-all hover:border-black/30 hover:text-black/80"
                style={{ borderRadius: "2px" }}
              >
                View Roadmap
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current transition-transform group-hover:translate-x-1">
                  <path d="M13.22 19.03a.75.75 0 010-1.06L18.19 13H3.75a.75.75 0 010-1.5h14.44l-4.97-4.97a.75.75 0 011.06-1.06l6.25 6.25a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 01-1.06 0z" />
                </svg>
              </Link>
            </motion.div>
            <p className="mt-4 text-sm text-black/50">Voice Lab や各Hub機能も順次追加予定です。</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EarlyMembersSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const stats = [
    { label: "Founding", count: "100", roles: "先着100名限定" },
    { label: "Badge", count: "#001", roles: "小さい番号ほど希少" },
    { label: "Access", count: "Priority", roles: "新機能へ最優先アクセス" },
    { label: "Card", count: "Limited", roles: "限定デザインを付与" },
  ];

  return (
    <section ref={ref} className="border-y border-white/5 bg-[#0B0B0F] py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-16 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end"
        >
          <div className="text-center md:text-left">
            <p className="mb-2 font-display text-[12px] uppercase tracking-[0.4em] text-[#FFD600]">Founding Member</p>
            <h2 className="whitespace-nowrap font-display text-[40px] leading-none font-black uppercase text-white md:text-[56px]">
              残り100名。<br />番号を刻む。
            </h2>
          </div>
          <p className="max-w-90 text-center text-[13px] leading-relaxed text-white/40 md:text-left">
            登録するほど番号が埋まっていく。
            #001に近いほど、最初にいた証明になる。今すぐ登録して、あなたの番号を確保する。
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-px bg-white/10 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="bg-[#0B0B0F] p-8"
            >
              <p className="font-display text-[12px] uppercase tracking-widest text-white/30">{s.label}</p>
              <p className="my-1 font-display text-[32px] font-black text-[#FFD600]">{s.count}</p>
              <p className="text-[10px] font-medium text-white/20">{s.roles}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            "「最初にいた証明を、プロフィールに残したい」",
            "「Founding MemberとしてDiscoveryで存在感を持ちたい」",
            "「今のタイミングで入るからこそ、将来の価値がある」",
          ].map((voice, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="rounded-sm border border-white/5 bg-white/[0.02] p-6 text-[12px] italic leading-relaxed text-white/50"
            >
              {voice}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyNowSection() {
  const lines = [
    { text: "もう、観客ではいられない。", accent: true },
    { text: "ただ広がるだけのつながりか。", accent: false },
    { text: "それとも、", accent: false },
    { text: "自分の役割を名乗る側に立つか。", accent: false },
    { text: "ここは、", accent: false },
    { text: "本気の人が集まる場所。", accent: false },
    { text: "役割を、武器にしろ。", accent: false },
    { text: "見える信頼は、強い。", accent: true },
  ];

  return (
    <section className="flex min-h-screen flex-col justify-center bg-[#f2f0eb]">
      <div className="flex flex-1 flex-col justify-center px-5 py-20 md:px-10 lg:px-16 xl:px-20">
        <div className="space-y-4">
          {lines.map(({ text, accent }, i) => (
            <RevealLine key={i} delay={i * 0.1} accent={accent}>
              <p
                className={`font-display font-black uppercase leading-tight tracking-tighter text-[#0B0B0F] ${accent
                  ? "text-[7vw] md:text-[5.5vw] lg:text-[4vw]"
                  : "text-[6vw] md:text-[4vw] lg:text-[2.8vw]"
                  }`}
              >
                {text}
              </p>
            </RevealLine>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhatSection() {
  const cards = [
    { label: "ROLE", title: "名乗れ。", desc: "自分の役割を知らせる。スポーツに関わるすべての人が、自らの立場を宣言できる場所。", image: "/images/roll-demo.png" },
    { label: "DISCOVER", title: "見つけろ。", desc: "信頼できる人や仕事と出会う。構造化された情報が、偶然ではなく必然のつながりを生む。現在はDiscoveryが稼働中で、公開中ユーザーを検索・一覧表示できます。", image: "/images/discovery-demo.png" },
    { label: "CHEER", title: "積み上げろ。", desc: "Cheerは単なる『いいね』ではありません。誰がいつ応援・推薦したかの『関与の記録』です。不正連打を防ぐ構造化データにより、積み重なるほどあなたの純粋な信頼証明となります。", image: "/images/cheer-demo.png" },
  ];

  return (
    <section className="min-h-screen">
      <div className="mb-12 px-5 md:px-10 lg:px-16 xl:px-20">
        <RevealLine delay={0}>
          <p className="font-display text-[3vw] font-light uppercase tracking-[0.3em] text-white/30 md:text-[1.4vw] lg:text-[1vw]">
            What You Can Do
          </p>
        </RevealLine>
      </div>
      <div className="flex flex-col gap-px bg-[#FFD600]/10">
        {cards.map((c, i) => (
          <FeatureCard key={i} {...c} delay={i * 0.12} />
        ))}
      </div>
      <p className="mt-8 px-5 font-body text-[3vw] text-white/25 md:px-10 md:text-[1.4vw] lg:px-16 lg:text-[0.9vw] xl:px-20">
        ※ 稼働中機能に加えて、今後も新機能を順次追加予定です。
      </p>
    </section>
  );
}

export function FoundingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-32 text-center md:px-10"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[50vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
        style={{ background: "radial-gradient(ellipse at center, #FFD600 0%, transparent 65%)", filter: "blur(60px)" }}
      />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mb-20 font-display text-[5vw] font-light leading-loose tracking-widest text-white/40 md:text-[2.5vw] lg:mb-28 lg:text-[1.8vw]"
      >
        最初の100名だけが、<br />この番号を持てる。
      </motion.p>

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-16 lg:gap-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <span className="font-display text-[11px] uppercase tracking-[0.55em] text-white/25">Founding Member Benefits</span>
          <div className="flex flex-col items-center leading-none">
            <h2 className="font-display text-[14vw] font-black uppercase tracking-tight text-white md:text-[8vw] lg:text-[7vw]">Founding</h2>
            <h2 className="font-display text-[14vw] font-black uppercase tracking-tight text-[#FFD600] md:text-[8vw] lg:text-[7vw]">Member</h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 grid grid-cols-1 gap-4 text-left md:grid-cols-2"
          >
            {[
              { t: "1. Founding Member 認定バッジ", d: "プロフィールと公開カードに「Founding Member #001」形式の通し番号バッジが永続表示。番号が小さいほど希少。" },
              { t: "2. 有料プラン 永久Founder価格保証", d: "将来導入される全ユーザー向け有料プランが、登録時点の価格で永久固定。" },
              { t: "3. Discovery 永続優先表示", d: "登録者が増えるほど価値が上がる、検索・一覧での永続的な優位性。" },
              { t: "4. 新機能への最優先アクセス", d: "Trainer Hub / Members Hubなど新機能リリース時に最初に解放。" },
              { t: "5. 創設者名簿への永続掲載", d: "アプリ内およびLP上の「Founding Members」セクションに永続掲載。" },
              { t: "6. 限定カードデザイン", d: "通常会員とは異なるFounding専用カードデザイン。100名のみ。" },
            ].map((b, i) => (
              <div key={i} className="border-l border-[#FFD600]/30 pl-4">
                <p className="text-[18px] font-bold text-[#FFD600]">{b.t}</p>
                <p className="text-[16px] leading-relaxed text-white/40">{b.d}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.85, duration: 0.9 }}
        className="relative z-10 mt-20 font-display text-[4.5vw] font-bold tracking-widest text-white/60 md:text-[2.2vw] lg:mt-28 lg:text-[1.6vw]"
      >
        最初に立つ者だけが、未来の証明を持てる。
      </motion.p>
    </section>
  );
}
