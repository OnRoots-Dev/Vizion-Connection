// components/ui/avatar.tsx — avatar（Design System v2）
// 役割リングは識別の補助。size は5段のみ。

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 72 };

const ROLE_VAR: Record<string, string> = {
    Athlete: "var(--vc-athlete)",
    Trainer: "var(--vc-trainer)",
    Crew: "var(--vc-crew)",
    Business: "var(--vc-business)",
    Admin: "var(--vc-accent)",
};

export interface AvatarProps {
    src?: string | null;
    name: string;
    size?: AvatarSize;
    /** リング色（role名 or 任意CSS color）。未指定でリングなし */
    ring?: string;
}

export function Avatar({ src, name, size = "md", ring }: AvatarProps) {
    const px = SIZES[size];
    const ringColor = ring && ROLE_VAR[ring] ? ROLE_VAR[ring] : ring;
    const initial = (name || "?").trim().slice(0, 1).toUpperCase();
    return (
        <span
            style={{
                position: "relative",
                display: "inline-flex",
                width: px,
                height: px,
                flexShrink: 0,
            }}
        >
            <span
                style={{
                    display: "flex",
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: "50%",
                    border: `1px solid ${ringColor ? `${ringColor}55` : "var(--vc-border)"}`,
                    background: ringColor ? `${ringColor}18` : "rgba(255,255,255,0.06)",
                    color: ringColor ?? "var(--vc-text-secondary)",
                    fontWeight: 800,
                    fontSize: Math.max(10, Math.round(px * 0.36)),
                }}
            >
                {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                    initial
                )}
            </span>
            {ringColor ? (
                <span
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: -3,
                        borderRadius: "50%",
                        border: `1px solid ${ringColor}44`,
                        pointerEvents: "none",
                    }}
                />
            ) : null}
        </span>
    );
}
