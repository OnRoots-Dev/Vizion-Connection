"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import { ProfilePreviewModal } from "@/app/(app)/dashboard/components/ProfilePreviewModal";
import AdCard from "@/app/(app)/news-rooms/components/AdCard";
import Image from "next/image";

type InlineAd = {
  id: string;
  headline: string;
  image_url?: string;
  link_url: string;
  sponsor?: string;
  business_id?: number;
};

const ROLE_COLOR_MAP: Record<string, string> = {
  Athlete: "#FF5050",
  Trainer: "#32D278",
  Members: "#FFC81E",
  Business: "#3C8CFF",
};

type CheerReceivedItem = {
  id: string;
  fromSlug: string;
  fromDisplayName: string;
  role?: string | null;
  region?: string | null;
  prefecture?: string | null;
  sport?: string | null;
  avatarUrl?: string | null;
  profileImageUrl?: string | null;
  comment?: string | null;
  createdAt?: string | null;
};

function formatLocation(user: { region?: string | null; prefecture?: string | null }) {
  return [user.region, user.prefecture].filter(Boolean).join(" / ") || "地域未設定";
}

export function CheerView({ profile, t, roleColor, setView }: {
  profile: ProfileData;
  t: ThemeColors;
  roleColor: string;
  setView: (v: DashboardView) => void;
}) {
  const cheerCount = profile.cheerCount ?? 0;
  const [selectedProfileSlug, setSelectedProfileSlug] = useState<string | null>(null);
  const [ads, setAds] = useState<InlineAd[]>([]);
  const [received, setReceived] = useState<CheerReceivedItem[]>([]);
  const [receivedLoading, setReceivedLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ads", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setAds(Array.isArray(data?.ads) ? data.ads : []))
      .catch(() => setAds([]));
  }, []);

  useEffect(() => {
    setReceivedLoading(true);
    fetch("/api/cheer/received?limit=30")
      .then((r) => r.json())
      .then((d) => setReceived(Array.isArray(d?.items) ? d.items : []))
      .catch(() => setReceived([]))
      .finally(() => setReceivedLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ProfilePreviewModal slug={selectedProfileSlug} onClose={() => setSelectedProfileSlug(null)} />

      <ViewHeader title="Cheer" sub="あなたへの応援" onBack={() => setView("home")} t={t} roleColor={roleColor} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ padding: "22px 18px", borderRadius: 16, background: "linear-gradient(135deg, rgba(255,214,0,0.08), rgba(255,255,255,0.02))", border: "1px solid rgba(255,214,0,0.16)" }}
        >
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.35em", textTransform: "uppercase", color: "#FFD600", opacity: 0.7, fontFamily: "monospace" }}>TOTAL CHEER</div>
            <div style={{ fontSize: 64, fontWeight: 900, color: "#FFD600", lineHeight: 1, fontFamily: "monospace" }}>{cheerCount}</div>
            <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.7 }}>あなたのプロフィールに届いたCheerの合計です。</div>
          </div>
        </motion.div>

        <SectionCard accentColor={roleColor} t={t}>
          <SLabel text="Cheerを増やす" color={roleColor} />
          <p style={{ fontSize: 12, color: t.sub, margin: "0 0 14px", opacity: 0.65 }}>公開プロフィールを広めてCheerを集めましょう。</p>
          <a
            href={`/u/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: `${roleColor}18`, border: `1px solid ${roleColor}35`, color: roleColor, fontSize: 12, fontWeight: 700, textDecoration: "none" }}
          >
            公開プロフィールを開く
          </a>
        </SectionCard>
      </div>

      <SectionCard t={t} accentColor={roleColor}>
        <SLabel text="Cheerコメント" color={roleColor} />
        {receivedLoading ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: t.sub, fontSize: 12 }}>読み込み中...</div>
        ) : received.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: t.sub, fontSize: 12 }}>まだCheerコメントがありません</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {received.map((item) => {
              const rowColor = (item.role ? (ROLE_COLOR_MAP[item.role] ?? roleColor) : roleColor);
              const canOpen = Boolean(item.fromSlug && item.fromSlug !== "anonymous" && item.fromSlug !== "null");
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={canOpen ? () => setSelectedProfileSlug(item.fromSlug) : undefined}
                  disabled={!canOpen}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${rowColor}30`,
                    background: item.profileImageUrl
                      ? `linear-gradient(90deg, rgba(7,10,18,0.94) 0%, rgba(7,10,18,0.84) 55%, rgba(7,10,18,0.96) 100%), url(${item.profileImageUrl}) center/cover`
                      : "rgba(255,255,255,0.03)",
                    display: "grid",
                    gridTemplateColumns: "44px minmax(0, 1fr)",
                    gap: 10,
                    alignItems: "start",
                    cursor: canOpen ? "pointer" : "default",
                    color: t.text,
                    opacity: canOpen ? 1 : 0.82,
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 999, overflow: "hidden", border: `1px solid ${rowColor}45`, background: `${rowColor}18`, display: "flex", alignItems: "center", justifyContent: "center", color: rowColor, fontWeight: 900, fontFamily: "monospace", flexShrink: 0 }}>
                    {item.avatarUrl ? (
                      <Image src={item.avatarUrl} alt={item.fromDisplayName} width={44} height={44} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span>{(item.fromDisplayName ?? "?").slice(0, 1)}</span>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.fromDisplayName}</div>
                      {item.role ? <div style={{ fontSize: 10, fontWeight: 900, color: rowColor }}>{item.role}</div> : null}
                      <div style={{ fontSize: 10, color: t.sub }}>{formatLocation(item)}</div>
                      {item.createdAt ? <div style={{ fontSize: 10, color: t.sub, marginLeft: "auto" }}>{new Date(item.createdAt).toLocaleString("ja-JP")}</div> : null}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {item.comment?.trim() ? item.comment : "(コメントなし)"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      {ads.length > 0 ? (
        <AdCard ad={ads[0]!} />
      ) : (
        <SectionCard t={t}>
          <SLabel text="AD SLOT" color="#FFD600" />
          <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>全国スポンサー広告枠（空き枠）</p>
        </SectionCard>
      )}
    </div>
  );
}
