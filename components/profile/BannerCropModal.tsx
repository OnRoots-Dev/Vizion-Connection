"use client";

import MediaCropModal from "./MediaCropModal";

// Banner 専用プリセット（矩形 / 3:1 / natural解像度 webp）。MediaCropModal の薄ラッパ。
// 出力は crop 領域の自然解像度のまま（強制リサイズしない）→ banner_url の 3:1 webp 仕様を維持。
// 旧実装の自前ファイル選択は廃止し、src を親から受け取る統一設計に移行。
export default function BannerCropModal({
    isOpen,
    src,
    onClose,
    onComplete,
    busy = false,
    accentColor = "#a78bfa",
    aspect = 3 / 1,
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
            eyebrow="Banner"
            title="バナー画像を調整"
            hint="ドラッグで位置調整・スライダーで拡大（3:1）"
        />
    );
}
