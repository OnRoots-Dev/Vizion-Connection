"use client";

// app/(app)/trail/TrailClient.tsx
// Trail 画面 — 表示層のみ新規。既存の Activity/Moment 取得結果を props として受け取り、
// ヘッダー + タブ (Activity/Camp/Moment) + Filter (スポーツ種別) + 縦スクロールフィードを描画。
// データ取得ロジックは page.tsx 側で既存 server 関数を利用、ここでは表示とフィルタのみ。
// デザイントークン (lib/design/tokens.ts / globals.css --vc-*) に準拠し、既存 feed コンポーネントを再利用。

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { COLOR, FONT, TYPE, SPACE, RADIUS } from "@/lib/design/tokens";
import { ACTIVITY_TYPES, type ActivityType } from "@/features/activity/types";
import type { MomentFeedItem } from "@/features/moment/types";
import type { ActivityRecord } from "@/features/activity/types";
import { CreatorHeader, ProfileAvatar } from "@/app/(app)/dashboard/components/feed/creator";
import { CheerButton, CommentButton } from "@/app/(app)/dashboard/components/feed/actions";
import { MediaViewer } from "@/app/(app)/dashboard/components/feed/media";
import { ViewHeader } from "@/app/(app)/dashboard/components/ui";
import { useVzTheme } from "@/app/(app)/dashboard/components/bottom-nav/useVzTheme";
import { ROLE_COLOR } from "@/app/(app)/dashboard/types";
import { apiSend, ApiError } from "@/lib/api/core-client";
import { useToast } from "@/components/ui/toast";

type TabId = "activity" | "camp" | "moment";

type ActivityWithAuthor = ActivityRecord & {
    place?: { id: string; name: string; prefecture: string } | null;
    author?: { id: number; slug: string; display_name: string | null; avatar_url: string | null } | null;
};

const TAB_LABELS: Record<TabId, string> = {
    activity: "Activity",
    camp: "Camp",
    moment: "Moment",
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

function formatDateTime(iso: string): { date: string; time: string } {
    const d = new Date(iso);
    return {
        date: d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }),
        time: d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
    };
}

function relTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "たった今";
    if (m < 60) return `${m}分前`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}時間前`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}日前`;
    return new Date(iso).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

