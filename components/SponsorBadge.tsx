import { getPlanFeatures, PLAN_PRIORITY } from "@/features/business/plan-features";

const BADGE_SIZE: Record<number, { fontSize: number; padding: string }> = {
  0: { fontSize: 10, padding: "4px 9px" },
  1: { fontSize: 10.5, padding: "5px 10px" },
  2: { fontSize: 11, padding: "5px 11px" },
  3: { fontSize: 12, padding: "6px 12px" },
  4: { fontSize: 12.5, padding: "7px 13px" },
};

export default function SponsorBadge({
  plan,
  prominent = false,
}: {
  plan: string | null | undefined;
  prominent?: boolean;
}) {
  const features = getPlanFeatures(plan ?? null);
  if (!features) return null;

  const priority = PLAN_PRIORITY[String(plan)] ?? 0;
  const size = BADGE_SIZE[priority] ?? BADGE_SIZE[0];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        padding: prominent ? "7px 14px" : size.padding,
        background: `${features.badgeColor}18`,
        border: `1px solid ${features.badgeColor}45`,
        color: features.badgeColor,
        fontSize: prominent ? size.fontSize + 0.5 : size.fontSize,
        fontWeight: 800,
        lineHeight: 1,
        whiteSpace: "nowrap",
        boxShadow: prominent ? `0 10px 24px ${features.badgeColor}20` : "none",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: prominent ? 8 : 7,
          height: prominent ? 8 : 7,
          borderRadius: "50%",
          background: features.badgeColor,
          boxShadow: `0 0 14px ${features.badgeColor}`,
          flexShrink: 0,
        }}
      />
      <span>{features.badgeLabel}</span>
    </span>
  );
}
