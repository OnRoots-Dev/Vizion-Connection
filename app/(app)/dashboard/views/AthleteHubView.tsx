"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import { HubAdPanel } from "@/app/(app)/dashboard/components/HubAdPanel";
import type { AdItem } from "@/lib/ads-shared";

type HubStats = { journeyCount: number; cheerCount: number; streak: number; bondCount: number };

export function AthleteHubView({
  profile,
  t,
  roleColor,
  setView,
  ads,
}: {
  profile: ProfileData;
  t: ThemeColors;
  roleColor: string;
  setView: (v: DashboardView) => void;
  ads: AdItem[];
}) {
  const accent = roleColor;
  const [stats, setStats] = useState<HubStats | null>(null);

  useEffect(() => {
    fetch("/api/athlete-hub/stats")
      .then((r) => r.json())
      .then((d) => setStats(d as HubStats))
      .catch(() => { /* サイレント */ });
  }, []);

  const statItems = [
    { label: "Journey", value: stats?.journeyCount ?? "—", onClick: () => setView("journey") },
    { label: "Cheer", value: stats?.cheerCount ?? "—", onClick: () => setView("cheer") },
    { label: "継続", value: stats ? `${stats.streak}日` : "—", onClick: undefined },
    { label: "Bond", value: stats?.bondCount ?? "—", onClick: undefined },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader title="Athlete Hub" sub="あなたの活動データ" onBack={() => setView("home")} t={t} roleColor={roleColor} />
      <HubAdPanel ads={ads} t={t} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <SectionCard t={t} accentColor={accent}>
          <SLabel text="Stats" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 8 }}>
            {statItems.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={s.onClick}
                disabled={!s.onClick}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  padding: "14px 8px", borderRadius: 12,
                  border: `1px solid ${accent}28`, background: `${accent}10`,
                  cursor: s.onClick ? "pointer" : "default",
                  color: t.text,
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 900, color: accent, lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: t.sub }}>{s.label}</span>
              </button>
            ))}
          </div>
        </SectionCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <SectionCard t={t}>
          <SLabel text="アクション" />
          <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setView("journey")}
              style={{ padding: "13px 16px", borderRadius: 12, border: "none", background: accent, color: "#061018", fontSize: 13, fontWeight: 800, cursor: "pointer", textAlign: "left" }}
            >
              今日の記録をする →
            </button>
            <a
              href={`/u/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", padding: "13px 16px", borderRadius: 12, border: `1px solid ${accent}40`, background: `${accent}0d`, color: accent, fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "left" }}
            >
              公開プロフィールを見る →
            </a>
          </div>
        </SectionCard>
      </motion.div>
    </div>
  );
}