export default function TrailClient({
    initialActivities,
    initialMoments,
    viewerId,
    viewerRole,
    onBack,
}: {
    initialActivities: ActivityWithAuthor[];
    initialMoments: MomentFeedItem[];
    viewerId: number | null;
    viewerRole?: string | null;
    onBack?: () => void;
}) {
    const reduce = useReducedMotion();
    const toast = useToast();
    const router = useRouter();
    const { t } = useVzTheme();
    const roleColor = viewerRole ? ROLE_COLOR[viewerRole as keyof typeof ROLE_COLOR] ?? COLOR.accent : COLOR.accent;
    const handleBack = onBack ?? (() => router.push("/dashboard"));
    const [tab, setTab] = useState<TabId>("activity");
    const [sportFilter, setSportFilter] = useState<ActivityType | "all">("all");

    // Activity 用のローカル Cheer 状態 (楽観的更新)
    const [reactions, setReactions] = useState<Record<string, { cheered: boolean; cheer_count: number; comment_count: number }>>({});
    const [cheerBusy, setCheerBusy] = useState<Record<string, boolean>>({});

    const filteredActivities = useMemo(() => {
        if (sportFilter === "all") return initialActivities;
        return initialActivities.filter((a) => a.type === sportFilter);
    }, [initialActivities, sportFilter]);

    const accent = COLOR.accent;

    async function toggleActivityCheer(a: ActivityWithAuthor) {
        if (cheerBusy[a.id]) return;
        const current = reactions[a.id] ?? { cheered: false, cheer_count: a.cheer_count ?? 0, comment_count: a.comment_count ?? 0 };
        setCheerBusy((s) => ({ ...s, [a.id]: true }));
        const prev = current;
        setReactions((s) => ({
            ...s,
            [a.id]: { ...current, cheered: !current.cheered, cheer_count: current.cheer_count + (current.cheered ? -1 : 1) },
        }));
        try {
            const data = await apiSend<{ success: boolean; cheered: boolean; cheer_count: number }>(
                `/api/activities/${a.id}/cheer`,
                "POST",
            );
            setReactions((s) => ({
                ...s,
                [a.id]: { ...(s[a.id] ?? prev), cheered: data.cheered, cheer_count: data.cheer_count },
            }));
        } catch (e) {
            setReactions((s) => ({ ...s, [a.id]: prev }));
            toast.show({
                title: "Cheerできませんでした",
                description: e instanceof ApiError ? e.message : "通信に失敗しました",
                tone: "danger",
            });
        } finally {
            setCheerBusy((s) => ({ ...s, [a.id]: false }));
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: SPACE.lg, maxWidth: 720, margin: "0 auto", padding: `${SPACE.lg}px ${SPACE.md}px`, paddingBottom: 96 }}>
            {/* 1. 上部ヘッダー — SPA統一: 他ページと同じ ViewHeader (戻るボタン) を使用 */}
            <div style={{ marginBottom: 4 }}>
                <ViewHeader title="Trail" sub="みんなの軌跡 — Activity と Moment が一つの流れに" onBack={handleBack} t={t} roleColor={roleColor} />
            </div>

            {/* 2. タブ: Activity / Camp / Moment */}
            <nav
                role="tablist"
                aria-label="Trail タブ"
                style={{
                    display: "flex",
                    gap: 6,
                    padding: 4,
                    borderRadius: RADIUS.pill,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${COLOR.border}`,
                    alignSelf: "flex-start",
                }}
            >
                {(["activity", "camp", "moment"] as TabId[]).map((id) => {
                    const active = tab === id;
                    return (
                        <button
                            key={id}
                            role="tab"
                            aria-selected={active}
                            onClick={() => setTab(id)}
                            style={{
                                position: "relative",
                                minWidth: 92,
                                minHeight: 36,
                                padding: "0 14px",
                                borderRadius: RADIUS.pill,
                                border: active ? `1px solid ${COLOR.accentBorder}` : "1px solid transparent",
                                background: active ? COLOR.accent : "transparent",
                                color: active ? "#000" : COLOR.textSecondary,
                                fontFamily: FONT.mono,
                                fontSize: TYPE.label,
                                fontWeight: 800,
                                letterSpacing: "0.06em",
                                cursor: "pointer",
                                transition: "background 150ms, color 150ms, border-color 150ms",
                            }}
                        >
                            {TAB_LABELS[id]}
                        </button>
                    );
                })}
            </nav>

            {/* 3. Filter (スポーツ種別のみ) — Activity タブ時のみ表示 */}
            <AnimatePresence mode="wait">
                {tab === "activity" ? (
                    <motion.div
                        key="filter"
                        initial={reduce ? false : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        style={{ display: "flex", flexDirection: "column", gap: 8 }}
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
                            Filter — スポーツ種別
                        </p>
                        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "thin" }}>
                            <FilterChip label="すべて" active={sportFilter === "all"} onClick={() => setSportFilter("all")} />
                            {ACTIVITY_TYPES.map((t) => (
                                <FilterChip
                                    key={t}
                                    label={TYPE_LABELS_JA[t]}
                                    active={sportFilter === t}
                                    onClick={() => setSportFilter(t)}
                                />
                            ))}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* 4. フィード (縦スクロール) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {tab === "activity" ? (
                    filteredActivities.length === 0 ? (
                        <EmptyState title="Activityがありません" description="条件に合うActivityがまだありません。別の種別を選ぶか、最初のActivityを投稿してみましょう。" />
                    ) : (
                        filteredActivities.map((a) => {
                            const reaction = reactions[a.id] ?? {
                                cheered: false,
                                cheer_count: a.cheer_count ?? 0,
                                comment_count: a.comment_count ?? 0,
                            };
                            return (
                                <ActivityTrailCard
                                    key={a.id}
                                    activity={a}
                                    viewerId={viewerId}
                                    accent={accent}
                                    reaction={reaction}
                                    cheerBusy={!!cheerBusy[a.id]}
                                    onToggleCheer={() => void toggleActivityCheer(a)}
                                    reduce={reduce}
                                />
                            );
                        })
                    )
                ) : tab === "moment" ? (
                    initialMoments.length === 0 ? (
                        <EmptyState title="Momentがありません" description="まだ共有されたMomentがありません。Activityから最初のMomentを投稿してみましょう。" />
                    ) : (
                        initialMoments.map((item) => (
                            <MomentTrailRow key={item.moment.id} item={item} viewerId={viewerId} accent={accent} />
                        ))
                    )
                ) : (
                    // Camp — 準備中
                    <CampPlaceholder />
                )}
            </div>

            {/* 軽いフッター導線 */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
                <span style={{ fontFamily: FONT.mono, fontSize: TYPE.labelSm, color: COLOR.decorative, letterSpacing: "0.08em" }}>
                    Trail — 続くほど、道になる
                </span>
            </div>
        </div>
    );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            style={{
                flexShrink: 0,
                padding: "6px 12px",
                borderRadius: RADIUS.pill,
                fontFamily: FONT.mono,
                fontSize: TYPE.labelSm,
                fontWeight: 700,
                letterSpacing: "0.02em",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 150ms",
                ...(active
                    ? {
                          background: COLOR.accent,
                          color: "#000",
                          border: `1px solid ${COLOR.accent}`,
                      }
                    : {
                          background: "rgba(255,255,255,0.05)",
                          color: COLOR.textSecondary,
                          border: `1px solid ${COLOR.border}`,
                      }),
            }}
        >
            {label}
        </button>
    );
}

function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div
            style={{
                padding: "32px 20px",
                borderRadius: RADIUS.lg,
                background: COLOR.surface,
                border: `1px solid ${COLOR.border}`,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "center",
            }}
        >
            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${COLOR.border}`,
                    color: COLOR.textTertiary,
                }}
            >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx={12} cy={12} r={10} />
                    <path d="M8 12h8M12 8v8" />
                </svg>
            </div>
            <p style={{ margin: 0, fontFamily: FONT.body, fontSize: TYPE.bodySm, fontWeight: 700, color: COLOR.text }}>{title}</p>
            <p style={{ margin: 0, fontFamily: FONT.body, fontSize: TYPE.bodySm, color: COLOR.textTertiary, lineHeight: 1.6, maxWidth: 360 }}>{description}</p>
        </div>
    );
}

