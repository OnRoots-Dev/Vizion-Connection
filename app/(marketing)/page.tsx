"use client";

// app/(marketing)/page.tsx — LP 完全リビルド
// ブランド: 純黒 #000000 / アクセント #C8E800 / Oswald(見出し)・Inter(本文)
// 世界観: 「深夜の孤独な努力」×「瞬間の爆発」。Nikeの簡潔さ + グラスモーフィズム。

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import ShinyText from "@/components/ShinyText";

const ACCENT = "#C8E800";
const ACCENT_DIM = "rgba(200,232,0,0.18)";
const GRID = "rgba(200,232,0,0.04)";
const BG = "#000000";
const TEXT = "#f5f5f5";
const SUB = "rgba(255,255,255,0.55)";

const HEAD = "'Oswald', system-ui, sans-serif";
const BODY = "'Inter', system-ui, sans-serif";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// 数字カウントアップ（ビューに入ったら発火）
function CountUp({ to, duration = 1600, suffix = "" }: { to: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

const FEATURES = [
  { no: "01", label: "Journey & Pulse", title: "毎日の積み上げが、証明になる。", desc: "練習・試合・コンディションを記録するだけ。続けるほどPulseが脈打ち、あなたの軌跡が信用になる。" },
  { no: "02", label: "Cheer & Bond", title: "応援が、関係になる。", desc: "Cheerを続けると脈動が育つ。3日でBond解放。応援の深さが可視化され、ただのフォローを超えた関係になる。" },
  { no: "03", label: "Portfolio & Vizion Card", title: "URLひとつで、あなたが伝わる。", desc: "役割・競技・Pulse継続日数が1枚に。SNSに貼るだけでVizion Cardが自動表示される。" },
];

const ROLES = [
  { id: "Athlete", color: "#FF5050", jp: "アスリート", line: "競技活動を記録・可視化・発見される。" },
  { id: "Trainer", color: "#32D278", jp: "トレーナー", line: "指導実績を蓄積し、信頼を可視化する。" },
  { id: "Crew", color: "#FFC81E", jp: "サポーター", line: "好きな選手を、深く応援できる場所。" },
  { id: "Business", color: "#3C8CFF", jp: "ビジネス", line: "アスリートへの注目・広告・協業機会。" },
];

const FOUNDING = [
  "#001から始まるシリアルナンバー（永久表示）",
  "将来の有料プランが登録時点の価格で永久固定",
  "Discovery永続優先表示",
  "新機能への最優先アクセス",
];

function PrimaryCTA({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} className={`inline-block ${className}`}>
      <Link
        href="/register"
        style={{
          display: "inline-block",
          padding: "16px 40px",
          background: ACCENT,
          color: "#000",
          borderRadius: 12,
          fontFamily: HEAD,
          fontWeight: 600,
          letterSpacing: "0.04em",
          fontSize: 16,
          textDecoration: "none",
          boxShadow: `0 0 40px ${ACCENT_DIM}`,
          textTransform: "uppercase",
        }}
      >
        {children}
      </Link>
    </motion.div>
  );
}

export default function Page() {
  const [hoverFeature, setHoverFeature] = useState<number | null>(null);
  const [hoverRole, setHoverRole] = useState<number | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <main style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: BODY, overflowX: "hidden" }}>
        {/* ── Header ── */}
        <header
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px clamp(20px, 5vw, 56px)",
            background: "rgba(10,10,10,0.55)",
            backdropFilter: "blur(22px) saturate(180%)",
            WebkitBackdropFilter: "blur(22px) saturate(180%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          <div aria-hidden style={{
            position: "absolute", insetInline: 0, top: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(244,193,10,0.25), transparent)",
            pointerEvents: "none",
          }} />
          <Link href="/" style={{ fontFamily: HEAD, fontWeight: 700, letterSpacing: "0.18em", fontSize: 15, color: TEXT, textDecoration: "none", textTransform: "uppercase", transition: "transform 100ms ease-out" }} className="active:scale-[0.97]">
            Vizion<span style={{ color: ACCENT }}>.</span>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Link href="/login" style={{ fontFamily: HEAD, fontWeight: 500, letterSpacing: "0.12em", fontSize: 13, color: SUB, textDecoration: "none", textTransform: "uppercase", transition: "transform 100ms ease-out" }} className="active:scale-[0.97]">
              Login
            </Link>
            <Link href="/register" data-pressable style={{ fontFamily: HEAD, fontWeight: 600, letterSpacing: "0.06em", fontSize: 13, color: "#000", background: ACCENT, padding: "9px 18px", borderRadius: 9, textDecoration: "none", textTransform: "uppercase", transition: "transform 100ms ease-out", boxShadow: "0 0 24px rgba(244,193,10,0.25)" }} className="active:scale-[0.97]">
              無料で始める
            </Link>
          </nav>
        </header>

        {/* ── Hero ── */}
        <section
          style={{
            position: "relative", minHeight: "100vh", display: "flex", alignItems: "center",
            padding: "120px clamp(20px, 5vw, 56px) 80px",
          }}
        >
          {/* グリッドライン */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
            backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }} />
          <div aria-hidden style={{
            position: "absolute", top: "20%", left: "10%", width: 520, height: 520, zIndex: 0, pointerEvents: "none",
            background: `radial-gradient(circle, ${ACCENT_DIM} 0%, transparent 70%)`, filter: "blur(40px)", opacity: 0.5,
          }} />

          <div style={{
            position: "relative", zIndex: 1, width: "100%", maxWidth: 1200, margin: "0 auto",
            display: "grid", gridTemplateColumns: "1fr", gap: 48, alignItems: "center",
          }} className="vc-hero-grid">
            {/* 左: コピー */}
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.div variants={fadeUp} transition={{ duration: 0.6 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28, fontFamily: HEAD, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: ACCENT }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }} />
                IGNITION — 先行登録受付中
              </motion.div>
              <motion.h1 variants={fadeUp} transition={{ duration: 0.7 }}
                style={{ fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(56px, 9vw, 96px)", lineHeight: 0.98, letterSpacing: "-0.02em", margin: "0 0 28px" }}>
                活動が、<br />
                <ShinyText
                  text="信用"
                  className="!inline-block"
                  color={ACCENT}
                  shineColor="#ffffff"
                  speed={2.5}
                  spread={120}
                  pauseOnHover={false}
                  direction="left"
                />
                になる。
              </motion.h1>
              <motion.p variants={fadeUp} transition={{ duration: 0.7 }}
                style={{ fontSize: 17, lineHeight: 1.9, color: SUB, maxWidth: 460, margin: "0 0 40px" }}>
                アスリート・トレーナー・クルー・企業。<br />
                スポーツに関わるすべての人の役割と信頼を可視化する場所。
              </motion.p>
              <motion.div variants={fadeUp} transition={{ duration: 0.7 }}>
                <PrimaryCTA>今すぐ登録する（無料）</PrimaryCTA>
              </motion.div>
            </motion.div>

            {/* 右: Pulse グラスカード */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "relative",
                borderRadius: 24,
                border: `1px solid ${ACCENT_DIM}`,
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
                boxShadow: `0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)`,
                padding: "32px 30px",
                maxWidth: 420,
                justifySelf: "center",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <span style={{ fontFamily: HEAD, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: SUB }}>Pulse Score</span>
                <span style={{ fontFamily: HEAD, fontSize: 11, letterSpacing: "0.1em", color: ACCENT, border: `1px solid ${ACCENT_DIM}`, borderRadius: 999, padding: "3px 10px" }}>LIVE</span>
              </div>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 84, lineHeight: 1, color: ACCENT, letterSpacing: "-0.02em" }}>
                <CountUp to={1428} />
              </div>
              <div style={{ fontSize: 13, color: SUB, margin: "8px 0 28px" }}>あなたの脈動は、止まらない。</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  { label: "継続", to: 365, suffix: "日" },
                  { label: "Cheer", to: 892, suffix: "" },
                  { label: "Bond", to: 47, suffix: "" },
                ].map((s) => (
                  <div key={s.label} style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", padding: "14px 8px", textAlign: "center" }}>
                    <div style={{ fontFamily: HEAD, fontWeight: 600, fontSize: 24, color: TEXT }}>
                      <CountUp to={s.to} suffix={s.suffix} />
                    </div>
                    <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: SUB, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* 28日ドット */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 24 }}>
                {Array.from({ length: 28 }).map((_, i) => (
                  <motion.span key={i}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.02 }}
                    style={{ width: 9, height: 9, borderRadius: "50%", background: i % 5 === 3 ? "rgba(255,255,255,0.12)" : ACCENT, boxShadow: i % 5 === 3 ? "none" : `0 0 6px ${ACCENT_DIM}` }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Features 3列 ── */}
        <section style={{ padding: "100px clamp(20px, 5vw, 56px)", maxWidth: 1200, margin: "0 auto" }}>
          <motion.h2
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} transition={{ duration: 0.6 }}
            style={{ fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(32px, 5vw, 56px)", letterSpacing: "-0.01em", margin: "0 0 56px" }}>
            毎日使える。<span style={{ color: ACCENT }}>育つ。</span>見つかる。
          </motion.h2>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.no}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                onMouseEnter={() => setHoverFeature(i)}
                onMouseLeave={() => setHoverFeature(null)}
                style={{
                  position: "relative", overflow: "hidden",
                  borderRadius: 18, padding: "32px 28px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 14, letterSpacing: "0.2em", color: ACCENT, marginBottom: 18 }}>{f.no}</div>
                <div style={{ fontFamily: HEAD, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: SUB, marginBottom: 10 }}>{f.label}</div>
                <h3 style={{ fontFamily: HEAD, fontWeight: 600, fontSize: 20, lineHeight: 1.4, margin: "0 0 12px" }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: SUB, margin: 0 }}>{f.desc}</p>
                {/* ホバーで左から展開する #C8E800 ライン */}
                <motion.div
                  initial={false}
                  animate={{ scaleX: hoverFeature === i ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ position: "absolute", left: 0, bottom: 0, height: 2, width: "100%", background: ACCENT, transformOrigin: "left" }}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Quote 全幅 ── */}
        <section style={{ position: "relative", padding: "120px clamp(20px, 5vw, 56px)", textAlign: "center" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(200,232,0,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />
          <motion.blockquote
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8 }}
            style={{ position: "relative", fontFamily: HEAD, fontWeight: 500, fontSize: "clamp(26px, 4.5vw, 48px)", lineHeight: 1.4, letterSpacing: "-0.01em", maxWidth: 900, margin: "0 auto" }}>
            誰も見ていない練習が、<br />いつか<span style={{ color: ACCENT }}>誰かの目</span>に届く。
          </motion.blockquote>
        </section>

        {/* ── Roles 4列 ── */}
        <section style={{ padding: "100px clamp(20px, 5vw, 56px)", maxWidth: 1200, margin: "0 auto" }}>
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.6 }}
            style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: HEAD, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: ACCENT, marginBottom: 14 }}>Roles</div>
            <h2 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(30px, 5vw, 52px)", letterSpacing: "-0.01em", margin: 0 }}>あなたのロールはどれですか？</h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {ROLES.map((r, i) => (
              <motion.div
                key={r.id}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                onMouseEnter={() => setHoverRole(i)}
                onMouseLeave={() => setHoverRole(null)}
                style={{
                  borderRadius: 18, padding: "28px 24px",
                  border: `1px solid ${hoverRole === i ? ACCENT : "rgba(255,255,255,0.1)"}`,
                  background: "rgba(255,255,255,0.02)",
                  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                  transition: "border-color 0.3s",
                }}
              >
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: r.color, marginBottom: 16, boxShadow: `0 0 10px ${r.color}` }} />
                <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 22, textTransform: "uppercase", letterSpacing: "0.02em" }}>{r.id}</div>
                <div style={{ fontSize: 12, color: SUB, margin: "2px 0 14px" }}>{r.jp}</div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: SUB, margin: 0 }}>{r.line}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Founding Member ── */}
        <section style={{ padding: "100px clamp(20px, 5vw, 56px)", background: "linear-gradient(180deg, transparent, rgba(200,232,0,0.03))" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} transition={{ duration: 0.6 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16, fontFamily: HEAD, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: ACCENT }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }} />
                Founding Member
              </div>
              <h2 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(30px, 5vw, 52px)", letterSpacing: "-0.01em", margin: "0 0 14px" }}>
                最初の記録が、永遠に残る。
              </h2>
              <p style={{ fontSize: 15, color: SUB, margin: "0 0 40px" }}>シリアルナンバー #001 から埋まります。先着100名限定。</p>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={stagger}
              style={{ display: "grid", gap: 10, textAlign: "left", marginBottom: 40 }}>
              {FOUNDING.map((item) => (
                <motion.div key={item} variants={fadeUp} transition={{ duration: 0.4 }}
                  style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", padding: "14px 18px" }}>
                  <span style={{ color: ACCENT, fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.78)" }}>{item}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* カウンター */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: SUB, marginBottom: 8, fontFamily: HEAD, letterSpacing: "0.08em" }}>
                <span>現在 <CountUp to={37} /> 名</span>
                <span>上限 100 名</span>
              </div>
              <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }} whileInView={{ width: "37%" }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: "100%", background: ACCENT, boxShadow: `0 0 16px ${ACCENT_DIM}` }} />
              </div>
            </div>

            <PrimaryCTA>番号を確保する（無料）</PrimaryCTA>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "56px clamp(20px, 5vw, 56px) 40px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: HEAD, fontWeight: 700, letterSpacing: "0.18em", fontSize: 18, textTransform: "uppercase" }}>
                Vizion<span style={{ color: ACCENT }}>.</span>Connection
              </div>
              <p style={{ fontSize: 12, color: SUB, margin: "8px 0 0" }}>活動が、信用になる。</p>
            </div>
            <div style={{ display: "flex", gap: 22, fontSize: 13 }}>
              <Link href="/login" style={{ color: SUB, textDecoration: "none" }}>ログイン</Link>
              <Link href="/register" style={{ color: ACCENT, textDecoration: "none" }}>無料で始める</Link>
              <Link href="/business" style={{ color: SUB, textDecoration: "none" }}>Business</Link>
            </div>
          </div>
          <p style={{ maxWidth: 1200, margin: "32px auto 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} Vizion Connection. All rights reserved.
          </p>
        </footer>
      </main>

      <style>{`
        @media (min-width: 900px) {
          .vc-hero-grid { grid-template-columns: 1.1fr 0.9fr !important; }
        }
      `}</style>
    </>
  );
}
