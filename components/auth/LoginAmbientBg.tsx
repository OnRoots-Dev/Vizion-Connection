// components/auth/LoginAmbientBg.tsx
// ログイン画面専用背景。「記録」と「繋がる」を控えめに可視化。
// ブランド: electric #C8E800 / ダーク #07070e。reduced-motion 時は静止。

"use client";

import { useReducedMotion } from "framer-motion";

/** 繋がる: ノード座標（viewBox 0–100） */
const NODES = [
  { x: 12, y: 28, r: 1.1, delay: 0 },
  { x: 28, y: 42, r: 0.9, delay: 0.4 },
  { x: 18, y: 62, r: 1.0, delay: 0.8 },
  { x: 42, y: 22, r: 0.85, delay: 0.2 },
  { x: 58, y: 38, r: 1.15, delay: 0.6 },
  { x: 72, y: 24, r: 0.9, delay: 1.0 },
  { x: 78, y: 52, r: 1.0, delay: 0.3 },
  { x: 62, y: 68, r: 0.95, delay: 0.9 },
  { x: 88, y: 36, r: 0.8, delay: 1.2 },
  { x: 48, y: 58, r: 1.05, delay: 0.5 },
  { x: 34, y: 74, r: 0.85, delay: 1.1 },
  { x: 82, y: 72, r: 0.9, delay: 0.7 },
] as const;

/** 繋がる: エッジ（ノード index） */
const EDGES: readonly [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 4],
  [4, 5],
  [4, 6],
  [5, 8],
  [6, 7],
  [7, 9],
  [1, 9],
  [9, 10],
  [6, 11],
  [7, 11],
  [2, 10],
  [3, 9],
];

/** 記録: タイムライン上の「エントリ」位置 */
const RECORD_MARKS = [
  { y: 18, delay: 0 },
  { y: 32, delay: 1.2 },
  { x: 0, y: 46, delay: 2.4 },
  { y: 58, delay: 0.6 },
  { y: 72, delay: 1.8 },
  { y: 84, delay: 3.0 },
] as const;

/**
 * ログイン背景。pointer-events: none。
 * - 記録: 左の縦タイムライン + 点滅する記録ノード
 * - 繋がる: 薄いネットワークの線とノード
 */
export function LoginAmbientBg() {
  const reduce = useReducedMotion();

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
            "radial-gradient(ellipse 80% 55% at 50% -8%, rgba(200,232,0,0.08) 0%, transparent 52%), radial-gradient(ellipse 60% 45% at 80% 90%, rgba(200,232,0,0.04) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 70%, rgba(60,140,255,0.04) 0%, transparent 55%), #07070e",
        }}
      />

      {/* soft grid — 記録の「ノート」感 */}
      <div
        className="absolute inset-0 opacity-[0.28]"
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

      {/* electric orbs */}
      <div
        className={`vc-auth-orb vc-auth-orb-a ${reduce ? "vc-auth-orb--static" : ""}`}
        style={{
          width: 400,
          height: 400,
          top: "6%",
          left: "50%",
          marginLeft: -200,
          background:
            "radial-gradient(circle, rgba(200,232,0,0.14) 0%, rgba(200,232,0,0.03) 42%, transparent 70%)",
        }}
      />
      <div
        className={`vc-auth-orb vc-auth-orb-b ${reduce ? "vc-auth-orb--static" : ""}`}
        style={{
          width: 260,
          height: 260,
          bottom: "10%",
          right: "6%",
          background:
            "radial-gradient(circle, rgba(200,232,0,0.09) 0%, transparent 68%)",
        }}
      />
      <div
        className={`vc-auth-orb vc-auth-orb-c ${reduce ? "vc-auth-orb--static" : ""}`}
        style={{
          width: 200,
          height: 200,
          top: "48%",
          left: "4%",
          background:
            "radial-gradient(circle, rgba(60,140,255,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── 繋がる: ネットワーク ── */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.55 }}
      >
        <defs>
          <linearGradient id="login-edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(200,232,0,0.0)" />
            <stop offset="40%" stopColor="rgba(200,232,0,0.35)" />
            <stop offset="100%" stopColor="rgba(60,140,255,0.2)" />
          </linearGradient>
        </defs>

        {EDGES.map(([a, b], i) => {
          const n0 = NODES[a];
          const n1 = NODES[b];
          return (
            <line
              key={`e-${i}`}
              x1={n0.x}
              y1={n0.y}
              x2={n1.x}
              y2={n1.y}
              stroke="url(#login-edge-grad)"
              strokeWidth={0.12}
              className={reduce ? undefined : "vc-login-edge"}
              style={
                reduce
                  ? { opacity: 0.35 }
                  : ({ ["--edge-delay" as string]: `${i * 0.35}s` } as React.CSSProperties)
              }
            />
          );
        })}

        {NODES.map((n, i) => (
          <g
            key={`n-${i}`}
            className={reduce ? undefined : "vc-login-node-g"}
            style={
              reduce
                ? undefined
                : ({
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    animationDelay: `${n.delay}s`,
                  } as React.CSSProperties)
            }
          >
            {!reduce && (
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r * 2.6}
                fill="rgba(200,232,0,0.1)"
                className="vc-login-node-halo"
              />
            )}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="rgba(200,232,0,0.6)"
            />
          </g>
        ))}
      </svg>

      {/* ── 記録: 縦タイムライン + エントリ ── */}
      <div
        className="absolute left-[8%] top-[14%] bottom-[14%] w-px sm:left-[12%]"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(200,232,0,0.22) 15%, rgba(200,232,0,0.22) 85%, transparent)",
          opacity: 0.7,
        }}
      >
        {RECORD_MARKS.map((m, i) => (
          <span
            key={i}
            className={reduce ? "vc-login-record-mark vc-login-record-mark--static" : "vc-login-record-mark"}
            style={{
              top: `${m.y}%`,
              animationDelay: reduce ? undefined : `${m.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 記録: 右側の薄いジャーニー線（対称のリズム） */}
      <div
        className="absolute right-[10%] top-[20%] bottom-[18%] w-px sm:right-[14%]"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(200,232,0,0.12) 20%, rgba(200,232,0,0.12) 80%, transparent)",
          opacity: 0.55,
        }}
      >
        {[22, 40, 55, 70].map((y, i) => (
          <span
            key={i}
            className={
              reduce
                ? "vc-login-record-mark vc-login-record-mark--static vc-login-record-mark--right"
                : "vc-login-record-mark vc-login-record-mark--right"
            }
            style={{
              top: `${y}%`,
              animationDelay: reduce ? undefined : `${i * 0.9 + 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* 記録: ゆっくり流れる「ログ行」の気配（横線のフェード） */}
      {!reduce &&
        [0, 1, 2].map((i) => (
          <div
            key={`log-${i}`}
            className="vc-login-logline"
            style={{
              top: `${28 + i * 18}%`,
              animationDelay: `${i * 2.8}s`,
            }}
          />
        ))}

      {/* vignette — カード可読性を守る */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 48%, transparent 25%, rgba(7,7,14,0.55) 70%, rgba(7,7,14,0.88) 100%)",
        }}
      />
    </div>
  );
}
