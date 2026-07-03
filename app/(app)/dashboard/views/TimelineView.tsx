"use client";

// ─────────────────────────────────────────────────────────────────────────────
// dashboard/views/TimelineView.tsx
// 既存スキーマ（journeys / cheers / in_stand）に適合した Timeline ビュー。
// - 投稿  : POST /api/journey（1日1件のJourneyとして記録）
// - Cheer : POST /api/cheer { toSlug }
// - Bond（観戦）: POST/DELETE /api/instand { target_slug }（user_follows）
// - DAILY CIRCUIT: POST /api/daily-circuit { action } で daily_circuits に永続化。
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { DashboardView } from "../types";
import { SectionHeader } from "../components/ui";
import { IconBond } from "@/lib/design/icons";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050",
    Trainer: "#32D278",
    Crew: "#FFC81E",
    Business: "#3C8CFF",
};

const CONDITION_EMOJI: Record<number, string> = { 1: "😵", 2: "😕", 3: "🙂", 4: "🔥", 5: "🚀" };

type TimelineRole = "All" | "Athlete" | "Trainer" | "Business" | "Crew";
const ROLES: TimelineRole[] = ["All", "Athlete", "Trainer", "Business", "Crew"];

interface JourneyRow {
    id: string;
    user_slug: string;
    content: string;
    condition_score: number | null;
    image_url: string | null;
    created_at: string;
    cheer_count: number;
    users:
        | { display_name: string | null; role: string | null; avatar_url: string | null }
        | { display_name: string | null; role: string | null; avatar_url: string | null }[]
        | null;
}

interface Journey {
    id: string;
    user_slug: string;
    content: string;
    condition_score: number | null;
    image_url: string | null;
    created_at: string;
    cheer_count: number;
    user: { display_name: string | null; role: string | null; avatar_url: string | null } | null;
}

