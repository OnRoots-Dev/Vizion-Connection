"use client";

// app/(app)/base/BaseClient.tsx
// BASE 画面 — 指示の 6 構成を既存コンポーネント再利用で実装。表示層のみ新規。
// 1. 上部ヘッダー: 左 BASEメニュー(アコーディオン) / 中央 Vizionロゴ / 右 通知アイコン
// 2. "○○ BASE" (ログインユーザー名)
// 3. Vizion ID (既存の本人性・認証状態表示を再利用)
// 4. Profile (DashboardProfileView をそのまま利用)
// 5. My Camps: 「準備中」
// 6. Schedule: 本人が主催/参加している Activity を時系列で (既存データ・ロジック再利用)

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { COLOR, FONT, TYPE, SPACE, RADIUS } from "@/lib/design/tokens";
import { ROLE_COLOR } from "@/app/(app)/dashboard/types";
import { useVzTheme } from "@/app/(app)/dashboard/components/bottom-nav/useVzTheme";
import { DashboardProfileView } from "@/app/(app)/dashboard/components/DashboardProfileView";
import { FoundingMemberBadge, EarlyPartnerBadge } from "@/components/ui/FoundingMemberBadge";
import { MediaViewer } from "@/app/(app)/dashboard/components/feed/media";
import { CheerButton, CommentButton } from "@/app/(app)/dashboard/components/feed/actions";
import { apiSend, ApiError } from "@/lib/api/core-client";
import { useToast } from "@/components/ui/toast";
import { getFoundingMemberNumber } from "@/lib/founding-member-number";
import type { ProfileData } from "@/features/profile/types";
import type { ActivityRecord, ActivityType } from "@/features/activity/types";
import type { CareerProfileRow } from "@/lib/supabase/career-profiles";

type ScheduleActivity = ActivityRecord & {
    place?: { id: string; name: string; prefecture: string } | null;
    isOwner: boolean;
};

const TYPE_LABELS_JA: Record<ActivityType, string> = {
    practice: "練習",
    training: "トレーニング",
    match: "試合",
    competition: "大会",
    event: "イベント",
    coaching: "コーチング",
    session: "セッション",
    workshop: "ワークショップ",
    watching: "観戦",
    supporting: "サポート",
    participation: "参加",
    other: "その他",
};

