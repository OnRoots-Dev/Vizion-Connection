"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import { Switch } from "@/components/ui/switch";
import { supabaseBrowser } from "@/lib/supabase/browser";

type EditorCategory = "interview" | "news" | "announcement" | "sports" | "event";

type ApiPost = {
    id: string;
    title: string;
    category: string;
    body: string;
    published_at: string;
    is_published: boolean;
    gallery_image_urls?: unknown;
};

function toDatetimeLocalValue(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function getFirstGalleryUrl(value: unknown): string {
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value) as unknown;
            if (Array.isArray(parsed) && typeof parsed[0] === "string") return parsed[0];
        } catch {
            return "";
        }
    }
    return "";
}

export default function PostEditorView({
    t,
    roleColor,
    setView,
    postId,
    onDone,
}: {
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    postId: string | null;
    onDone: () => void;
}) {
    const [loading, setLoading] = useState(Boolean(postId));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>("");

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<EditorCategory>("news");
    const [body, setBody] = useState("");
    const [publishedAtLocal, setPublishedAtLocal] = useState("");
    const [isPublished, setIsPublished] = useState(false);

    const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
    const [galleryImageUrl, setGalleryImageUrl] = useState<string>("");
    const [fileError, setFileError] = useState<string>("");

    const previousIsPublishedRef = useRef<boolean>(false);

    const categoryOptions = useMemo(() => (
        [
            { value: "interview", label: "interview" },
            { value: "news", label: "news" },
            { value: "announcement", label: "announcement" },
            { value: "sports", label: "sports" },
            { value: "event", label: "event" },
        ] as const
    ), []);

    const loadPost = useCallback(async () => {
        if (!postId) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/posts/${postId}`, { cache: "no-store" });
            const json = (await res.json()) as { post?: ApiPost; error?: string };
            if (!res.ok || !json.post) {
                throw new Error(json.error ?? "記事の取得に失敗しました");
            }

            setTitle(json.post.title ?? "");
            setCategory((json.post.category as EditorCategory) ?? "news");
            setBody(json.post.body ?? "");
            setIsPublished(Boolean(json.post.is_published));
            previousIsPublishedRef.current = Boolean(json.post.is_published);

            const publishedIso = json.post.published_at || new Date().toISOString();
            setPublishedAtLocal(toDatetimeLocalValue(publishedIso));

            const first = getFirstGalleryUrl(json.post.gallery_image_urls);
            setGalleryImageUrl(first);
            setImagePreviewUrl(first);
        } catch (e) {
            setError(e instanceof Error ? e.message : "記事の取得に失敗しました");
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        loadPost();
    }, [loadPost]);

    const handleFile = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError("");

        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setFileError("画像サイズは5MB以内にしてください");
            return;
        }

        const localUrl = URL.createObjectURL(file);
        setImagePreviewUrl(localUrl);

        try {
            const { data: bucket } = await supabaseBrowser.storage.getBucket("news-images");
            if (!bucket) {
                await supabaseBrowser.storage.createBucket("news-images", { public: true });
            }

            const ext = file.name.split(".").pop() || "png";
            const path = `admin/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
            const upload = await supabaseBrowser.storage.from("news-images").upload(path, file, {
                upsert: true,
                contentType: file.type,
            });

            if (upload.error) {
                throw new Error(upload.error.message);
            }

            const { data } = supabaseBrowser.storage.from("news-images").getPublicUrl(path);
            const publicUrl = data.publicUrl;
            setGalleryImageUrl(publicUrl);
            setImagePreviewUrl(publicUrl);
        } catch (err) {
            setFileError(err instanceof Error ? err.message : "画像アップロードに失敗しました");
        }
    }, []);

    const save = useCallback(async () => {
        setSaving(true);
        setError("");

        try {
            const publishedAtIso = publishedAtLocal ? fromDatetimeLocalValue(publishedAtLocal) : new Date().toISOString();

            const payload = {
                title: title.trim(),
                category,
                body: body.trim(),
                publishedAt: publishedAtIso,
                isPublished,
                galleryImageUrl: galleryImageUrl || undefined,
            };

            const wasPublished = previousIsPublishedRef.current;

            const endpoint = postId ? `/api/admin/posts/${postId}` : "/api/admin/posts";
            const method = postId ? "PATCH" : "POST";
            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = (await res.json()) as { post?: ApiPost; error?: string };
            if (!res.ok || !json.post) {
                throw new Error(json.error ?? "保存に失敗しました");
            }

            const becamePublished = !wasPublished && Boolean(json.post.is_published);
            previousIsPublishedRef.current = Boolean(json.post.is_published);

            if (becamePublished) {
                await fetch(`/api/admin/posts/${json.post.id}/notify`, { method: "POST" });
            }

            onDone();
        } catch (e) {
            setError(e instanceof Error ? e.message : "保存に失敗しました");
        } finally {
            setSaving(false);
        }
    }, [body, category, galleryImageUrl, isPublished, onDone, postId, publishedAtLocal, title]);

    const bodyGuide = "本文は100文字以上を推奨します";

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <ViewHeader title={postId ? "記事編集" : "新規投稿"} sub="タイトル / カテゴリー / 本文 / 公開設定" onBack={() => setView("hub")} t={t} roleColor={roleColor} />

            <SectionCard t={t} accentColor={roleColor}>
                <SLabel text="Editor" color={roleColor} />
                {error ? <p style={{ margin: 0, fontSize: 12, color: "#ff6b6b" }}>{error}</p> : null}
                {fileError ? <p style={{ margin: "8px 0 0", fontSize: 12, color: "#ffb86b" }}>{fileError}</p> : null}
            </SectionCard>

            <SectionCard t={t}>
                {loading ? (
                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>読み込み中...</p>
                ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                        <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}>
                            <span>タイトル（必須）</span>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{
                                    width: "100%",
                                    borderRadius: 12,
                                    border: `1px solid ${t.border}`,
                                    background: "rgba(255,255,255,0.04)",
                                    color: t.text,
                                    padding: "11px 12px",
                                    fontSize: 12,
                                    outline: "none",
                                }}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}>
                            <span>カテゴリー（必須）</span>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as EditorCategory)}
                                style={{
                                    width: "100%",
                                    borderRadius: 12,
                                    border: `1px solid ${t.border}`,
                                    background: "rgba(255,255,255,0.04)",
                                    color: t.text,
                                    padding: "11px 12px",
                                    fontSize: 12,
                                    outline: "none",
                                }}
                            >
                                {categoryOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}>
                            <span>本文（必須）</span>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                style={{
                                    width: "100%",
                                    borderRadius: 12,
                                    border: `1px solid ${t.border}`,
                                    background: "rgba(255,255,255,0.04)",
                                    color: t.text,
                                    padding: "11px 12px",
                                    fontSize: 12,
                                    outline: "none",
                                    minHeight: 220,
                                    resize: "vertical",
                                }}
                            />
                            <span style={{ fontSize: 10, opacity: 0.65 }}>{bodyGuide}</span>
                        </label>

                        <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}>
                            <span>画像（任意 / 最大5MB）</span>
                            <input type="file" accept="image/*" onChange={(e) => void handleFile(e)} />
                        </label>

                        {imagePreviewUrl ? (
                            <div style={{ borderRadius: 14, border: `1px solid ${t.border}`, overflow: "hidden", background: "rgba(255,255,255,0.02)" }}>
                                <img src={imagePreviewUrl} alt="preview" style={{ width: "100%", height: "auto", display: "block" }} />
                            </div>
                        ) : null}

                        <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}>
                            <span>公開日時（任意）</span>
                            <input
                                type="datetime-local"
                                value={publishedAtLocal}
                                onChange={(e) => setPublishedAtLocal(e.target.value)}
                                style={{
                                    width: "100%",
                                    borderRadius: 12,
                                    border: `1px solid ${t.border}`,
                                    background: "rgba(255,255,255,0.04)",
                                    color: t.text,
                                    padding: "11px 12px",
                                    fontSize: 12,
                                    outline: "none",
                                }}
                            />
                        </label>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                            <div>
                                <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: t.text }}>公開 / 非公開</p>
                                <p style={{ margin: "2px 0 0", fontSize: 10, color: t.sub }}>デフォルトは非公開です</p>
                            </div>
                            <Switch checked={isPublished} onCheckedChange={setIsPublished} aria-label="公開切り替え" />
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button
                                type="button"
                                onClick={() => void save()}
                                disabled={saving || !title.trim() || !body.trim() || body.trim().length < 1}
                                style={{
                                    border: "none",
                                    background: roleColor,
                                    color: "#061018",
                                    fontWeight: 900,
                                    fontSize: 12,
                                    padding: "10px 14px",
                                    borderRadius: 12,
                                    cursor: saving ? "progress" : "pointer",
                                    opacity: saving ? 0.7 : 1,
                                }}
                            >
                                {saving ? "保存中..." : "保存"}
                            </button>
                            <button
                                type="button"
                                onClick={onDone}
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
                                戻る
                            </button>
                        </div>
                    </div>
                )}
            </SectionCard>
        </div>
    );
}
