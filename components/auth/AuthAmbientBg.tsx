// components/auth/AuthAmbientBg.tsx
// auth全系のアンビエント背景。variant で出力を切り替える。
// - "login": ネットワーク（繋がる）+ ログ行（記録）を含むリッチ版（旧 LoginAmbientBg）
// - "default": 控えめな Pulse 発光 + グリッド（register / thanks 等）
// 値は旧実装から一切変更していない。reduced-motion 時はいずれも静止。

"use client";

import { useReducedMotion } from "framer-motion";

/* ────────────────────────────────────────────────
 * login variant（旧 LoginAmbientBg）
 * 「記録」と「繋がる」を可視化。
 * オーブ・ネットワークは画面外へはみ出し、点滅は要素ごとにバラバラ。
 * ブランド: electric #C8E800 / ダーク #07070e。
 * ──────────────────────────────────────────────── */

/**
 * 繋がる: ノード座標（viewBox 0–100 の「可視域」に対し、負〜100超で画面外へ）
 * 画面内: おおよそ 8–92 / 画面外: <0 or >100
 */
const LOGIN_NODES = [
  // 画面内
  { x: 18, y: 32, r: 1.15 },
  { x: 38, y: 22, r: 0.95 },
  { x: 52, y: 48, r: 1.25 },
  { x: 68, y: 28, r: 1.0 },
  { x: 78, y: 58, r: 1.1 },
  { x: 42, y: 68, r: 1.05 },
  { x: 22, y: 58, r: 0.95 },
  { x: 58, y: 78, r: 1.0 },
  { x: 88, y: 42, r: 0.9 },
  { x: 32, y: 42, r: 1.1 },
  // 画面外・縁（はみ出し）
  { x: -12, y: 18, r: 1.2 },
  { x: -8, y: 55, r: 1.0 },
  { x: -6, y: 88, r: 0.95 },
  { x: 15, y: -10, r: 1.05 },
  { x: 48, y: -14, r: 1.15 },
  { x: 85, y: -8, r: 0.9 },
  { x: 108, y: 12, r: 1.1 },
  { x: 112, y: 48, r: 1.2 },
  { x: 106, y: 82, r: 0.95 },
  { x: 72, y: 108, r: 1.0 },
  { x: 28, y: 110, r: 1.05 },
  { x: -4, y: 105, r: 0.9 },
  { x: 118, y: -6, r: 1.0 },
  { x: 118, y: 108, r: 0.95 },
] as const;

/**
 * 繋がる: エッジ（本数を抑え、画面内外をまたぐ骨格のみ）
 * 同時に明るく見えるのは点滅の sparse ピークで 2〜4 本程度になる想定
 */
const LOGIN_EDGES: readonly [number, number][] = [
  // 内側の骨格（少なめ）
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 5],
  [0, 6],
  [9, 2],
  [4, 8],
  [5, 7],
  // 外→内（四辺から1〜2本ずつ）
  [10, 0],
  [11, 9],
  [14, 2],
  [15, 3],
  [17, 4],
  [18, 7],
  [20, 5],
  [12, 6],
  // 長く画面を横切る線（2本だけ）
  [10, 17],
  [14, 20],
];

const LOGIN_ORBS = [
  {
    w: 560,
    h: 560,
    // 上端から大きくはみ出し
    style: { top: "-18%", left: "42%", marginLeft: -280 } as const,
    bg: "radial-gradient(circle, rgba(200,232,0,0.22) 0%, rgba(200,232,0,0.06) 42%, transparent 70%)",
    salt: 3,
  },
  {
    w: 420,
    h: 420,
    style: { bottom: "-22%", right: "-12%" } as const,
    bg: "radial-gradient(circle, rgba(200,232,0,0.16) 0%, rgba(200,232,0,0.04) 48%, transparent 70%)",
    salt: 7,
  },
  {
    w: 380,
    h: 380,
    style: { top: "38%", left: "-16%" } as const,
    bg: "radial-gradient(circle, rgba(200,232,0,0.14) 0%, transparent 68%)",
    salt: 11,
  },
  {
    w: 300,
    h: 300,
    style: { top: "-8%", right: "-10%" } as const,
    bg: "radial-gradient(circle, rgba(200,232,0,0.12) 0%, transparent 68%)",
    salt: 13,
  },
  {
    w: 340,
    h: 340,
    style: { bottom: "-14%", left: "18%" } as const,
    bg: "radial-gradient(circle, rgba(200,232,0,0.1) 0%, transparent 70%)",
    salt: 19,
  },
] as const;