function BaseHeader({ role, pathname }: { role: string | null; pathname: string }) {
    const [open, setOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>("navigation");
    const roleColor = role ? ROLE_COLOR[role as keyof typeof ROLE_COLOR] ?? "#C8E800" : "#C8E800";
    const [unread, setUnread] = useState(0);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/notifications/unread", { cache: "no-store" })
            .then((r) => r.json().catch(() => ({})))
            .then((j: { unreadCount?: number }) => {
                if (!cancelled) setUnread(j.unreadCount ?? 0);
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    const APP_MENU = [
        { href: "/base", label: "BASE", short: "Base" },
        { href: "/trail", label: "Trail", short: "Trail" },
        { href: "/dashboard?view=viz_map", label: "Viz Map", short: "Map" },
        { href: "/dashboard", label: "Dashboard", short: "Home" },
        { href: "/schedule", label: "Schedule", short: "Schedule" },
    ];

    return (
        <header
            className="sticky top-0 z-40 border-b border-white/10"
            style={{
                background: "rgba(10, 10, 12, 0.82)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
            }}
        >
            <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
                {/* 左: BASEメニュー アコーディオン */}
                <button
                    type="button"
                    aria-label="BASEメニューを開く"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition active:scale-[0.98]"
                >
                    <span className="relative block h-4 w-4">
                        <span className={`absolute left-0 right-0 top-0 h-[2px] rounded-full bg-white transition ${open ? "translate-y-[6px] rotate-45" : ""}`} />
                        <span className={`absolute left-0 right-0 top-[6px] h-[2px] rounded-full bg-white transition ${open ? "opacity-0" : "opacity-100"}`} />
                        <span className={`absolute left-0 right-0 top-[12px] h-[2px] rounded-full bg-white transition ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
                    </span>
                </button>

                {/* 中央: Vizionロゴ */}
                <Link href="/base" className="flex items-center gap-2">
                    <Image
                        src="/images/vizion-connection-logo-6-cropped.png"
                        alt="Vizion Connection"
                        width={140}
                        height={36}
                        priority
                        className="h-7 w-auto sm:h-8"
                    />
                </Link>

                {/* 右: 通知アイコン */}
                <Link
                    href="/dashboard?view=notifications"
                    aria-label="通知"
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition active:scale-[0.98]"
                >
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    {unread > 0 ? (
                        <span
                            className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-black text-black"
                            style={{ background: roleColor }}
                        >
                            {unread > 99 ? "99+" : unread}
                        </span>
                    ) : null}
                </Link>
            </div>

            {open && (
                <div className="border-t border-white/10 px-4 py-3 sm:px-6">
                    <div className="mx-auto max-w-[1400px] space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
                            <button
                                type="button"
                                onClick={() => setExpandedSection((v) => (v === "navigation" ? null : "navigation"))}
                                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-white/70"
                            >
                                <span>BASE Navigation</span>
                                <span className={`transition ${expandedSection === "navigation" ? "rotate-180" : ""}`}>▼</span>
                            </button>
                            {expandedSection === "navigation" && (
                                <div className="mt-2 space-y-1.5">
                                    {APP_MENU.map((item) => {
                                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setOpen(false)}
                                                className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-[13px] font-medium transition"
                                                style={{
                                                    background: isActive ? `${roleColor}18` : "transparent",
                                                    borderColor: isActive ? `${roleColor}40` : "rgba(255,255,255,0.08)",
                                                    color: isActive ? roleColor : "rgba(255,255,255,0.8)",
                                                }}
                                            >
                                                <span>{item.label}</span>
                                                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/50">{item.short}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

function VizionIdSection({ profile }: { profile: ProfileData }) {
    const vzId = profile.serialId ?? "VZ-2026-000001";
    const foundingNo = getFoundingMemberNumber(profile.id);
    const foundingNoPadded = String(foundingNo).padStart(4, "0");
    const isFounding = profile.isFoundingMember || foundingNo > 0;
    return (
        <section
            style={{
                background: COLOR.surface,
                border: `1px solid ${COLOR.border}`,
                borderRadius: RADIUS.lg,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
            }}
        >
            <p
                style={{
                    margin: 0,
                    fontFamily: FONT.mono,
                    fontSize: TYPE.labelSm,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: COLOR.textTertiary,
                }}
            >
                Vizion ID
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span
                    style={{
                        fontFamily: FONT.mono,
                        fontSize: 16,
                        fontWeight: 900,
                        letterSpacing: "0.06em",
                        color: COLOR.text,
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${COLOR.border}`,
                        borderRadius: RADIUS.md,
                        padding: "8px 12px",
                    }}
                >
                    {vzId}
                </span>
                <span style={{ fontFamily: FONT.mono, fontSize: TYPE.labelSm, color: COLOR.textTertiary }}>@{profile.slug}</span>
                {profile.verified ? (
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 8px",
                            borderRadius: RADIUS.pill,
                            fontFamily: FONT.mono,
                            fontSize: 10,
                            fontWeight: 800,
                            background: `${COLOR.accent}14`,
                            color: COLOR.accent,
                            border: `1px solid ${COLOR.accentBorder}`,
                        }}
                    >
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 12l2 2 4-4" />
                            <circle cx={12} cy={12} r={10} />
                        </svg>
                        Verified
                    </span>
                ) : (
                    <span
                        style={{
                            padding: "4px 8px",
                            borderRadius: RADIUS.pill,
                            fontFamily: FONT.mono,
                            fontSize: 10,
                            color: COLOR.textTertiary,
                            background: "rgba(255,255,255,0.04)",
                            border: `1px solid ${COLOR.border}`,
                        }}
                    >
                        未認証
                    </span>
                )}
                {profile.isFoundingMember ? <FoundingMemberBadge /> : <EarlyPartnerBadge />}
            </div>
            {isFounding ? (
                <div
                    style={{
                        marginTop: 2,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 10px",
                        borderRadius: RADIUS.md,
                        background: "rgba(255,214,0,0.08)",
                        border: "1px solid rgba(255,214,0,0.18)",
                        alignSelf: "flex-start",
                    }}
                >
                    <span style={{ fontFamily: FONT.mono, fontSize: 11, color: "#FFD600", fontWeight: 800 }}>創設メンバー番号:{foundingNoPadded}</span>
                    <span style={{ fontFamily: FONT.mono, fontSize: 10, color: COLOR.textTertiary }}>(id={profile.id} → {foundingNoPadded})</span>
                </div>
            ) : null}
            <p style={{ margin: 0, fontFamily: FONT.body, fontSize: TYPE.bodySm, color: COLOR.textTertiary, lineHeight: 1.6 }}>
                あなたの本人性と活動履歴を結ぶ固有ID。プロフィールや Activity と紐づいて公開されます。
            </p>
        </section>
    );
}

