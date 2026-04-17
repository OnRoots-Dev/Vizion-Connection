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
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [prefectureFilter, setPrefectureFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [ads, setAds] = useState<InlineAd[]>([]);
  const PAGE_SIZE = 10;
  const COLLECTION_LIMIT = 10;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const regionOptions = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => {
      const v = String(c.region ?? "").trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [cards]);

  const prefectureOptions = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => {
      const v = String((c as any).prefecture ?? "").trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [cards]);

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
      const matchRegion = regionFilter === "all" || String(card.region ?? "").trim() === regionFilter;
      const matchPrefecture = prefectureFilter === "all" || String((card as any).prefecture ?? "").trim() === prefectureFilter;
      const matchSearch = !query
        || card.displayName.toLowerCase().includes(query)
        || card.targetSlug.toLowerCase().includes(query)
        || String(card.region ?? "").toLowerCase().includes(query)
        || String((card as any).prefecture ?? "").toLowerCase().includes(query);
      return matchRole && matchRegion && matchPrefecture && matchSearch;
    }).slice(0, COLLECTION_LIMIT);
  }, [cards, prefectureFilter, regionFilter, roleFilter, search]);

  useEffect(() => {
    setPage(1);
  }, [prefectureFilter, regionFilter, roleFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCards.length / PAGE_SIZE));
  const pagedCards = filteredCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader title="Collection" sub="コレクトしたカードを回して確認" onBack={() => setView("home")} t={t} roleColor={roleColor} />

      <SectionCard t={t}>
        <SLabel text="AD SLOT" color="#FFD600" />
        <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>スポンサー広告枠（空き枠）</p>
      </SectionCard>

      <SectionCard t={t} accentColor={roleColor}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <SLabel text="Card Collection" color={roleColor} />
          <span style={{ fontSize: 10, color: t.sub }}>{filteredCards.length} / {COLLECTION_LIMIT} cards</span>
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

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
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
            >
              <option value="all">地域（すべて）</option>
              {regionOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <select
              value={prefectureFilter}
              onChange={(e) => setPrefectureFilter(e.target.value)}
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
            >
              <option value="all">都道府県（すべて）</option>
              {prefectureOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="名前・スラッグ・地域で検索"
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

                const place = String((card as any).prefecture ?? card.region ?? "").trim();
                const sport = String(card.sport ?? "").trim();
                const roleLabel = card.role === "Athlete" ? "ATHLETE" : card.role === "Trainer" ? "TRAINER" : card.role === "Members" ? "MEMBERS" : "BUSINESS";

                return (
                  <button
                    key={card.targetSlug}
                    type="button"
                    onClick={() => onOpenProfile(card.targetSlug)}
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "400 / 240",
                      borderRadius: 14,
                      border: `1px solid rgba(255,255,255,0.10)`,
                      background: `linear-gradient(145deg, ${bg} 0%, color-mix(in srgb, ${bg} 40%, #000) 60%, #060606 100%)`,
                      overflow: "hidden",
                      textAlign: "left",
                      cursor: "pointer",
                      boxShadow: "0 10px 42px rgba(0,0,0,0.55)",
                      padding: 0,
                    }}
                  >
                    {card.profileImageUrl ? (
                      <img src={card.profileImageUrl} alt={card.displayName} style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "62%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 0.9 }} />
                    ) : null}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(128deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.025) 30%,transparent 55%)", borderRadius: 14, pointerEvents: "none", zIndex: 1 }} />
                    <div style={{ position: "absolute", inset: 1, borderRadius: 13, border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none", zIndex: 1 }} />
                    <div style={{ position: "absolute", top: "-15%", right: "25%", width: 200, height: 200, background: `radial-gradient(circle, ${cardRoleColor}25, transparent 70%)`, pointerEvents: "none" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.72) 100%)", pointerEvents: "none" }} />

                    <div style={{ position: "absolute", inset: 0, zIndex: 7, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "16px 60% 14px 16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start", paddingLeft: 10 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, color: card.isFoundingMember ? "#FFD600" : "rgba(255,255,255,0.6)", fontWeight: 900, letterSpacing: "0.08em" }}>{card.isFoundingMember ? "FOUNDING" : "EARLY"}</span>
                        </div>
                        <span style={{ fontFamily: "monospace", fontSize: 8.5, letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.region || "N/A"} / {(card as any).prefecture || "N/A"}</span>
                      </div>

                      <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", gap: 3 }}>
                        <div style={{ fontFamily: "monospace", fontSize: 7, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>{roleLabel}</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.04, letterSpacing: "-0.01em", whiteSpace: "normal", overflow: "hidden", textOverflow: "ellipsis", wordBreak: "break-word", textShadow: "0 1px 0 rgba(255,255,255,0.5), 0 -1px 0 rgba(0,0,0,0.75), 0 2px 5px rgba(0,0,0,0.55), 0 0 14px rgba(255,255,255,0.05)" }}>
                          {card.displayName}
                        </div>
                        {sport ? <div style={{ fontFamily: "monospace", fontSize: 10.5, letterSpacing: "0.03em", color: "rgba(255,255,255,0.52)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sport}</div> : null}
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                          <span style={{ fontSize: 9, color: "#FFD600" }}>★</span>
                          <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)" }}>Cheer</span>
                          <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, lineHeight: 1, color: "#FFD600" }}>{card.cheerCount ?? 0}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ position: "absolute", bottom: 8, right: 10, zIndex: 5, fontFamily: "monospace", fontSize: 5, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.06)", pointerEvents: "none", whiteSpace: "nowrap" }}>VIZION CONNECTION · PROOF OF EXISTENCE</div>
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
            <div style={{ marginTop: 14 }}>
              {ads.length > 0 ? (
                <AdCard ad={ads[0]!} />
              ) : (
                <SectionCard t={t}>
                  <SLabel text="AD SLOT" color="#FFD600" />
                  <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>全国スポンサー広告枠（空き枠）</p>
                </SectionCard>
              )}
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}
