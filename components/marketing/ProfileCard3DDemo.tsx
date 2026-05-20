"use client";

import { useState, type MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { ROLES, type RoleKey } from "./constants";
import { FoundingMemberBadge } from "../ui/FoundingMemberBadge";

const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const IG_PATH = "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z";
const YT_PATH = "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z";

function BackSnsIcon({
  label,
  href = "#",
  color,
  path,
}: {
  label: string;
  href?: string;
  color: string;
  path: string;
}) {
  return (
    <a
      href={href}
      target={href !== "#" ? "_blank" : undefined}
      rel={href !== "#" ? "noopener noreferrer" : undefined}
      title={label}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] no-underline"
      style={{ background: `${color}18`, border: `1px solid ${color}35` }}
      onClick={(e) => e.stopPropagation()}
    >
      <svg viewBox="0 0 24 24" width={11} height={11} fill={color}>
        <path d={path} />
      </svg>
    </a>
  );
}

export function ProfileCard3DDemo() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [role, setRole] = useState<RoleKey>("athlete");
  const s = ROLES[role];
  const frontPhotoRatio = "62%";

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 180, damping: 22, mass: 0.6 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (isFlipped) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() { mx.set(0); my.set(0); }

  const initials = s.name.split(" ").map(w => w[0]).join("");

  return (
    <div className="w-full min-w-0">
      {/* ── Role Switcher ── */}
      <div className="mx-auto mb-10 grid max-w-[440px] grid-cols-2 gap-4 sm:grid-cols-4">
        {(Object.keys(ROLES) as RoleKey[]).map(r => (
          <button
            key={r}
            onClick={() => { setRole(r); setIsFlipped(false); }}
            className="flex items-center gap-[7px] rounded-[3px] border px-[14px] py-[7px] font-mono text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-200"
            style={{
              borderColor: role === r ? ROLES[r].rl : "rgba(255,255,255,0.08)",
              color: role === r ? ROLES[r].rl : "rgba(255,255,255,0.28)",
              background: role === r ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.03)",
              boxShadow: role === r ? `0 0 14px ${ROLES[r].rl}30` : "none",
            }}
          >
            <span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: ROLES[r].rl, opacity: role === r ? 1 : 0.55 }} />
            {r}
          </button>
        ))}
      </div>

      {/* ── Card Stage ── */}
      <div className="relative mx-auto aspect-[400/240] w-full max-w-[440px] [perspective:1200px]">
        <motion.div
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest("a")) return;
            setIsFlipped(f => !f);
          }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 1.0, ease: [0.68, 0, 0.32, 1] }}
          style={{
            rotateX: isFlipped ? 0 : rotateX,
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
          } as React.CSSProperties}
          className="v12-wrap relative h-full w-full cursor-pointer"
        >
          {/* ══ FRONT FACE ══ */}
          <div
            className="v12-face absolute inset-0 rounded-[14px] border border-white/10 shadow-[0_10px_42px_rgba(0,0,0,0.65)]"
            style={{
              ["--rg-val" as string]: s.rg,
              overflow: "hidden",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              opacity: isFlipped ? 0 : 1,
              pointerEvents: isFlipped ? "none" : "auto",
              transition: "opacity 0s 0.5s",
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 z-0" style={{ background: `linear-gradient(145deg, ${s.bg1} 0%, color-mix(in srgb, ${s.bg1} 40%, #000) 60%, #060606 100%)` }} />
            <div className="pointer-events-none absolute right-[25%] top-[-15%] z-[1] h-[200px] w-[200px]" style={{ background: `radial-gradient(circle, ${s.rl}22, transparent 70%)` }} />
            <div className="pointer-events-none absolute -right-[10%] -top-[12%] z-[1] h-[220px] w-[220px] opacity-90 blur-[12px]" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)" }} />
            <div className="pointer-events-none absolute inset-0 z-[1] rounded-[14px] border border-white/12" style={{ background: "linear-gradient(128deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.025) 30%,transparent 55%)" }} />
            <div className="pointer-events-none absolute inset-px z-[1] rounded-[13px] border border-white/4" />
            <div className="v12-shim absolute inset-0 z-[10] rounded-[14px] opacity-0" />
            <div className="pointer-events-none absolute inset-0 z-[6] rounded-[14px]" style={{ boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)` }} />
            <div className="pointer-events-none absolute bottom-[8px] right-[12px] z-[5] font-mono text-[5px] uppercase tracking-[0.2em] text-white/6 whitespace-nowrap">VIZION CONNECTION · PROOF OF EXISTENCE</div>

            <div
              className="pointer-events-none absolute top-0 bottom-0 right-0 z-[3] h-full overflow-hidden"
              style={{
                width: frontPhotoRatio,
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 20%, black 45%)",
                maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 20%, black 45%)",
              }}
            >
              {s.photo ? (
                <Image
                  src={s.photo}
                  alt={s.name}
                  fill
                  sizes="(min-width: 768px) 440px, 100vw"
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-[80px] font-[900] tracking-tight text-white/5 select-none">
                  {initials}
                </div>
              )}
            </div>

            <div className="absolute inset-0 z-[7] flex flex-col justify-between" style={{ padding: "16px 14px 14px 16px" }}>
              <div className="flex flex-col items-start gap-[5px]">
                <div className="inline-flex"><FoundingMemberBadge /></div>
                <span className="font-mono text-[8.5px] tracking-[0.06em] text-white/50">{s.region}</span>
              </div>

              <div className="flex flex-1 flex-col justify-center gap-[3px]">
                <div className="font-mono text-[7px] font-[500] uppercase tracking-[0.22em] text-white/38">{s.label}</div>
                <div
                  className="max-w-full overflow-hidden whitespace-nowrap text-ellipsis font-[900] text-white"
                  style={{ fontSize: "clamp(14px, 4.2vw, 18px)", lineHeight: 1.04, letterSpacing: "-0.01em", textShadow: "0 1px 0 rgba(255,255,255,0.5), 0 -1px 0 rgba(0,0,0,0.75), 0 2px 5px rgba(0,0,0,0.55), 0 0 14px rgba(255,255,255,0.05)" }}
                >
                  {s.name}
                </div>
                <div className="overflow-hidden whitespace-nowrap text-ellipsis font-mono tracking-[0.03em] text-white/52" style={{ fontSize: "clamp(9px, 2.8vw, 10.5px)" }}>{s.spec}</div>
                <div className="mt-[5px] flex items-center gap-[4px]">
                  <span className="text-[9px] text-[#FFD600]">★</span>
                  <span className="font-mono text-[7px] tracking-[0.12em] text-white/28">Cheer</span>
                  <span className="font-mono text-[16px] font-[800] leading-none tracking-tight text-[#FFD600]">{s.cheer}</span>
                </div>
              </div>

              <div className="flex flex-col gap-0" />
            </div>

            <div className="pointer-events-none absolute left-[16px] right-[16px] bottom-[14px] z-[8]">
              <div className="flex max-w-[60%] flex-col gap-[4px]">
                <span
                  style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.26)", textTransform: "uppercase" }}
                >
                  Account ID
                </span>
                <span
                  className="block whitespace-nowrap"
                  style={{ display: "block", fontFamily: "monospace", fontSize: "clamp(12px, 3.0vw, 17px)", fontWeight: 950, letterSpacing: "clamp(0.06em, 0.5vw, 0.16em)", color: "rgba(255,255,255,0.72)", textShadow: "0 1px 0 rgba(255,255,255,0.42), 0 -1px 0 rgba(0,0,0,0.88), 0 2px 8px rgba(0,0,0,0.62)", filter: "drop-shadow(0 0 10px rgba(0,0,0,0.28))" }}
                >
                  {s.memberId}
                </span>
                <div
                  className="mt-[2px]"
                  style={{ fontFamily: "monospace", fontSize: 6, letterSpacing: "0.14em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase" }}
                >
                  - Tap to see profile
                </div>
              </div>
            </div>

            <div className="absolute bottom-[10px] right-[10px] z-[7]">
              <Image
                src="/images/Vizion_Connection_logo-wt.png"
                alt="Logo"
                width={140}
                height={38}
                className="opacity-[0.55] mix-blend-lighten"
                style={{ width: "auto", height: 38 }}
              />
            </div>
          </div>

          {/* ══ BACK FACE ══ */}
          <div
            className="v12-face absolute inset-0 rounded-[14px] border border-white/10 shadow-[0_10px_42px_rgba(0,0,0,0.65)]"
            style={{
              background: `linear-gradient(145deg, ${s.bg1} 0%, #000 100%)`,
              transform: "rotateY(180deg)",
              WebkitTransform: "rotateY(180deg)",
              overflow: "hidden",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              opacity: isFlipped ? 1 : 0,
              pointerEvents: isFlipped ? "auto" : "none",
              transition: "opacity 0s 0.5s",
            }}
          >
            <div className="absolute inset-0 z-0 opacity-40" style={{ background: `linear-gradient(145deg, ${s.bg1} 0%, #000 100%)` }} />
            <div className="pointer-events-none absolute inset-0 z-[1] rounded-[14px] border border-white/12" style={{ background: "linear-gradient(128deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.025) 30%,transparent 55%)" }} />
            <div className="pointer-events-none absolute inset-px z-[1] rounded-[13px] border border-white/4" />
            <div className="v12-shim absolute inset-0 z-[10] rounded-[14px] opacity-0" />
            <div className="pointer-events-none absolute bottom-[8px] right-[12px] z-[5] font-mono text-[5px] uppercase tracking-[0.2em] text-white/6 whitespace-nowrap">VIZION CONNECTION · PROOF OF EXISTENCE</div>

            {s.backPhoto ? (
              <Image
                src={s.backPhoto}
                alt={s.name}
                width={1}
                height={1}
                unoptimized
                sizes="(max-width: 768px) 60vw, 60%"
                className="pointer-events-none absolute right-0 top-0 z-[2]"
                style={{ width: "60%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.7, WebkitMaskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 20%,black 45%)", maskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 20%,black 45%)" }}
              />
            ) : (
              <div
                className="pointer-events-none absolute right-0 top-0 z-[2] flex h-full w-[60%] items-center justify-center select-none"
                style={{ fontFamily: "monospace", fontSize: 60, fontWeight: 700, color: "rgba(255,255,255,0.04)", WebkitMaskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 20%,black 45%)", maskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 20%,black 45%)" }}
              >
                {initials}
              </div>
            )}

            <div className="absolute inset-0 z-[30] flex flex-col justify-between" style={{ padding: "14px 13px 16px" }}>
              <div className="pointer-events-none flex items-center justify-between">
                <Image
                  src="/images/Vizion_Connection_logo-wt.png"
                  alt="Logo"
                  width={120}
                  height={30}
                  className="opacity-60 mix-blend-lighten"
                  style={{ width: "auto", height: 30 }}
                />
                <div className="flex items-center gap-[5px]">
                  <span className="inline-block h-[5px] w-[5px] flex-shrink-0 rounded-full" style={{ background: s.rl, boxShadow: `0 0 5px ${s.rl}` }} />
                  <span style={{ fontFamily: "monospace", fontSize: 7, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>{s.label}</span>
                </div>
                <span style={{ fontFamily: "monospace", fontSize: 5.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>Official Card</span>
              </div>

              <div className="pointer-events-none flex flex-1 flex-col justify-center gap-[2px]">
                <div style={{ fontSize: 14, fontWeight: 900, color: "rgba(255,255,255,0.88)", lineHeight: 1.08, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 1px 0 rgba(255,255,255,0.4), 0 -1px 0 rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)" }}>
                  {s.name}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  @{s.url.replace(/^.*\/u\//, "")}{s.region ? ` · ${s.region}` : ""}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.02em", color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.spec}
                </div>
              </div>

              <div className="pointer-events-none my-[5px] h-px opacity-40" style={{ background: `linear-gradient(90deg, ${s.rl} 0%, transparent 100%)` }} />

              <div className="pointer-events-none min-h-[1em] pb-[2px] text-[9.5px] leading-[1.6] text-white/40">
                {s.comment}
              </div>

              <div className="flex items-end justify-between gap-[8px]">
                <div
                  className="relative z-[50] flex flex-col gap-[5px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}>Connect</span>
                  <div className="flex gap-[5px]">
                    <BackSnsIcon label="X" color={s.rl} path={X_PATH} />
                    <BackSnsIcon label="Instagram" color={s.rl} path={IG_PATH} />
                    <BackSnsIcon label="YouTube" color={s.rl} path={YT_PATH} />
                  </div>
                </div>
                <div className="pointer-events-none flex items-end gap-[7px]">
                  <div className="flex flex-col items-end gap-[2px]">
                    <span style={{ fontFamily: "monospace", fontSize: 5.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>Profile URL</span>
                    <span style={{ fontFamily: "monospace", fontSize: 7.5, color: "rgba(255,255,255,0.5)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.url}</span>
                  </div>
                  <div className="h-[44px] w-[44px] flex-shrink-0 rounded-[3px] bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 space-y-2 text-center">
        <p className="text-[10px] tracking-wider text-white/20">
          ※サンプルカードの写真はAIで作成された架空の人物です。
        </p>
        <p className="mx-auto max-w-[620px] text-sm leading-relaxed text-white/45">
          プロフィールカードは「役割」と「信頼（Cheer）」の入口。<br className="md:hidden" />
          タップして詳細を確認してください。
        </p>
      </div>
    </div>
  );
}
