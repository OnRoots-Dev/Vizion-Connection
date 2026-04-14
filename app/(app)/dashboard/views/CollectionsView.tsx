"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import type { CollectionCardItem } from "@/components/collections/CollectionCarousel";
import AdCard from "@/app/(app)/news-rooms/components/AdCard";

type InlineAd = {
  id: string;
  headline: string;
  image_url?: string;
  link_url: string;
  sponsor?: string;
  business_id?: number;
};

const ROLE_FILTERS = [
  { label: "すべて", value: "all" },
  { label: "Athlete", value: "Athlete" },
  { label: "Trainer", value: "Trainer" },
  { label: "Members", value: "Members" },
  { label: "Business", value: "Business" },
] as const;

export function CollectionsView({
  t,
  roleColor,
  setView,
  onOpenProfile,
}: {
  t: ThemeColors;
  roleColor: string;
  setView: (v: DashboardView) => void;
  onOpenProfile: (slug: string) => void;
}) {
  const [cards, setCards] = useState<CollectionCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]["value"]>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [ads, setAds] = useState<InlineAd[]>([]);
  const PAGE_SIZE = 8;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("/api/collect/list", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => setCards(Array.isArray(json.cards) ? json.cards : []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/ads", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setAds(Array.isArray(data?.ads) ? data.ads : []))
      .catch(() => setAds([]));
  }, []);

  const filteredCards = useMemo(() => {
    const query = search.trim().toLowerCase();
    return cards.filter((card) => {
      const matchRole = roleFilter === "all" || card.role === roleFilter;
      const matchSearch = !query
        || card.displayName.toLowerCase().includes(query)
        || card.targetSlug.toLowerCase().includes(query);
      return matchRole && matchSearch;
    });
  }, [cards, roleFilter, search]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCards.length / PAGE_SIZE));
  const pagedCards = filteredCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader title="Collection" sub="コレクトしたカードを回して確認" onBack={() => setView("home")} t={t} roleColor={roleColor} />
      <SectionCard t={t} accentColor={roleColor}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <SLabel text="Card Rotation" color={roleColor} />
          <span style={{ fontSize: 10, color: t.sub }}>{filteredCards.length} / {cards.length} cards</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ROLE_FILTERS.map((filter) => {
              const active = roleFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setRoleFilter(filter.value)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 800,
                    background: active ? `${roleColor}18` : "rgba(255,255,255,0.04)",
                    color: active ? roleColor : t.sub,
                    outline: active ? `1px solid ${roleColor}33` : "1px solid transparent",
                  }}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="名前・スラッグで検索"
            style={{
              width: "100%",
              padding: "11px 13px",
              borderRadius: 12,
              border: `1px solid ${t.border}`,
              background: "rgba(255,255,255,0.04)",
              color: t.text,
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        {loading ? (
          <p style={{ margin: 0, fontSize: 12, color: t.sub }}>コレクションを読み込み中...</p>
        ) : (
          <>
            {ads.length > 0 ? (
              <div style={{ marginBottom: 12 }}>
                <AdCard ad={ads[0]!} />
              </div>
            ) : (
              <div style={{ marginBottom: 12 }}>
                <SectionCard t={t}>
                  <SLabel text="AD SLOT" color="#FFD600" />
                  <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>全国スポンサー広告枠（空き枠）</p>
                </SectionCard>
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              {pagedCards.map((card) => {
                const cardRoleColor =
                  card.role === "Athlete" ? "#C1272D" :
                  card.role === "Trainer" ? "#1A7A4A" :
                  card.role === "Members" ? "#B8860B" :
                  "#1B3A8C";
                const bg =
                  card.role === "Athlete" ? "#2D0000" :
                  card.role === "Trainer" ? "#001A0A" :
                  card.role === "Members" ? "#1A0F00" :
                  "#000A24";

                return (
                  <button
                    key={card.targetSlug}
                    type="button"
                    onClick={() => onOpenProfile(card.targetSlug)}
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "400 / 240",
                      borderRadius: 18,
                      border: `1px solid ${cardRoleColor}25`,
                      background: `linear-gradient(145deg, ${bg} 0%, #050508 100%)`,
                      overflow: "hidden",
                      textAlign: "left",
                      cursor: "pointer",
                      boxShadow: `0 14px 34px rgba(0,0,0,0.28), 0 0 0 1px ${cardRoleColor}15`,
                      padding: 0,
                    }}
                  >
                    {card.profileImageUrl ? (
                      <img src={card.profileImageUrl} alt={card.displayName} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.38 }} />
                    ) : null}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.76) 58%, rgba(0,0,0,0.96) 100%)" }} />
                    <div style={{ position: "absolute", top: 0, right: 0, width: 140, height: 140, background: `radial-gradient(circle, ${cardRoleColor}30, transparent 72%)` }} />
                    <div style={{ position: "relative", zIndex: 1, height: "100%", padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.16em", color: "rgba(255,255,255,0.78)" }}>
                          {card.role.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 10, color: card.isFoundingMember ? "#FFD600" : "rgba(255,255,255,0.75)" }}>
                          {card.isFoundingMember ? "FOUNDING" : "EARLY"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", background: `${cardRoleColor}22`, border: `1px solid ${cardRoleColor}66`, display: "flex", alignItems: "center", justifyContent: "center", color: cardRoleColor, fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                          {card.avatarUrl ? <img src={card.avatarUrl} alt={card.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : card.displayName.slice(0, 1)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#fff" }}>{card.displayName}</p>
                          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>@{card.targetSlug}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <p style={{ margin: 0, fontSize: 12, color: "#FFD600", fontFamily: "monospace", fontWeight: 900, whiteSpace: "nowrap" }}>★ {card.cheerCount ?? 0}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.66)", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                          {card.serialId ? `#${String(card.serialId).padStart(4, "0")}` : "CARD"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {filteredCards.length > PAGE_SIZE ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 14 }}>
                <span style={{ fontSize: 11, color: t.sub }}>ページ {page} / {totalPages}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: page === 1 ? t.sub : t.text, cursor: page === 1 ? "not-allowed" : "pointer" }}
                  >
                    前へ
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: `${roleColor}16`, color: page === totalPages ? t.sub : roleColor, cursor: page === totalPages ? "not-allowed" : "pointer" }}
                  >
                    次へ
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </SectionCard>
    </div>
  );
}
