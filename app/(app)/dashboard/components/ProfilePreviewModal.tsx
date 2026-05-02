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
  const [liveCollectorCount, setLiveCollectorCount] = useState<number | null>(null);
  const [showCheerComment, setShowCheerComment] = useState(false);
  const [cheerComment, setCheerComment] = useState("");
  const [cheerMessage, setCheerMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/profile/public/${slug}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) {
          setPayload(null);
          setLiveCollectorCount(null);
          return;
        }
        setPayload({ profile: json.profile, careerProfile: json.careerProfile ?? null, collectorCount: json.collectorCount ?? 0 });
        setLiveCollectorCount(json.collectorCount ?? 0);
      })
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
  const collectorCount = liveCollectorCount ?? payload?.collectorCount ?? 0;
  const roleColor = ROLE_COLOR[profile?.role ?? ""] ?? "#a78bfa";
  const highlightStats = useMemo(() => (careerProfile?.stats ?? []).filter((item) => item?.label || item?.value).slice(0, 3), [careerProfile]);

  async function handleCheer(comment?: string) {
    if (!profile || cheerLoading) return;
    setCheerLoading(true);
    setCheerMessage(null);
    try {
      const res = await fetch("/api/cheer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toSlug: profile.slug, comment: comment?.trim() || undefined }),
      });
      if (res.status === 401) {
        window.location.href = `/login?redirect=/u/${profile.slug}`;
        return;
      }
      const data: { success?: boolean; cheerCount?: number; error?: string } = await res.json().catch(() => ({}));
      if (data.success && typeof data.cheerCount === "number") {
        setPayload((current) => current ? { ...current, profile: { ...current.profile, cheerCount: data.cheerCount as number } } : current);
        setCheerComment("");
        setShowCheerComment(false);
        setCheerMessage(comment?.trim() ? "コメント付きCheerを送りました。" : "Cheerを送りました。");
      } else if (typeof data.error === "string") {
        setCheerMessage(data.error);
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
      if (data.ok) {
        setCollected(Boolean(data.collected));
        setLiveCollectorCount((current) => {
          const base = current ?? payload?.collectorCount ?? 0;
          return data.collected ? base + 1 : Math.max(0, base - 1);
        });
      }
    } finally {
      setCollectLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {slug ? (
        <>
          <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[80] border-none bg-black/72" />
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 22 }} className="fixed inset-0 z-[81] grid place-items-center p-3 sm:p-4">
            <div className="flex w-full max-w-[760px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#06070b] shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:rounded-[28px]" style={{ maxHeight: "min(92dvh, 920px)" }}>
              <div className="sticky top-0 z-[2] flex items-start justify-between gap-3 border-b border-white/10 bg-[#06070b]/95 px-4 py-4 backdrop-blur sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="m-0 break-words font-mono text-[9px] font-black tracking-[0.16em] text-white/35 sm:text-[10px] sm:tracking-[0.2em]">PROFILE PREVIEW</p>
                  <h2 className="mt-1 break-words text-[18px] font-black leading-tight text-white sm:text-[20px]">公開イメージ</h2>
                </div>
                <button type="button" onClick={onClose} className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/75">
                  閉じる
                </button>
              </div>

              {loading ? (
                <div className="overflow-y-auto p-6 text-white/65">読み込み中...</div>
              ) : profile ? (
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
                  <div className="relative min-h-[300px] overflow-hidden px-6 pb-7 pt-6 sm:min-h-[320px] sm:pb-8 sm:pt-6">
                    {profile.profileImageUrl ? (
                      <Image
                        src={profile.profileImageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 760px, 100vw"
                        className="absolute inset-0 object-cover object-top opacity-45"
                      />
                    ) : (
                      <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${roleColor}22 0%, #07070d 80%)` }} />
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #06070b 0%, rgba(6,7,11,0.24) 55%, rgba(6,7,11,0.06) 100%)" }} />
                    <div className="absolute right-[-6%] top-[-18%] h-[260px] w-[260px]" style={{ background: `radial-gradient(circle, ${roleColor}28, transparent 68%)` }} />

                    <div className="relative z-[2] flex flex-col gap-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex w-fit rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]" style={{ borderColor: `${roleColor}50`, background: `${roleColor}16`, color: roleColor }}>
                          {profile.role}
                        </span>
                        <span className="max-w-full break-all font-mono text-[10px] text-white/55">@{profile.slug}</span>
                      </div>

                      <div className="flex items-end gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
                          {profile.avatarUrl ? <Image src={profile.avatarUrl} alt={profile.displayName} width={80} height={80} className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="m-0 break-words text-[28px] font-black leading-none tracking-[-0.03em] text-white sm:text-[34px]">{profile.displayName}</p>
                          <p className="mt-2 break-words text-[12px] text-white/55">{profile.region ?? "Region not set"}{profile.sport ? ` · ${profile.sport}` : ""}</p>
                          {careerProfile?.tagline ? <p className="mt-3 max-w-[520px] break-words text-[13px] font-semibold leading-6 text-white/82 sm:text-[14px] sm:leading-7">{careerProfile.tagline}</p> : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <StatPill label="CHEER" value={(profile.cheerCount ?? 0).toLocaleString()} accent="#FFD600" />
                        <StatPill label="COLLECT" value={String(collectorCount)} accent={roleColor} />
                        <StatPill label="STATUS" value={profile.isPublic === false ? "PRIVATE" : "PUBLIC"} accent={profile.isPublic === false ? "#FF5050" : roleColor} />
                      </div>
                    </div>
                  </div>

                  <div className="relative z-[3] -mt-6 grid gap-4 rounded-t-[28px] border-t border-white/10 bg-[#06070b] px-4 py-4 sm:-mt-8 sm:px-6 sm:py-5 md:grid-cols-[1.1fr_0.9fr]">
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
                          <motion.button
                            type="button"
                            onClick={() => void handleCheer()}
                            whileTap={{ scale: 0.98 }}
                            disabled={cheerLoading}
                            className="inline-flex items-center gap-2 rounded-[16px] border px-[16px] py-[12px] font-black text-white shadow-[0_16px_32px_rgba(255,214,0,0.12)]"
                            style={{ borderColor: "rgba(255,214,0,0.28)", background: "linear-gradient(135deg, rgba(255,214,0,0.28), rgba(255,255,255,0.08))" }}
                          >
                            <span className="text-[#FFD600]">📣</span>
                            Cheer
                            <span className="rounded-full bg-black/25 px-2 py-1 font-mono text-[11px] text-white/90">{profile.cheerCount ?? 0}</span>
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => setShowCheerComment((prev) => !prev)}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-[16px] py-[12px] font-black text-white/90"
                          >
                            <span className="text-white/80">💬</span>
                            コメント付きCheer
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={handleCollectToggle}
                            whileTap={{ scale: 0.98 }}
                            disabled={collectLoading}
                            className="inline-flex items-center gap-2 rounded-[16px] border px-[16px] py-[12px] font-black text-white shadow-[0_16px_32px_rgba(124,58,237,0.12)]"
                            style={{ borderColor: `${roleColor}33`, background: collected ? `linear-gradient(135deg, ${roleColor}33, rgba(255,255,255,0.08))` : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))" }}
                          >
                            <span style={{ color: collected ? "#FFD600" : "rgba(255,255,255,0.75)" }}>🃏</span>
                            {collected ? "Collected" : "Collect"}
                            <span className="rounded-full bg-black/25 px-2 py-1 font-mono text-[11px] text-white/90">{collectorCount}</span>
                          </motion.button>
                        </div>
                        {showCheerComment ? (
                          <div className="mt-3 grid gap-2">
                            <textarea
                              value={cheerComment}
                              onChange={(e) => setCheerComment(e.target.value.slice(0, 120))}
                              rows={3}
                              placeholder="応援コメントを入力（120文字まで）"
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-[12px] leading-6 text-white outline-none"
                            />
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[11px] text-white/45">{cheerComment.length}/120</span>
                              <button
                                type="button"
                                onClick={() => void handleCheer(cheerComment)}
                                disabled={cheerLoading || !cheerComment.trim()}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-[14px] py-[10px] text-[12px] font-bold text-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {cheerLoading ? "送信中..." : "コメントを送る"}
                              </button>
                            </div>
                          </div>
                        ) : null}
                        {cheerMessage ? <p className="mt-3 text-[12px] leading-6 text-white/60">{cheerMessage}</p> : null}
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
                <div className="overflow-y-auto p-6 text-white/55">プロフィールを表示できませんでした。</div>
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
