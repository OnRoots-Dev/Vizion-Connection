"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import { ActionPill, CardHeader, SectionCard } from "@/app/(app)/dashboard/components/ui";
import type { ThemeColors } from "@/app/(app)/dashboard/types";
import type { DashboardView } from "@/app/(app)/dashboard/types";
import { useDailyLogStore } from "@/hooks/useDailyLogStore";
import { CONDITION_OPTIONS, getConditionMeta, getJourneyHype } from "./journey";

export function DailyLogCard({
  t,
  roleColor,
  onOpenJourney,
}: {
  t: ThemeColors;
  roleColor: string;
  onOpenJourney?: (view: DashboardView) => void;
}) {
  const { todayLog, isLoading, isSubmitting, hasLoaded, error, fetchLogs, submitLog } = useDailyLogStore();
  const [content, setContent] = useState("");
  const [conditionScore, setConditionScore] = useState<number | null>(null);

  useEffect(() => {
    if (!hasLoaded) {
      void fetchLogs();
    }
  }, [fetchLogs, hasLoaded]);

  const remaining = useMemo(() => 200 - content.length, [content.length]);
  const canSubmit = content.trim().length > 0 && conditionScore !== null && !isSubmitting && !todayLog;
  const todayCondition = getConditionMeta(todayLog?.condition_score);
  const hypeMessage = useMemo(() => getJourneyHype(todayLog), [todayLog]);

  async function handleSubmit() {
    if (!canSubmit || conditionScore === null) return;

    const ok = await submitLog({
      content: content.trim(),
      conditionScore,
    });

    if (ok) {
      setContent("");
      setConditionScore(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <SectionCard t={t} accentColor={roleColor}>
        <CardHeader
          title="My Journey"
          color={roleColor}
          action={<ActionPill onClick={() => onOpenJourney?.("journey")} color={roleColor} t={t}>記録画面 →</ActionPill>}
          meta={<p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>一言と今の気分だけ、今日のJourneyを残します。</p>}
        />

        {error ? (
          <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.08)", color: "rgba(255,160,160,0.95)", fontSize: 12 }}>
            {error}
          </div>
        ) : null}

        {!hasLoaded && isLoading ? <div style={{ padding: "12px 0", fontSize: 12, color: t.sub }}>読み込み中...</div> : null}

        <div style={{ display: "grid", gap: 12 }}>
          {todayLog ? (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ padding: "14px 16px", borderRadius: 16, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: `${roleColor}14`, border: `1px solid ${roleColor}24`, color: roleColor }}>
                      <MessageSquareText size={16} />
                    </div>
                    <div>
                      <p style={{ margin: "0 0 3px", fontSize: 11, color: t.sub, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "monospace" }}>Today&apos;s Entry</p>
                      <p style={{ margin: 0, fontSize: 12, color: t.text }}>
                        {todayCondition?.emoji ?? "🙂"} {todayCondition?.label ?? "記録済み"}
                      </p>
                    </div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: t.text, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{todayLog.content}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value.slice(0, 200))}
                  maxLength={200}
                  placeholder="今日の一言・取り組みを記録しよう"
                  rows={3}
                  style={{ width: "100%", resize: "none", borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.text, padding: "13px 14px 34px", fontSize: 12, lineHeight: 1.65, outline: "none" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: -30, padding: "0 14px" }}>
                  <span style={{ fontSize: 10, color: t.sub }}>4:00-10:00 の記録で +10pt</span>
                  <span style={{ fontSize: 10, color: remaining >= 0 ? t.sub : "rgba(255,80,80,0.9)" }}>残り{remaining}文字</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8 }}>
                {CONDITION_OPTIONS.map((option) => {
                  const selected = conditionScore === option.score;
                  return (
                    <motion.button
                      key={option.score}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      animate={{ scale: selected ? 1.03 : 1 }}
                      onClick={() => setConditionScore(option.score)}
                      style={{
                        borderRadius: 14,
                        border: `1px solid ${selected ? `${roleColor}44` : t.border}`,
                        background: selected ? `${roleColor}18` : "rgba(255,255,255,0.03)",
                        color: selected ? t.text : t.sub,
                        padding: "10px 6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 6,
                      }}
                      aria-label={option.label}
                    >
                      <span style={{ fontSize: 20, lineHeight: 1 }}>{option.emoji}</span>
                      <span style={{ fontSize: 9, lineHeight: 1.2 }}>{option.score}</span>
                    </motion.button>
                  );
                })}
              </div>

              <button
                type="button"
                className="vz-btn"
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{ width: "100%", border: "none", borderRadius: 14, padding: "12px 14px", background: canSubmit ? roleColor : "rgba(255,255,255,0.08)", color: canSubmit ? "#0B0B0F" : "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 800, cursor: canSubmit ? "pointer" : "not-allowed" }}
              >
                {isSubmitting ? "記録中..." : "Journeyを記録"}
              </button>
            </div>
          )}

          <div style={{ padding: "12px 14px", borderRadius: 16, border: `1px solid ${roleColor}22`, background: `${roleColor}10` }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: roleColor, fontWeight: 900, letterSpacing: "0.04em" }}>📣 Your HYPE</p>
            <p style={{ margin: 0, fontSize: 12, color: t.text, lineHeight: 1.7 }}>{hypeMessage.replace(/^Your Hype:\s*/, "")}</p>
          </div>
        </div>
      </SectionCard>
    </motion.div>
  );
}
