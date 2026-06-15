"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { ThemeColors } from "@/app/(app)/dashboard/types";
import { ACTIVITY_TAGS, ACTIVITY_TAGS_MAX } from "./journey";

interface Props {
    imageUrl: string | null;
    videoUrl: string | null;
    tags: string[];
    isPublic: boolean;
    onImageChange: (url: string | null) => void;
    onVideoChange: (url: string | null) => void;
    onTagsChange: (tags: string[]) => void;
    onPublicChange: (next: boolean) => void;
    t: ThemeColors;
    roleColor: string;
    disabled?: boolean;
}

// Activity（Journey）記録の拡張入力: 画像 / 動画 / 活動タグ / 公開設定。
// アップロードは /api/journey/upload に委譲し、確定 URL を親へ渡す controlled 構成。
export function ActivityExtras({
    imageUrl,
    videoUrl,
    tags,
    isPublic,
    onImageChange,
    onVideoChange,
    onTagsChange,
    onPublicChange,
    t,
    roleColor,
    disabled = false,
}: Props) {
    const imageInput = useRef<HTMLInputElement | null>(null);
    const videoInput = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState<null | "image" | "video">(null);
    const [error, setError] = useState<string | null>(null);

    async function upload(kind: "image" | "video", file: File) {
        setError(null);
        setUploading(kind);
        try {
            const fd = new FormData();
            fd.append("kind", kind);
            fd.append("file", file);
            const res = await fetch("/api/journey/upload", { method: "POST", body: fd });
            const data = (await res.json()) as { url?: string; error?: string };
            if (!res.ok || !data.url) {
                setError(data.error ?? "アップロードに失敗しました");
                return;
            }
            if (kind === "image") onImageChange(data.url);
            else onVideoChange(data.url);
        } catch {
            setError("通信エラーが発生しました");
        } finally {
            setUploading(null);
        }
    }

    function toggleTag(tag: string) {
        if (tags.includes(tag)) {
            onTagsChange(tags.filter((x) => x !== tag));
        } else if (tags.length < ACTIVITY_TAGS_MAX) {
            onTagsChange([...tags, tag]);
        }
    }

    const mediaBtn = (label: string, onClick: () => void, busy: boolean) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || busy}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 12px",
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: "rgba(255,255,255,0.03)",
                color: t.text,
                fontSize: 12,
                fontWeight: 700,
                cursor: disabled || busy ? "not-allowed" : "pointer",
                opacity: busy ? 0.6 : 1,
            }}
        >
            {busy ? "アップロード中…" : label}
        </button>
    );

    return (
        <div style={{ display: "grid", gap: 14 }}>
            {/* メディア */}
            <div style={{ display: "grid", gap: 10 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: t.sub }}>写真・動画（任意）</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {mediaBtn("📷 画像を追加", () => imageInput.current?.click(), uploading === "image")}
                    {mediaBtn("🎬 動画を追加", () => videoInput.current?.click(), uploading === "video")}
                    <input
                        ref={imageInput}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void upload("image", f);
                            e.target.value = "";
                        }}
                    />
                    <input
                        ref={videoInput}
                        type="file"
                        accept="video/*"
                        hidden
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void upload("video", f);
                            e.target.value = "";
                        }}
                    />
                </div>

                {error ? <p style={{ margin: 0, fontSize: 12, color: "var(--destructive)" }}>{error}</p> : null}

                {imageUrl ? (
                    <div style={{ position: "relative", width: "100%", maxWidth: 280 }}>
                        <Image
                            src={imageUrl}
                            alt="添付画像"
                            width={280}
                            height={180}
                            style={{ width: "100%", height: "auto", borderRadius: 12, border: `1px solid ${t.border}`, objectFit: "cover" }}
                        />
                        <RemoveBtn onClick={() => onImageChange(null)} />
                    </div>
                ) : null}

                {videoUrl ? (
                    <div style={{ position: "relative", width: "100%", maxWidth: 280 }}>
                        <video src={videoUrl} controls style={{ width: "100%", borderRadius: 12, border: `1px solid ${t.border}` }} />
                        <RemoveBtn onClick={() => onVideoChange(null)} />
                    </div>
                ) : null}
            </div>

            {/* 活動タグ */}
            <div style={{ display: "grid", gap: 8 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: t.sub }}>
                    活動タグ（{tags.length}/{ACTIVITY_TAGS_MAX}）
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {ACTIVITY_TAGS.map((tag) => {
                        const active = tags.includes(tag);
                        const full = !active && tags.length >= ACTIVITY_TAGS_MAX;
                        return (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                disabled={disabled || full}
                                style={{
                                    padding: "6px 11px",
                                    borderRadius: 999,
                                    border: `1px solid ${active ? `${roleColor}88` : t.border}`,
                                    background: active ? `${roleColor}1f` : "rgba(255,255,255,0.03)",
                                    color: active ? roleColor : t.sub,
                                    fontSize: 12,
                                    fontWeight: active ? 800 : 600,
                                    cursor: disabled || full ? "not-allowed" : "pointer",
                                    opacity: full ? 0.4 : 1,
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 公開設定 */}
            <button
                type="button"
                onClick={() => onPublicChange(!isPublic)}
                disabled={disabled}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: `1px solid ${t.border}`,
                    background: "rgba(255,255,255,0.03)",
                    color: t.text,
                    cursor: disabled ? "not-allowed" : "pointer",
                }}
            >
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{isPublic ? "公開" : "非公開"}</span>
                    <span style={{ fontSize: 10, color: t.sub }}>
                        {isPublic ? "Timeline / Portfolio に表示されます" : "自分だけが閲覧できます（後から変更可）"}
                    </span>
                </span>
                <span
                    aria-hidden
                    style={{
                        position: "relative",
                        width: 40,
                        height: 22,
                        borderRadius: 999,
                        background: isPublic ? roleColor : "rgba(255,255,255,0.18)",
                        transition: "background 0.2s ease",
                        flexShrink: 0,
                    }}
                >
                    <span
                        style={{
                            position: "absolute",
                            top: 2,
                            left: isPublic ? 20 : 2,
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "#fff",
                            transition: "left 0.2s ease",
                        }}
                    />
                </span>
            </button>
        </div>
    );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="削除"
            style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 26,
                height: 26,
                borderRadius: "50%",
                border: "none",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                fontSize: 14,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
            }}
        >
            ×
        </button>
    );
}
