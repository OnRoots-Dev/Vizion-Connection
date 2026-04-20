"use client";

import { useEffect, useMemo, useState } from "react";
import { ViewHeader, SectionCard, SLabel } from "@/app/(app)/dashboard/components/ui";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import type { ProfileData } from "@/features/profile/types";

type CheerInsights = {
  total: number;
  anonymous: number;
  byRole: Record<string, number>;
  byRegion: Record<string, number>;
  bySport: Record<string, number>;
};

function sortEntries(map: Record<string, number>, limit?: number) {
  const entries = Object.entries(map).filter(([, value]) => Number(value) > 0);
  entries.sort((a, b) => b[1] - a[1]);
  return typeof limit === "number" ? entries.slice(0, limit) : entries;
}

function BarList({
  title,
  items,
  total,
  accent,
  t,
}: {
  title: string;
  items: [string, number][];
  total: number;
  accent: string;
  t: ThemeColors;
}) {
  return (
    <SectionCard t={t} accentColor={accent}>
      <SLabel text={title} color={accent} />
      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12, color: t.sub }}>まだデータがありません。</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map(([label, value]) => {
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return (
              <div key={label} style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</p>
                  </div>
                  <div style={{ fontSize: 11, color: t.sub, fontFamily: "monospace", whiteSpace: "nowrap" }}>{value} ({pct}%)</div>
                </div>
                <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

export function CheerGraphView({
  profile,
  t,
  roleColor,
  setView,
  onBack,
}: {
  profile: ProfileData;
  t: ThemeColors;
  roleColor: string;
  setView: (v: DashboardView) => void;
  onBack?: () => void;
}) {
  const [insights, setInsights] = useState<CheerInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/cheer/insights", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json?.success === false) {
          throw new Error(typeof json?.error === "string" ? json.error : "Cheerグラフの取得に失敗しました");
        }
        if (active) {
          setInsights((json.insights ?? null) as CheerInsights | null);
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : "Cheerグラフの取得に失敗しました");
          setInsights(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const total = insights?.total ?? 0;

  const byRole = useMemo(() => sortEntries(insights?.byRole ?? {}), [insights]);
  const byRegion = useMemo(() => sortEntries(insights?.byRegion ?? {}, 8), [insights]);
  const bySport = useMemo(() => sortEntries(insights?.bySport ?? {}, 8), [insights]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader
        title="Cheer Graph"
        sub="Cheerしてくれたユーザーの属性分布"
        onBack={onBack ?? (() => setView("home"))}
        t={t}
        roleColor={roleColor}
      />

      <SectionCard t={t} accentColor={roleColor}>
        <SLabel text="Overview" color={roleColor} />
        {loading ? (
          <p style={{ margin: 0, fontSize: 12, color: t.sub }}>読み込み中...</p>
        ) : error ? (
          <p style={{ margin: 0, fontSize: 12, color: "#ff9b9b" }}>{error}</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: 10, color: t.sub }}>TOTAL CHEER</div>
              <div style={{ marginTop: 8, fontSize: 30, fontWeight: 900, color: "#FFD600", fontFamily: "monospace" }}>{total.toLocaleString()}</div>
              <div style={{ marginTop: 6, fontSize: 10, color: t.sub }}>あなた宛に送られたCheer（集計）</div>
            </div>
            <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: 10, color: t.sub }}>ANONYMOUS</div>
              <div style={{ marginTop: 8, fontSize: 30, fontWeight: 900, color: t.text, fontFamily: "monospace" }}>{(insights?.anonymous ?? 0).toLocaleString()}</div>
              <div style={{ marginTop: 6, fontSize: 10, color: t.sub }}>from_slug が未設定のCheer</div>
            </div>
            <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${roleColor}28`, background: `${roleColor}12` }}>
              <div style={{ fontSize: 10, color: t.sub }}>PROFILE</div>
              <div style={{ marginTop: 8, fontSize: 14, fontWeight: 900, color: t.text }}>{profile.displayName}</div>
              <div style={{ marginTop: 6, fontSize: 11, color: t.sub }}>@{profile.slug}</div>
            </div>
          </div>
        )}
      </SectionCard>

      {loading || error ? null : (
        <>
          <BarList title="By Role" items={byRole} total={total} accent={roleColor} t={t} />
          <BarList title="Top Regions" items={byRegion} total={total} accent={roleColor} t={t} />
          <BarList title="Top Sports" items={bySport} total={total} accent={roleColor} t={t} />
        </>
      )}
    </div>
  );
}
