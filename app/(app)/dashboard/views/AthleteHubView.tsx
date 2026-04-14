"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import { HubAdPanel } from "@/app/(app)/dashboard/components/HubAdPanel";
import { getHubConfig } from "@/features/hub/config";
import type { AdItem } from "@/lib/ads-shared";

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
  const hub = getHubConfig(profile.role);
  const accent = hub.accentColor || roleColor;
  const [selectedFeatureId, setSelectedFeatureId] = useState(hub.features[0]?.id ?? "");

  const selectedFeature = useMemo(
    () => hub.features.find((feature) => feature.id === selectedFeatureId) ?? hub.features[0],
    [hub.features, selectedFeatureId],
  );

  if (!selectedFeature) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader title="Athlete Hub" sub={hub.purpose} onBack={() => setView("home")} t={t} roleColor={accent} />
      <HubAdPanel ads={ads} t={t} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <SectionCard t={t} accentColor={accent}>
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, border: `1px solid ${accent}25`, background: `linear-gradient(135deg, ${accent}16, rgba(255,255,255,0.03))`, padding: 18 }}>
            <div style={{ position: "absolute", right: -24, top: -24, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${accent}28, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, fontFamily: "monospace" }}>{hub.accentLabel}</p>
              <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: t.text }}>{hub.hubName}</h2>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: t.text, fontWeight: 700 }}>{hub.purpose}</p>
              <p style={{ margin: 0, fontSize: 11, color: t.sub, lineHeight: 1.8 }}>{hub.summary}</p>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, alignItems: "start" }}>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
          <SectionCard t={t} accentColor={accent}>
            <SLabel text="Hub Menu" color={accent} />
            <div style={{ display: "grid", gap: 10 }}>
              {hub.features.map((feature, index) => {
                const active = selectedFeature.id === feature.id;
                return (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => {
                      if (feature.targetView) {
                        setView(feature.targetView);
                        return;
                      }
                      setSelectedFeatureId(feature.id);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "14px 15px",
                      borderRadius: 16,
                      border: `1px solid ${active ? `${accent}45` : t.border}`,
                      background: active ? `${accent}16` : "rgba(255,255,255,0.03)",
                      color: t.text,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 999, background: active ? `${accent}20` : "rgba(255,255,255,0.06)", border: `1px solid ${active ? `${accent}40` : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: active ? accent : t.sub, fontSize: 11, fontWeight: 900, fontFamily: "monospace", flexShrink: 0 }}>
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 800, color: active ? accent : t.text }}>{feature.title}</p>
                        <p style={{ margin: 0, fontSize: 10, color: t.sub, lineHeight: 1.7 }}>{feature.summary}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <SectionCard t={t} accentColor={accent}>
            <SLabel text="Feature Detail" color={accent} />
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ padding: 18, borderRadius: 18, border: `1px solid ${accent}28`, background: `linear-gradient(145deg, ${accent}14, rgba(255,255,255,0.02))` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900, color: t.text }}>{selectedFeature.title}</p>
                    <p style={{ margin: 0, fontSize: 11, color: accent, fontWeight: 800 }}>{selectedFeature.summary}</p>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: 999, border: `1px solid ${accent}35`, background: `${accent}12`, color: accent, fontSize: 10, fontWeight: 800, fontFamily: "monospace" }}>
                    MAIN FUNCTION
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.9 }}>{selectedFeature.detail}</p>
              </div>

              <div style={{ padding: "14px 16px", borderRadius: 16, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.025)" }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: t.sub, opacity: 0.6, fontFamily: "monospace" }}>How This Drives Value</p>
                <p style={{ margin: 0, fontSize: 11, color: t.sub, lineHeight: 1.8 }}>
                  アスリート活動の広がりを見える化し、応援の増加や案件機会を次の収益行動へつなげやすくします。
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {selectedFeature.targetView ? (
                  <button type="button" onClick={() => setView(selectedFeature.targetView!)} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: accent, color: "#061018", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                    {selectedFeature.actionLabel}
                  </button>
                ) : (
                  <div style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${accent}25`, background: `${accent}12`, color: accent, fontSize: 12, fontWeight: 800 }}>
                    {selectedFeature.actionLabel}
                  </div>
                )}
                <button type="button" onClick={() => setSelectedFeatureId(hub.features[0].id)} style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.sub, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Hubトップに戻る
                </button>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      </div>
    </div>
  );
}