function JoinStampSection({ profile }: { profile: ProfileData }) {
    const foundingNo = getFoundingMemberNumber(profile.id);
    const foundingNoPadded = String(foundingNo).padStart(4, "0");
    const isFounding = profile.isFoundingMember || foundingNo > 0;
    if (!isFounding) return null;
    return (
        <section
            style={{
                background: `linear-gradient(135deg, ${COLOR.surface} 0%, #1a1500 100%)`,
                border: `1px solid rgba(255,214,0,0.22)`,
                borderRadius: RADIUS.lg,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                alignItems: "center",
                textAlign: "center",
            }}
        >
            <p
                style={{
                    margin: 0,
                    fontFamily: FONT.mono,
                    fontSize: TYPE.labelSm,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#FFD600",
                }}
            >
                Join Stamp
            </p>
            <div
                style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    border: "3px solid #FFD600",
                    background: "radial-gradient(circle at 30% 30%, #fff8c0, #FFD600 60%, #c8940c 100%)",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 0 20px rgba(255,214,0,0.35), inset 0 0 12px rgba(255,255,255,0.6)",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: "0.12em", color: "#5a4000", fontWeight: 800 }}>No.</span>
                    <span style={{ fontFamily: FONT.mono, fontSize: 32, fontWeight: 900, color: "#1a1200", lineHeight: 1 }}>{foundingNoPadded}</span>
                </div>
            </div>
            <p style={{ margin: 0, fontFamily: FONT.mono, fontSize: 11, color: "#FFD600", fontWeight: 800 }}>創設メンバー番号:{foundingNoPadded}</p>
            <p style={{ margin: 0, fontFamily: FONT.body, fontSize: 12, color: COLOR.textTertiary, lineHeight: 1.5 }}>
                id={profile.id} → 創設メンバー番号:{foundingNoPadded} (base 230, id=2は特例1)
            </p>
        </section>
    );
}

