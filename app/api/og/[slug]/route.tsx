// app/api/og/[slug]/route.ts

import { ImageResponse } from "next/og";
import { getPublicProfileBySlug } from "@/features/profile/server/get-profile-by-slug";

export const runtime = "edge";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050",
    Trainer: "#32D278",
    Members: "#FFC81E",
    Business: "#3C8CFF",
};
const ROLE_GRADIENT: Record<string, string> = {
    Athlete: "#6b0000",
    Trainer: "#003d1a",
    Members: "#5a4200",
    Business: "#001f5a",
};
const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE",
    Trainer: "TRAINER",
    Members: "MEMBERS",
    Business: "BUSINESS",
};

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const result = await getPublicProfileBySlug(slug);

    if (!result.success || !result.data.isPublic) {
        return new ImageResponse(
            (
                <div style={{
                    width: "1200px", height: "630px",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: "#07070e",
                    fontFamily: "sans-serif",
                }}>
                    <div style={{
                        fontSize: "13px", fontWeight: 700,
                        color: "rgba(255,255,255,0.2)",
                        letterSpacing: "0.3em", textTransform: "uppercase",
                        fontFamily: "monospace",
                    }}>
                        VIZION CONNECTION
                    </div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    }

    const profile = result.data;
    const displayName = profile.displayName ?? "Vizion Member";
    const role = profile.role ?? "Members";
    const bio = profile.bio ?? "";
    const sport = profile.sport ?? "";
    const region = profile.region ?? "Japan";
    const cheerCount = profile.cheerCount ?? 0;
    const serialId = profile.serialId ? `#${String(profile.serialId).padStart(4, "0")}` : "";
    const isFoundingMember = profile.isFoundingMember ?? false;

    // avatarUrl → profileImageUrl の順でフォールバック（アバター丸アイコン用）
    const avatarUrl = profile.avatarUrl ?? profile.profileImageUrl ?? null;
    // 背景は profileImageUrl のみ
    const bgPhotoUrl = profile.profileImageUrl ?? null;

    const rl = ROLE_COLOR[role] ?? "#a78bfa";
    const bg1 = ROLE_GRADIENT[role] ?? "#1a1a2e";
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const nameFontSize = displayName.length > 16 ? (displayName.length > 22 ? "34px" : "42px") : "52px";

    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px",
                    height: "630px",
                    display: "flex",
                    background: "#07070e",
                    fontFamily: "sans-serif",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {/* ── Left: Photo / Initials ── */}
                <div style={{
                    width: "420px",
                    height: "630px",
                    flexShrink: 0,
                    position: "relative",
                    display: "flex",
                    background: `linear-gradient(145deg, ${bg1} 0%, #060606 100%)`,
                    overflow: "hidden",
                }}>
                    {/* Glow */}
                    <div style={{
                        position: "absolute",
                        top: "-60px", left: "-60px",
                        width: "320px", height: "320px",
                        background: `radial-gradient(circle, ${rl}35, transparent 65%)`,
                    }} />

                    {/* 背景: profileImageUrl のみ使用 */}
                    {bgPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={bgPhotoUrl}
                            alt={displayName}
                            title={displayName}
                            style={{
                                position: "absolute",
                                bottom: 0, left: 0,
                                width: "100%", height: "100%",
                                objectFit: "cover",
                                opacity: 0.6,
                            }}
                        />
                    ) : (
                        <div style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "120px",
                            fontWeight: 900,
                            color: `${rl}18`,
                            fontFamily: "monospace",
                        }}>
                            {initials}
                        </div>
                    )}

                    {/* Right fade */}
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to right, transparent 50%, #07070e 100%)",
                    }} />

                    {/* Bottom fade */}
                    <div style={{
                        position: "absolute",
                        bottom: 0, left: 0, right: 0,
                        height: "160px",
                        background: "linear-gradient(to top, #07070e, transparent)",
                    }} />

                    {/* ── Avatar circle（左下） ── */}
                    <div style={{
                        position: "absolute",
                        bottom: "28px",
                        left: "28px",
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: `3px solid ${rl}80`,
                        background: `linear-gradient(145deg, ${bg1}, #111)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 0 24px ${rl}50`,
                    }}>
                        {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <span style={{
                                fontSize: "28px",
                                fontWeight: 900,
                                color: `${rl}90`,
                                fontFamily: "monospace",
                            }}>
                                {initials}
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Right: Info ── */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "48px 56px 48px 40px",
                    position: "relative",
                }}>

                    {/* Early Member badge */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "20px",
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "5px 12px",
                            borderRadius: "20px",
                            background: `${rl}15`,
                            border: `1px solid ${rl}40`,
                        }}>
                            <div style={{
                                width: "6px", height: "6px",
                                borderRadius: "50%",
                                background: rl,
                            }} />
                            <span style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color: rl,
                                letterSpacing: "0.15em",
                                fontFamily: "monospace",
                                textTransform: "uppercase",
                            }}>
                                {isFoundingMember ? "FOUNDING MEMBER" : "EARLY MEMBER"}
                            </span>
                        </div>
                        {serialId && (
                            <span style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.18)",
                                fontFamily: "monospace",
                                letterSpacing: "0.1em",
                                marginLeft: "8px",
                            }}>
                                {serialId}
                            </span>
                        )}
                    </div>

                    {/* Role label */}
                    <div style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: rl,
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        fontFamily: "monospace",
                        marginBottom: "10px",
                    }}>
                        {sport || ROLE_LABEL[role]}
                    </div>

                    {/* Name */}
                    <div style={{
                        fontSize: nameFontSize,
                        fontWeight: 900,
                        color: "#ffffff",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.05,
                        marginBottom: "8px",
                    }}>
                        {displayName}
                    </div>

                    {/* slug */}
                    <div style={{
                        fontSize: "16px",
                        color: "rgba(255,255,255,0.35)",
                        fontFamily: "monospace",
                        marginBottom: "20px",
                        letterSpacing: "0.03em",
                    }}>
                        @{slug}{region ? ` · ${region}` : ""}
                    </div>

                    {/* Bio */}
                    {bio && (
                        <div style={{
                            fontSize: "16px",
                            color: "rgba(255,255,255,0.55)",
                            lineHeight: 1.6,
                            marginBottom: "28px",
                            maxWidth: "520px",
                        }}>
                            {bio}
                        </div>
                    )}

                    {/* Divider */}
                    <div style={{
                        width: "48px", height: "2px",
                        background: `linear-gradient(90deg, ${rl}, transparent)`,
                        marginBottom: "24px",
                    }} />

                    {/* Stats */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "32px",
                    }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" }}>Cheer</span>
                            <span style={{ fontSize: "28px", fontWeight: 900, color: "#FFD600", fontFamily: "monospace", lineHeight: 1 }}>
                                {cheerCount.toLocaleString()}
                            </span>
                        </div>
                        <div style={{ width: "1px", height: "36px", background: "rgba(255,255,255,0.08)" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace" }}>Role</span>
                            <span style={{ fontSize: "18px", fontWeight: 800, color: rl, fontFamily: "monospace", lineHeight: 1 }}>
                                {ROLE_LABEL[role]}
                            </span>
                        </div>
                    </div>

                    {/* Bottom: URL */}
                    <div style={{
                        position: "absolute",
                        bottom: "36px",
                        right: "56px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}>
                        <span style={{
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.2)",
                            fontFamily: "monospace",
                            letterSpacing: "0.05em",
                        }}>
                            vizionconnection.com/u/{slug}
                        </span>
                    </div>
                </div>

                {/* ── Logo top-right ── */}
                <div style={{
                    position: "absolute",
                    top: "28px",
                    right: "56px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}>
                    <span style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.2)",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        fontFamily: "monospace",
                    }}>
                        VIZION CONNECTION
                    </span>
                </div>

                {/* ── Role color accent line ── */}
                <div style={{
                    position: "absolute",
                    left: 0, top: 0, bottom: 0,
                    width: "4px",
                    background: `linear-gradient(to bottom, transparent, ${rl}, transparent)`,
                }} />
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}