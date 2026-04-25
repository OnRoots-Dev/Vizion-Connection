"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { PublicProfileData } from "@/features/profile/types";

export function ProfilePreviewModal({
  slug,
  onClose,
}: {
  slug: string | null;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [cheerLoading, setCheerLoading] = useState(false);
  const [collectLoading, setCollectLoading] = useState(false);
  const [collected, setCollected] = useState(false);
  const [notesBurst, setNotesBurst] = useState(0);
  const [collectBurst, setCollectBurst] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/profile/public/${slug}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => setProfile(json.success ? (json.profile as PublicProfileData) : null))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/collect?targetSlug=${slug}`)
      .then((r) => r.json())
      .then((d) => setCollected(Boolean(d?.collected)))
      .catch(() => setCollected(false));
  }, [slug]);

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
        const nextCheerCount: number = data.cheerCount;
        setProfile((p) => {
          if (!p) return p;
          return { ...p, cheerCount: nextCheerCount };
        });
        setNotesBurst((n) => n + 1);
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
        setCollectBurst((n) => n + 1);
      }
    } finally {
      setCollectLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {slug ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] border-none bg-black/70"
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-0 z-[81] grid place-items-center p-4"
          >
            <div className="w-full max-w-[560px] rounded-[24px] border border-white/10 bg-[#0b0b11] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
              <div className="mb-[14px] flex items-center justify-between gap-3">
                <div>
                  <p className="mb-1 mt-0 font-mono text-[10px] font-black tracking-[0.18em] text-white/35">PROFILE PREVIEW</p>
                  <h2 className="m-0 text-[20px] font-black text-white">プロフィール詳細</h2>
                </div>
                <button type="button" onClick={onClose} className="cursor-pointer rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-white/75">
                  閉じる
                </button>
              </div>
              {loading ? (
                <p className="m-0 text-white/60">読み込み中...</p>
              ) : profile ? (
                <div className="flex flex-col gap-[14px]">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-full bg-white/8">
                      {profile.avatarUrl ? (
                        <Image
                          src={profile.avatarUrl}
                          alt={profile.displayName}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="mb-1 mt-0 text-[20px] font-black text-white">{profile.displayName}</p>
                      <p className="m-0 text-[12px] text-white/45">@{profile.slug}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      type="button"
                      onClick={handleCheer}
                      whileTap={{ scale: 0.98 }}
                      disabled={cheerLoading}
                      className="relative inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-[14px] py-[10px] font-bold text-white/90"
                    >
                      <span className="text-[#FFD600]">📣</span>
                      Cheer
                      <span className="font-mono text-white/50">{profile.cheerCount ?? 0}</span>

                      <AnimatePresence>
                        {notesBurst ? (
                          <motion.div
                            key={`notes-${notesBurst}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="pointer-events-none absolute inset-0"
                          >
                            {[0, 1, 2].map((i) => (
                              <motion.span
                                key={i}
                                initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
                                animate={{ opacity: [0, 1, 0], x: 18 + i * 8, y: -16 - i * 8, scale: 1.05 }}
                                transition={{ duration: 0.85, delay: i * 0.06, ease: "easeOut" }}
                                className="absolute left-1/2 top-1/2"
                                style={{ color: "rgba(255,255,255,0.85)" }}
                              >
                                ♪
                              </motion.span>
                            ))}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={handleCollectToggle}
                      whileTap={{ scale: 0.98 }}
                      disabled={collectLoading}
                      className="relative inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-[14px] py-[10px] font-bold text-white/90"
                    >
                      <span style={{ color: collected ? "#FFD600" : "rgba(255,255,255,0.75)" }}>🃏</span>
                      {collected ? "Collected" : "Collect"}

                      <AnimatePresence>
                        {collectBurst ? (
                          <motion.span
                            key={`collect-${collectBurst}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: [0, 0.8, 0], scale: [0.95, 1.08, 1.0] }}
                            transition={{ duration: 0.65, ease: "easeOut" }}
                            className="pointer-events-none absolute inset-0 rounded-xl"
                            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.16), 0 0 28px rgba(255,214,0,0.22)" }}
                          />
                        ) : null}
                      </AnimatePresence>
                    </motion.button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {profile.role ? <span className="rounded-full bg-white/6 px-[10px] py-[5px] text-[11px] text-white">{profile.role}</span> : null}
                    {profile.region ? <span className="rounded-full bg-white/6 px-[10px] py-[5px] text-[11px] text-white">{profile.region}</span> : null}
                    {profile.sport ? <span className="rounded-full bg-white/6 px-[10px] py-[5px] text-[11px] text-white">{profile.sport}</span> : null}
                  </div>
                  <p className="m-0 text-[13px] leading-[1.8] text-white/70">{profile.bio ?? "プロフィール未設定です。"}</p>
                  <Link
                    href={`/u/${profile.slug}`}
                    onClick={onClose}
                    className="inline-flex w-fit rounded-xl bg-white/8 px-[14px] py-[10px] font-bold text-white no-underline"
                  >
                    詳しく見る →
                  </Link>
                </div>
              ) : (
                <p className="m-0 text-white/55">プロフィールを表示できませんでした。</p>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
