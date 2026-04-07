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
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", border: "none", zIndex: 80 }}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            style={{ position: "fixed", inset: 0, zIndex: 81, display: "grid", placeItems: "center", padding: 16 }}
          >
            <div style={{ width: "min(560px, 100%)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", background: "#0b0b11", padding: 20, boxShadow: "0 18px 60px rgba(0,0,0,0.45)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>PROFILE PREVIEW</p>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff" }}>プロフィール詳細</h2>
                </div>
                <button type="button" onClick={onClose} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.75)", cursor: "pointer" }}>
                  閉じる
                </button>
              </div>
              {loading ? (
                <p style={{ margin: 0, color: "rgba(255,255,255,0.6)" }}>読み込み中...</p>
              ) : profile ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
                      {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: "#fff" }}>{profile.displayName}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>@{profile.slug}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {profile.role ? <span style={{ fontSize: 11, padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#fff" }}>{profile.role}</span> : null}
                    {profile.region ? <span style={{ fontSize: 11, padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#fff" }}>{profile.region}</span> : null}
                    {profile.sport ? <span style={{ fontSize: 11, padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "#fff" }}>{profile.sport}</span> : null}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.7)" }}>{profile.bio ?? "プロフィール未設定です。"}</p>
                  <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", width: "fit-content", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.08)", color: "#fff", textDecoration: "none", fontWeight: 700 }}>
                    公開プロフィールを新しいタブで開く
                  </a>
                </div>
              ) : (
                <p style={{ margin: 0, color: "rgba(255,255,255,0.55)" }}>プロフィールを表示できませんでした。</p>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
