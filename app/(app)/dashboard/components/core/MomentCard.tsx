"use client";

// dashboard/components/core/MomentCard.tsx
// 「このActivityから生まれたMoment」であることを示すカード。
// Cheerは moment_cheers API（既存ユーザーCheerとは別経路）。UIの感覚は既存Cheerを踏襲。

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { apiSend, ApiError } from "@/lib/api/core-client";
import { MOTION, TAP_SCALE } from "@/lib/design/tokens";
import { IconCheer } from "@/lib/design/icons";
import { ConnectionButton } from "./ConnectionButton";
import { CommentsSheet } from "./CommentsSheet";
import type { MomentFeedItem } from "@/features/moment/types";
import type { ThemeColors } from "../../types";

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
}: {
    item: MomentFeedItem;
    viewerId: number | null;
    roleColor: string;
    t: ThemeColors;
    connection?: { state: "none" | "outgoing" | "incoming" | "accepted"; id: string | null };
    onConnectionChanged?: () => void;
}) {
    const reduce = useReducedMotion();
    const isOwn = viewerId != null && viewerId === item.moment.user_id;

    const [cheered, setCheered] = useState(item.cheered_by_me);
    const [cheerCount, setCheerCount] = useState(item.moment.cheer_count);
    const [burst, setBurst] = useState(0);
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
            setCheered(!prevCheered);
            setCheerCount((c) => c + (prevCheered ? -1 : 1));
            if (!prevCheered) setBurst((n) => n + 1);
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

    void t;

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
                padding: "14px 16px",
                display: "flex", flexDirection: "column", gap: 10,
            }}
        >
            {/* ヘッダー: 誰が */}
            <header style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {item.author?.avatar_url ? (
                    <Image
                        src={item.author.avatar_url}
                        alt=""
                        width={36} height={36}
                        style={{ borderRadius: "50%", objectFit: "cover", border: `1px solid ${roleColor}44` }}
                        unoptimized
                    />
                ) : (
                    <div
                        aria-hidden
                        style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: `linear-gradient(135deg, ${roleColor}33, rgba(255,255,255,0.08))`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 800, color: "#f0f0f5",
                        }}
                    >
                        {(item.author?.display_name ?? "?").slice(0, 1)}
                    </div>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.author?.display_name ?? "ユーザー"}
                    </div>
                    {/* 何をして（起源Activity）— Momentは「ただの投稿」ではないことを示す */}
                    {item.activity ? (
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            marginTop: 2, maxWidth: "100%", overflow: "hidden",
                            padding: "1px 7px", borderRadius: 999,
                            background: `${roleColor}12`, border: `1px solid ${roleColor}30`,
                        }}>
                            <span aria-hidden style={{ fontSize: 9 }}>⚡</span>
                            <span style={{ fontSize: 10.5, fontWeight: 800, color: roleColor, letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {item.activity.title ?? item.activity.type}
                            </span>
                        </div>
                    ) : null}
                    {/* どこで・いつ */}
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.place ? `📍 ${item.place.name}` : ""}
                        {" · "}
                        {relTime(item.moment.created_at)}
                    </div>
                </div>
            </header>

            {/* 本文 */}
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.9)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {item.moment.body}
            </p>

            {item.moment.image_url ? (
                <Image
                    src={item.moment.image_url}
                    alt="Momentの画像"
                    width={640} height={360}
                    style={{ width: "100%", height: "auto", maxHeight: 320, objectFit: "cover", borderRadius: 12 }}
                    unoptimized
                />
            ) : null}
            {item.moment.video_url ? (
                <video src={item.moment.video_url} controls preload="metadata" style={{ width: "100%", maxHeight: 320, borderRadius: 12, background: "#000" }} />
            ) : null}

            {/* アクション行 */}
            <footer style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {!isOwn ? (
                    <motion.button
                        type="button"
                        aria-label={cheered ? "Cheer済み" : "Cheerする"}
                        whileTap={reduce || cheerBusy ? undefined : { scale: TAP_SCALE }}
                        animate={burst && !reduce ? { scale: [1, 1.25, 1] } : undefined}
                        transition={MOTION.pop}
                        onClick={toggleCheer}
                        disabled={cheerBusy}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            minHeight: 34, padding: "0 12px", borderRadius: 999,
                            fontSize: 12, fontWeight: 800, cursor: cheerBusy ? "wait" : "pointer",
                            ...(cheered
                                ? {
                                      background: `linear-gradient(135deg, ${roleColor}26, rgba(255,255,255,0.06))`,
                                      color: roleColor, border: `1px solid ${roleColor}55`,
                                  }
                                : {
                                      background: "rgba(255,255,255,0.05)",
                                      color: "rgba(255,255,255,0.75)",
                                      border: "1px solid rgba(255,255,255,0.14)",
                                  }),
                        }}
                    >
                        <span style={{ display: "inline-flex" }}><IconCheer size={13} /></span>
                        {cheerCount.toLocaleString()}
                    </motion.button>
                ) : (
                    <span
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            minHeight: 34, padding: "0 12px", borderRadius: 999,
                            fontSize: 12, fontWeight: 800,
                            background: `linear-gradient(135deg, ${roleColor}26, rgba(255,255,255,0.06))`,
                            color: roleColor, border: `1px solid ${roleColor}55`,
                        }}
                    >
                        <span style={{ display: "inline-flex" }}><IconCheer size={13} /></span>
                        {cheerCount.toLocaleString()}
                    </span>
                )}

                <motion.button
                    type="button"
                    aria-label={`コメント${commentCount}件を開く`}
                    whileTap={reduce ? undefined : { scale: 0.94 }}
                    onClick={() => setCommentsOpen(true)}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        minHeight: 34, padding: "0 12px", borderRadius: 999,
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                        color: "rgba(255,255,255,0.6)",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                    }}
                >
                    💬 {commentCount}
                </motion.button>

                {!isOwn && connection && item.author ? (
                    <span style={{ marginLeft: "auto" }}>
                        <ConnectionButton
                            targetSlug={item.author.slug}
                            state={connection.state}
                            connectionId={connection.id}
                            onChanged={onConnectionChanged}
                            compact
                        />
                    </span>
                ) : null}
            </footer>

            {/* 星バースト（成功フィードバック） */}
            <AnimatePresence>
                {burst && !reduce ? (
                    <motion.span
                        key={`burst-${burst}`}
                        initial={{ opacity: 0.9, scale: 0.6 }}
                        animate={{ opacity: 0, scale: 1.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        aria-hidden
                        style={{
                            position: "absolute", left: 40, bottom: 46,
                            width: 40, height: 40, borderRadius: "50%",
                            pointerEvents: "none",
                            boxShadow: `0 0 32px ${roleColor}`,
                        }}
                    />
                ) : null}
            </AnimatePresence>

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
                    // 閉じるタイミングで最新のコメント数を取得して反映
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
