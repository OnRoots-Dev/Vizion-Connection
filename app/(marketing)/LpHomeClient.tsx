"use client";

// lp-prototype.html 準拠の LP 本体（Bebas Neue × Noto Sans JP / lime #C8E800）

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./lp-prototype.css";

const REGIONS = [
  { id: "hokkaido_tohoku", label: "北海道・東北" },
  { id: "kanto", label: "関東" },
  { id: "chubu", label: "中部" },
  { id: "kinki", label: "近畿" },
  { id: "chugoku_shikoku", label: "中国・四国" },
  { id: "kyushu_okinawa", label: "九州・沖縄" },
] as const;

const FEED_EVENTS = [
  { c: "#FF5050", t: "東京都のアスリートが Journey に今日の練習を記録しました" },
  { c: "#FFC81E", t: "大阪府のファンが Cheer を送りました「次も応援してる！」" },
  { c: "#30de1d", t: "福岡県のトレーナーが Career に指導実績を追加しました" },
  { c: "#3C8CFF", t: "愛知県の企業が Discovery でアスリートを検索しました" },
  { c: "#FF5050", t: "北海道のアスリートがプロフィールカードを公開しました" },
  { c: "#FFC81E", t: "神奈川県のファンと選手の Bond が深まりました" },
  { c: "#FF5050", t: "沖縄県のアスリートがデイリーミッションを達成しました" },
  { c: "#3C8CFF", t: "宮城県の企業が Roots 掲載枠に申し込みました" },
  { c: "#FFC81E", t: "広島県のファンが新しい選手のフォローを始めました" },
  { c: "#30de1d", t: "京都府のトレーナーのプロフィールが閲覧されました" },
  { c: "#FF5050", t: "新潟県のアスリートに初期メンバー番号が発行されました" },
  { c: "#FFC81E", t: "熊本県のファンが Cheer を送りました「ここからだ！」" },
];

type RegionAvail = { id: string; label: string; seats: number; remaining: number; soldOut: boolean };

/** アプリ共通ロゴ（Header / Login 等と同じアセット） */
function AppLogo({ height = 48, priority = false }: { height?: number; priority?: boolean }) {
  // 元画像の横長比率に合わせて width を推定（表示は h / w-auto）
  const width = Math.round(height * (492 / 232));
  return (
    <Image
      src="/images/vizion-connection-logo-6-cropped.png"
      alt="Vizion Connection"
      width={width}
      height={height}
      priority={priority}
      className="lp-app-logo"
      style={{ height, width: "auto" }}
    />
  );
}

function Marquee({ reverse = false }: { reverse?: boolean }) {
  const items = reverse
    ? (
      <>
        <span className="o">47 Prefectures</span><i className="dot" /><span>先着順</span><i className="dot" />
        <span className="o">First Come, First Served</span><i className="dot" /><span>掲載枠 残りわずか</span><i className="dot" />
      </>
    ) : (
      <>
        <span>Vizion Connection</span><i className="dot" /><span className="o">47 Prefectures</span><i className="dot" />
        <span>積み重ねが、見える</span><i className="dot" /><span className="o">Athletes × Trainers × Fans × Business</span><i className="dot" />
      </>
    );
  return (
    <div className={`marquee${reverse ? " rev" : ""}`} aria-hidden>
      <div className="marquee-track">
        <div className="marquee-seq">{items}</div>
        <div className="marquee-seq">{items}</div>
      </div>
    </div>
  );
}

