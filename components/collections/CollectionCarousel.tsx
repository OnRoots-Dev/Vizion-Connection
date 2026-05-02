"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ThemeColors } from "@/app/(app)/dashboard/types";
import SponsorBadge from "@/components/SponsorBadge";
import Image from "next/image";

export type CollectionCardItem = {
  targetSlug: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
  profileImageUrl: string | null;
  bio?: string | null;
  region?: string | null;
  prefecture?: string | null;
  sport?: string | null;
  sponsorPlan?: "roots" | "roots_plus" | "signal" | "presence" | "legacy" | null;
  serialId: string | null;
  cheerCount: number;
  isFoundingMember: boolean;
};

const ROLE_COLOR: Record<string, string> = {
  Athlete: "#C1272D",
  Trainer: "#1A7A4A",
  Members: "#B8860B",
  Business: "#1B3A8C",
};

const ROLE_LABEL: Record<string, string> = {
  Athlete: "ATHLETE",
  Trainer: "TRAINER",
  Members: "MEMBERS",
  Business: "BUSINESS",
};

const ROLE_BG: Record<string, string> = {
  Athlete: "#2D0000",
  Trainer: "#001A0A",
  Members: "#1A0F00",
  Business: "#000A24",
};

export function CollectionCarousel({
  cards,
  t,
  roleColor,
  compact = false,
  onOpenProfile,
}: {
  cards: CollectionCardItem[];
  t: ThemeColors;
  roleColor: string;
  compact?: boolean;
  onOpenProfile?: (slug: string) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = cards.length;
  const cardMaxWidth = compact ? 300 : 332;
  const cardMinHeight = compact ? 188 : 222;

  const orderedCards = useMemo(() => {
    if (cards.length === 0) return [];
    return cards.map((_, offset) => cards[(activeIndex + offset) % cards.length]);
  }, [activeIndex, cards]);

  const activeCard = orderedCards[0] ?? null;

  if (cards.length === 0) {
    return <p style={{ margin: 0, fontSize: 12, color: t.sub }}>コレクションはまだありません。</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ position: "relative", minHeight: cardMinHeight + 42, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: cardMaxWidth, aspectRatio: "400 / 240" }}>
          {(() => {
            const visible = orderedCards.slice(0, Math.min(3, orderedCards.length));
            return visible.slice().reverse().map((card, indexFromBack) => {
              const displayIndex = (visible.length - 1) - indexFromBack;
            const cardRoleColor = ROLE_COLOR[card.role] ?? roleColor;
            const scale = compact ? 1 - displayIndex * 0.06 : 1 - displayIndex * 0.055;
            const y = compact ? displayIndex * 18 : displayIndex * 18;
            const x = compact ? displayIndex * 12 : displayIndex * 9;
            const veilOpacity = displayIndex === 0 ? 0 : displayIndex === 1 ? 0.12 : 0.2;
            return (
              <motion.button
                key={`${card.targetSlug}-${displayIndex}`}
                type="button"
                onClick={() => onOpenProfile?.(card.targetSlug)}
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y, x, scale }}
                transition={{ duration: 0.26 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  borderRadius: 20,
                  border: `1px solid ${cardRoleColor}28`,
                  background: `linear-gradient(150deg, ${ROLE_BG[card.role] ?? "#111827"} 0%, rgba(8,8,12,0.98) 65%, #050508 100%)`,
                  overflow: "hidden",
                  textAlign: "left",
                  cursor: "pointer",
                  boxShadow: compact
                    ? `0 18px 42px rgba(0,0,0,0.42), 0 0 0 1px ${cardRoleColor}18`
                    : `0 16px 38px rgba(0,0,0,0.35), 0 0 0 1px ${cardRoleColor}15`,
                  padding: 0,
                  zIndex: 10 - displayIndex,
                  pointerEvents: displayIndex === 0 ? "auto" : "none",
                  transformOrigin: "center top",
                }}
              >
              {card.profileImageUrl ? (
                <Image
                  src={card.profileImageUrl}
                  alt={card.displayName}
                  fill
                  sizes={compact ? "300px" : "332px"}
                  style={{ objectFit: "cover", opacity: 0.38 }}
                />
              ) : null}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.74) 60%, rgba(0,0,0,0.97) 100%)" }} />
              <div style={{ position: "absolute", top: -10, right: -10, width: 180, height: 180, background: `radial-gradient(circle, ${cardRoleColor}32, transparent 72%)` }} />
              <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${veilOpacity})` }} />
              <div style={{ position: "absolute", inset: 1, borderRadius: 19, border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(130deg, rgba(255,255,255,0.08), transparent 38%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1, height: "100%", padding: compact ? 16 : 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.16em", color: "rgba(255,255,255,0.78)" }}>
                    {ROLE_LABEL[card.role] ?? card.role}
                  </span>
                  <span style={{ fontSize: compact ? 9 : 10, color: card.isFoundingMember ? "#FFD600" : "rgba(255,255,255,0.75)" }}>
                    {card.isFoundingMember ? "FOUNDING" : "EARLY"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: compact ? 46 : 52, height: compact ? 46 : 52, borderRadius: "50%", overflow: "hidden", background: `${cardRoleColor}22`, border: `1px solid ${cardRoleColor}66`, display: "flex", alignItems: "center", justifyContent: "center", color: cardRoleColor, fontSize: 16, fontWeight: 800, flexShrink: 0, boxShadow: `0 0 18px ${cardRoleColor}22` }}>
                    {card.avatarUrl ? (
                      <Image
                        src={card.avatarUrl}
                        alt={card.displayName}
                        width={compact ? 46 : 52}
                        height={compact ? 46 : 52}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      card.displayName.slice(0, 1)
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: "0 0 4px", fontSize: compact ? 16 : 18, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#fff", letterSpacing: "-0.01em" }}>{card.displayName}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>@{card.targetSlug}</p>
                    {((!compact && (card.sport || card.region)) || (compact && (card.sport || card.region))) ? (
                      <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {[card.sport, card.region].filter(Boolean).join(" / ")}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 10 }}>
                  {(compact ? Boolean(card.bio) : Boolean(card.bio)) ? (
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, minHeight: 34 }}>
                      {card.bio && (card.bio.length > (compact ? 52 : 44) ? `${card.bio.slice(0, compact ? 52 : 44)}...` : card.bio)}
                    </p>
                  ) : null}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, color: "#FFD600", fontFamily: "monospace", fontWeight: 900, whiteSpace: "nowrap" }}>★ {card.cheerCount ?? 0}</p>
                      {card.sponsorPlan ? <SponsorBadge plan={card.sponsorPlan} /> : null}
                    </div>
                    <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.66)", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                      {card.serialId ? `#${String(card.serialId).padStart(4, "0")}` : "CARD"}
                    </p>
                  </div>
                  </div>
                </div>
              </motion.button>
            );
            });
          })()}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev - 1 + total) % total)}
            style={{ padding: "8px 12px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
          >
            前へ
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % total)}
            style={{ padding: "8px 12px", borderRadius: 12, border: `1px solid ${t.border}`, background: `${roleColor}16`, color: roleColor, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
          >
            次へ
          </button>
        </div>
        <span style={{ fontSize: 10, color: t.sub, fontFamily: "monospace" }}>
          {activeIndex + 1} / {total}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {activeCard ? (
          <motion.p
            key={activeCard.targetSlug}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ margin: 0, fontSize: 11, color: t.sub, lineHeight: 1.7 }}
          >
            前面のカードを確認しながら、次へ進むと後ろへ回り込みます。
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
