// features/og/server/build-og-image.ts

import type { UserRole } from "@/features/auth/types";
import type { PublicProfileData } from "@/features/profile/types";

const ROLE_LABEL: Record<UserRole, string> = {
    Athlete: "アスリート",
    Trainer: "トレーナー",
    Members: "メンバー",
    Business: "ビジネス",
    Admin: "管理",
};

const ROLE_COLOR: Record<UserRole, { bg: string; text: string; border: string }> = {
    Athlete: { bg: "#1e3a5f", text: "#60a5fa", border: "#2563eb" },
    Trainer: { bg: "#14532d", text: "#4ade80", border: "#16a34a" },
    Members: { bg: "#1c1c1c", text: "#9ca3af", border: "#4b5563" },
    Business: { bg: "#451a03", text: "#fbbf24", border: "#d97706" },
    Admin: { bg: "#2e1065", text: "#c4b5fd", border: "#7c3aed" },
};

export function buildOgImageElement(
    profile: PublicProfileData
): React.ReactElement {
    const color = ROLE_COLOR[profile.role];
    const initial = profile.displayName.charAt(0).toUpperCase();
    const roleLabel = ROLE_LABEL[profile.role];

    return (
        <div
      style= {{
        width: "1200px",
            height: "630px",
                background: "#0a0a0a",
                    display: "flex",
                        flexDirection: "column",
                            justifyContent: "space-between",
                                padding: "64px",
                                    fontFamily: "'Noto Sans JP', sans-serif",
                                        position: "relative",
                                            overflow: "hidden",
      }
}
    >
    {/* Background decoration */ }
    < div
style = {{
    position: "absolute",
        top: "-120px",
            right: "-120px",
                width: "480px",
                    height: "480px",
                        borderRadius: "50%",
                            background:
    "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
        }}
      />
    < div
style = {{
    position: "absolute",
        bottom: "-80px",
            left: "-80px",
                width: "320px",
                    height: "320px",
                        borderRadius: "50%",
                            background:
    "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
        }}
      />

{/* Top row: service name */ }
<div
        style={
    {
        display: "flex",
            alignItems: "center",
                justifyContent: "space-between",
        }
}
      >
    <span
          style={
    {
        fontSize: "22px",
            fontWeight: "700",
                color: "#ffffff",
                    letterSpacing: "0.15em",
          }
}
        >
    Vizion Connection
        </span>

{/* Role badge */ }
<div
          style={
    {
        display: "flex",
            alignItems: "center",
                background: color.bg,
                    border: `1px solid ${color.border}`,
                        borderRadius: "999px",
                            padding: "8px 20px",
          }
}
        >
    <span
            style={
    {
        fontSize: "18px",
            fontWeight: "600",
                color: color.text,
            }
}
          >
    { roleLabel }
    </span>
    </div>
    </div>

{/* Center: avatar + name */ }
<div
        style={
    {
        display: "flex",
            alignItems: "center",
                gap: "40px",
        }
}
      >
    {/* Avatar */ }
    < div
style = {{
    width: "120px",
        height: "120px",
            borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
                    border: "2px solid rgba(124,58,237,0.4)",
                        display: "flex",
                            alignItems: "center",
                                justifyContent: "center",
                                    flexShrink: 0,
          }}
        >
    <span
            style={
    {
        fontSize: "52px",
            fontWeight: "800",
                color: "#ffffff",
            }
}
          >
    { initial }
    </span>
    </div>

{/* Name & slug */ }
<div
          style={
    {
        display: "flex",
            flexDirection: "column",
                gap: "12px",
          }
}
        >
    {/* Verified + name */ }
    < div
style = {{
    display: "flex",
        alignItems: "center",
            gap: "16px",
            }}
          >
    <span
              style={
    {
        fontSize: "56px",
            fontWeight: "800",
                color: "#ffffff",
                    lineHeight: "1.1",
              }
}
            >
    { profile.displayName }
    </span>
{
    profile.verified && (
        <div
                style={
        {
            width: "36px",
                height: "36px",
                    borderRadius: "50%",
                        background: "rgba(124,58,237,0.2)",
                            border: "1px solid rgba(124,58,237,0.4)",
                                display: "flex",
                                    alignItems: "center",
                                        justifyContent: "center",
                                            flexShrink: 0,
                }
    }
              >
        <span style={ { fontSize: "20px", color: "#a78bfa" } }>✓</span>
            </div>
            )
}
</div>

{/* Slug */ }
<span
            style={
    {
        fontSize: "24px",
            color: "#4b5563",
                fontFamily: "monospace",
            }
}
          >
    @{ profile.slug }
    </span>
    </div>
    </div>

{/* Bottom row: stats + URL */ }
<div
        style={
    {
        display: "flex",
            alignItems: "flex-end",
                justifyContent: "space-between",
        }
}
      >
    {/* Cheer count */ }
    < div
style = {{
    display: "flex",
        flexDirection: "column",
            gap: "4px",
          }}
        >
    <span
            style={
    {
        fontSize: "42px",
            fontWeight: "800",
                color: "#ffffff",
                    lineHeight: "1",
            }
}
          >
    { profile.cheerCount.toLocaleString() }
    </span>
    < span
style = {{
    fontSize: "16px",
        color: "#6b7280",
            letterSpacing: "0.05em",
            }}
          >
    Cheers
    </span>
    </div>

{/* URL */ }
<span
          style={
    {
        fontSize: "18px",
            color: "#374151",
                fontFamily: "monospace",
          }
}
        >
    vizion.app / u / { profile.slug }
    </span>
    </div>

{/* Bottom border accent */ }
<div
        style={
    {
        position: "absolute",
            bottom: "0",
                left: "0",
                    right: "0",
                        height: "3px",
                            background:
        "linear-gradient(90deg, transparent, #7c3aed, #a78bfa, transparent)",
        }
}
      />
    </div>
  ) as React.ReactElement;
}