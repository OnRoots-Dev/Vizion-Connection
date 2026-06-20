"use client";

import MediaCropModal from "./MediaCropModal";

// Profile(hero) 専用プリセット（矩形 / 16:9 / natural解像度 webp）。MediaCropModal の薄ラッパ。
// 出力は crop 領域の自然解像度のまま（強制リサイズしない）→ profile_image_url の保存スキームを維持。
// src は親から受け取る統一設計（Avatar / Banner と同型）。
export default function ProfileHeroCropModal({
    isOpen,
    src,
    onClose,
    onComplete,
    busy = false,
    accentColor = "#a78bfa",
    aspect = 16 / 9,
}: {
    isOpen: boolean;
    src: string | null;
    onClose: () => void;
    onComplete: (blob: Blob) => void;
    busy?: boolean;
    accentColor?: string;
    aspect?: number;
}) {
    return (
        <MediaCropModal
            isOpen={isOpen}
            src={src}
            onClose={onClose}
            onComplete={onComplete}
            busy={busy}
            accentColor={accentColor}
            aspect={aspect}
            cropShape="rect"
            optimize={{ maxEdge: 1920, quality: 0.85 }}
            eyebrow="Profile"
            title="プロフィール画像を調整"
            hint="ドラッグで位置調整・スライダーで拡大（16:9）"
        />
    );
}
