"use client";

import { motion } from "framer-motion";
import type { ThemeColors } from "@/app/(app)/dashboard/types";
import { CONDITION_OPTIONS } from "./journey";

export function ConditionScorePicker({
  value,
  onChange,
  t,
  roleColor,
  showSubLabels = false,
  compact = false,
}: {
  value: number | null;
  onChange: (score: number) => void;
  t: ThemeColors;
  roleColor: string;
  showSubLabels?: boolean;
  compact?: boolean;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: compact ? 6 : 8 }}>
      {CONDITION_OPTIONS.map((option) => {
        const selected = value === option.score;
        return (
          <motion.button
            key={option.score}
            type="button"
            whileTap={{ scale: 0.95 }}
            animate={{ scale: selected ? 1.02 : 1 }}
            onClick={() => onChange(option.score)}
            style={{
              borderRadius: compact ? 12 : 12,
              border: `1px solid ${selected ? `${roleColor}88` : t.border}`,
              background: selected ? `${roleColor}18` : "rgba(255,255,255,0.03)",
              color: selected ? t.text : t.sub,
              padding: compact ? "10px 4px" : "12px 6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 4,
              boxShadow: selected ? `0 0 0 1px ${roleColor}30` : "none",
            }}
            aria-label={`${option.label}（${option.sub}）`}
            aria-pressed={selected}
          >
            <span style={{ fontSize: compact ? 20 : 24, lineHeight: 1 }}>{option.emoji}</span>
            <span
              style={{
                fontSize: compact ? 8 : 10,
                fontWeight: 800,
                color: selected ? t.text : t.sub,
                lineHeight: 1.2,
              }}
            >
              {option.label}
            </span>
            {showSubLabels ? (
              <span style={{ fontSize: 8, lineHeight: 1.2, opacity: selected ? 0.9 : 0.65 }}>{option.sub}</span>
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
}