function MyCampsPlaceholder() {
    return (
        <section
            style={{
                background: COLOR.surface,
                border: `1px dashed ${COLOR.borderStrong}`,
                borderRadius: RADIUS.lg,
                padding: 24,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "center",
            }}
        >
            <div
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${COLOR.border}`,
                    color: COLOR.textTertiary,
                }}
            >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 20h18L12 4z" />
                    <path d="M12 14v4" />
                    <circle cx={12} cy={10} r={1.5} fill="currentColor" stroke="none" />
                </svg>
            </div>
            <p style={{ margin: 0, fontFamily: FONT.body, fontSize: 14, fontWeight: 700, color: COLOR.text }}>My Camps は準備中</p>
            <p style={{ margin: 0, fontFamily: FONT.body, fontSize: 13, color: COLOR.textTertiary, lineHeight: 1.6, maxWidth: 360 }}>
                合宿・遠征の募集と参加管理は次のアップデートで公開予定です。
            </p>
            <span style={{ fontFamily: FONT.mono, fontSize: TYPE.labelSm, letterSpacing: "0.1em", color: COLOR.decorative, textTransform: "uppercase" }}>
                Coming Soon
            </span>
        </section>
    );
}

function ScheduleSection({ activities }: { activities: ScheduleActivity[]; viewerId?: number | null }) {
    const [reactions, setReactions] = useState<Record<string, { cheered: boolean; cheer_count: number; comment_count: number }>>({});
    const [cheerBusy, setCheerBusy] = useState<Record<string, boolean>>({});
    const toast = useToast();
    const accent = COLOR.accent;

    async function toggleCheer(a: ScheduleActivity) {
        if (cheerBusy[a.id]) return;
        const current = reactions[a.id] ?? { cheered: false, cheer_count: a.cheer_count ?? 0, comment_count: a.comment_count ?? 0 };
        setCheerBusy((s) => ({ ...s, [a.id]: true }));
        const prev = current;
        setReactions((s) => ({ ...s, [a.id]: { ...current, cheered: !current.cheered, cheer_count: current.cheer_count + (current.cheered ? -1 : 1) } }));
        try {
            const data = await apiSend<{ success: boolean; cheered: boolean; cheer_count: number }>(`/api/activities/${a.id}/cheer`, "POST");
            setReactions((s) => ({ ...s, [a.id]: { ...(s[a.id] ?? prev), cheered: data.cheered, cheer_count: data.cheer_count } }));
        } catch (e) {
            setReactions((s) => ({ ...s, [a.id]: prev }));
            toast.show({ title: "Cheerできませんでした", description: e instanceof ApiError ? e.message : "通信に失敗しました", tone: "danger" });
        } finally {
            setCheerBusy((s) => ({ ...s, [a.id]: false }));
        }
    }

    if (activities.length === 0) {
        return (
            <section
                style={{
                    background: COLOR.surface,
                    border: `1px solid ${COLOR.border}`,
                    borderRadius: RADIUS.lg,
                    padding: 20,
                    textAlign: "center",
                }}
            >
                <p style={{ margin: 0, fontFamily: FONT.body, fontSize: 13, color: COLOR.textTertiary, lineHeight: 1.6 }}>
                    主催または参加している Activity がまだありません。Activity を作成するか、参加申請が承認されるとここに表示されます。
                </p>
            </section>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activities.map((a) => {
                const dt = new Date(a.starts_at);
                const dateLabel = dt.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
                const timeLabel = dt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
                const reaction = reactions[a.id] ?? { cheered: false, cheer_count: a.cheer_count ?? 0, comment_count: a.comment_count ?? 0 };
                const isOwner = a.isOwner;

                return (
                    <div
                        key={a.id}
                        style={{
                            background: COLOR.surface,
                            border: `1px solid ${COLOR.border}`,
                            borderRadius: RADIUS.lg,
                            padding: 14,
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            overflow: "hidden",
                        }}
                    >
                        {a.image_url || a.video_url ? (
                            <div style={{ margin: -14, marginBottom: 2 }}>
                                <MediaViewer imageUrl={a.image_url} videoUrl={a.video_url} alt={a.title ?? "Activity"} maxHeight={200} />
                            </div>
                        ) : null}

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                                style={{
                                    padding: "2px 8px",
                                    borderRadius: RADIUS.pill,
                                    fontFamily: FONT.mono,
                                    fontSize: TYPE.labelSm,
                                    fontWeight: 700,
                                    background: isOwner ? `${accent}14` : "rgba(255,255,255,0.06)",
                                    color: isOwner ? accent : COLOR.textTertiary,
                                    border: `1px solid ${isOwner ? `${accent}30` : COLOR.border}`,
                                }}
                            >
                                {isOwner ? "主催" : "参加"}
                            </span>
                            <span style={{ fontFamily: FONT.mono, fontSize: TYPE.labelSm, color: COLOR.textTertiary, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx={12} cy={12} r={10} />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                {dateLabel} {timeLabel}
                            </span>
                            {a.place ? (
                                <>
                                    <span style={{ opacity: 0.3, color: COLOR.textTertiary }}>•</span>
                                    <span style={{ fontFamily: FONT.mono, fontSize: TYPE.labelSm, color: COLOR.textTertiary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                                        📍 {a.place.name}
                                    </span>
                                </>
                            ) : null}
                        </div>

                        <h3
                            style={{
                                margin: 0,
                                fontFamily: FONT.body,
                                fontSize: 15,
                                fontWeight: 800,
                                color: COLOR.text,
                                lineHeight: 1.35,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {a.title ?? TYPE_LABELS_JA[a.type as ActivityType] ?? a.type}
                        </h3>

                        {a.description ? (
                            <p
                                style={{
                                    margin: 0,
                                    fontFamily: FONT.body,
                                    fontSize: 13,
                                    color: COLOR.textSecondary,
                                    lineHeight: 1.6,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                }}
                            >
                                {a.description}
                            </p>
                        ) : null}

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <CheerButton cheered={reaction.cheered} count={reaction.cheer_count} disabled={!!cheerBusy[a.id]} onToggle={() => void toggleCheer(a)} color={accent} />
                            <CommentButton count={reaction.comment_count} onClick={() => (window.location.href = `/dashboard?view=activities&activityId=${a.id}`)} />
                            <a
                                href={`/dashboard?view=activities&activityId=${a.id}`}
                                style={{
                                    marginLeft: "auto",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: 32,
                                    padding: "0 12px",
                                    borderRadius: RADIUS.pill,
                                    fontFamily: FONT.body,
                                    fontSize: 12,
                                    fontWeight: 800,
                                    background: accent,
                                    color: "#000",
                                    textDecoration: "none",
                                }}
                            >
                                詳細
                            </a>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function BaseClient({
    profile,
    scheduleActivities,
}: {
    profile: ProfileData;
    scheduleActivities: ScheduleActivity[];
}) {
    const pathname = usePathname();
    const { t } = useVzTheme();
    const reduce = useReducedMotion();
    const roleColor = ROLE_COLOR[profile.role as keyof typeof ROLE_COLOR] ?? COLOR.accent;
    // DashboardProfileView 用の theme 構築 (useVzTheme の t を流用)
    const [careerProfile, setCareerProfile] = useState<CareerProfileRow | null>(null);

    // 既存の career 取得を再利用 (なければ null のまま)
    useEffect(() => {
        let cancelled = false;
        fetch(`/api/career/me`, { cache: "no-store" })
            .then((r) => r.json().catch(() => ({})))
            .then((j: { career?: CareerProfileRow }) => {
                if (!cancelled && j.career) setCareerProfile(j.career);
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    return (
        <div style={{ minHeight: "100vh", background: COLOR.bg }}>
            {/* 1. 上部ヘッダー: 左 BASEメニュー(アコーディオン) / 中央 Vizionロゴ / 右 通知 */}
            <BaseHeader role={profile.role} pathname={pathname} />

            <div style={{ maxWidth: 720, margin: "0 auto", padding: `${SPACE.lg}px ${SPACE.md}px`, paddingBottom: 96, display: "flex", flexDirection: "column", gap: SPACE.lg }}>
                {/* 2. "○○ BASE" */}
                <motion.h1
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        margin: 0,
                        fontFamily: FONT.display,
                        fontSize: TYPE.displayMd,
                        fontWeight: 400,
                        letterSpacing: "0.04em",
                        color: COLOR.text,
                        lineHeight: 1,
                    }}
                >
                    {profile.displayName} BASE
                </motion.h1>

                {/* 3. Vizion ID */}
                <VizionIdSection profile={profile} />

                {/* 3b. Join Stamp (創設メンバー番号の可視化) */}
                <JoinStampSection profile={profile} />

                {/* 4. Profile (既存 DashboardProfileView を再利用) */}
                <DashboardProfileView
                    profile={profile}
                    t={t}
                    roleColor={roleColor}
                    onBack={() => window.history.back()}
                    careerProfile={careerProfile}
                    onProfileRefresh={async () => {}}
                    onCareerRefresh={async () => {}}
                />

                {/* 5. My Camps: 準備中 */}
                <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <h2
                        style={{
                            margin: 0,
                            fontFamily: FONT.mono,
                            fontSize: TYPE.label,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: COLOR.textTertiary,
                        }}
                    >
                        My Camps
                    </h2>
                    <MyCampsPlaceholder />
                </section>

                {/* 6. Schedule: 本人が主催/参加している Activity を時系列で */}
                <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: FONT.mono,
                                fontSize: TYPE.label,
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                                color: COLOR.textTertiary,
                            }}
                        >
                            Schedule
                        </h2>
                        <span style={{ fontFamily: FONT.mono, fontSize: TYPE.labelSm, color: COLOR.decorative }}>
                            主催・参加 {scheduleActivities.length}件
                        </span>
                    </div>
                    <ScheduleSection activities={scheduleActivities} viewerId={Number(profile.id)} />
                </section>
            </div>
        </div>
    );
}