/**
 * 決定論的な疑似乱数（SSR/CSR 一致）。
 * 周期・位相・点滅パターンを強くばらす。
 */
function blinkParams(index: number, salt: number) {
  const n = ((index + 1) * 2654435761 + salt * 1013904223) >>> 0;
  // 9–24s: ゆっくり＋個体差
  const duration = 9 + (n % 1500) / 100;
  // 開始位相を広く散らす
  const delay = -((n >>> 7) % 24000) / 1000;
  // 3種の非対称キーフレーム
  const variant = n % 3;
  // ピークの明るさ（要素ごと）
  const peak = 0.55 + ((n >>> 14) % 40) / 100; // 0.55–0.94
  const dim = 0.12 + ((n >>> 20) % 22) / 100; // 0.12–0.33
  return { duration, delay, variant, peak, dim };
}

/** 線専用: ピークを短く・暗時間を長く → 同時に目立つ本数を制限 */
function edgeBlinkParams(index: number) {
  const base = blinkParams(index, 17);
  // さらに周期を伸ばし、ピークは控えめ
  return {
    ...base,
    duration: base.duration + 4 + (index % 5), // 13–33s 帯
    peak: 0.42 + (base.peak - 0.55) * 0.6, // ~0.42–0.65
    dim: 0.06 + base.dim * 0.35, // ~0.10–0.18（ほぼ消灯）
  };
}

