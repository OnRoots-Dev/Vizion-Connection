"use client";
// app/(app)/dashboard/career/CareerDashboardClient.tsx

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Pencil, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { ROLE_CONFIG } from "@/types/career";
import type { UserRole } from "@/types/career";
import type { CareerProfileRow } from "@/lib/supabase/career-profiles";
import UnifiedProfileModal from "@/components/unified-profile/UnifiedProfileModal";

// ─── Props ────────────────────────────────────────────────

interface Props {
  user: {
    slug: string;
    displayName: string;
    role: string;
    sport: string;
    region: string;
    instagram: string;
    xUrl: string;
    tiktok: string;
    cheerCount: number;
    avatarUrl: string | null;
  };
  careerProfile: CareerProfileRow | null;
  onBack?: () => void;
  embedded?: boolean;
}

// ─── Component ────────────────────────────────────────────

export default function CareerDashboardClient({ user, careerProfile, onBack, embedded = false }: Props) {
  const {
    data,
    resetWizard,
    initFromUser,
    initFromCareerProfile,
  } = useCareerWizard();

  const [wizardOpen, setWizardOpen] = useState(false);

  const role = user.role as UserRole;
  const cfg = ROLE_CONFIG[role];
  const color = cfg?.color ?? "#C1272D";
  const hasCareer = !!(careerProfile || data.episodes.length > 0 || data.tagline);

  // ── サーバーデータをストアに読み込む ────────────────────────
  useEffect(() => {
    resetWizard();
    // usersテーブルのデータ
    initFromUser({
      role: role,
      name: user.displayName,
      slug: user.slug,
      sport: user.sport,
      region: user.region,
      instagram: user.instagram,
      xUrl: user.xUrl,
      tiktok: user.tiktok,
    });

    // career_profilesのデータ（あれば上書き）
    if (careerProfile) {
      initFromCareerProfile(careerProfile);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const completeness = [
    { icon: "💬", label: "キャッチコピー", ok: !!(careerProfile?.tagline || data.tagline) },
    { icon: "📝", label: "自己紹介", ok: !!(careerProfile?.bio_career || data.bioCareer) },
    { icon: "📅", label: "キャリア年表", ok: (careerProfile?.episodes?.length ?? data.episodes.length) > 0 },
    { icon: "💪", label: "スキル", ok: (careerProfile?.skills?.length ?? data.skills.length) > 0 },
  ];
  const completedCount = completeness.filter((c) => c.ok).length;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    window.location.href = "/dashboard";
  };
  const completePct = Math.round((completedCount / completeness.length) * 100);

  return (
    <div
      className="relative"
      style={{ background: embedded ? "transparent" : "var(--vz-bg, #08080f)", color: "var(--vz-text, #ffffff)" }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      {!embedded && <header
        className="sticky top-0 z-30 border-b px-5 py-3.5 flex items-center justify-between"
        style={{
          background: "color-mix(in srgb, var(--vz-bg, #08080f) 88%, transparent)",
          borderColor: "var(--vz-border, rgba(255,255,255,0.07))",
          backdropFilter: "blur(20px)",
        }}
      >
        <button
          onClick={handleBack}
          className="flex items-center gap-2 transition-colors"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <ArrowLeft size={14} />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--vz-sub, rgba(255,255,255,0.45))" }}>
            Dashboard
          </span>
        </button>
        <span
          className="font-mono text-[9px] tracking-[0.28em] uppercase"
          style={{ color }}
        >
          Career Page
        </span>
      </header>}

      <div className="max-w-[600px] mx-auto px-5 py-4">

        {/* ── Profile header ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}
          >
            {user.avatarUrl
              ? (
                <Image
                  src={user.avatarUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded-2xl"
                />
              )
              : cfg?.icon ?? "👤"}
          </div>
          <div>
            <p className="font-extrabold text-[17px] tracking-[-0.02em]">
              {user.displayName}
            </p>
            <p
              className="font-mono text-[10px] tracking-[0.16em] uppercase mt-0.5"
              style={{ color }}
            >
              {cfg?.labelEn ?? role}
              {user.sport ? ` · ${user.sport}` : ""}
            </p>
          </div>
        </motion.div>

        {hasCareer ? (
          <>
            {/* ── Completeness bar ───────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-4 p-4 rounded-2xl border"
              style={{
                background: `${color}06`,
                borderColor: `${color}22`,
              }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <p className="font-mono text-[9px] tracking-[0.22em] uppercase" style={{ color: "var(--vz-sub, rgba(255,255,255,0.45))" }}>
                  完成度
                </p>
                <p
                  className="font-mono text-[13px] font-medium"
                  style={{ color }}
                >
                  {completePct}%
                </p>
              </div>
              <div className="h-[3px] rounded-full overflow-hidden mb-3" style={{ background: "var(--vz-border, rgba(255,255,255,0.07))" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${completePct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {completeness.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px]"
                    style={
                      item.ok
                        ? { background: `${color}14`, color, border: `1px solid ${color}35` }
                        : { background: "var(--vz-surface, rgba(255,255,255,0.03))", color: "var(--vz-sub, rgba(255,255,255,0.45))", border: "1px solid var(--vz-border, rgba(255,255,255,0.07))" }
                    }
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {item.ok
                      ? <span className="text-[10px]">✓</span>
                      : <span className="text-[10px] opacity-40">未入力</span>
                    }
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Actions ────────────────────────────────── */}
            <div className="flex flex-col gap-2.5 mb-6">
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => setWizardOpen(true)}
                className="flex items-center gap-3 p-4 rounded-2xl border transition-all group"
                style={{
                  background: "var(--vz-surface, rgba(255,255,255,0.03))",
                  borderColor: "var(--vz-border, rgba(255,255,255,0.07))",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "color-mix(in srgb, var(--vz-surface, rgba(255,255,255,0.03)) 70%, var(--vz-text, #fff) 6%)";
                  e.currentTarget.style.borderColor = "color-mix(in srgb, var(--vz-border, rgba(255,255,255,0.07)) 65%, var(--vz-text, #fff) 18%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--vz-surface, rgba(255,255,255,0.03))";
                  e.currentTarget.style.borderColor = "var(--vz-border, rgba(255,255,255,0.07))";
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18`, color }}
                >
                  <Pencil size={15} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[13px] font-bold">プロフィール・キャリアを編集</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--vz-sub, rgba(255,255,255,0.45))" }}>
                    {(careerProfile?.episodes?.length ?? 0)}件のエピソード ·{" "}
                    {(careerProfile?.skills?.length ?? 0)}スキル
                  </p>
                </div>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="var(--vz-sub, rgba(255,255,255,0.45))" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Link
                  href={`/u/${user.slug}`}
                  className="flex items-center gap-3 p-4 rounded-2xl border transition-all"
                  style={{
                    background: "var(--vz-surface, rgba(255,255,255,0.03))",
                    borderColor: "var(--vz-border, rgba(255,255,255,0.07))",
                  }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/[0.05] text-white/40">
                    <Eye size={15} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold">公開ページを見る</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--vz-sub, rgba(255,255,255,0.45))" }}>
                      vizion.connection/u/{user.slug}
                    </p>
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* ── Episodes preview ───────────────────────── */}
            {(careerProfile?.episodes?.length ?? 0) > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="font-mono text-[9px] tracking-[0.24em] uppercase mb-3" style={{ color: "var(--vz-sub, rgba(255,255,255,0.45))" }}>
                  キャリア年表
                </p>
                <div className="flex flex-col gap-1.5">
                  {(careerProfile!.episodes as any[]).slice(0, 5).map(
                    (ep: any, i: number) => (
                      <div
                        key={ep.id ?? i}
                        className="flex items-center gap-3 px-3.5 py-3 rounded-xl"
                        style={{
                          background: "var(--vz-surface, rgba(255,255,255,0.03))",
                          border: "1px solid var(--vz-border, rgba(255,255,255,0.07))",
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-medium flex-shrink-0"
                          style={{ background: `${color}18`, color }}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold truncate" style={{ color: "color-mix(in srgb, var(--vz-text, #fff) 78%, transparent)" }}>
                            {ep.role}
                            {ep.org ? (
                              <span className="font-normal" style={{ color: "var(--vz-sub, rgba(255,255,255,0.45))" }}> — {ep.org}</span>
                            ) : null}
                          </p>
                          <p className="font-mono text-[9px] mt-0.5" style={{ color: "var(--vz-sub, rgba(255,255,255,0.45))" }}>
                            {ep.period}
                          </p>
                        </div>
                        {ep.isCurrent && (
                          <span
                            className="font-mono text-[8px] tracking-[0.1em] uppercase px-2 py-1 rounded flex-shrink-0"
                            style={{ background: `${color}18`, color }}
                          >
                            現在
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          /* ── Empty state ──────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "var(--vz-surface, rgba(255,255,255,0.03))", border: "1px solid var(--vz-border, rgba(255,255,255,0.07))" }}
            >
              <Sparkles size={24} className="text-white/25" />
            </div>
            <h2 className="text-[18px] font-extrabold tracking-[-0.025em] mb-2">
              キャリアページを作ろう
            </h2>
            <p className="text-[13px] text-white/38 leading-relaxed mb-7 max-w-xs mx-auto">
              いくつかの質問に答えるだけで、プロフェッショナルなキャリアストーリーページが自動生成されます。
            </p>
            <button
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[13px] text-white transition-all hover:brightness-110 active:scale-[0.97]"
              style={{
                background: color,
                boxShadow: `0 0 28px ${color}40`,
              }}
            >
              <Sparkles size={14} />
              プロフィール・キャリアを登録する
            </button>
          </motion.div>
        )}
      </div>

      {/* ── Wizard modal ────────────────────────────────── */}
      <AnimatePresence>
        {wizardOpen && (
          <UnifiedProfileModal
            isOpen={wizardOpen}
            onClose={() => setWizardOpen(false)}
            user={user}
            onCompleted={() => setWizardOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}



