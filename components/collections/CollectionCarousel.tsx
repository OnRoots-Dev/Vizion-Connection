"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ThemeColors } from "@/app/(app)/dashboard/types";
import SponsorBadge from "@/components/SponsorBadge";

export type CollectionCardItem = {
  targetSlug: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
  profileImageUrl: string | null;
  bio?: string | null;
  region?: string | null;
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
      <div style={{ position: "relative", minHeight: compact ? 188 : 276 }}>
        {orderedCards.slice(0, 3).reverse().map((card, indexFromBack) => {
          const displayIndex = 2 - indexFromBack;
          const cardRoleColor = ROLE_COLOR[card.role] ?? roleColor;
          const scale = 1 - displayIndex * 0.04;
          const y = displayIndex * 14;
          const veilOpacity = displayIndex === 0 ? 0 : displayIndex === 1 ? 0.18 : 0.32;
          return (
            <motion.button
              key={`${card.targetSlug}-${displayIndex}`}
              type="button"
              onClick={() => onOpenProfile?.(card.targetSlug)}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y, scale }}
              transition={{ duration: 0.26 }}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                borderRadius: 18,
                border: `1px solid ${cardRoleColor}25`,
                background: `linear-gradient(145deg, ${ROLE_BG[card.role] ?? "#111827"} 0%, #050508 100%)`,
                overflow: "hidden",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: `0 14px 34px rgba(0,0,0,0.35), 0 0 0 1px ${cardRoleColor}15`,
                padding: 0,
                zIndex: 10 - displayIndex,
                pointerEvents: displayIndex === 0 ? "auto" : "none",
              }}
            >
              {card.profileImageUrl ? (
                <img src={card.profileImageUrl} alt={card.displayName} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.38 }} />
              ) : null}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.76) 58%, rgba(0,0,0,0.96) 100%)" }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 180, background: `radial-gradient(circle, ${cardRoleColor}30, transparent 72%)` }} />
              <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${veilOpacity})` }} />
              <div style={{ position: "relative", zIndex: 1, height: "100%", padding: compact ? 14 : 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.16em", color: "rgba(255,255,255,0.78)" }}>
                    {ROLE_LABEL[card.role] ?? card.role}
                  </span>
                  <span style={{ fontSize: 10, color: card.isFoundingMember ? "#FFD600" : "rgba(255,255,255,0.75)" }}>
                    {card.isFoundingMember ? "FOUNDING" : "EARLY"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: compact ? 42 : 52, height: compact ? 42 : 52, borderRadius: "50%", overflow: "hidden", background: `${cardRoleColor}22`, border: `1px solid ${cardRoleColor}66`, display: "flex", alignItems: "center", justifyContent: "center", color: cardRoleColor, fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                    {card.avatarUrl ? <img src={card.avatarUrl} alt={card.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : card.displayName.slice(0, 1)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: "0 0 4px", fontSize: compact ? 15 : 18, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#fff" }}>{card.displayName}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>@{card.targetSlug}</p>
                    {!compact && (card.sport || card.region) ? (
                      <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {[card.sport, card.region].filter(Boolean).join(" / ")}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 10 }}>
                  {!compact && card.bio ? (
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, minHeight: 34 }}>
                      {card.bio.length > 44 ? `${card.bio.slice(0, 44)}...` : card.bio}
                    </p>
                  ) : null}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, color: "#FFD600", fontFamily: "monospace", fontWeight: 900, whiteSpace: "nowrap" }}>★ {card.cheerCount ?? 0}</p>
                      {!compact && card.sponsorPlan ? <SponsorBadge plan={card.sponsorPlan} /> : null}
                    </div>
                    <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.66)", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                      {card.serialId ? `#${String(card.serialId).padStart(4, "0")}` : "CARD"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
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