function normalize(row: JourneyRow): Journey {
    const user = Array.isArray(row.users) ? row.users[0] ?? null : row.users;
    return {
        id: row.id,
        user_slug: row.user_slug,
        content: row.content,
        condition_score: row.condition_score,
        image_url: row.image_url,
        created_at: row.created_at,
        cheer_count: row.cheer_count,
        user,
    };
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "今";
    if (m < 60) return `${m}分前`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}時間前`;
    return `${Math.floor(h / 24)}日前`;
}

function PostCard({ journey, currentUserSlug }: { journey: Journey; currentUserSlug: string }) {
    const roleColor = ROLE_COLOR[journey.user?.role ?? ""] ?? "var(--vc-accent)";
    const displayName = journey.user?.display_name ?? journey.user_slug;
    const isOwn = currentUserSlug === journey.user_slug;

    const cheeredKey = `timeline-cheered:${journey.id}`;
    const standKey = `in-stand:${journey.user_slug}`;

    const [cheer, setCheer] = useState(() => ({
        count: journey.cheer_count,
        cheered: typeof window !== "undefined" && window.localStorage.getItem(cheeredKey) === "1",
    }));
    const [inStand, setInStand] = useState(() =>
        typeof window !== "undefined" ? window.localStorage.getItem(standKey) === "1" : false,
    );
    const [busy, setBusy] = useState(false);

    async function handleCheer() {
        if (cheer.cheered || busy) return;
        setBusy(true);
        setCheer((p) => ({ count: p.count + 1, cheered: true }));
        window.localStorage.setItem(cheeredKey, "1");
        // DAILY CIRCUIT: Cheer送信を daily_circuits に永続化
        void fetch("/api/daily-circuit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "cheer" }),
        }).catch(() => { /* サーキット記録失敗は無視 */ });
        try {
            const res = await fetch("/api/cheer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toSlug: journey.user_slug }),
            });
            if (!res.ok) throw new Error("cheer failed");
        } catch {
            setCheer((p) => ({ count: p.count - 1, cheered: false }));
            window.localStorage.removeItem(cheeredKey);
        } finally {
            setBusy(false);
        }
    }

    async function handleStand() {
        const prev = inStand;
        const next = !prev;
        setInStand(next);
        window.localStorage.setItem(standKey, next ? "1" : "0");
        try {
            const res = next
                ? await fetch("/api/instand", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ target_slug: journey.user_slug }),
                  })
                : await fetch(`/api/instand?target_slug=${encodeURIComponent(journey.user_slug)}`, {
                      method: "DELETE",
                  });
            if (!res.ok && res.status !== 409) {
                setInStand(prev);
                window.localStorage.setItem(standKey, prev ? "1" : "0");
            }
        } catch {
            setInStand(prev);
            window.localStorage.setItem(standKey, prev ? "1" : "0");
        }
    }

    return (
        <div style={{ padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: journey.user?.avatar_url
                            ? `url(${journey.user.avatar_url}) center/cover`
                            : roleColor + "22",
                        border: `1.5px solid ${roleColor}44`,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 700,
                        color: roleColor,
                    }}
                >
                    {!journey.user?.avatar_url && (displayName?.[0]?.toUpperCase() ?? "V")}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--vc-text1)" }}>{displayName}</span>
                        {journey.user?.role && (
                            <span
                                style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    border: `1px solid ${roleColor}55`,
                                    color: roleColor,
                                    background: roleColor + "11",
                                }}
                            >
                                {journey.user.role.toUpperCase()}
                            </span>
                        )}
                        <span style={{ fontSize: 11, color: "var(--vc-text3)", marginLeft: "auto" }}>
                            {timeAgo(journey.created_at)}
                        </span>
                    </div>

                    {journey.condition_score != null && (
                        <span style={{ display: "inline-block", marginTop: 6, fontSize: 14 }}>
                            {CONDITION_EMOJI[journey.condition_score] ?? "✨"}
                        </span>
                    )}

                    <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.82)", whiteSpace: "pre-wrap" }}>
                        {journey.content}
                    </p>

                    {journey.image_url && (
                        <div
                            style={{
                                marginTop: 12,
                                borderRadius: 10,
                                overflow: "hidden",
                                aspectRatio: "16 / 10",
                                background: `url(${journey.image_url}) center/cover`,
                                border: "1px solid var(--vc-border)",
                            }}
                        />
                    )}
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, paddingLeft: 52 }}>
                <button
                    onClick={() => void handleCheer()}
                    disabled={cheer.cheered || busy}
                    style={{
                        fontSize: 12,
                        padding: "5px 12px",
                        borderRadius: 20,
                        background: cheer.cheered ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.05)",
                        border: cheer.cheered ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.08)",
                        color: cheer.cheered ? "var(--vc-accent)" : "var(--vc-text2)",
                        cursor: cheer.cheered ? "default" : "pointer",
                        fontWeight: 700,
                    }}
                >
                    ♥ Cheer {cheer.count > 0 ? cheer.count : ""}
                </button>

                {!isOwn && (
                    <button
                        onClick={() => void handleStand()}
                        style={{
                            fontSize: 12,
                            padding: "5px 12px",
                            borderRadius: 20,
                            background: inStand ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.04)",
                            border: inStand ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.08)",
                            color: inStand ? "var(--vc-accent)" : "var(--vc-text2)",
                            cursor: "pointer",
                            fontFamily: "'Space Mono', monospace",
                            letterSpacing: "0.06em",
                        }}
                    >
                        {inStand ? "観戦中" : "IN STAND"}
                    </button>
                )}
            </div>
        </div>
    );
}

export function TimelineView({
    profile,
    setView,
}: {
    profile: { slug: string };
    setView: (v: DashboardView) => void;
}) {
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeRole, setActiveRole] = useState<TimelineRole>("All");
    const [content, setContent] = useState("");
    const [posting, setPosting] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const fetchJourneys = useCallback(async () => {
        setError(null);
        const { data, error: fetchError } = await supabaseBrowser
            .from("journeys")
            .select("id, user_slug, content, condition_score, image_url, created_at, cheer_count, users(display_name, role, avatar_url)")
            .eq("is_public", true)
            .order("created_at", { ascending: false })
            .limit(30);

        if (fetchError) {
            setError("Timelineを読み込めませんでした。");
            setLoading(false);
            return;
        }
        setJourneys(((data ?? []) as unknown as JourneyRow[]).map(normalize));
        setLoading(false);
    }, []);

    useEffect(() => {
        void fetchJourneys();
        // DAILY CIRCUIT: Timeline閲覧を daily_circuits に永続化
        void fetch("/api/daily-circuit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "timeline" }),
        }).catch(() => { /* サーキット記録失敗は無視 */ });
    }, [fetchJourneys]);

    const filtered = useMemo(() => {
        if (activeRole === "All") return journeys;
        return journeys.filter((j) => j.user?.role?.toLowerCase() === activeRole.toLowerCase());
    }, [activeRole, journeys]);

    async function handlePost() {
        if (!content.trim() || posting) return;
        setPosting(true);
        setNotice(null);
        try {
            const res = await fetch("/api/journey", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: content.trim() }),
            });
            if (res.status === 201) {
                setContent("");
                // DAILY CIRCUIT: Journey記録を daily_circuits に永続化
                void fetch("/api/daily-circuit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "journey" }),
                }).catch(() => { /* サーキット記録失敗は無視 */ });
                await fetchJourneys();
            } else {
                const body = (await res.json().catch(() => null)) as { error?: string } | null;
                setNotice(body?.error ?? "投稿に失敗しました");
            }
        } catch {
            setNotice("通信エラーが発生しました");
        } finally {
            setPosting(false);
        }
    }

    return (
        <div style={{ animation: "vcFadeUp 0.4s ease both" }}>
            <SectionHeader label="Timeline" />

            {/* 投稿フォーム（= 今日のJourneyとして記録） */}
            <div
                style={{
                    padding: 16,
                    background: "var(--vc-surface)",
                    borderRadius: 12,
                    border: "1px solid var(--vc-border)",
                    marginBottom: 20,
                }}
            >
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="今日の活動を投稿する…（今日のJourneyとして記録されます）"
                    rows={3}
                    maxLength={500}
                    style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        resize: "none",
                        color: "var(--vc-text1)",
                        fontSize: 14,
                        lineHeight: 1.75,
                        fontFamily: "'Noto Sans JP', sans-serif",
                    }}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: notice ? "#FF5050" : "var(--vc-text3)" }}>
                        {notice ?? `${content.length}/500`}
                    </span>
                    <button
                        onClick={() => void handlePost()}
                        disabled={!content.trim() || posting}
                        style={{
                            padding: "8px 20px",
                            borderRadius: 8,
                            background: content.trim() ? "var(--vc-accent)" : "rgba(255,255,255,0.08)",
                            color: content.trim() ? "#000" : "var(--vc-text3)",
                            border: "none",
                            cursor: content.trim() && !posting ? "pointer" : "default",
                            fontSize: 13,
                            fontWeight: 700,
                            transition: "all 0.2s",
                        }}
                    >
                        {posting ? "投稿中…" : "投稿する"}
                    </button>
                </div>
            </div>

            {/* ロールフィルター */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16, paddingBottom: 2 }}>
                {ROLES.map((r) => (
                    <button
                        key={r}
                        onClick={() => setActiveRole(r)}
                        style={{
                            flexShrink: 0,
                            padding: "5px 12px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontFamily: "'Space Mono', monospace",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                            background: activeRole === r ? "rgba(167,139,250,0.12)" : "transparent",
                            border: activeRole === r ? "1px solid rgba(167,139,250,0.3)" : "1px solid var(--vc-border)",
                            color: activeRole === r ? "var(--vc-accent)" : "var(--vc-text3)",
                        }}
                    >
                        {r}
                    </button>
                ))}
            </div>

            {error ? (
                <div style={{ textAlign: "center", padding: 40, color: "#FF5050", fontSize: 13 }}>{error}</div>
            ) : loading ? (
                <div>
                    {[0, 1, 2].map((i) => (
                        <div key={i} style={{ display: "flex", gap: 12, padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--vc-elevated)", animation: "vcPulse 1.5s ease-in-out infinite" }} />
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                                <div style={{ height: 12, width: "40%", borderRadius: 6, background: "var(--vc-elevated)" }} />
                                <div style={{ height: 12, width: "85%", borderRadius: 6, background: "var(--vc-elevated)" }} />
                                <div style={{ height: 12, width: "60%", borderRadius: 6, background: "var(--vc-elevated)" }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--vc-text3)" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }} aria-hidden><IconBond size={32} /></div>
                    <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                        まだ投稿がありません。
                        <br />
                        最初の活動を発信しましょう。
                    </div>
                    <button
                        onClick={() => setView("journey")}
                        style={{
                            marginTop: 20,
                            padding: "10px 20px",
                            borderRadius: 8,
                            background: "var(--vc-accent)",
                            color: "#000",
                            border: "none",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer",
                        }}
                    >
                        Journeyへ
                    </button>
                </div>
            ) : (
                <div>
                    {filtered.map((j) => (
                        <PostCard key={j.id} journey={j} currentUserSlug={profile.slug} />
                    ))}
                </div>
            )}
        </div>
    );
}
