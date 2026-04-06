"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import { CollectionCarousel, type CollectionCardItem } from "@/components/collections/CollectionCarousel";

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

  useEffect(() => {
    setLoading(true);
    fetch("/api/collect/list", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => setCards(Array.isArray(json.cards) ? json.cards : []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
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
          <CollectionCarousel cards={filteredCards} t={t} roleColor={roleColor} onOpenProfile={onOpenProfile} />
        )}
      </SectionCard>
    </div>
  );
}