function LoginBackground({ reduce }: { reduce: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* base depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -8%, rgba(200,232,0,0.08) 0%, transparent 52%), radial-gradient(ellipse 60% 45% at 80% 90%, rgba(200,232,0,0.05) 0%, transparent 50%), #07070e",
        }}
      />

      {/* soft grid */}
      <div
        className="absolute inset-0 opacity-[0.24]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 75% 65% at 50% 42%, black 15%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 65% at 50% 42%, black 15%, transparent 78%)",
        }}
      />

      {/* electric orbs — 画面外にはみ出し + 個別にゆっくり点滅 */}
      {LOGIN_ORBS.map((orb, i) => {
        const { duration, delay, variant, peak, dim } = blinkParams(i, orb.salt);
        // オーブは完全に消えないよう dim を底上げ
        const orbDim = 0.45 + dim * 0.5; // ~0.51–0.615
        const orbPeak = 0.75 + peak * 0.25; // ~0.89–0.985
        return (
          <div
            key={`orb-${i}`}
            className={
              reduce
                ? "vc-auth-orb vc-auth-orb--static"
                : `vc-auth-orb vc-login-orb-blink vc-login-blink-v${variant}`
            }
            style={{
              width: orb.w,
              height: orb.h,
              ...orb.style,
              background: orb.bg,
              ...(reduce
                ? { opacity: 0.75 }
                : ({
                    ["--blink-dur" as string]: `${duration * 1.15}s`,
                    ["--blink-delay" as string]: `${delay}s`,
                    ["--blink-peak" as string]: String(orbPeak),
                    ["--blink-dim" as string]: String(orbDim),
                  } as React.CSSProperties)),
            }}
          />
        );
      })}

      {/* ── 繋がる: ネットワーク（可視域より大きく、縁で切れる） ── */}
      <svg
        className="absolute"
        viewBox="-18 -18 136 136"
        preserveAspectRatio="xMidYMid slice"
        style={{
          opacity: 0.72,
          // 画面より一回り大きくして、外のノード・線が自然にクリップされる
          width: "138%",
          height: "138%",
          top: "-19%",
          left: "-19%",
        }}
      >
        <defs>
          <linearGradient id="login-edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(200,232,0,0.18)" />
            <stop offset="45%" stopColor="rgba(200,232,0,0.7)" />
            <stop offset="100%" stopColor="rgba(200,232,0,0.32)" />
          </linearGradient>
          <radialGradient id="login-node-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(220,245,100,0.9)" />
            <stop offset="35%" stopColor="rgba(200,232,0,0.55)" />
            <stop offset="70%" stopColor="rgba(200,232,0,0.14)" />
            <stop offset="100%" stopColor="rgba(200,232,0,0)" />
          </radialGradient>
          <radialGradient id="login-node-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(200,232,0,0.28)" />
            <stop offset="55%" stopColor="rgba(200,232,0,0.08)" />
            <stop offset="100%" stopColor="rgba(200,232,0,0)" />
          </radialGradient>
          <filter id="login-node-blur" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" />
          </filter>
        </defs>

        {LOGIN_EDGES.map(([a, b], i) => {
          const n0 = LOGIN_NODES[a];
          const n1 = LOGIN_NODES[b];
          const { duration, delay, variant, peak, dim } = edgeBlinkParams(i);
          return (
            <line
              key={`e-${i}`}
              x1={n0.x}
              y1={n0.y}
              x2={n1.x}
              y2={n1.y}
              stroke="url(#login-edge-grad)"
              strokeWidth={0.2}
              strokeLinecap="round"
              className={
                reduce
                  ? undefined
                  : `vc-login-edge vc-login-edge--sparse vc-login-blink-v${variant}`
              }
              style={
                reduce
                  ? { opacity: 0.28 }
                  : ({
                      ["--blink-dur" as string]: `${duration}s`,
                      ["--blink-delay" as string]: `${delay}s`,
                      ["--blink-peak" as string]: String(peak),
                      ["--blink-dim" as string]: String(dim),
                    } as React.CSSProperties)
              }
            />
          );
        })}

        <g filter="url(#login-node-blur)" className="vc-login-nodes-layer">
          {LOGIN_NODES.map((n, i) => {
            const { duration, delay, variant, peak, dim } = blinkParams(i, 41);
            return (
              <g
                key={`n-${i}`}
                className={
                  reduce ? undefined : `vc-login-node-g vc-login-blink-v${variant}`
                }
                style={
                  reduce
                    ? { opacity: 0.75 }
                    : ({
                        transformBox: "fill-box",
                        transformOrigin: "center",
                        ["--blink-dur" as string]: `${duration}s`,
                        ["--blink-delay" as string]: `${delay}s`,
                        ["--blink-peak" as string]: String(peak),
                        ["--blink-dim" as string]: String(dim),
                      } as React.CSSProperties)
                }
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r * 3.6}
                  fill="url(#login-node-halo)"
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r * 1.7}
                  fill="url(#login-node-core)"
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r * 0.35}
                  fill="rgba(230,250,140,0.75)"
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* 記録: ログ行の気配（左右にはみ出して流れる） */}
      {!reduce &&
        [0, 1, 2, 3].map((i) => {
          const { duration, delay } = blinkParams(i, 29);
          return (
            <div
              key={`log-${i}`}
              className="vc-login-logline"
              style={{
                top: `${18 + i * 20}%`,
                left: "-8%",
                right: "-8%",
                animationDuration: `${duration + 4}s`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}

      {/* vignette: 中央を少し沈め、外周のネットワークは残す */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 52% 46% at 50% 48%, rgba(7,7,14,0.4) 0%, transparent 56%, rgba(7,7,14,0.5) 100%)",
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────
 * default variant（旧 AuthAmbientBg）
 * register / thanks 等向け。控えめな Pulse 発光 + グリッド。
 * ──────────────────────────────────────────────── */

function DefaultBackground({ reduce }: { reduce: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* base depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(200,232,0,0.07) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 50% 110%, rgba(200,232,0,0.04) 0%, transparent 50%), #07070e",
        }}
      />

      {/* soft grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)",
        }}
      />

      {/* electric orbs — slow, low-amplitude (not near 0.2Hz) */}
      <div
        className={`vc-auth-orb vc-auth-orb-a ${reduce ? "vc-auth-orb--static" : ""}`}
        style={{
          width: 420,
          height: 420,
          top: "8%",
          left: "50%",
          marginLeft: -210,
          background:
            "radial-gradient(circle, rgba(200,232,0,0.16) 0%, rgba(200,232,0,0.04) 40%, transparent 70%)",
        }}
      />
      <div
        className={`vc-auth-orb vc-auth-orb-b ${reduce ? "vc-auth-orb--static" : ""}`}
        style={{
          width: 280,
          height: 280,
          bottom: "12%",
          right: "8%",
          background:
            "radial-gradient(circle, rgba(200,232,0,0.10) 0%, transparent 68%)",
        }}
      />
      <div
        className={`vc-auth-orb vc-auth-orb-c ${reduce ? "vc-auth-orb--static" : ""}`}
        style={{
          width: 220,
          height: 220,
          top: "42%",
          left: "6%",
          background:
            "radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)",
        }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}

export function AuthAmbientBg({
  variant = "default",
}: {
  /** "login" = ログイン専用のネットワーク背景。省略時は汎用背景。 */
  variant?: "login" | "default";
}) {
  const reduceRaw = useReducedMotion();
  // 旧実装の truthy 分岐と同一挙動（null=未確定 → 通常アニメ）
  const reduce = reduceRaw ?? false;
  if (variant === "login") {
    return <LoginBackground reduce={reduce} />;
  }
  return <DefaultBackground reduce={reduce} />;
}
