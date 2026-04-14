"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AdminPostRow = {
    id: string;
    title: string;
    category: string;
    published_at: string;
    is_published: boolean;
};

function formatDateTime(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);
}

export default function PostsView({
    t,
    roleColor,
    setView,
    onEdit,
}: {
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    onEdit: (postId: string | null) => void;
}) {
    const [posts, setPosts] = useState<AdminPostRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/posts", { cache: "no-store" });
            const json = (await res.json()) as { posts?: AdminPostRow[]; error?: string };
            if (!res.ok) {
                throw new Error(json.error ?? "記事一覧の取得に失敗しました");
            }
            setPosts(Array.isArray(json.posts) ? json.posts : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "記事一覧の取得に失敗しました");
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const deletePost = useCallback(async (id: string) => {
        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
            const json = (await res.json()) as { success?: boolean; error?: string };
            if (!res.ok || !json.success) {
                throw new Error(json.error ?? "削除に失敗しました");
            }
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "削除に失敗しました");
        } finally {
            setDeletingId(null);
        }
    }, [load]);

    const rows = useMemo(() => posts, [posts]);

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <ViewHeader title="記事管理" sub="運営記事の一覧 / 編集 / 削除" onBack={() => setView("hub")} t={t} roleColor={roleColor} />

            <SectionCard t={t} accentColor={roleColor}>
                <SLabel text="Actions" color={roleColor} />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                        type="button"
                        onClick={() => onEdit(null)}
                        style={{
                            border: "none",
                            background: roleColor,
                            color: "#061018",
                            fontWeight: 900,
                            fontSize: 12,
                            padding: "10px 14px",
                            borderRadius: 12,
                            cursor: "pointer",
                        }}
                    >
                        新規投稿
                    </button>
                    <button
                        type="button"
                        onClick={() => load()}
                        style={{
                            border: `1px solid ${t.border}`,
                            background: "transparent",
                            color: t.text,
                            fontWeight: 800,
                            fontSize: 12,
                            padding: "10px 14px",
                            borderRadius: 12,
                            cursor: "pointer",
                        }}
                    >
                        更新
                    </button>
                </div>
                {error ? <p style={{ margin: "10px 0 0", fontSize: 12, color: "#ff6b6b" }}>{error}</p> : null}
            </SectionCard>

            <SectionCard t={t}>
                <SLabel text="Posts" color={roleColor} />

                {loading ? (
                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>読み込み中...</p>
                ) : rows.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>記事がありません。</p>
                ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                        {rows.map((post) => (
                            <div
                                key={post.id}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "minmax(0, 1fr) auto",
                                    gap: 10,
                                    padding: 14,
                                    borderRadius: 14,
                                    border: `1px solid ${t.border}`,
                                    background: "rgba(255,255,255,0.02)",
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {post.title}
                                    </p>
                                    <p style={{ margin: "6px 0 0", fontSize: 11, color: t.sub }}>
                                        {post.category} · {formatDateTime(post.published_at)}
                                    </p>
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            marginTop: 8,
                                            padding: "2px 8px",
                                            borderRadius: 999,
                                            border: `1px solid ${post.is_published ? `${roleColor}55` : t.border}`,
                                            background: post.is_published ? `${roleColor}18` : "transparent",
                                            color: post.is_published ? roleColor : t.sub,
                                            fontSize: 10,
                                            fontWeight: 900,
                                            fontFamily: "monospace",
                                        }}
                                    >
                                        {post.is_published ? "公開" : "下書き"}
                                    </span>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => onEdit(post.id)}
                                        style={{
                                            border: `1px solid ${t.border}`,
                                            background: "transparent",
                                            color: t.text,
                                            borderRadius: 10,
                                            padding: "8px 10px",
                                            fontSize: 11,
                                            fontWeight: 800,
                                            cursor: "pointer",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        編集
                                    </button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                type="button"
                                                disabled={Boolean(deletingId)}
                                                style={{
                                                    border: "1px solid rgba(255,107,107,0.4)",
                                                    background: "rgba(255,107,107,0.10)",
                                                    color: "#ffb6b6",
                                                    borderRadius: 10,
                                                    padding: "8px 10px",
                                                    fontSize: 11,
                                                    fontWeight: 900,
                                                    cursor: deletingId ? "not-allowed" : "pointer",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                削除
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>記事を削除しますか？</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    この操作は取り消せません。
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => deletePost(post.id)}
                                                >
                                                    {deletingId === post.id ? "削除中..." : "削除する"}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
}
