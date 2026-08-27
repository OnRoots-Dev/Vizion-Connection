"use client";

// dashboard/components/feed/media.tsx
// Moment / Activity 共通: 画像・動画のアスペクト比を保ったまま表示し、フィードカードのレイアウトを崩さない。
// portrait / landscape / square / video すべてを許容。
// 方針: object-fit: contain + 最大高 + 幅100% で、元の比率を維持しつつ無理に引き伸ばさない。

import { useState } from "react";
import Image from "next/image";

export type FeedMediaKind = "image" | "video";

/**
 * メディアを内包するフレーム。アスペクト比は固定せず、
 * object-fit: contain で元比率を保つ。maxHeight で縦長メディアの暴発を防ぐ。
 * 背景を黒にして contain の余白が目立たないようにする。
 */
export function MediaFrame({
    kind,
    src,
    maxHeight = 420,
    radius = 12,
    alt = "",
    poster,
}: {
    kind: FeedMediaKind;
    src: string;
    maxHeight?: number;
    radius?: number;
    alt?: string;
    poster?: string;
}) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                maxHeight,
                borderRadius: radius,
                overflow: "hidden",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {!loaded ? (
                <MediaPlaceholder />
            ) : null}
            {kind === "image" ? (
                <Image
                    src={src}
                    alt={alt}
                    width={1600}
                    height={900}
                    onLoad={() => setLoaded(true)}
                    onError={() => setLoaded(false)}
                    style={{
                        width: "100%",
                        height: "auto",
                        maxHeight,
                        objectFit: "contain",
                        display: "block",
                    }}
                    unoptimized
                />
            ) : (
                <video
                    src={src}
                    poster={poster}
                    controls
                    preload="metadata"
                    onLoadedData={() => setLoaded(true)}
                    style={{
                        width: "100%",
                        height: "auto",
                        maxHeight,
                        objectFit: "contain",
                        display: "block",
                        background: "#000",
                    }}
                />
            )}
        </div>
    );
}

export function ImageDisplay({
    src,
    alt = "画像",
    maxHeight = 420,
}: {
    src: string;
    alt?: string;
    maxHeight?: number;
}) {
    return <MediaFrame kind="image" src={src} alt={alt} maxHeight={maxHeight} />;
}

export function VideoDisplay({
    src,
    poster,
    maxHeight = 420,
}: {
    src: string;
    poster?: string;
    maxHeight?: number;
}) {
    return <MediaFrame kind="video" src={src} poster={poster} maxHeight={maxHeight} />;
}

/** 画像 or 動画のいずれか有効な方を表示。両方ある場合は画像を優先（複数メディアは次フェーズ）。 */
export function MediaViewer({
    imageUrl,
    videoUrl,
    alt,
    maxHeight = 420,
}: {
    imageUrl?: string | null;
    videoUrl?: string | null;
    alt?: string;
    maxHeight?: number;
}) {
    if (imageUrl) {
        return <MediaFrame kind="image" src={imageUrl} alt={alt} maxHeight={maxHeight} />;
    }
    if (videoUrl) {
        return <MediaFrame kind="video" src={videoUrl} maxHeight={maxHeight} />;
    }
    return null;
}

/** ローディング中のプレースホルダー（ちらつき防止のためのみ、スケルトンは LoadingSkeleton で提供）。 */
function MediaPlaceholder() {
    return (
        <div
            aria-hidden
            style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
            }}
        >
            <span
                style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.15)",
                    borderTopColor: "rgba(255,255,255,0.6)",
                    animation: "media-spin 0.8s linear infinite",
                    opacity: 0.7,
                }}
            />
        </div>
    );
}
