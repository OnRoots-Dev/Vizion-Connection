"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import type { AdItem } from "@/lib/ads-shared";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard from "@/components/AdCard";
import { REGION_OPTIONS, ROLE_DISCOVERY_OPTIONS, getPrefectureOptions } from "@/lib/discovery-filters";

type DiscoveryUser = {
  slug: string;
  display_name: string;
  role: string;
  avatar_url?: string | null;
  profile_image_url?: string | null;
  cheer_count: number;
  referral_count: number;
  region?: string | null;
  prefecture?: string | null;
  sport?: string | null;
};

type DiscoveryRole = "Athlete" | "Trainer" | "Members" | "Business";

const ROLE_COLORS: Record<string, string> = {
  Athlete: "#FF5050",
  Trainer: "#32D278",
  Members: "#FFC81E",
  Business: "#3C8CFF",
};

function formatLocation(user: DiscoveryUser) {
  return [user.region, user.prefecture].filter(Boolean).join(" / ") || "地域未設定";
}

function getRankIcon(rank: number) {
  if (rank === 1) return { icon: "♛", color: "#FFD600" };
  if (rank === 2) return { icon: "🥈", color: "#DCE7F5" };
  if (rank === 3) return { icon: "🥉", color: "#D8A06A" };
  return null;
}

function ArcadeDiscoveryRow({
  user,
  rank,
  score,
  accentColor,
  onOpen,
}: {
  user: DiscoveryUser;
  rank: number;
  score: string;
  accentColor: string;
  onOpen: () => void;
}) {
  const roleColor = ROLE_COLORS[user.role] ?? accentColor;
  const rankIcon = getRankIcon(rank);

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        padding: "clamp(10px, 1.5vw, 12px) clamp(10px, 1.5vw, 12px)",
        borderRadius: 14,
        border: `1px solid ${roleColor}30`,
        background: user.profile_image_url
          ? `linear-gradient(90deg, rgba(7,10,18,0.94) 0%, rgba(7,10,18,0.82) 48%, rgba(7,10,18,0.96) 100%), url(${user.profile_image_url}) center/cover`
          : "linear-gradient(90deg, rgba(7,10,18,0.94) 0%, rgba(10,14,24,0.92) 100%)",
        display: "grid",
        gridTemplateColumns: "clamp(40px, 8vw, 48px) minmax(0, 1fr) auto",
        gap: "clamp(6px, 1vw, 8px)",
        alignItems: "center",
        color: "#fff",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div style={{ textAlign: "left" }}>
        {rankIcon ? (
          <div
            style={{
              margin: 0,
              display: "inline-flex",
              width: "1.2em",
              justifyContent: "center",
              color: rankIcon.color,
              fontSize: "clamp(18px, 3vw, 22px)",
              lineHeight: 1,
            }}
          >
            {rankIcon.icon}
          </div>
        ) : (
          <div style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{String(rank).padStart(2, "0")}</div>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: roleColor }}>{user.role}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.72)" }}>{formatLocation(user)}</span>
        </div>
        <p style={{ margin: "0 0 3px", fontSize: "clamp(13px, 2.3vw, 15px)", fontWeight: 900, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.display_name}</p>
        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.62)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.sport || "活動情報なし"}</p>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "clamp(18px, 3.2vw, 22px)", fontWeight: 900, color: score.includes("★") ? "#FFD600" : "#fff", lineHeight: 1 }}>{score}</div>
        <div style={{ marginTop: 4, fontSize: 10, color: "#fff", fontWeight: 800 }}>Check →</div>
      </div>
    </button>
  );
}

