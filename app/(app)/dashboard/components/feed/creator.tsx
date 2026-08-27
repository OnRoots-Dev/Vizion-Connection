"use client";

// dashboard/components/feed/creator.tsx
// Moment / Activity 共通: Creator の Identity 表示（アバター + 表示名 + Vizion ID + 役割色）。

import Image from "next/image";

export interface CreatorUser {
    id?: number | string;
    slug: string;
    display_name?: string | null;
    avatar_url?: string | null;
}

const MONO = "'Space Mono', 'SF Mono', monospace";

/** 丸アバター（画像 or 頭文字のフォールバック）。size は px 指定。 */
export function ProfileAvatar({
    user,
    size = 36,
    color,
}: {
    user: CreatorUser;
    size?: number;
    color: string;
}) {
    const fontChar = (user.display_name ?? user.slug ?? "?").slice(0, 1).toUpperCase();
    return (
        <span
            aria-hidden
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
                border: `1px solid ${color}55`,
                background: `linear-gradient(135deg, ${color}33, rgba(255,255,255,0.08))`,
            }}
        >
            {user.avatar_url ? (
                <Image
                    src={user.avatar_url}
                    alt=""
                    width={size}
                    height={size}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    unoptimized
                />
            ) : (
                <span
                    style={{
                        fontSize: Math.max(10, Math.round(size * 0.42)),
                        fontWeight: 800,
                        color: "#f0f0f5",
                        lineHeight: 1,
                    }}
                >
                    {fontChar}
                </span>
            )}
        </span>
    );
}

/** Creator ヘッダー: アバター + 表示名 + Vizion ID + 任意のメタ行（時刻・場所 etc）。 */
export function CreatorHeader({
    user,
    color,
    avatarSize = 36,
    label,
    meta,
}: {
    user: CreatorUser;
    color: string;
    avatarSize?: number;
    /** 表示名の代わりに明示的なラベルを使う場合（例: "MY ACTIVITY"） */
    label?: string;
    /** 1〜複数行のメタ情報（時刻 / 場所 / ステータスなど） */
    meta?: React.ReactNode;
}) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <ProfileAvatar user={user} size={avatarSize} color={color} />
            <div style={{ minWidth: 0, flex: 1 }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 6,
                        minWidth: 0,
                    }}
                >
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: "#f0f0f5",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {label ?? user.display_name ?? user.slug}
                    </span>
                </div>
                <VizionIDPreview slug={user.slug} />
                {meta ? (
                    <div
                        style={{
                            marginTop: 2,
                            fontSize: 11,
                            color: "rgba(255,255,255,0.45)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        {meta}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

/** Vizion ID プレビュー（mono 表記のスラッグ）。存在する場合のみ表示。 */
export function VizionIDPreview({ slug }: { slug?: string }) {
    if (!slug) return null;
    return (
        <div
            style={{
                fontSize: 10,
                fontFamily: MONO,
                letterSpacing: "0.04em",
                color: "rgba(255,255,255,0.38)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}
        >
            @{slug}
        </div>
    );
}
