"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { RevealLine, FeatureCard } from "../AnimatedComponents";

// ─── Now / Next Section ───────────────────────────────────────────────────────
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
          先行登録期間は「役割を名乗り、見つけ合い、信頼を積み上げる」ための土台作り。
          今できることは絞ります。その代わり、次の解放が明確に見える状態にします。
        </p>

        <div className="mt-10 flex flex-col gap-6">
          <div className="rounded-3xl border border-black/10 bg-white p-7">
            <p className="text-xs font-bold tracking-[0.35em] text-black/50">NOW</p>
            <p className="mt-3 text-lg font-bold">先行登録期間にできること</p>
            <ul className="mt-4 space-y-2 text-black/75">
              <li>・プロフィールカードを作る（役割を名乗る）</li>
              <li>・公開プロフィールを共有する（SNS導線）</li>
              <li>・Discoveryで参加者を見つける</li>
              <li>・Cheerで信頼を積み上げる</li>
            </ul>
            <div className="flex items-center justify-between">
              <p className="mt-3 text-lg font-bold">先行登録で、今すぐ手に入る4つ</p>
              <span className="rounded-full bg-[#FFD600] px-3 py-1 text-[10px] font-bold">先行限定特典あり</span>
            </div>
            <ul className="mt-4 space-y-3 text-black/75 font-medium">
              {[
                { title: "デジタル・パスポート発行", desc: "役割を証明するプロフィールカードと専用URL。" },
                { title: "Founding Member 称号", desc: "初期参加者のみに与えられる永続的な証明。" },
                { title: "信頼（Cheer）の早期蓄積", desc: "公開初日から支援や評価を可視化。" },
                { title: "β機能の優先解放", desc: "共創募集やスポンサー接続への優先参加権。" },
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
            <ul className="mt-4 space-y-2 text-black/75">
              <li>・共創募集（案件/協業の募集と参加）</li>
              <li>・スポンサー/Business連携（先行ポジションが起点）</li>
              <li>・信頼データを元にした推薦・接続</li>
              <li>・活動ログや実績の積み上げ（カードに反映）</li>
            </ul>
            <p className="mt-4 text-sm text-black/50">※順次追加。先行参加者は優先案内。</p>
          </div>
        </div>

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
      </div>
    </section>
  );
}

