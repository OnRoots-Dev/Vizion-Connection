"use client";

// dashboard/components/core/MomentCard.tsx
// 「スポーツの今」を共有する Moment フィードのカード。
// Creator / Vizion ID / Text / Media / Cheer / Comment / Location Link の基本構造。
// メディアは アスペクト比を保ったまま表示し、レイアウトを崩さない。

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { apiSend, ApiError } from "@/lib/api/core-client";
import { ConnectionButton } from "./ConnectionButton";
import { CommentsSheet } from "./CommentsSheet";
import type { MomentFeedItem } from "@/features/moment/types";
import type { ThemeColors } from "../../types";
import {
    CreatorHeader,
    MediaViewer,
    CheerButton,
    CommentButton,
    LocationLink,
} from "../feed";

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

export function MomentCard({
    item,
    viewerId,
    roleColor,
    t,
    connection,
    onConnectionChanged,
    highlight = false,
}: {
    item: MomentFeedItem;
    viewerId: number | null;
    roleColor: string;
    t: ThemeColors;
    connection?: { state: "none" | "outgoing" | "incoming" | "accepted"; id: string | null };
    onConnectionChanged?: () => void;
    highlight?: boolean;
}) {
    const reduce = useReducedMotion();
    const isOwn = viewerId != null && viewerId === item.moment.user_id;

    const [cheered, setCheered] = useState(item.cheered_by_me);
    const [cheerCount, setCheerCount] = useState(item.moment.cheer_count);
    const [cheerBusy, setCheerBusy] = useState(false);
    const [cheerError, setCheerError] = useState("");
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentCount, setCommentCount] = useState(item.moment.comment_count);

    async function toggleCheer() {
        if (cheerBusy) return;
        setCheerBusy(true);
        setCheerError("");
        const prevCheered = cheered;
        const prevCount = cheerCount;
        try {
            // 楽観的更新
            setCheered(!prevCheered);
            setCheerCount((c) => c + (prevCheered ? -1 : 1));
            const data = await apiSend<{ success: boolean; cheered: boolean; cheer_count: number }>(
                `/api/moments/${item.moment.id}/cheer`,
                "POST",
            );
            setCheered(data.cheered);
            setCheerCount(data.cheer_count);
        } catch (e) {
            setCheered(prevCheered);
            setCheerCount(prevCount);
            setCheerError(e instanceof ApiError ? e.message : "Cheerできませんでした");
        } finally {
            setCheerBusy(false);
        }
    }

    const authorUser = item.author
        ? { slug: item.author.slug, display_name: item.author.display_name, avatar_url: item.author.avatar_url }
        : { slug: "", display_name: "ユーザー", avatar_url: null };

    return (
        <motion.article
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            style={{
                position: "relative",
                background: "#111118",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "13px 14px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
            }}
        >
            {/* Creator / Vizion ID */}
            <header style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div
                    role={item.author ? "link" : undefined}
                    tabIndex={item.author ? 0 : undefined}
                    onClick={item.author ? (e) => { window.location.href = `/u/${item.author!.slug}`; e.stopPropagation(); } : undefined}
                    onKeyDown={item.author ? (e) => { if (e.key === "Enter") window.location.href = `/u/${item.author!.slug}`; } : undefined}
                    style={{ flex: 1, minWidth: 0, cursor: item.author ? "pointer" : "default" }}
                >
                    <CreatorHeader user={authorUser} color={roleColor} avatarSize={38} />
                </div>
                {!isOwn && connection && item.author ? (
                    <span style={{ flexShrink: 0 }}>
                        <ConnectionButton
                            targetSlug={item.author.slug}
                            state={connection.state}
                            connectionId={connection.id}
                            onChanged={onConnectionChanged}
                            compact
                        />
                    </span>
                ) : null}
            </header>

            {/* 起源Activity（Momentは「ただの投稿」ではないことを示す） */}
            {item.activity ? (
                <a
                    href={`/dashboard?view=activities&activityId=${item.activity.id}`}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        maxWidth: "100%",
                        alignSelf: "flex-start",
                        padding: "2px 10px",
                        borderRadius: 999,
                        background: `${roleColor}12`,
                        border: `1px solid ${roleColor}30`,
                        textDecoration: "none",
                        transition: "filter 0.15s, transform 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.filter = "brightness(1.2)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.filter = "brightness(1)";
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    <span aria-hidden style={{ fontSize: 9 }}>★</span>
                    <span
                        style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            color: roleColor,
                            letterSpacing: "0.02em",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {item.activity.title ?? item.activity.type}
                    </span>
                </a>
            ) : null}

            {/* 場所・時刻（CreatorHeader 下のメタ） */}
            <div
                style={{
                    marginTop: -2,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    lineHeight: 1.3,
                }}
            >
                <span>{new Date(item.moment.created_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                <span aria-hidden>•</span>
                <span>{relTime(item.moment.created_at)}</span>
            </div>

            {/* 本文 */}
            {item.moment.body ? (
                <p
                    style={{
                        margin: 0,
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: "rgba(255,255,255,0.88)",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                    }}
                >
                    {item.moment.body}
                </p>
            ) : null}

            {/* Media: テキストとのバランスを崩さないよう、上部に寄せてコンパクトに表示 */}
            <MediaViewer
                imageUrl={item.moment.image_url}
                videoUrl={item.moment.video_url}
                alt="Momentの画像"
                maxHeight={320}
            />

            {/* Location Link（Viz Map 導線） */}
            {item.place ? <LocationLink placeName={item.place.name} prefecture={item.place.prefecture} /> : null}

            {/* アクション行 */}
            <footer style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {!isOwn ? (
                    <CheerButton
                        cheered={cheered}
                        count={cheerCount}
                        disabled={cheerBusy}
                        onToggle={toggleCheer}
                        color={roleColor}
                    />
                ) : (
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            minHeight: 34,
                            padding: "0 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                            background: `linear-gradient(135deg, ${roleColor}26, rgba(255,255,255,0.06))`,
                            color: roleColor,
                            border: `1px solid ${roleColor}55`,
                        }}
                    >
                        <CheerCountOnly count={cheerCount} />
                    </span>
                )}
                <CommentButton count={commentCount} onClick={() => setCommentsOpen(true)} />
            </footer>

            {cheerError ? (
                <p role="alert" style={{ margin: 0, fontSize: 11, color: "rgba(255,120,120,0.9)" }}>{cheerError}</p>
            ) : null}

            <CommentsSheet
                open={commentsOpen}
                momentId={item.moment.id}
                viewerId={viewerId}
                t={t}
                onClose={() => {
                    setCommentsOpen(false);
                    fetch(`/api/moments/${item.moment.id}/comments`, { credentials: "same-origin" })
                        .then((r) => (r.ok ? r.json() : null))
                        .then((d: { comments?: unknown[] } | null) => {
                            if (d?.comments) setCommentCount(d.comments.length);
                        })
                        .catch(() => undefined);
                }}
            />
        </motion.article>
    );
}

/** 自分のMoment用: カウントのみの受動表示（アイコンは非表示） */
function CheerCountOnly({ count }: { count: number }) {
    return <span>{count.toLocaleString()}</span>;
}
