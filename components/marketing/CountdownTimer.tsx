"use client";

import { useState, useEffect } from "react";

const PHASES = [
  {
    label: "先行登録",
    deadline: new Date("2026-03-31T23:59:00+09:00"), // ← 修正
    next: "先行登録締め切りまで",
    color: "#C1272D",
  },
  {
    label: "β版",
    deadline: new Date("2026-04-08T23:59:00+09:00"), // ← 修正
    next: "β版終了まで",
    color: "#1A7A4A",
  },
  {
    label: "正式版",
    deadline: new Date("2099-01-01T00:00:00+09:00"),
    next: "正式版スタート",
    color: "#1B3A8C",
  },
] as const;

function getCurrentPhase() {
  const now = Date.now();
  if (now < PHASES[0].deadline.getTime()) return PHASES[0];
  if (now < PHASES[1].deadline.getTime()) return PHASES[1];
  return PHASES[2];
}

interface TimeLeft { d: number; h: number; m: number; s: number; ready: boolean; }

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ d: 0, h: 0, m: 0, s: 0, ready: false });
  const [phase, setPhase] = useState(getCurrentPhase());

  useEffect(() => {
    const tick = () => {
      const current = getCurrentPhase();
      setPhase(current);
      const diff = Math.max(0, current.deadline.getTime() - Date.now());
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        ready: true,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft.ready) return null;

  const rl = phase.color;
  const pad = (n: number) => String(n).padStart(2, "0");
  const units = [
    { label: "DAY", value: timeLeft.d },
    { label: "HOUR", value: timeLeft.h },
    { label: "MIN", value: timeLeft.m },
    { label: "SEC", value: timeLeft.s },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "32px 0" }}>

      {/* フェーズバッジ */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", background: `${rl}15`, border: `1px solid ${rl}40` }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: rl, boxShadow: `0 0 6px ${rl}`, display: "inline-block" }} />
        <span style={{ fontSize: "11px", fontWeight: 800, color: rl, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" }}>
          {phase.label}
        </span>
      </div>

      {/* カウントダウン数字 */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {units.map(({ label, value }, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "monospace", fontSize: "40px", fontWeight: 900,
                color: "#fff", lineHeight: 1, letterSpacing: "-0.02em",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${rl}30`,
                borderRadius: "10px", padding: "10px 14px",
                minWidth: "68px", textAlign: "center",
              }}>
                {pad(value)}
              </div>
              <div style={{
                fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.3)", marginTop: "6px",
                textTransform: "uppercase", fontFamily: "monospace",
              }}>
                {label}
              </div>
            </div>
            {i < units.length - 1 && (
              <span style={{ fontSize: "28px", fontWeight: 900, color: `${rl}60`, marginBottom: "20px" }}>:</span>
            )}
          </div>
        ))}
      </div>

      {/* 残り時間ラベル */}
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0, fontFamily: "monospace", letterSpacing: "0.08em" }}>
        {phase.next}
      </p>

      {/* フェーズスケジュール */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", maxWidth: "360px", marginTop: "8px" }}>
        {[
          { label: "先行登録", period: "3/23 MON 17:00 〜 3/31 TUE 23:59", color: "#C1272D", active: phase.label === "先行登録" }, // ← 修正
          { label: "β版", period: "4/1 WED 10:00 〜 4/8 WED 23:59", color: "#1A7A4A", active: phase.label === "β版" },      // ← 修正
          { label: "正式版", period: "4/9 THU 10:00 〜", color: "#1B3A8C", active: phase.label === "正式版" },    // ← 修正
        ].map(({ label, period, color, active }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 12px", borderRadius: "8px",
            background: active ? `${color}12` : "rgba(255,255,255,0.02)",
            border: `1px solid ${active ? color + "35" : "rgba(255,255,255,0.06)"}`,
            opacity: active ? 1 : 0.45,
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: active ? color : "rgba(255,255,255,0.2)", flexShrink: 0, boxShadow: active ? `0 0 6px ${color}` : "none", display: "inline-block" }} />
            <span style={{ fontSize: "10px", fontWeight: 800, color: active ? color : "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: "0.1em", minWidth: "52px" }}>
              {label}
            </span>
            <span style={{ fontSize: "10px", color: active ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)", fontFamily: "monospace", letterSpacing: "0.03em" }}>
              {period}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}