export default function LpHomeClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroGlowRef = useRef<HTMLDivElement>(null);
  const feedIdx = useRef(5);
  const [feedItems, setFeedItems] = useState(() =>
    FEED_EVENTS.slice(0, 5).map((ev, i) => ({
      id: `seed-${i}`,
      c: ev.c,
      t: ev.t,
      fresh: false,
      show: true,
    })),
  );
  const [regions, setRegions] = useState<RegionAvail[]>([]);

  // boot + scroll reveal
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    document.documentElement.classList.add("lp-scroll");
    const t = window.setTimeout(() => root.classList.add("loaded"), 80);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    root.querySelectorAll(".reveal").forEach((el) => {
      if (reduce) el.classList.add("in");
      else io.observe(el);
    });

    return () => {
      clearTimeout(t);
      io.disconnect();
      document.documentElement.classList.remove("lp-scroll");
    };
  }, []);

  // particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const COUNT = isMobile ? 34 : 70;
    let W = 0, H = 0, DPR = 1;
    let particles: Array<{ x: number; y: number; r: number; vy: number; vx: number; a: number; ph: number; tw: number }> = [];
    let running = true;
    let raf = 0;

    const sprite = document.createElement("canvas");
    const SS = 64;
    sprite.width = SS;
    sprite.height = SS;
    const sctx = sprite.getContext("2d")!;
    const grad = sctx.createRadialGradient(SS / 2, SS / 2, 0, SS / 2, SS / 2, SS / 2);
    grad.addColorStop(0, "rgba(200, 232, 0, 0.9)");
    grad.addColorStop(0.35, "rgba(200, 232, 0, 0.25)");
    grad.addColorStop(1, "rgba(200, 232, 0, 0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, SS, SS);

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W * DPR;
      canvas!.height = H * DPR;
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function spawn(randomY: boolean) {
      return {
        x: Math.random() * W,
        y: randomY ? Math.random() * H : H + 12,
        r: 1.4 + Math.random() * 4.6,
        vy: -(0.12 + Math.random() * 0.4),
        vx: (Math.random() - 0.5) * 0.16,
        a: 0.25 + Math.random() * 0.55,
        ph: Math.random() * Math.PI * 2,
        tw: 0.4 + Math.random() * 1.2,
      };
    }
    function frame(t: number) {
      if (!running) return;
      ctx!.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(t * 0.0004 + p.ph) * 0.12;
        if (p.y < -14 || p.x < -14 || p.x > W + 14) Object.assign(p, spawn(false));
        const twinkle = 0.55 + 0.45 * Math.sin(t * 0.001 * p.tw + p.ph);
        ctx!.globalAlpha = p.a * twinkle;
        const s = p.r * 6;
        ctx!.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    resize();
    particles = Array.from({ length: COUNT }, () => spawn(true));
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // aurora parallax
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const aurora = document.getElementById("aurora");
    if (!aurora) return;
    const blobs = aurora.querySelectorAll<HTMLElement>(".blob");
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      if (blobs[0]) blobs[0].style.transform = `translate3d(0, ${y * -0.06}px, 0)`;
      if (blobs[1]) blobs[1].style.transform = `translate3d(0, ${y * 0.045}px, 0)`;
      if (blobs[2]) blobs[2].style.transform = `translate3d(0, ${y * -0.028}px, 0)`;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // hero glow pointer
  useEffect(() => {
    const glow = heroGlowRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!glow || reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const onMove = (e: Event) => {
      const pe = e as PointerEvent;
      const x = (pe.clientX / window.innerWidth - 0.5) * 40;
      const y = (pe.clientY / window.innerHeight - 0.5) * 30;
      glow.style.transform = `translate(${x}px, ${y}px)`;
    };
    hero.addEventListener("pointermove", onMove);
    return () => hero.removeEventListener("pointermove", onMove);
  }, []);

  // live feed demo — 常にちょうど 5 件（高さ固定、下要素のズレ防止）
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const ev = FEED_EVENTS[feedIdx.current++ % FEED_EVENTS.length];
      const id = `f-${Date.now()}`;
      setFeedItems((prev) => {
        const next = [
          { id, c: ev.c, t: ev.t, fresh: true, show: false },
          ...prev.map((p) => ({ ...p, fresh: false })).slice(0, 4),
        ];
        return next;
      });
      // 次フレームで .show を付与（入場アニメ）
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFeedItems((prev) =>
            prev.map((p) => (p.id === id ? { ...p, show: true } : p)),
          );
        });
      });
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // region availability from API
  useEffect(() => {
    let active = true;
    fetch("/api/business/region-availability", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        // ad_slots 由来のみ。失敗時は空（仮の seats:20 は出さない）
        if (Array.isArray(d?.regions) && d.regions.length) {
          setRegions(d.regions as RegionAvail[]);
        } else {
          setRegions([]);
        }
      })
      .catch(() => {
        if (active) setRegions([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // count-up for 47
  useEffect(() => {
    const el = document.querySelector<HTMLElement>("[data-count]");
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = Number(el.dataset.count || 47);
    if (reduce) {
      el.textContent = String(target);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1600;
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="lp-proto" ref={rootRef}>
      <div className="bg-aurora" id="aurora" aria-hidden>
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>
      <canvas ref={canvasRef} id="bgCanvas" aria-hidden />

      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="logo" aria-label="Vizion Connection">
          <AppLogo height={64} priority />
        </Link>
        <Link href="/register" className="nav-cta">
          今すぐ登録する
        </Link>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="hero-grid" aria-hidden />
        <div className="hero-floor" aria-hidden />
        <div className="hero-glow" id="heroGlow" ref={heroGlowRef} aria-hidden>
          <div className="core" />
          <div className="hero-ring" />
          <div className="hero-ring r2" />
          <div className="hero-ring r3" />
        </div>

        <div className="hero-inner">
          <p className="hero-badge boot" style={{ ["--d" as string]: ".05s" }}>
            本日よりコア機能を提供開始 — 7/21 9:00 全国向け正式リリース発表
          </p>
          <p className="boot" style={{ ["--d" as string]: ".08s", margin: "8px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.04em" }}>
            ※ 7/21 は機能解禁ではなく、全国に向けた正式リリース発表の日です。アプリは本日19:00より利用可能です。
          </p>
          <p className="hero-en boot" style={{ ["--d" as string]: ".12s" }} aria-hidden>
            Every Effort, Visible.
          </p>
          <h1 className="hero-title">
            <span className="boot" style={{ ["--d" as string]: ".2s", display: "block" }}>
              積み重ねが、<em>見える</em>。
            </span>
            <span className="boot" style={{ ["--d" as string]: ".35s", display: "block" }}>
              応援が、<em>届く</em>。
            </span>
          </h1>
          <p className="hero-sub boot" style={{ ["--d" as string]: ".5s" }}>
            <span className="np">スポーツに関わるすべての人が、</span>
            <span className="np">信頼でつながる場所。</span>
          </p>
          <p className="hero-sub2 boot" style={{ ["--d" as string]: ".58s" }}>
            <span className="np">日々の記録も、応援も、出会いも——</span>
            <span className="np">すべてがあなたの証明になる。</span>
          </p>
          <div className="hero-pills boot" style={{ ["--d" as string]: ".68s" }}>
            <span className="pill"><span className="dot" />47都道府県で展開</span>
            <span className="pill"><span className="dot" />初期メンバー番号 <strong>先着発行</strong></span>
            <span className="pill"><span className="dot" />企業掲載枠 <strong>地域ごと・先着順</strong></span>
          </div>
          <div className="hero-actions boot" style={{ ["--d" as string]: ".8s" }}>
            <Link href="/register" className="btn-primary">
              今すぐ登録する（無料） <span className="arrow" aria-hidden>→</span>
            </Link>
            <Link href="/roadmap" className="btn-ghost">
              ロードマップを見る
            </Link>
          </div>
        </div>
        <div className="scroll-cue boot" style={{ ["--d" as string]: "1.05s" }} aria-hidden>
          <span>Scroll</span>
          <span className="bar" />
        </div>
      </header>

      <Marquee />

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="sec-head">
          <div className="reveal">
            <p className="sec-kicker">What is Vizion</p>
            <h2 className="sec-title jp">
              毎日が、<br /><span className="lime">証明</span>に変わる。
            </h2>
          </div>
          <p className="sec-lead reveal" style={{ ["--d" as string]: ".15s" }}>
            Vizion Connection の中心にあるのは3つの体験。記録する、応援でつながる、見つけてもらう。そのすべてが、あなたの信頼として積み上がっていく。
          </p>
        </div>
        <div className="about-grid">
          {[
            { n: "01", en: "Journey", h: "日々の記録が、成長の軌跡になる", p: "練習・試合・日々の挑戦を Journey に記録。デイリーログとミッションで積み重ねた毎日が、プロフィールに刻まれる成長の軌跡になる。" },
            { n: "02", en: "Cheer & Bond", h: "応援が、数字と言葉で届く", p: "Cheer は送った瞬間に消えない応援。数字と言葉で選手に届き、Bond という絆として残る。支えている実感と、支えられている実感の両方がここにある。" },
            { n: "03", en: "Discovery", h: "見つけてもらえる、場所", p: "Discovery は企業・トレーナーがロールやスキルで人材を探す検索の場。挑戦を積み重ねる人ほど見つかりやすくなり、次の出会いにつながる。" },
          ].map((item, i) => (
            <article key={item.n} className="about-item reveal" style={{ ["--d" as string]: `${i * 0.12}s` }}>
              <div className="about-top">
                <p className="about-index">{item.n}</p>
                <span className="about-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {i === 0 && <><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>}
                    {i === 1 && <><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3.4 1-4.5 2.5C10.9 4 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z" /></>}
                    {i === 2 && <><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" /></>}
                  </svg>
                </span>
              </div>
              <h3>
                <span className="en">{item.en}</span>
                {item.h}
              </h3>
              <p>{item.p}</p>
            </article>
          ))}
        </div>
      </section>

      {/* LIVE */}
      <section className="live" id="live">
        <div className="sec-head">
          <div className="reveal">
            <p className="sec-kicker">Live</p>
            <h2 className="sec-title jp">今、<span className="lime">動いて</span>いる。</h2>
          </div>
          <p className="sec-lead reveal" style={{ ["--d" as string]: ".15s" }}>
            大きな数字より、確かな鼓動を。Vizion では今日も、新しい登録と応援が生まれ続けている。
          </p>
        </div>
        <div className="live-grid">
          <div className="feed-card reveal">
            <div className="feed-head">
              <p className="feed-live">Live Feed</p>
              <p className="feed-note">※ 演出イメージ（デモデータ）</p>
            </div>
            <ul className="feed-list" aria-live="off">
              {feedItems.map((item) => (
                <li
                  key={item.id}
                  className={`feed-item${item.fresh ? " fresh" : ""}${item.show ? " show" : ""}`}
                  style={{ ["--fc" as string]: item.c }}
                >
                  <i className="fd" />
                  <span>{item.t}</span>
                  <span className="ft">{item.fresh ? "たった今" : ""}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mom-stack">
            <div className="mom-tile reveal" style={{ ["--d" as string]: ".1s" }}>
              <p className="mom-label"><i className="tick" />展開エリア</p>
              <p className="mom-value">
                <span className="num" data-count="47">0</span>
                <span className="unit">都道府県</span>
              </p>
              <div className="mom-bar" style={{ ["--w" as string]: "100%" }}><i /></div>
              <p className="mom-sub">初日から<strong>全国をカバー</strong>。あなたの地域にも、すでに仲間がいる。</p>
            </div>
            <div className="mom-tile reveal" style={{ ["--d" as string]: ".2s" }}>
              <p className="mom-label"><i className="tick" />現在フェーズ</p>
              <p className="mom-value"><span className="num" style={{ fontSize: "clamp(30px,3vw,42px)" }}>IGNITION</span></p>
              <div className="mom-bar" style={{ ["--w" as string]: "100%" }}><i /></div>
              <p className="mom-sub">Phase 01 のコア機能は<strong>本日19:00よりすべて利用可能</strong>。次のフェーズが、もう見えている。</p>
            </div>
            <div className="mom-tile reveal" style={{ ["--d" as string]: ".3s" }}>
              <p className="mom-label"><i className="tick" />初期メンバー番号</p>
              <p className="mom-value"><span className="num" style={{ fontSize: "clamp(30px,3vw,42px)" }}>先着発行中</span></p>
              <p className="mom-sub">今参加した人だけが手にできる<strong>永久欠番</strong>。「最初からいた」の証明になる。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="roles" id="roles">
        <div className="sec-head">
          <div className="reveal">
            <p className="sec-kicker">For Every Player</p>
            <h2 className="sec-title jp">全員が、<br /><span className="lime">主役</span>になる。</h2>
          </div>
          <p className="sec-lead reveal" style={{ ["--d" as string]: ".15s" }}>
            挑戦する人、支える人、応援する人、投資する人。立場は違っても、熱狂の当事者であることは変わらない。
          </p>
        </div>
        <div className="roles-grid">
          {[
            { tag: "Athlete", name: "Athlete", color: "var(--c-athlete)", copy: "あなたの「今」と「これまで」が、信頼になる。", points: ["Journey で日々の挑戦を記録", "Cheer と応援ptが積み上がる", "プロフィールカードで証明を共有"] },
            { tag: "Trainer", name: "Trainer", color: "var(--c-trainer)", copy: "指導実績が、次のクライアントを連れてくる。", points: ["Career に指導実績を蓄積", "Discovery で見つけてもらう", "信頼がそのまま営業資産になる"] },
            { tag: "Fan / Crew", name: "Fan", color: "var(--c-fan)", copy: "好きな選手を、数字で応援できる。", points: ["Cheer が選手に直接届く", "応援の履歴が Bond として残る", "「最初から応援していた」を証明できる"] },
            { tag: "Business", name: "Business", color: "var(--c-biz)", copy: "47都道府県、あなたの企業を待っている人がいる。", points: ["地方ブロックの掲載枠で露出", "Discovery でスポーツ人材と出会う", "支援がブランドの物語になる"] },
          ].map((r, i) => (
            <article key={r.tag} className="role-card reveal" style={{ ["--rc" as string]: r.color, ["--d" as string]: `${i * 0.1}s` }}>
              <p className="role-tag">{r.tag}</p>
              <p className="role-name">{r.name}</p>
              <p className="role-copy">{r.copy}</p>
              <ul className="role-points">
                {r.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ROADMAP */}
      <section className="roadmap" id="roadmap">
        <div className="sec-head">
          <div className="reveal">
            <p className="sec-kicker">Roadmap</p>
            <h2 className="sec-title jp">進化は、<br /><span className="lime">止まらない</span>。</h2>
          </div>
          <p className="sec-lead reveal" style={{ ["--d" as string]: ".15s" }}>
            Vizion Connection は5つのフェーズで拡張していく。今はまだ、最初の点火にすぎない。
          </p>
        </div>
        <ol className="phase-track">
          {[
            { status: "Now", statusCls: "now", num: "01", label: "Ignition", period: "2026.6.30 –", tag: "役割を名乗れ。信頼を刻め。", desc: "プロフィールカード、Cheer、Journey、Discovery——コア機能は本日よりすべて利用可能。", pc: "#FFD600", current: true },
            { status: "Coming Soon", statusCls: "soon", num: "02", label: "Momentum", period: "今後・順次拡張", tag: "つながりに、深さを。", desc: "Synergy 拡張、Discovery 地図・高度検索、スキルタグ、V-Score など。", pc: "#3282FF" },
            { status: "2026.9 予定", statusCls: "", num: "03", label: "Ascent", period: "2026年 9月予定", tag: "広がりが、力になる。", desc: "Synergy（コミュニティ）、Arena（イベント）、Trust Score、AI Discovery。", pc: "#FF4646" },
            { status: "2027 –", statusCls: "", num: "04", label: "Alliance", period: "2027年 順次展開", tag: "信頼が、共創を生む。", desc: "スポンサー・マッチング、企業コラボ、グローバルスポンサー接続。", pc: "#28D26E" },
            { status: "2027 –", statusCls: "", num: "05", label: "Origin", period: "2027年以降 順次展開", tag: "信頼が、世界の原点になる。", desc: "応援証明書（SBT / NFT）、グローバル・コミュニティ、AIキャリア支援。", pc: "#A855F7" },
          ].map((ph, i) => (
            <li
              key={ph.num}
              className={`phase${ph.current ? " current" : ""} reveal`}
              style={{ ["--pc" as string]: ph.pc, ["--d" as string]: `${i * 0.08}s` }}
            >
              <span className={`phase-status ${ph.statusCls}`}>{ph.status}</span>
              <p className="phase-num">{ph.num}</p>
              <h3 className="phase-label">{ph.label}</h3>
              <p className="phase-period">{ph.period}</p>
              <p className="phase-tag">{ph.tag}</p>
              <p className="phase-desc">{ph.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <Marquee reverse />

      {/* BUSINESS */}
      <section className="biz" id="business">
        <div className="biz-panel reveal">
          <div className="biz-copy">
            <p className="biz-chip">Business Plan — 企業向け掲載枠</p>
            <h2 className="biz-title">
              <span className="big">47</span><span className="jp">都道府県、</span><br />
              <span className="jp lime">先着順。</span>
            </h2>
            <p className="biz-lead">
              地域密着の <strong>Roots</strong> プランは、全国を<strong>6つの地方ブロック</strong>に分けて<strong>各20枠・先着順</strong>で提供。埋まったブロックの募集は、その時点で終了します。
            </p>
            <p className="biz-price">
              <span className="plan">Roots</span>
              <span className="yen">¥30,000</span>
              <span className="per">〜 / 月・1ブロック</span>
            </p>
            <div className="biz-actions">
              <Link href="/business" className="btn-primary">
                掲載枠の空き状況を見る <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
            <p className="biz-note">※ 実際の空き状況は Business ページ・チェックアウトでご確認ください。</p>
          </div>
          <div className="biz-map">
            <p className="region-head">
              <span>Roots · 地方ブロック残枠</span>
              <strong>各20枠</strong>
            </p>
            <div className="region-grid">
              {(regions.length
                ? regions
                : REGIONS.map((r) => ({
                    id: r.id,
                    label: r.label,
                    seats: 20,
                    remaining: 20,
                    soldOut: false,
                  }))
              ).map((r, i) => (
                <div
                  key={r.id}
                  className="region-card"
                  style={{ ["--d" as string]: `${0.05 + i * 0.06}s` }}
                >
                  <span className="region-name">{r.label}</span>
                  <div className="region-avail">
                    {r.soldOut ? (
                      <span className="n" style={{ fontSize: 18, color: "#ff6b5b" }}>
                        満席
                      </span>
                    ) : (
                      <>
                        <span className="n">{r.remaining}</span>
                        <span className="u">/ {r.seats} 枠</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="plan-table-wrap reveal" style={{ ["--d" as string]: ".15s" }}>
          <table className="plan-table">
            <caption className="sr-only">Businessプラン比較表</caption>
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">項目</span></th>
                <th scope="col" className="col-roots">Roots<span className="tagchip">地域・先着</span></th>
                <th scope="col">Signal</th>
                <th scope="col">Presence</th>
                <th scope="col">Legacy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">単価（月額）</th>
                <td className="col-roots">¥30,000</td>
                <td className="hl">¥100,000</td>
                <td className="hl">¥300,000</td>
                <td className="hl">個別見積</td>
              </tr>
              <tr>
                <th scope="row">枠数</th>
                <td className="col-roots">120枠（6ブロック×20）</td>
                <td>30枠</td>
                <td>10枠</td>
                <td>5枠</td>
              </tr>
              <tr>
                <th scope="row">表示エリア</th>
                <td className="col-roots">地方ブロック</td>
                <td>全国</td>
                <td>全国</td>
                <td>全国</td>
              </tr>
              <tr>
                <th scope="row">Discovery表示</th>
                <td className="col-roots">—</td>
                <td>表示</td>
                <td className="hl">優先</td>
                <td className="hl">最優先</td>
              </tr>
              <tr>
                <th scope="row">1ヶ月料金で4ヶ月利用（1＋ボーナス3）</th>
                <td className="col-roots"><span className="ok">✓</span></td>
                <td><span className="ok">✓</span></td>
                <td><span className="ok">✓</span></td>
                <td><span className="ok">✓</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-final">
        <div className="inner reveal">
          <p className="cta-kicker">Join the Vizion</p>
          <h2 className="cta-title">
            最初のページに、<br /><span className="lime">名前を刻め</span>。
          </h2>
          <p className="cta-sub">登録は無料。初期メンバー番号は、いま参加した人にしか発行されない。</p>
          <Link href="/register" className="btn-primary">
            今すぐ登録する（無料） <span className="arrow" aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div>
            <Link href="/" className="logo" aria-label="Vizion Connection">
              <AppLogo height={56} />
            </Link>
            <p className="footer-tag">スポーツ × 信頼プラットフォーム</p>
          </div>
          <nav className="footer-links" aria-label="フッターナビゲーション">
            <div>
              <p className="fl-head">Service</p>
              <a href="#about">Vizionとは</a>
              <a href="#live">Live</a>
              <a href="#roles">ロール別の価値</a>
              <a href="#roadmap">ロードマップ</a>
              <Link href="/business">Businessプラン</Link>
            </div>
            <div>
              <p className="fl-head">Account</p>
              <Link href="/register">今すぐ登録</Link>
              <Link href="/login">ログイン</Link>
            </div>
            <div>
              <p className="fl-head">Legal</p>
              <Link href="/company">会社情報</Link>
              <Link href="/contact">お問い合わせ</Link>
            </div>
          </nav>
        </div>
        <p className="footer-giant" aria-hidden>Vizion Connection</p>
        <div className="footer-bottom">
          <span>© 2026 Vizion Connection</span>
          <span>Produced by OnRoot</span>
        </div>
      </footer>
    </div>
  );
}
