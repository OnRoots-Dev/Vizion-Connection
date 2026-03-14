"use client";

import { useState, type MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ROLES, type RoleKey } from "./constants";
import { FoundingMemberBadge, SnsIcon } from "../ui";

const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const IG_PATH = "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z";
const YT_PATH = "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z";

export function ProfileCard3DDemo() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [role, setRole] = useState<RoleKey>("athlete");
  const s = ROLES[role];

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
            className="v12-face absolute inset-0 rounded-[14px] border border-white/10 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] shadow-[0_10px_42px_rgba(0,0,0,0.65)]"
            style={{ ["--rg-val" as string]: s.rg, overflow: "hidden" } as React.CSSProperties}
          >
            <div className="absolute inset-0 z-0" style={{ background: `linear-gradient(145deg, ${s.bg1} 0%, color-mix(in srgb, ${s.bg1} 50%, #000) 55%, #060606 100%)` }} />
            <div className="pointer-events-none absolute inset-0 z-[1] rounded-[14px] border border-white/12" style={{ background: "linear-gradient(128deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.025) 30%,transparent 55%)" }} />
            <div className="pointer-events-none absolute inset-px z-[1] rounded-[13px] border border-white/4" />
            <div className="pointer-events-none absolute -right-[10%] -top-[10%] z-[1] h-[180px] w-[180px] blur-[25px]" style={{ background: `radial-gradient(circle at center, ${s.rg}, transparent 70%)` }} />
            <div className="v12-shim absolute inset-0 z-[10] rounded-[14px] opacity-0" />
            <div className="pointer-events-none absolute bottom-[8px] right-[12px] z-[5] font-mono text-[5px] uppercase tracking-[0.2em] text-white/6 whitespace-nowrap">VIZION CONNECTION · PROOF OF EXISTENCE</div>

            {s.photo ? (
              <img
                src={s.photo}
                alt={s.name}
                loading="eager"
                className="pointer-events-none absolute bottom-0 right-[-8px] z-[3] h-[105%] w-[65%] object-cover [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
                style={{ WebkitMaskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 18%,black 42%)", maskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 18%,black 42%)" }}
              />
            ) : (
              <div
                className="pointer-events-none absolute bottom-0 right-[-8px] z-[3] flex h-[116%] w-[65%] items-center justify-center font-mono text-[74px] font-bold tracking-tight text-white/6 select-none [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
                style={{ WebkitMaskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 18%,black 42%)", maskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.4) 18%,black 42%)" }}
              >
                {initials}
              </div>
            )}

            <div className="absolute inset-0 z-[6] flex flex-col justify-between" style={{ padding: "16px 60% 14px 16px" }}>
              <div className="flex items-flex-start gap-[6px] pl-[10px]">
                <div className="flex flex-col items-start gap-[5px]">
                  <FoundingMemberBadge />
                  <span className="font-mono text-[9px] tracking-[0.08em] text-white/55">{s.region}</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-center gap-[3px]">
                <div className="font-mono text-[7px] font-[500] uppercase tracking-[0.22em] text-white/38">{s.label}</div>
                <div
                  className="whitespace-nowrap text-ellipsis text-[20px] font-[900] text-white"
                  style={{ lineHeight: 1.05, letterSpacing: "-0.01em", textShadow: "0 1px 0 rgba(255,255,255,0.5), 0 -1px 0 rgba(0,0,0,0.75), 0 2px 5px rgba(0,0,0,0.55), 0 0 14px rgba(255,255,255,0.05)" }}
                >
                  {s.name}
                </div>
                <div className="whitespace-nowrap font-mono text-[10.5px] tracking-[0.03em] text-white/52">{s.spec}</div>
                <div className="mt-1.25 flex items-center gap-[4px]">
                  <span className="text-[8px] text-[#FFD600]">★</span>
                  <span className="font-mono text-[7px] tracking-[0.12em] text-white/28">Cheer</span>
                  <span className="font-mono text-[13px] font-[700] leading-none tracking-tight text-[#FFD600]">{s.cheer}</span>
                </div>
              </div>

              <div className="flex flex-col gap-0">
                <div
                  className="font-light text-[14px] font-bold uppercase tracking-[0.13em] text-white/45 whitespace-nowrap"
                  style={{ textShadow: "0 1px 0 rgba(255,255,255,0.38), 0 -1px 0 rgba(0,0,0,0.65), 0 1px 3px rgba(0,0,0,0.45)" }}
                >
                  {s.memberId}
                </div>
                <div className="flip-hint mt-[4px] flex items-center font-mono text-[6px] uppercase tracking-[0.14em] text-white/18">Tap to see profile</div>
              </div>
            </div>

            <div className="absolute bottom-[10px] right-[12px] z-[7]">
              <img src="/images/Vizion_Connection_logo-wt.png" alt="Logo" className="h-12 w-auto opacity-60 mix-blend-lighten" />
            </div>
          </div>

          {/* ══ BACK FACE ══ */}
          <div
            className="v12-face absolute inset-0 rounded-[14px] border border-white/10 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] shadow-[0_10px_42px_rgba(0,0,0,0.65)]"
            style={{
              background: `linear-gradient(145deg, ${s.bg1} 0%, #000 100%)`,
              transform: "rotateY(180deg)",
              WebkitTransform: "rotateY(180deg)",
              overflow: "hidden",
            }}
          >
            <div className="absolute inset-0 z-0 opacity-40" style={{ background: `linear-gradient(145deg, ${s.bg1} 0%, #000 100%)` }} />
            <div className="pointer-events-none absolute inset-0 z-[1] rounded-[14px] border border-white/12" style={{ background: "linear-gradient(128deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.025) 30%,transparent 55%)" }} />
            <div className="pointer-events-none absolute inset-px z-[1] rounded-[13px] border border-white/4" />
            <div className="v12-shim absolute inset-0 z-[10] rounded-[14px] opacity-0" />
            <div className="pointer-events-none absolute bottom-[8px] right-[12px] z-[5] font-mono text-[5px] uppercase tracking-[0.2em] text-white/6 whitespace-nowrap">VIZION CONNECTION · PROOF OF EXISTENCE</div>

            {/* ══ BACK FACE ══ の写真部分 */}
            {s.backPhoto ? (
              <img
                src={s.backPhoto}
                alt={s.name}
                loading="eager"
                className="pointer-events-none absolute right-0 top-0 z-[2] h-full w-[60%] object-cover"
                style={{ WebkitMaskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 20%,black 45%)", maskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 20%,black 45%)" }}
              />
            ) : (
              <div
                className="pointer-events-none absolute right-0 top-0 z-[2] flex h-full w-[60%] items-center justify-center font-mono text-[60px] font-[700] tracking-tight text-white/4 select-none"
                style={{ WebkitMaskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 20%,black 45%)", maskImage: "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 20%,black 45%)" }}
              >
                {initials}
              </div>
            )}

            <div className="absolute inset-0 z-[30] flex flex-col justify-between" style={{ padding: "14px 13px 16px" }}>
              <div className="pointer-events-none flex items-center justify-between">
                <img src="/images/Vizion_Connection_logo-wt.png" alt="Logo" className="h-10 w-auto opacity-60 mix-blend-lighten" />
                <div className="flex items-center gap-[6px]">
                  <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full" style={{ background: s.rl, boxShadow: `0 0 6px ${s.rl}` }} />
                  <span className="font-mono text-[7.5px] font-[600] uppercase tracking-[0.18em] text-white/45">{s.label}</span>
                </div>
                <span className="font-mono text-[6px] uppercase tracking-[0.16em] text-white/18">Official Card</span>
              </div>

              <div className="pointer-events-none flex flex-1 flex-col justify-center items-start gap-[2px] py-[4px]">
                <div
                  className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-[900] text-white/88"
                  style={{ lineHeight: 1.1, letterSpacing: "-0.01em", textShadow: "0 1px 0 rgba(255,255,255,0.4), 0 -1px 0 rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)" }}
                >
                  {s.name}
                </div>
                <div className="font-mono text-[7.5px] tracking-[0.04em] text-white/38">{s.spec} · {s.region}</div>
              </div>

              <div className="pointer-events-none my-[6px] h-px opacity-40" style={{ background: `linear-gradient(90deg, ${s.rl} 0%, transparent 100%)` }} />

              <div className="pointer-events-none min-h-[1em] pb-[2px] font-sans text-[10px] leading-[1.6] tracking-[0.01em] text-white/50 text-left">
                {s.comment}
              </div>

              <div className="flex items-end justify-between gap-2.5">
                <div
                  className="relative z-[50] flex flex-col items-start gap-[5px] pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="pointer-events-none font-mono text-[7px] uppercase tracking-[0.14em] text-white/35">Connect</span>
                  <div className="flex gap-[6px]">
                    <SnsIcon label="X" color={s.rl} path={X_PATH} />
                    <SnsIcon label="Instagram" color={s.rl} path={IG_PATH} />
                    <SnsIcon label="YouTube" color={s.rl} path={YT_PATH} />
                  </div>
                </div>
                <div className="pointer-events-none flex items-end gap-[8px]">
                  <div className="flex flex-col items-end gap-[2px]">
                    <span className="font-mono text-[6px] uppercase tracking-[0.14em] text-white/22">Profile URL</span>
                    <span className="max-w-[110px] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[8.5px] tracking-[0.03em] text-white/58">{s.url}</span>
                  </div>
                  <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[4px] bg-white/94 p-[3px]">
                    <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-[1px]">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="rounded-[1px]" style={{ background: [0, 1, 4, 5, 2, 7, 8, 11, 12, 13, 10, 15, 3, 6, 9, 14].indexOf(i) % 3 === 0 ? "#111" : "#fff" }} />
                      ))}
                    </div>
                  </div>
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