export function DiscoveryView({ t, roleColor, setView, ads, onOpenProfile }: {
  t: ThemeColors;
  roleColor: string;
  setView: (v: DashboardView) => void;
  ads: AdItem[];
  onOpenProfile?: (slug: string) => void;
}) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [region, setRegion] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [sport, setSport] = useState("");
  const [sort, setSort] = useState<"all" | "cheer" | "referral" | "new">("all");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<DiscoveryUser[]>([]);
  const [picks, setPicks] = useState<{ cheer: DiscoveryUser[]; referral: DiscoveryUser[] }>({ cheer: [], referral: [] });

  const localAds = ads.filter((ad) => ad.adScope === "regional" || isLocalPlan(ad.plan));
  const nationalAds = ads.filter((ad) => ad.adScope === "national" || !isLocalPlan(ad.plan));
  const topHero = nationalAds[0] ?? null;
  const bottomAd = localAds[0] ?? nationalAds[1] ?? null;
  const sportOptions = useMemo(() => (role ? (ROLE_DISCOVERY_OPTIONS[role as DiscoveryRole]?.options ?? []) : []), [role]);
  const sportLabel = role ? (ROLE_DISCOVERY_OPTIONS[role as DiscoveryRole]?.label ?? "項目") : "競技 / 項目";
  const prefectureOptions = useMemo(() => getPrefectureOptions(region), [region]);
  const selectedPrefecture = prefectureOptions.includes(prefecture) ? prefecture : "";
  const selectedSport = sportOptions.includes(sport) ? sport : "";

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (role) sp.set("role", role);
    if (region) sp.set("region", region);
    if (selectedPrefecture) sp.set("prefecture", selectedPrefecture);
    if (selectedSport) sp.set("sport", selectedSport);
    sp.set("sort", sort);
    return sp.toString();
  }, [q, role, region, selectedPrefecture, selectedSport, sort]);

  useEffect(() => {
    const visitKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const storageKey = `vz:discovery_visit:${visitKey}`;
    if (typeof window !== "undefined" && window.sessionStorage.getItem(storageKey) === "done") return;

    fetch("/api/missions/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ required_action: "discovery_visit" }),
    })
      .then(() => {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(storageKey, "done");
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetch(`/api/discovery?${query}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users ?? []);
        setPicks(d.picks ?? { cheer: [], referral: [] });
      })
      .catch(() => {
        setUsers([]);
        setPicks({ cheer: [], referral: [] });
      })
      .finally(() => setLoading(false));
  }, [query]);

  const sortTabs: Array<{ id: "all" | "cheer" | "referral" | "new"; label: string }> = [
    { id: "all", label: "全アカウント" },
    { id: "cheer", label: "Cheer急上昇" },
    { id: "referral", label: "紹介加速" },
    { id: "new", label: "新着" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader title="Discovery" sub="全ユーザー探索・推しレーダー" onBack={() => setView("home")} t={t} roleColor={roleColor} />

      {topHero ? (
        <AdCard ad={topHero} size="hero" />
      ) : (
        <SectionCard t={t}>
          <SLabel text="AD SLOT" color="#FFD600" size={10} />
          <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>全国スポンサー広告枠（空き枠）</p>
        </SectionCard>
      )}

      <SectionCard t={t} accentColor={roleColor}>
        <SLabel text="Vizion Radar" color={roleColor} size={10} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginBottom: 8 }}>
          <input value={q} onChange={(e) => { setLoading(true); setQ(e.target.value); }} placeholder="ユーザーID / アカウント名で検索" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 11 }} />
          <select value={role} onChange={(e) => { setLoading(true); setRole(e.target.value); setSport(""); }} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 11 }}>
            <option value="">全ロール</option>
            <option value="Athlete">Athlete</option>
            <option value="Trainer">Trainer</option>
            <option value="Members">Members</option>
            <option value="Business">Business</option>
          </select>
          <select value={region} onChange={(e) => { setLoading(true); setRegion(e.target.value); setPrefecture(""); }} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 11 }}>
            <option value="">全地域</option>
            {REGION_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select value={selectedPrefecture} onChange={(e) => { setLoading(true); setPrefecture(e.target.value); }} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 11 }}>
            <option value="">{region ? "都道府県を選択" : "全都道府県"}</option>
            {prefectureOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {role ? (
            <select
              value={selectedSport}
              onChange={(e) => { setLoading(true); setSport(e.target.value); }}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 11 }}
            >
              <option value="">{sportLabel}を選択</option>
              {sportOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sortTabs.map((tab) => (
            <button key={tab.id} onClick={() => { setLoading(true); setSort(tab.id); }} style={{ padding: "5px 10px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 10, background: sort === tab.id ? `${roleColor}22` : "rgba(255,255,255,0.05)", color: sort === tab.id ? roleColor : t.sub, outline: sort === tab.id ? `1px solid ${roleColor}40` : "none" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </SectionCard>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
        <SectionCard t={t}>
          <SLabel text="Cheer Ranking" color="#FFD600" size={10} />
          <div style={{ display: "grid", gap: 8 }}>
            {picks.cheer.slice(0, 5).map((u, i) => (
              <ArcadeDiscoveryRow
                key={`c-${u.slug}`}
                user={u}
                rank={i + 1}
                score={`★ ${u.cheer_count}`}
                accentColor="#FFD600"
                onOpen={() => onOpenProfile?.(u.slug)}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard t={t}>
          <SLabel text="Referral Ranking" color={roleColor} size={10} />
          <div style={{ display: "grid", gap: 8 }}>
            {picks.referral.slice(0, 5).map((u, i) => (
              <ArcadeDiscoveryRow
                key={`r-${u.slug}`}
                user={u}
                rank={i + 1}
                score={String(u.referral_count)}
                accentColor={roleColor}
                onOpen={() => onOpenProfile?.(u.slug)}
              />
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard t={t} accentColor={roleColor}>
        <SLabel text="Discovery Results" color={roleColor} size={10} />
        {loading ? (
          <p style={{ fontSize: 12, color: t.sub, margin: 0 }}>レーダー同期中...</p>
        ) : users.length === 0 ? (
          <p style={{ fontSize: 12, color: t.sub, margin: 0 }}>条件に一致するユーザーがいません。</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {users.map((u, i) => (
              <ArcadeDiscoveryRow
                key={u.slug}
                user={u}
                rank={i + 1}
                score={`★ ${u.cheer_count}`}
                accentColor={roleColor}
                onOpen={() => onOpenProfile?.(u.slug)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {bottomAd ? (
        <AdCard ad={bottomAd} size="medium" />
      ) : (
        <SectionCard t={t}>
          <SLabel text="AD SLOT" color="#FFD600" size={10} />
          <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>サイド広告枠（空き枠）</p>
        </SectionCard>
      )}
    </div>
  );
}
