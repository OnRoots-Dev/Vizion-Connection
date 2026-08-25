"use client";

// dashboard/components/core/CommentsSheet.tsx
// Momentコメント: 一覧 / 入力 / 投稿 / 削除（自分の分）/ Loading / Empty / Error。

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { apiGet, apiSend, ApiError } from "@/lib/api/core-client";
import type { MomentCommentRecord } from "@/features/moment/types";
import type { ThemeColors } from "../../types";

type CommentRow = MomentCommentRecord & {
    author_slug: string | null;
    author_display_name: string | null;
};

export function CommentsSheet({
    open,
    momentId,
    viewerId,
    t,
    onClose,
}: {
    open: boolean;
    momentId: string;
    viewerId: number | null;
    t: ThemeColors;
    onClose: () => void;
}) {
    const reduce = useReducedMotion();
    void t;
    const [comments, setComments] = useState<CommentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [body, setBody] = useState("");
    const [posting, setPosting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await apiGet<{ success: boolean; comments: CommentRow[] }>(`/api/moments/${momentId}/comments`);
            setComments(data.comments ?? []);
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "コメントを読み込めませんでした");
        } finally {
            setLoading(false);
        }
    }, [momentId]);

    useEffect(() => {
        if (open) void load();
    }, [open, load]);

    async function post() {
        if (!body.trim() || posting) return;
        setPosting(true);
        setError("");
        try {
            await apiSend(`/api/moments/${momentId}/comments`, "POST", { body: body.trim() });
            setBody("");
            await load();
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "コメントできませんでした");
        } finally {
            setPosting(false);
        }
    }

    async function remove(commentId: string) {
        if (deletingId) return;
        setDeletingId(commentId);
        setError("");
        try {
            await apiSend(`/api/moments/${momentId}/comments/${commentId}`, "DELETE");
            await load();
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "削除できませんでした");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <AnimatePresence>
            {open ? (
                <>
                    <motion.button
                        type="button"
                        aria-label="閉じる"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "fixed", inset: 0, zIndex: 90,
                            background: "rgba(5,5,10,0.55)", border: "none", cursor: "default",
                        }}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="コメント"
                        drag={reduce ? false : "y"}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.6 }}
                        onDragEnd={(_, info) => info.offset.y > 90 && onClose()}
                        initial={reduce ? { opacity: 0 } : { y: "100%" }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { y: "100%" }}
                        transition={{ type: "spring", stiffness: 380, damping: 38 }}
                        style={{
                            position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 91,
                            maxHeight: "72dvh",
                            background: "#111118", border: "1px solid rgba(255,255,255,0.1)",
                            borderBottom: "none", borderRadius: "20px 20px 0 0",
                            boxShadow: "0 -18px 48px rgba(0,0,0,0.45)",
                            display: "flex", flexDirection: "column",
                        }}
                    >
                        <div style={{ padding: "10px 16px 0", display: "flex", justifyContent: "center" }}>
                            <div aria-hidden style={{ width: 40, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.18)" }} />
                        </div>
                        <div style={{ padding: "6px 20px 8px", fontSize: 13, fontWeight: 800, color: "#f0f0f5" }}>
                            コメント
                        </div>

                        <div style={{ overflowY: "auto", flex: 1, padding: "0 20px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
                            {loading ? (
                                <p style={{ margin: 0, padding: "18px 0", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>読み込み中...</p>
                            ) : comments.length === 0 && !error ? (
                                <p style={{ margin: 0, padding: "18px 0", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                                    まだコメントがありません。最初の応援コメントを贈ろう。
                                </p>
                            ) : (
                                comments.map((c) => (
                                    <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <div
                                            aria-hidden
                                            style={{
                                                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                                background: "linear-gradient(135deg, rgba(200,232,0,0.25), rgba(255,255,255,0.08))",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 11, fontWeight: 800, color: "#f0f0f5",
                                            }}
                                        >
                                            {(c.author_display_name ?? "?").slice(0, 1)}
                                        </div>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                                                {c.author_display_name ?? c.author_slug ?? "ユーザー"} ·{" "}
                                                {new Date(c.created_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                            <div style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.88)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                                {c.body}
                                            </div>
                                        </div>
                                        {viewerId != null && Number(viewerId) === c.user_id ? (
                                            <button
                                                type="button"
                                                onClick={() => void remove(c.id)}
                                                disabled={deletingId === c.id}
                                                aria-label="コメントを削除"
                                                style={{
                                                    background: "none", border: "none", fontSize: 10,
                                                    color: deletingId === c.id ? "rgba(255,120,120,0.5)" : "rgba(255,120,120,0.75)",
                                                    cursor: deletingId === c.id ? "wait" : "pointer",
                                                    textDecoration: "underline", flexShrink: 0,
                                                }}
                                            >
                                                削除
                                            </button>
                                        ) : null}
                                    </div>
                                ))
                            )}
                            {error ? <p role="alert" style={{ margin: 0, fontSize: 11, color: "rgba(255,120,120,0.9)" }}>{error}</p> : null}
                        </div>

                        <div
                            style={{
                                display: "flex", gap: 8,
                                padding: "10px 16px calc(14px + env(safe-area-inset-bottom))",
                                borderTop: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <input
                                value={body}
                                onChange={(e) => setBody(e.target.value.slice(0, 300))}
                                onKeyDown={(e) => e.key === "Enter" && post()}
                                placeholder="コメントを入力（300字まで）"
                                aria-label="コメントを入力"
                                style={{
                                    flex: 1, minHeight: 42, padding: "0 14px", borderRadius: 999,
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.14)",
                                    color: "#f0f0f5", fontSize: 13, outline: "none",
                                }}
                            />
                            <motion.button
                                type="button"
                                whileTap={reduce || posting || !body.trim() ? undefined : { scale: 0.94 }}
                                onClick={post}
                                disabled={posting || !body.trim()}
                                style={{
                                    minHeight: 42, padding: "0 18px", borderRadius: 999,
                                    fontSize: 12, fontWeight: 800,
                                    background: "#C8E800", color: "#000", border: "none",
                                    opacity: posting || !body.trim() ? 0.45 : 1,
                                    cursor: posting ? "wait" : "pointer",
                                }}
                            >
                                投稿
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            ) : null}
        </AnimatePresence>
    );
}