// Activity カード — 既存 Actions / Media / Creator を再利用し、Trail 用にカード化
function ActivityTrailCard({
    activity: a,
    viewerId,
    accent,
    reaction,
    cheerBusy,
    onToggleCheer,
    reduce,
}: {
    activity: ActivityWithAuthor;
    viewerId: number | null;
    accent: string;
    reaction: { cheered: boolean; cheer_count: number; comment_count: number };
    cheerBusy: boolean;
    onToggleCheer: () => void;
    reduce: boolean | null;
}) {
    const dt = formatDateTime(a.starts_at);
    const isOwn = viewerId != null && viewerId === a.user_id;
    const authorUser = a.author
        ? { slug: a.author.slug, display_name: a.author.display_name, avatar_url: a.author.avatar_url }
        : { slug: "", display_name: "ユーザー", avatar_url: null };

    return (
        <motion.article
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
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
            {/* 画像 */}
            {a.image_url || a.video_url ? (
                <div style={{ margin: -14, marginBottom: 2 }}>
                    <MediaViewer imageUrl={a.image_url} videoUrl={a.video_url} alt={a.title ?? "Activity"} maxHeight={220} />
                </div>
            ) : null}

            {/* タイトル */}
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

            {/* 日時 / 場所 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontFamily: FONT.mono, fontSize: TYPE.labelSm, color: COLOR.textTertiary }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx={12} cy={12} r={10} />
                        <path d="M12 6v6l4 2" />
                    </svg>
                    {dt.date} {dt.time}
                </span>
                {a.place ? (
                    <>
                        <span aria-hidden style={{ opacity: 0.3 }}>•</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx={12} cy={10} r={3} />
                            </svg>
                            {a.place.name} ({a.place.prefecture})
                        </span>
                    </>
                ) : (
                    <>
                        <span aria-hidden style={{ opacity: 0.3 }}>•</span>
                        <span>場所なし</span>
                    </>
                )}
            </div>

            {/* 主催者 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CreatorHeader user={authorUser} color={accent} avatarSize={28} />
                <span
                    style={{
                        marginLeft: "auto",
                        padding: "2px 8px",
                        borderRadius: RADIUS.pill,
                        fontFamily: FONT.mono,
                        fontSize: TYPE.labelSm,
                        fontWeight: 700,
                        background: `${accent}14`,
                        color: accent,
                        border: `1px solid ${accent}30`,
                    }}
                >
                    {TYPE_LABELS_JA[a.type as ActivityType] ?? a.type}
                </span>
            </div>

            {/* Cheer / Comment / CTA */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 2 }}>
                <CheerButton cheered={reaction.cheered} count={reaction.cheer_count} disabled={cheerBusy || isOwn} onToggle={onToggleCheer} color={accent} />
                <CommentButton count={reaction.comment_count} onClick={() => (window.location.href = `/dashboard?view=activities&activityId=${a.id}`)} />
                <a
                    href={`/dashboard?view=activities&activityId=${a.id}`}
                    style={{
                        marginLeft: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 34,
                        padding: "0 14px",
                        borderRadius: RADIUS.pill,
                        fontFamily: FONT.body,
                        fontSize: 12,
                        fontWeight: 800,
                        background: accent,
                        color: "#000",
                        textDecoration: "none",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    詳細を見る
                </a>
            </div>
        </motion.article>
    );
}

// Moment コンパクト行 — 既存 MomentCard の要素を分解し、行形式で再構成 (アイコン/発信者/本文/時刻)
function MomentTrailRow({ item, viewerId, accent }: { item: MomentFeedItem; viewerId: number | null; accent: string }) {
    const authorUser = item.author
        ? { slug: item.author.slug, display_name: item.author.display_name, avatar_url: item.author.avatar_url }
        : { slug: "", display_name: "ユーザー", avatar_url: null };
    const isOwn = viewerId != null && viewerId === item.moment.user_id;

    return (
        <div
            style={{
                display: "flex",
                gap: 12,
                padding: "12px 14px",
                borderRadius: RADIUS.md,
                background: COLOR.surface,
                border: `1px solid ${COLOR.border}`,
                alignItems: "flex-start",
            }}
        >
            {/* アイコン */}
            <ProfileAvatar user={authorUser} size={34} color={accent} />

            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {/* 発信者 + 時刻 */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                    <span
                        style={{
                            fontFamily: FONT.body,
                            fontSize: 13,
                            fontWeight: 700,
                            color: COLOR.text,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {authorUser.display_name ?? authorUser.slug}
                    </span>
                    <span style={{ fontFamily: FONT.mono, fontSize: TYPE.labelSm, color: COLOR.textTertiary, flexShrink: 0 }}>
                        {relTime(item.moment.created_at)}
                    </span>
                    {isOwn ? (
                        <span
                            style={{
                                marginLeft: "auto",
                                fontFamily: FONT.mono,
                                fontSize: 9,
                                letterSpacing: "0.08em",
                                padding: "2px 6px",
                                borderRadius: RADIUS.pill,
                                background: "rgba(255,255,255,0.06)",
                                color: COLOR.textTertiary,
                                border: `1px solid ${COLOR.border}`,
                            }}
                        >
                            YOU
                        </span>
                    ) : null}
                </div>

                {/* 本文 */}
                <p
                    style={{
                        margin: 0,
                        fontFamily: FONT.body,
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: COLOR.textSecondary,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {item.moment.body}
                </p>

                {/* 軽いメタ: 場所があれば表示 */}
                {item.place ? (
                    <span style={{ fontFamily: FONT.mono, fontSize: TYPE.labelSm, color: COLOR.textTertiary, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx={12} cy={10} r={3} />
                        </svg>
                        {item.place.name}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

function CampPlaceholder() {
    return (
        <div
            style={{
                padding: "40px 24px",
                borderRadius: RADIUS.lg,
                background: COLOR.surface,
                border: `1px dashed ${COLOR.borderStrong}`,
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
            <p style={{ margin: 0, fontFamily: FONT.body, fontSize: 14, fontWeight: 700, color: COLOR.text }}>Camp は準備中</p>
            <p style={{ margin: 0, fontFamily: FONT.body, fontSize: 13, color: COLOR.textTertiary, lineHeight: 1.6, maxWidth: 340 }}>
                合宿・遠征の記録と募集は次のアップデートで公開予定です。まずは Activity と Moment で Trail を歩いてみましょう。
            </p>
            <span
                style={{
                    marginTop: 4,
                    fontFamily: FONT.mono,
                    fontSize: TYPE.labelSm,
                    letterSpacing: "0.1em",
                    color: COLOR.decorative,
                    textTransform: "uppercase",
                }}
            >
                Coming Soon
            </span>
        </div>
    );
}
