const SPONSOR_BADGES = {
  roots: { label: "Roots スポンサー", color: "#4CAF50", icon: "🌱" },
  roots_plus: { label: "Roots+ スポンサー", color: "#8BC34A", icon: "🌿" },
  signal: { label: "Signal スポンサー", color: "#2196F3", icon: "⚡" },
  presence: { label: "Presence スポンサー", color: "#9C27B0", icon: "◆" },
  legacy: { label: "Legacy スポンサー", color: "#FF6F00", icon: "🔥" },
} as const;

export function getSponsorBadge(plan: string | null | undefined) {
  if (!plan) return null;
  return SPONSOR_BADGES[plan as keyof typeof SPONSOR_BADGES] ?? null;
}

export function SponsorPlanBadge({
  plan,
  prominent = false,
}: {
  plan: string | null | undefined;
  prominent?: boolean;
}) {
  const badge = getSponsorBadge(plan);
  if (!badge) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: prominent ? "7px 12px" : "5px 10px",
        borderRadius: 999,
        background: `${badge.color}18`,
        border: `1px solid ${badge.color}42`,
        color: badge.color,
        fontSize: prominent ? 11 : 10,
        fontWeight: 800,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true">{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
}
