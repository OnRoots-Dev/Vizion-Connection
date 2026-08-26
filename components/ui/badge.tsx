// components/ui/badge.tsx — badge（Design System v2）
// 役割色は識別専用。Status は success/warning/danger を使う。

import type { UserRole } from "@/features/auth/types";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "athlete" | "trainer" | "crew" | "business";

const TONE_VARS: Record<BadgeTone, { color: string; bg: string; border: string }> = {
    neutral: { color: "var(--vc-text-secondary)", bg: "rgba(255,255,255,0.05)", border: "var(--vc-border)" },
    accent: { color: "var(--vc-accent)", bg: "var(--vc-accent-faint)", border: "var(--vc-accent-border)" },
    success: { color: "var(--vc-success)", bg: "rgba(50,210,120,0.10)", border: "rgba(50,210,120,0.32)" },
    warning: { color: "var(--vc-warning)", bg: "rgba(255,180,84,0.10)", border: "rgba(255,180,84,0.32)" },
    danger: { color: "var(--vc-danger)", bg: "rgba(255,92,122,0.10)", border: "rgba(255,92,122,0.32)" },
    athlete: { color: "var(--vc-athlete)", bg: "rgba(255,80,80,0.10)", border: "rgba(255,80,80,0.30)" },
    trainer: { color: "var(--vc-trainer)", bg: "rgba(48,222,29,0.08)", border: "rgba(48,222,29,0.28)" },
    crew: { color: "var(--vc-crew)", bg: "rgba(255,200,30,0.09)", border: "rgba(255,200,30,0.30)" },
    business: { color: "var(--vc-business)", bg: "rgba(60,140,255,0.10)", border: "rgba(60,140,255,0.30)" },
};

export const ROLE_BADGE_TONE: Record<UserRole, BadgeTone> = {
    Athlete: "athlete",
    Trainer: "trainer",
    Crew: "crew",
    Business: "business",
    Admin: "accent",
};

export interface BadgeProps {
    tone?: BadgeTone;
    children: React.ReactNode;
    /** モノスペースHUD風ラベル（既定true） */
    mono?: boolean;
}

export function Badge({ tone = "neutral", mono = true, children }: BadgeProps) {
    const v = TONE_VARS[tone];
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 9px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: mono ? "0.08em" : undefined,
                textTransform: mono ? "uppercase" : undefined,
                fontFamily: mono ? "var(--font-jetbrains), ui-monospace, monospace" : undefined,
                color: v.color,
                background: v.bg,
                border: `1px solid ${v.border}`,
            }}
        >
            {children}
        </span>
    );
}
