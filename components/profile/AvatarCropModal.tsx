"use client";

import MediaCropModal from "./MediaCropModal";

// 出力サイズ（正方形 webp）。表示側は CSS で円形マスクするため正方形のまま保存する
// → 既存の avatar_url 設計（正方形画像）を維持し、Profile Card / OG / 公開Profile を破壊しない。
const OUTPUT_SIZE = 512;

// Avatar 専用プリセット（円形 / 1:1 / 512² webp）。MediaCropModal の薄ラッパ。
// props は従来互換のため変更しない。
export default function AvatarCropModal({
    isOpen,
    src,
    onClose,
    onComplete,
    busy = false,
    accentColor = "#a78bfa",
}: {
    isOpen: boolean;
    src: string | null;
    onClose: () => void;
    onComplete: (blob: Blob) => void;
    busy?: boolean;
    accentColor?: string;
}) {
    return (
        <MediaCropModal
            isOpen={isOpen}
            src={src}
            onClose={onClose}
            onComplete={onComplete}
            busy={busy}
            accentColor={accentColor}
            aspect={1}
            cropShape="round"
            output={{ width: OUTPUT_SIZE, height: OUTPUT_SIZE }}
            eyebrow="Avatar"
            title="プロフィール画像を調整"
            hint="ドラッグで位置調整・スライダーで拡大"
        />
    );
}
