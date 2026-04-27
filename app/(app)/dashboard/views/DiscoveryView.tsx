"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import type { AdItem } from "@/lib/ads-shared";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard from "@/components/AdCard";
import { REGION_OPTIONS, ROLE_DISCOVERY_OPTIONS, getPrefectureOptions } from "@/lib/discovery-filters";
import { useDailyLogStore } from "@/hooks/useDailyLogStore";

type DiscoveryUser = {
  slug: string;
  display_name: string;
  role: string;
  avatar_url?: string | null;
  profile_image_url?: string | null;
  cheer_count: number;
  weekly_cheer_count: number;
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

function compareWeeklyCheer(a: DiscoveryUser, b: DiscoveryUser) {
  if ((b.weekly_cheer_count ?? 0) !== (a.weekly_cheer_count ?? 0)) return (b.weekly_cheer_count ?? 0) - (a.weekly_cheer_count ?? 0);
  if ((b.cheer_count ?? 0) !== (a.cheer_count ?? 0)) return (b.cheer_count ?? 0) - (a.cheer_count ?? 0);
  if ((b.referral_count ?? 0) !== (a.referral_count ?? 0)) return (b.referral_count ?? 0) - (a.referral_count ?? 0);
  return a.slug.localeCompare(b.slug);
}

function compareReferral(a: DiscoveryUser, b: DiscoveryUser) {
  if ((b.referral_count ?? 0) !== (a.referral_count ?? 0)) return (b.referral_count ?? 0) - (a.referral_count ?? 0);
  if ((b.weekly_cheer_count ?? 0) !== (a.weekly_cheer_count ?? 0)) return (b.weekly_cheer_count ?? 0) - (a.weekly_cheer_count ?? 0);
  if ((b.cheer_count ?? 0) !== (a.cheer_count ?? 0)) return (b.cheer_count ?? 0) - (a.cheer_count ?? 0);
  return a.slug.localeCompare(b.slug);
}

function ArcadeDiscoveryRow({
  user,
  rank,
  score,
  accentColor,
  onOpen,
  scoreTone = "default",
}: {
  user: DiscoveryUser;
  rank: number;
  score: string;
  accentColor: string;
  onOpen: () => void;
  scoreTone?: "default" | "gold";
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
        borderRadius: 14,
        border: `1px solid ${roleColor}30`,
        background: "linear-gradient(90deg, rgba(7,10,18,0.94) 0%, rgba(7,10,18,0.90) 55%, rgba(7,10,18,0.96) 100%)",
        color: "#fff",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {user.profile_image_url ? (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                left: "50%",
                backgroundImage: `url(${user.profile_image_url})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "contain",
                opacity: 0.95,
                filter: "saturate(1.05) contrast(1.02)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(7,10,18,0.98) 0%, rgba(7,10,18,0.94) 45%, rgba(7,10,18,0.55) 60%, rgba(7,10,18,0.88) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "50%",
                width: 48,
                transform: "translateX(-50%)",
                background:
                  "linear-gradient(90deg, rgba(7,10,18,1) 0%, rgba(7,10,18,0.0) 50%, rgba(7,10,18,1) 100%)",
                opacity: 0.55,
                filter: "blur(10px)",
              }}
            />
          </>
        ) : null}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.06), transparent 52%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 1,
            borderRadius: 13,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "clamp(10px, 1.5vw, 12px) clamp(10px, 1.5vw, 12px)",
          display: "grid",
          gridTemplateColumns: "clamp(40px, 8vw, 48px) minmax(0, 1fr) auto",
          gap: "clamp(6px, 1vw, 8px)",
          alignItems: "center",
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
          <div style={{ fontSize: "clamp(18px, 3.2vw, 22px)", fontWeight: 900, color: scoreTone === "gold" ? "#FFD600" : "#fff", lineHeight: 1 }}>{score}</div>
          <div style={{ marginTop: 4, fontSize: 10, color: "#fff", fontWeight: 800 }}>Check →</div>
        </div>
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
  const { logs, hasLoaded, fetchLogs } = useDailyLogStore();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [region, setRegion] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [sport, setSport] = useState("");
  const [sort, setSort] = useState<"all" | "cheer" | "referral" | "new" | "newcomer">("all");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<DiscoveryUser[]>([]);
  const [picks, setPicks] = useState<{ cheer: DiscoveryUser[]; referral: DiscoveryUser[] }>({ cheer: [], referral: [] });
  const [isPc, setIsPc] = useState(false);
  const [listMode, setListMode] = useState<null | "cheer" | "referral" | "results">(null);
  const [radarTab, setRadarTab] = useState<"all" | "cheer" | "referral" | "newcomer">("all");
  const LIST_PAGE_SIZE = 24;
  const [listPage, setListPage] = useState<1 | 2>(1);

  const localAds = ads.filter((ad) => ad.adScope === "regional" || isLocalPlan(ad.plan));
  const nationalAds = ads.filter((ad) => ad.adScope === "national" || !isLocalPlan(ad.plan));
  const topHero = nationalAds[0] ?? null;
  const bottomAd = localAds[0] ?? nationalAds[1] ?? null;
  const sportOptions = useMemo(() => (role ? (ROLE_DISCOVERY_OPTIONS[role as DiscoveryRole]?.options ?? []) : []), [role]);
  const sportLabel = role ? (ROLE_DISCOVERY_OPTIONS[role as DiscoveryRole]?.label ?? "項目") : "競技 / 項目";
  const prefectureOptions = useMemo(() => getPrefectureOptions(region), [region]);
  const selectedPrefecture = prefectureOptions.includes(prefecture) ? prefecture : "";
  const selectedSport = sportOptions.includes(sport) ? sport : "";

  useEffect(() => {
    if (!hasLoaded) {
      void fetchLogs();
    }
  }, [fetchLogs, hasLoaded]);

  const journeyStreak = useMemo(() => {
    const map = new Map(logs.map((log) => [log.log_date, log]));
    const getDateKey = (offset: number) => {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    };

    let count = 0;
    for (let i = 0; i < 30; i += 1) {
      if (map.has(getDateKey(i))) count += 1;
      else break;
    }
    return count;
  }, [logs]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsPc(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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

  useEffect(() => {
    setListPage(1);
  }, [LIST_PAGE_SIZE, listMode, query]);

  const boostedUsers = useMemo(() => {
    const list = [...users];
    if (sort === "referral") {
      return list.sort(compareReferral);
    }
    if (sort === "cheer") {
      return list.sort(compareWeeklyCheer);
    }
    if (sort === "new" || sort === "newcomer") {
      return list;
    }

    return list.sort((a, b) => {
      const aScore = (a.weekly_cheer_count ?? 0) + (a.referral_count ?? 0) * 4;
      const bScore = (b.weekly_cheer_count ?? 0) + (b.referral_count ?? 0) * 4;
      if (bScore !== aScore) return bScore - aScore;
      return compareWeeklyCheer(a, b);
    });
  }, [sort, users]);

  const listUsers = useMemo(() => {
    if (listMode === "cheer") {
      return [...users].sort(compareWeeklyCheer);
    }
    if (listMode === "referral") {
      return [...users].sort(compareReferral);
    }
    return boostedUsers;
  }, [boostedUsers, listMode, users]);

  const listTotal = listUsers.length;
  const maxPages = Math.max(1, Math.min(2, Math.ceil(listTotal / LIST_PAGE_SIZE)));
  const page = Math.min(listPage, maxPages) as 1 | 2;
  const start = (page - 1) * LIST_PAGE_SIZE;
  const end = start + LIST_PAGE_SIZE;
  const pageUsers = listUsers.slice(start, end);

  const listTitle = listMode === "cheer" ? "Cheer Ranking" : listMode === "referral" ? "Referral Ranking" : "Discovery Results";

  const sortTabs: Array<{ id: "all" | "cheer" | "referral" | "newcomer"; label: string }> = [
    { id: "all", label: "全アカウント" },
    { id: "cheer", label: "Cheerランキング" },
    { id: "referral", label: "紹介数ランキング" },
    { id: "newcomer", label: "新着" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader title="Discovery" sub="全ユーザー探索・推しレーダー" onBack={() => setView("home")} t={t} roleColor={roleColor} />

      <AnimatePresence mode="wait" initial={false}>
      {listMode ? (
        <motion.div
          key={`discovery-list-${listMode}`}
          initial={{ opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.985 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
        <SectionCard t={t} accentColor={roleColor}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <div>
              <SLabel text={listTitle} color={roleColor} size={10} />
              <p style={{ margin: "6px 0 0", fontSize: 11, color: t.sub }}>
                一覧表示（タップでプロフィールプレビュー） · {start + 1}-{Math.min(end, listTotal)}/{listTotal}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setListMode(null)}
              style={{ borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text, fontWeight: 900, fontSize: 12, padding: "10px 12px", cursor: "pointer" }}
            >
              ← 戻る
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={() => setListPage(1)}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${t.border}`,
                  background: page === 1 ? `${roleColor}22` : "rgba(255,255,255,0.03)",
                  color: page === 1 ? roleColor : t.text,
                  fontWeight: 900,
                  fontSize: 11,
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                1
              </button>
              <button
                type="button"
                onClick={() => setListPage(2)}
                disabled={maxPages < 2}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${t.border}`,
                  background: page === 2 ? `${roleColor}22` : "rgba(255,255,255,0.03)",
                  color: maxPages < 2 ? "rgba(255,255,255,0.25)" : page === 2 ? roleColor : t.text,
                  fontWeight: 900,
                  fontSize: 11,
                  padding: "8px 12px",
                  cursor: maxPages < 2 ? "default" : "pointer",
                  opacity: maxPages < 2 ? 0.6 : 1,
                }}
              >
                2
              </button>
            </div>
            {page === 2 && listTotal > LIST_PAGE_SIZE * 2 ? (
              <span style={{ fontSize: 10, color: t.sub, opacity: 0.85 }}>
                3ページ目以降は検索で絞り込み推奨
              </span>
            ) : null}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${listMode}-${page}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "grid", gap: 8 }}
            >
            {pageUsers.map((u, i) => (
              <ArcadeDiscoveryRow
                key={`${listMode ?? "results"}-${u.slug}`}
                user={u}
                rank={start + i + 1}
                score={listMode === "referral" ? String(u.referral_count) : String(u.weekly_cheer_count)}
                accentColor={roleColor}
                scoreTone={listMode === "referral" ? "default" : "gold"}
                onOpen={() => onOpenProfile?.(u.slug)}
              />
            ))}
            </motion.div>
          </AnimatePresence>
        </SectionCard>
        </motion.div>
      ) : null}

      {listMode ? null : (
        <motion.div
          key="discovery-main"
          initial={{ opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.985 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >

      {topHero ? (
        <AdCard ad={topHero} size="hero" />
      ) : (
        <SectionCard t={t}>
          <SLabel text="AD SLOT" color="#FFD600" size={10} />
          <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>全国スポンサー広告枠（空き枠）</p>
        </SectionCard>
      )}

      <div style={{ margin: "8px 0" }}>
        <SLabel text="Vizion Radar" color={roleColor} size={10} />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${isPc ? 4 : 2}, minmax(0, 1fr))`, gap: 8, marginBottom: 8 }}>
          <div style={{ position: "relative" }}>
            <input
              value={q}
              onChange={(e) => { setLoading(true); setQ(e.target.value); }}
              placeholder="ユーザーID / アカウント名で検索"
              style={{ width: "100%", padding: "10px 36px 10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, fontSize: 11 }}
            />
            {q.trim() ? (
              <button
                type="button"
                aria-label="検索条件をクリア"
                onClick={() => { setLoading(true); setQ(""); }}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 22,
                  height: 22,
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: "rgba(255,255,255,0.04)",
                  color: t.sub,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            ) : null}
          </div>
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
            <button
              key={tab.id}
              onClick={() => {
                setLoading(true);
                setRadarTab(tab.id);
                setSort(tab.id);
              }}
              style={{ padding: "5px 10px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 10, background: sort === tab.id ? `${roleColor}22` : "rgba(255,255,255,0.05)", color: sort === tab.id ? roleColor : t.sub, outline: sort === tab.id ? `1px solid ${roleColor}40` : "none" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`radar-pane-${radarTab}`}
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {radarTab === "cheer" ? (
            <SectionCard t={t}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                <SLabel text="Weekly Cheer Ranking" color="#FFD600" size={10} />
                <button type="button" onClick={() => setListMode("cheer")} style={{ border: "none", background: "transparent", color: t.sub, fontWeight: 900, fontSize: 11, cursor: "pointer" }}>
                  もっと見る→
                </button>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {picks.cheer.slice(0, 5).map((u, i) => (
                  <ArcadeDiscoveryRow
                    key={`c-${u.slug}`}
                    user={u}
                    rank={i + 1}
                    score={String(u.weekly_cheer_count)}
                    accentColor="#FFD600"
                    scoreTone="gold"
                    onOpen={() => onOpenProfile?.(u.slug)}
                  />
                ))}
              </div>
            </SectionCard>
          ) : radarTab === "referral" ? (
            <SectionCard t={t}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                <SLabel text="Referral Ranking" color={roleColor} size={10} />
                <button type="button" onClick={() => setListMode("referral")} style={{ border: "none", background: "transparent", color: t.sub, fontWeight: 900, fontSize: 11, cursor: "pointer" }}>
                  もっと見る→
                </button>
              </div>
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
          ) : radarTab === "newcomer" ? (
            <SectionCard t={t} accentColor={roleColor}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <SLabel text="New Results" color="#fff" size={10} />
                <button type="button" onClick={() => setListMode("results")} style={{ border: "none", background: "transparent", color: t.sub, fontWeight: 900, fontSize: 11, cursor: "pointer" }}>
                  もっと見る→
                </button>
              </div>
              {loading ? (
                <p style={{ fontSize: 12, color: t.sub, margin: 0 }}>レーダー同期中...</p>
              ) : users.length === 0 ? (
                <p style={{ fontSize: 12, color: t.sub, margin: 0 }}>条件に一致するユーザーがいません。</p>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {users.slice(0, 10).map((u, i) => (
                    <ArcadeDiscoveryRow
                      key={u.slug}
                      user={u}
                      rank={i + 1}
                      score={String(u.weekly_cheer_count)}
                      accentColor={roleColor}
                      scoreTone="gold"
                      onOpen={() => onOpenProfile?.(u.slug)}
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          ) : (
            <SectionCard t={t} accentColor={roleColor}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <SLabel text="Discovery Results" color="#fff" size={10} />
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: t.sub, opacity: 0.8, whiteSpace: "nowrap" }}>
                    Journey継続で露出が上がります（現在: 連続{journeyStreak}日）
                  </span>
                  <button type="button" onClick={() => setListMode("results")} style={{ border: "none", background: "transparent", color: t.sub, fontWeight: 900, fontSize: 11, cursor: "pointer" }}>
                    もっと見る→
                  </button>
                </div>
              </div>
              {loading ? (
                <p style={{ fontSize: 12, color: t.sub, margin: 0 }}>レーダー同期中...</p>
              ) : users.length === 0 ? (
                <p style={{ fontSize: 12, color: t.sub, margin: 0 }}>条件に一致するユーザーがいません。</p>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {boostedUsers.slice(0, 10).map((u, i) => (
                    <ArcadeDiscoveryRow
                      key={u.slug}
                      user={u}
                      rank={i + 1}
                      score={String(u.weekly_cheer_count)}
                      accentColor={roleColor}
                      scoreTone="gold"
                      onOpen={() => onOpenProfile?.(u.slug)}
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          )}
        </motion.div>
      </AnimatePresence>

      {bottomAd ? (
        <AdCard ad={bottomAd} size="medium" />
      ) : (
        <SectionCard t={t}>
          <SLabel text="AD SLOT" color="#FFD600" size={10} />
          <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>サイド広告枠（空き枠）</p>
        </SectionCard>
      )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
