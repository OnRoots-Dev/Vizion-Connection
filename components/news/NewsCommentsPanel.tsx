"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type NewsComment = {
    id: string;
    postId: string;
    userSlug: string | null;
    authorName: string;
    authorRole: string | null;
    avatarUrl: string | null;
    body: string;
    createdAt: string;
};

type PanelTheme = {
    surface: string;
    border: string;
    text: string;
    sub: string;
    accent: string;
    background?: string;
};

const DEFAULT_THEME: PanelTheme = {
    surface: "#ffffff",
    border: "rgba(15, 23, 42, 0.12)",
    text: "#111827",
    sub: "rgba(17, 24, 39, 0.62)",
    accent: "#e11d48",
    background: "#f4f6fb",
};

export function NewsCommentsPanel({
    postId,
    initialCount = 0,
    canComment,
    theme,
    compact = false,
}: {
    postId: string;
    initialCount?: number;
    canComment: boolean;
    theme?: PanelTheme;
    compact?: boolean;
}) {
    const mergedTheme = { ...DEFAULT_THEME, ...theme };
    const [comments, setComments] = useState<NewsComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [body, setBody] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        let active = true;
        setLoading(true);
        fetch(`/api/news/comments?postId=${encodeURIComponent(postId)}`, { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => {
                if (!active) return;
                const nextComments = Array.isArray(data.comments) ? data.comments : [];
                setComments(nextComments);
                setCount(nextComments.length);
            })
            .catch(() => {
                if (!active) return;
                setComments([]);
                setCount(initialCount);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [initialCount, postId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canComment || submitting) return;

        const trimmed = body.trim();
        if (!trimmed) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/news/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId, body: trimmed }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.comment) {
                setError(typeof data.error === "string" ? data.error : "コメントを投稿できませんでした。");
                return;
            }

            setComments((prev) => [data.comment as NewsComment, ...prev]);
            setCount((prev) => prev + 1);
            setBody("");
        } catch {
            setError("コメントを投稿できませんでした。");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section
            style={{
                borderRadius: compact ? 20 : 24,
                border: `1px solid ${mergedTheme.border}`,
                background: mergedTheme.surface,
                padding: compact ? 18 : 24,
                boxShadow: compact ? "none" : "0 18px 50px rgba(15, 23, 42, 0.08)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <div>
                    <p style={{ margin: 0, color: mergedTheme.sub, fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                        Comments
                    </p>
                    <h2 style={{ margin: "6px 0 0", color: mergedTheme.text, fontSize: compact ? 20 : 24, fontWeight: 900 }}>
                        コメント {count.toLocaleString()}件
                    </h2>
                </div>
                {!canComment ? (
                    <span style={{ fontSize: 12, color: mergedTheme.sub }}>コメント投稿にはログインが必要です</span>
                ) : null}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                <textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="記事への感想や意見を書いてください"
                    maxLength={500}
                    disabled={!canComment || submitting}
                    style={{
                        width: "100%",
                        minHeight: compact ? 92 : 110,
                        resize: "vertical",
                        borderRadius: 16,
                        border: `1px solid ${mergedTheme.border}`,
                        background: mergedTheme.background,
                        color: mergedTheme.text,
                        padding: "14px 16px",
                        outline: "none",
                        fontSize: 14,
                        lineHeight: 1.7,
                    }}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: error ? "#dc2626" : mergedTheme.sub }}>
                        {error ?? `${body.length}/500`}
                    </span>
                    <button
                        type="submit"
                        disabled={!canComment || submitting || body.trim().length === 0}
                        style={{
                            border: "none",
                            borderRadius: 999,
                            background: canComment ? mergedTheme.accent : mergedTheme.border,
                            color: "#fff",
                            padding: "10px 16px",
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: !canComment || submitting || body.trim().length === 0 ? "not-allowed" : "pointer",
                            opacity: !canComment || body.trim().length === 0 ? 0.6 : 1,
                        }}
                    >
                        {submitting ? "投稿中..." : "コメントを送信"}
                    </button>
                </div>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {loading ? (
                    <p style={{ margin: 0, color: mergedTheme.sub, fontSize: 13 }}>コメントを読み込み中...</p>
                ) : comments.length === 0 ? (
                    <div
                        style={{
                            borderRadius: 16,
                            border: `1px dashed ${mergedTheme.border}`,
                            background: mergedTheme.background,
                            padding: "18px 16px",
                            color: mergedTheme.sub,
                            fontSize: 13,
                        }}
                    >
                        まだコメントはありません。最初のコメントを投稿してみましょう。
                    </div>
                ) : (
                    comments.map((comment) => (
                        <article
                            key={comment.id}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "44px 1fr",
                                gap: 12,
                                borderRadius: 18,
                                border: `1px solid ${mergedTheme.border}`,
                                background: mergedTheme.background,
                                padding: "14px 14px 15px",
                            }}
                        >
                            {comment.avatarUrl ? (
                                <Image
                                    src={comment.avatarUrl}
                                    alt={comment.authorName}
                                    width={44}
                                    height={44}
                                    style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", display: "block" }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${mergedTheme.accent}33, ${mergedTheme.accent}11)`,
                                        display: "grid",
                                        placeItems: "center",
                                        color: mergedTheme.accent,
                                        fontWeight: 900,
                                        fontSize: 14,
                                    }}
                                >
                                    {comment.authorName.slice(0, 1)}
                                </div>
                            )}
                            <div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <span style={{ color: mergedTheme.text, fontSize: 14, fontWeight: 800 }}>{comment.authorName}</span>
                                        {comment.authorRole ? (
                                            <span
                                                style={{
                                                    borderRadius: 999,
                                                    border: `1px solid ${mergedTheme.border}`,
                                                    padding: "2px 8px",
                                                    color: mergedTheme.sub,
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {comment.authorRole}
                                            </span>
                                        ) : null}
                                    </div>
                                    <span style={{ color: mergedTheme.sub, fontSize: 12 }}>
                                        {new Date(comment.createdAt).toLocaleString("ja-JP")}
                                    </span>
                                </div>
                                <p style={{ margin: 0, color: mergedTheme.text, fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                                    {comment.body}
                                </p>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}
