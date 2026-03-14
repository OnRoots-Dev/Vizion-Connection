"use client";

import { useCallback, useRef, useState } from "react";

export type ShareTarget = "x" | "instagram" | "tiktok" | "line" | "native" | "copy" | "download";

interface ShareCardOptions {
    /** シェアするプロフィールのslug */
    slug: string;
    /** 表示名 */
    displayName: string;
    /** カード要素のDOM id（html2canvasのターゲット） */
    cardElementId?: string;
    /** シェア時のURL（referral URLなど） */
    shareUrl: string;
    /** Xに入れるデフォルトテキスト */
    tweetText?: string;
}

interface ShareCardReturn {
    /** シェアモーダルを開く */
    openShare: () => void;
    /** シェアモーダルを閉じる */
    closeShare: () => void;
    /** モーダルが開いているか */
    isOpen: boolean;
    /** 特定のターゲットにシェア */
    shareTo: (target: ShareTarget) => Promise<void>;
    /** 生成中フラグ */
    isGenerating: boolean;
    /** 生成済み画像のURL（blob URL） */
    imageUrl: string | null;
    /** カード画像を生成 */
    generateImage: () => Promise<string | null>;
}

export function useShareCard({
    slug,
    displayName,
    cardElementId = "profile-card-share",
    shareUrl,
    tweetText,
}: ShareCardOptions): ShareCardReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const blobUrlRef = useRef<string | null>(null);

    /** html2canvas でカード要素を画像化 */
    const generateImage = useCallback(async (): Promise<string | null> => {
        const el = document.getElementById(cardElementId);
        if (!el) {
            console.warn(`[useShareCard] element #${cardElementId} not found`);
            return null;
        }

        setIsGenerating(true);
        try {
            // html2canvas を動的インポート（SSR対策）
            const { default: html2canvas } = await import("html2canvas");

            const canvas = await html2canvas(el, {
                backgroundColor: null,
                scale: 3,           // 高解像度（Retina対応）
                useCORS: true,
                allowTaint: false,
                logging: false,
                // カード外のオーバーフローを除去
                width: el.offsetWidth,
                height: el.offsetHeight,
            });

            // Blob URL を生成
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
                    "image/png",
                    1.0
                );
            });

            // 古いBlobURLを解放
            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
            const url = URL.createObjectURL(blob);
            blobUrlRef.current = url;
            setImageUrl(url);
            return url;
        } catch (err) {
            console.error("[useShareCard] generateImage error:", err);
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, [cardElementId]);

    /** モーダルを開くと同時に画像生成を開始 */
    const openShare = useCallback(async () => {
        setIsOpen(true);
        // まだ生成されていなければ生成
        if (!imageUrl) {
            await generateImage();
        }
    }, [imageUrl, generateImage]);

    const closeShare = useCallback(() => {
        setIsOpen(false);
    }, []);

    /** 各SNSへシェア */
    const shareTo = useCallback(async (target: ShareTarget) => {
        const text = tweetText ?? `${displayName} のVizion Connectionプロフィールカード`;
        const encodedText = encodeURIComponent(text);
        const encodedUrl = encodeURIComponent(shareUrl);
        const cardUrl = `${shareUrl.replace("/register", "")}/card/${slug}`;

        switch (target) {

            // ── X (Twitter) ────────────────────────────────────────────────────
            case "x": {
                const xText = encodeURIComponent(`${text}\n\n${cardUrl}`);
                window.open(
                    `https://twitter.com/intent/tweet?text=${xText}`,
                    "_blank",
                    "width=600,height=500,noopener"
                );
                break;
            }

            // ── Instagram ──────────────────────────────────────────────────────
            // Web APIなし。画像を保存してもらってからアプリを開く
            case "instagram": {
                const url = imageUrl ?? (await generateImage());
                if (url) {
                    // 画像をダウンロード
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `vizion-card-${slug}.png`;
                    a.click();
                }
                // 少し待ってからInstagramアプリ（モバイル）またはWebを開く
                setTimeout(() => {
                    // モバイルならカスタムURLスキーム、デスクトップならWeb
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    if (isMobile) {
                        window.location.href = "instagram://";
                        // フォールバック
                        setTimeout(() => window.open("https://www.instagram.com/", "_blank"), 1500);
                    } else {
                        window.open("https://www.instagram.com/", "_blank");
                    }
                }, 500);
                break;
            }

            // ── TikTok ─────────────────────────────────────────────────────────
            // Web APIなし。同様に画像DL + アプリ起動
            case "tiktok": {
                const url = imageUrl ?? (await generateImage());
                if (url) {
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `vizion-card-${slug}.png`;
                    a.click();
                }
                setTimeout(() => {
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    if (isMobile) {
                        window.location.href = "tiktok://";
                        setTimeout(() => window.open("https://www.tiktok.com/", "_blank"), 1500);
                    } else {
                        window.open("https://www.tiktok.com/upload", "_blank");
                    }
                }, 500);
                break;
            }

            // ── LINE ───────────────────────────────────────────────────────────
            case "line": {
                window.open(
                    `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`,
                    "_blank",
                    "width=600,height=500,noopener"
                );
                break;
            }

            // ── Web Share API（ネイティブシート） ─────────────────────────────
            case "native": {
                if (!navigator.share) {
                    // フォールバック: URLコピー
                    await shareTo("copy");
                    return;
                }

                const url = imageUrl ?? (await generateImage());
                const shareData: ShareData = {
                    title: `${displayName} | Vizion Connection`,
                    text: text,
                    url: shareUrl,
                };

                // 画像ファイルをShareDataに含める（対応ブラウザのみ）
                if (url && navigator.canShare) {
                    try {
                        const res = await fetch(url);
                        const blob = await res.blob();
                        const file = new File([blob], `vizion-card-${slug}.png`, { type: "image/png" });
                        if (navigator.canShare({ files: [file] })) {
                            shareData.files = [file];
                        }
                    } catch {
                        // ファイル共有に失敗してもURL共有を続行
                    }
                }

                try {
                    await navigator.share(shareData);
                } catch (err) {
                    // キャンセルは無視
                    if ((err as Error).name !== "AbortError") console.error(err);
                }
                break;
            }

            // ── 画像ダウンロード ──────────────────────────────────────────────
            case "download": {
                const url = imageUrl ?? (await generateImage());
                if (url) {
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `vizion-card-${slug}.png`;
                    a.click();
                }
                break;
            }

            // ── URLコピー ─────────────────────────────────────────────────────
            case "copy": {
                try {
                    await navigator.clipboard.writeText(shareUrl);
                } catch {
                    const el = document.createElement("textarea");
                    el.value = shareUrl;
                    document.body.appendChild(el);
                    el.select();
                    document.execCommand("copy");
                    document.body.removeChild(el);
                }
                break;
            }
        }
    }, [slug, displayName, shareUrl, tweetText, imageUrl, generateImage]);

    return { openShare, closeShare, isOpen, shareTo, isGenerating, imageUrl, generateImage };
}