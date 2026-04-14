"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/profile/public/${slug}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => setProfile(json.success ? (json.profile as PublicProfileData) : null))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [slug]);

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
                      {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" /> : null}
                    </div>
                    <div>
                      <p className="mb-1 mt-0 text-[20px] font-black text-white">{profile.displayName}</p>
                      <p className="m-0 text-[12px] text-white/45">@{profile.slug}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.role ? <span className="rounded-full bg-white/6 px-[10px] py-[5px] text-[11px] text-white">{profile.role}</span> : null}
                    {profile.region ? <span className="rounded-full bg-white/6 px-[10px] py-[5px] text-[11px] text-white">{profile.region}</span> : null}
                    {profile.sport ? <span className="rounded-full bg-white/6 px-[10px] py-[5px] text-[11px] text-white">{profile.sport}</span> : null}
                  </div>
                  <p className="m-0 text-[13px] leading-[1.8] text-white/70">{profile.bio ?? "プロフィール未設定です。"}</p>
                  <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit rounded-xl bg-white/8 px-[14px] py-[10px] font-bold text-white no-underline">
                    公開プロフィールを新しいタブで開く
                  </a>
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