// ─── Early Members Section ────────────────────────────────────────────────────
export function EarlyMembersSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const stats = [
    { label: "Athletes", count: "Targeting 1000+", roles: "Pro / Amateur / Student" },
    { label: "Trainers", count: "Targeting 300+", roles: "S&C / Medical / Mental" },
    { label: "Business", count: "Limited", roles: "Sponsors / Teams" },
    { label: "Members", count: "Waitlist", roles: "Fans / Supporters" },
  ];

  return (
    <section ref={ref} className="bg-[#0B0B0F] py-24 border-y border-white/5">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-16 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end"
        >
          <div className="text-center md:text-left">
            <p className="font-display text-[12px] uppercase tracking-[0.4em] text-[#FFD600] mb-2">Early Members</p>
            <h2 className="whitespace-nowrap font-display text-[40px] md:text-[56px] font-black uppercase leading-none text-white">
              共に歩む、<br />最初の仲間。
            </h2>
          </div>
          <p className="max-w-90 text-center md:text-left text-[13px] leading-relaxed text-white/40">
            先行登録期間中、既に多様な役割を持つプレイヤーが参加を表明しています。
            あなたの「役割」も、このコミュニティの一部になります。
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
              <p className="font-display text-[32px] font-black text-[#FFD600] my-1">{s.count}</p>
              <p className="text-[10px] text-white/20 font-medium">{s.roles}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            "「自分の実績だけでなく『役割』を証明できる場所に期待している」",
            "「支援したいアスリートをCheerで可視化できるのは新しい」",
            "「スポンサーとして、数字以外の信頼を元にパートナーを探したい」",
          ].map((voice, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="rounded-sm border border-white/5 bg-white/[0.02] p-6 italic text-white/50 text-[12px] leading-relaxed"
            >
              {voice}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why Now Section ──────────────────────────────────────────────────────────
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

// ─── What You Can Do ──────────────────────────────────────────────────────────
export function WhatSection() {
  const cards = [
    { label: "ROLE", title: "名乗れ。", desc: "自分の役割を知らせる。スポーツに関わるすべての人が、自らの立場を宣言できる場所。", image: "/images/roll-demo.png" },
    { label: "DISCOVER", title: "見つけろ。", desc: "信頼できる人や仕事と出会う。構造化された情報が、偶然ではなく必然のつながりを生む。※こちらは開発中の画面をAI生成したものです。", image: "/images/discovery-demo.png" },
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
        ※ 機能は先行登録期間中に順次追加。
      </p>
    </section>
  );
}

// ─── Founding Section ─────────────────────────────────────────────────────────
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
        未完成の今だからこそ、<br />共に創る価値がある。
      </motion.p>

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-16 lg:gap-28">
        {/* Founding Member */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <span className="font-display text-[11px] uppercase tracking-[0.55em] text-white/25">For Individual</span>
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
              { t: "創業バッジ", d: "初期参加者の証をプロフィールに永続表示" },
              { t: "価格固定保証", d: "将来の有料機能はFounder価格に固定（値上げなし）" },
              { t: "優先アクセス権", d: "先行限定イベント・βテストへの優先招待" },
              { t: "参加履歴の証明", d: "「最初に立った」記録をAI構造データで不変に証明" },
            ].map((b, i) => (
              <div key={i} className="border-l border-[#FFD600]/30 pl-4">
                <p className="text-[18px] font-bold text-[#FFD600]">{b.t}</p>
                <p className="text-[16px] text-white/40 leading-relaxed">{b.d}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
          className="h-px w-20 origin-center bg-white/15"
        />

        {/* Founding Sponsor */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <span className="font-display text-[11px] uppercase tracking-[0.55em] text-white/25">For Business</span>
          <div className="flex flex-col items-center leading-none">
            <h2 className="font-display text-[14vw] font-black uppercase tracking-tight text-white md:text-[8vw] lg:text-[7vw]">Founding</h2>
            <h2 className="font-display text-[14vw] font-black uppercase tracking-tight text-[#FFD600] md:text-[8vw] lg:text-[7vw]">Sponsor</h2>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 text-left md:grid-cols-2">
            {[
              { t: "アプリ内広告枠", d: "Discovery・カード面への優先露出（Founding枠限定）" },
              { t: "コア認知の獲得", d: "アスリート/トレーナー/サポーター層へのダイレクト接触" },
              { t: "広告効果の可視化（β）", d: "表示 / クリック / 共有 / Cheer連動 / 滞在 / セグメント別データ" },
              { t: "Founding Sponsor刻印", d: "創設スポンサーとして名前が残る・永続表示" },
            ].map((b, i) => (
              <div key={i} className="border-l border-[#3282FF]/30 pl-4">
                <p className="text-[18px] font-bold text-[#3282FF]">{b.t}</p>
                <p className="text-[16px] text-white/40">{b.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 w-full">
            <p className="mb-4 font-display text-[10px] uppercase tracking-[0.4em] text-white/25">Founding Sponsor Plan</p>
            <div className="grid grid-cols-3 gap-px bg-white/5">
              {[
                { name: "Starter", price: "¥100,000", note: "露出・刻印" },
                { name: "Growth", price: "¥300,000", note: "+ 優先枠・データ" },
                { name: "Partner", price: "¥500,000", note: "+ カスタム連携" },
              ].map((plan, i) => (
                <div key={i} className="flex flex-col items-center gap-1 bg-[#0B0B0F] py-5 px-3 text-center">
                  <p className="font-display text-[11px] uppercase tracking-[0.3em] text-[#3282FF]">{plan.name}</p>
                  <p className="font-display text-[22px] font-black text-white">{plan.price}</p>
                  <p className="font-mono text-[9px] text-white/25">{plan.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-right font-mono text-[9px] uppercase tracking-[0.2em] text-white/20">※ 枠数限定</p>
          </div>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.85, duration: 0.9 }}
        className="relative z-10 mt-20 font-display text-[4.5vw] font-bold tracking-widest text-white/60 md:text-[2.2vw] lg:mt-28 lg:text-[1.6vw]"
      >
        最初に立つ者だけが、未来を選べる。
      </motion.p>
    </section>
  );
}
