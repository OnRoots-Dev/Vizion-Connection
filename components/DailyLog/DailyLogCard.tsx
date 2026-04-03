"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, MessageSquareText } from "lucide-react";
import { SectionCard } from "@/app/(app)/dashboard/components/ui";
import type { ThemeColors } from "@/app/(app)/dashboard/types";
import { useDailyLogStore } from "@/hooks/useDailyLogStore";

const CONDITION_OPTIONS = [
  { score: 1, emoji: "😫", label: "かなりきつい" },
  { score: 2, emoji: "😕", label: "少し重い" },
  { score: 3, emoji: "😐", label: "ふつう" },
  { score: 4, emoji: "🙂", label: "いい感じ" },
  { score: 5, emoji: "💪", label: "かなり良い" },
] as const;

function getConditionMeta(score: number | null | undefined) {
  return CONDITION_OPTIONS.find((option) => option.score === score) ?? null;
}

export function DailyLogCard({ t, roleColor }: { t: ThemeColors; roleColor: string }) {
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
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 900, color: t.text }}>今日のログ</p>
            <p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>
              毎日の記録が、あなたの成長を証明する。
            </p>
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${roleColor}18`,
              border: `1px solid ${roleColor}30`,
              color: roleColor,
              flexShrink: 0,
            }}
          >
            <MessageSquareText size={18} />
          </div>
        </div>

        {error ? (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,80,80,0.2)",
              background: "rgba(255,80,80,0.08)",
              color: "rgba(255,160,160,0.95)",
              fontSize: 12,
            }}
          >
            {error}
          </div>
        ) : null}

        {!hasLoaded && isLoading ? (
          <div style={{ padding: "12px 0", fontSize: 12, color: t.sub }}>読み込み中...</div>
        ) : null}

        <AnimatePresence mode="wait">
          {todayLog ? (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: `${roleColor}12`,
                  border: `1px solid ${roleColor}25`,
                  color: roleColor,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={16} />
                今日のログを記録しました ✓
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <div
                  style={{
                    padding: "14px 14px 12px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${t.border}`,
                  }}
                >
                  <p style={{ margin: "0 0 8px", fontSize: 10, color: t.sub }}>今日の記録</p>
                  <p style={{ margin: 0, fontSize: 13, color: t.text, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                    {todayLog.content}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${t.border}`,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 10, color: t.sub }}>コンディション</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 24, lineHeight: 1 }}>{todayCondition?.emoji ?? "🙂"}</span>
                      <span style={{ fontSize: 12, color: t.text, fontWeight: 700 }}>{todayCondition?.label ?? "記録済み"}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: t.sub }}>
                    スコア: {todayLog.condition_score ?? "-"} / 5
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{ display: "grid", gap: 12 }}
            >
              <div>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value.slice(0, 200))}
                  maxLength={200}
                  placeholder="今日の一言・取り組みを記録しよう"
                  rows={4}
                  style={{
                    width: "100%",
                    resize: "none",
                    borderRadius: 14,
                    border: `1px solid ${t.border}`,
                    background: "rgba(255,255,255,0.03)",
                    color: t.text,
                    padding: "14px 14px 40px",
                    fontSize: 13,
                    lineHeight: 1.7,
                    outline: "none",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -30, paddingRight: 12 }}>
                  <span style={{ fontSize: 10, color: remaining >= 0 ? t.sub : "rgba(255,80,80,0.9)" }}>
                    残り{remaining}文字
                  </span>
                </div>
              </div>

              <div>
                <p style={{ margin: "0 0 8px", fontSize: 11, color: t.sub }}>今日のコンディション</p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                    gap: 8,
                  }}
                >
                  {CONDITION_OPTIONS.map((option) => {
                    const selected = conditionScore === option.score;
                    return (
                      <motion.button
                        key={option.score}
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        animate={{ scale: selected ? 1.05 : 1 }}
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
                        <span style={{ fontSize: 22, lineHeight: 1 }}>{option.emoji}</span>
                        <span style={{ fontSize: 9, lineHeight: 1.2 }}>{option.score}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                className="vz-btn"
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 16px",
                  background: canSubmit ? roleColor : "rgba(255,255,255,0.08)",
                  color: canSubmit ? "#0B0B0F" : "rgba(255,255,255,0.35)",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                }}
              >
                {isSubmitting ? "記録中..." : "記録する"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>
    </motion.div>
  );
}
