"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { PublicProfileData } from "@/features/profile/types";
import type { CareerProfileRow } from "@/lib/supabase/career-profiles";

type PreviewPayload = {
  profile: PublicProfileData;
  careerProfile?: CareerProfileRow | null;
  collectorCount?: number;
};

const ROLE_COLOR: Record<string, string> = {
  Athlete: "#FF5050",
  Trainer: "#32D278",
  Members: "#FFC81E",
  Business: "#3C8CFF",
  Admin: "#7C3AED",
};

export function ProfilePreviewModal({
  slug,
  onClose,
}: {
  slug: string | null;
  onClose: () => void;
}) {
  const [payload, setPayload] = useState<PreviewPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [cheerLoading, setCheerLoading] = useState(false);
  const [collectLoading, setCollectLoading] = useState(false);
  const [collected, setCollected] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/profile/public/${slug}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => setPayload(json.success ? { profile: json.profile, careerProfile: json.careerProfile ?? null, collectorCount: json.collectorCount ?? 0 } : null))
      .catch(() => setPayload(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/collect?targetSlug=${slug}`)
      .then((r) => r.json())
      .then((d) => setCollected(Boolean(d?.collected)))
      .catch(() => setCollected(false));
  }, [slug]);

  const profile = payload?.profile ?? null;
  const careerProfile = payload?.careerProfile ?? null;
  const collectorCount = payload?.collectorCount ?? 0;
  const roleColor = ROLE_COLOR[profile?.role ?? ""] ?? "#a78bfa";
  const highlightStats = useMemo(() => (careerProfile?.stats ?? []).filter((item) => item?.label || item?.value).slice(0, 3), [careerProfile]);

  async function handleCheer() {
    if (!profile || cheerLoading) return;
    setCheerLoading(true);
    try {
      const res = await fetch("/api/cheer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toSlug: profile.slug }),
      });
      if (res.status === 401) {
        window.location.href = `/login?redirect=/u/${profile.slug}`;
        return;
      }
      const data: { success?: boolean; cheerCount?: number } = await res.json().catch(() => ({}));
      if (data.success && typeof data.cheerCount === "number") {
        setPayload((current) => current ? { ...current, profile: { ...current.profile, cheerCount: data.cheerCount as number } } : current);
      }
    } finally {
      setCheerLoading(false);
    }
  }

  async function handleCollectToggle() {
    if (!profile || collectLoading) return;
    setCollectLoading(true);
    try {
      const action = collected ? "uncollect" : "collect";
      const res = await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetSlug: profile.slug, action }),
      });
      if (res.status === 401) {
        window.location.href = `/login?redirect=/u/${profile.slug}`;
        return;
      }
      const data: { ok?: boolean; collected?: boolean } = await res.json().catch(() => ({}));
      if (data.ok) setCollected(Boolean(data.collected));
    } finally {
      setCollectLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {slug ? (
        <>
          <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[80] border-none bg-black/72" />
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 22 }} className="fixed inset-0 z-[81] grid place-items-center p-4">
            <div className="w-full max-w-[760px] overflow-hidden rounded-[28px] border border-white/10 bg-[#06070b] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-5 py-4">
                <div>
                  <p className="m-0 font-mono text-[10px] font-black tracking-[0.2em] text-white/35">PROFILE PREVIEW</p>
                  <h2 className="mt-1 text-[20px] font-black text-white">公開イメージ</h2>
                </div>
                <button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75">
                  閉じる
                </button>
              </div>

              {loading ? (
                <div className="p-6 text-white/65">読み込み中...</div>
              ) : profile ? (
                <div className="flex flex-col gap-0">
                  <div className="relative min-h-[280px] overflow-hidden px-6 pb-6 pt-6">
                    {profile.profileImageUrl ? (
                      <img src={profile.profileImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover object-top opacity-45" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${roleColor}22 0%, #07070d 80%)` }} />
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #06070b 0%, rgba(6,7,11,0.24) 55%, rgba(6,7,11,0.06) 100%)" }} />
                    <div className="absolute right-[-6%] top-[-18%] h-[260px] w-[260px]" style={{ background: `radial-gradient(circle, ${roleColor}28, transparent 68%)` }} />

                    <div className="relative z-[2] flex flex-col gap-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex w-fit rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]" style={{ borderColor: `${roleColor}50`, background: `${roleColor}16`, color: roleColor }}>
                          {profile.role}
                        </span>
                        <span className="font-mono text-[10px] text-white/55">@{profile.slug}</span>
                      </div>

                      <div className="flex items-end gap-4">
                        <div className="h-20 w-20 overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
                          {profile.avatarUrl ? <Image src={profile.avatarUrl} alt={profile.displayName} width={80} height={80} className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0">
                          <p className="m-0 text-[34px] font-black leading-none tracking-[-0.03em] text-white">{profile.displayName}</p>
                          <p className="mt-2 text-[12px] text-white/55">{profile.region ?? "Region not set"}{profile.sport ? ` · ${profile.sport}` : ""}</p>
                          {careerProfile?.tagline ? <p className="mt-3 max-w-[520px] text-[14px] font-semibold leading-7 text-white/82">{careerProfile.tagline}</p> : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <StatPill label="CHEER" value={(profile.cheerCount ?? 0).toLocaleString()} accent="#FFD600" />
                        <StatPill label="COLLECT" value={String(collectorCount)} accent={roleColor} />
                        <StatPill label="STATUS" value={profile.isPublic === false ? "PRIVATE" : "PUBLIC"} accent={profile.isPublic === false ? "#FF5050" : roleColor} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 px-6 py-5 md:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4">
                      <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                        <p className="mb-2 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-white/35">Story</p>
                        <p className="m-0 text-[13px] leading-7 text-white/78">{profile.bio ?? "プロフィール未設定です。"}</p>
                      </div>

                      {highlightStats.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-3">
                          {highlightStats.map((stat, index) => (
                            <div key={`${stat.label}-${index}`} className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                              <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.18em] text-white/35">{stat.label}</p>
                              <p className="m-0 text-[22px] font-black" style={{ color: stat.color === "gold" ? "#FFD600" : stat.color === "role" ? roleColor : "#ffffff" }}>{stat.value}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {careerProfile?.bio_career ? (
                        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                          <p className="mb-2 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-white/35">Career</p>
                          <p className="m-0 text-[13px] leading-7 text-white/74">{careerProfile.bio_career}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4">
                        <p className="mb-3 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-white/35">Engagement</p>
                        <div className="flex flex-wrap gap-2">
                          <motion.button type="button" onClick={handleCheer} whileTap={{ scale: 0.98 }} disabled={cheerLoading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-[14px] py-[10px] font-bold text-white/90">
                            <span className="text-[#FFD600]">📣</span>
                            Cheer
                            <span className="font-mono text-white/55">{profile.cheerCount ?? 0}</span>
                          </motion.button>
                          <motion.button type="button" onClick={handleCollectToggle} whileTap={{ scale: 0.98 }} disabled={collectLoading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-[14px] py-[10px] font-bold text-white/90">
                            <span style={{ color: collected ? "#FFD600" : "rgba(255,255,255,0.75)" }}>🃏</span>
                            {collected ? "Collected" : "Collect"}
                          </motion.button>
                        </div>
                        <p className="mt-3 text-[12px] leading-6 text-white/55">モーダルでも、Cheer と Collect の流れがすぐ伝わるレイアウトにしています。</p>
                      </div>

                      <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                        <p className="mb-3 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-white/35">CTA</p>
                        <Link href={`/u/${profile.slug}`} onClick={onClose} className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-center text-[13px] font-black no-underline" style={{ background: roleColor, color: "#050508" }}>
                          公開プロフィールを開く
                        </Link>
                        <p className="mt-3 text-[12px] leading-6 text-white/55">SNSやシェア導線で見られたときも、そのまま公開プロフィールへ遷移できます。</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-white/55">プロフィールを表示できませんでした。</div>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function StatPill({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-full border px-3 py-2" style={{ borderColor: `${accent}40`, background: `${accent}14` }}>
      <span className="mr-2 font-mono text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: accent }}>{label}</span>
      <span className="text-[12px] font-black text-white">{value}</span>
    </div>
  );
}
