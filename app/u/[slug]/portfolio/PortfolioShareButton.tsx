"use client";

import { useState } from "react";

type StoryStatus = "idle" | "loading" | "done" | "error";

// Portfolio 共有ボタン。Web Share API 優先、非対応環境はクリップボードコピー。
// 「URLをコピー」は常にコピー＋成功UIを出す。
// 「ストーリー画像を保存」は Stories OG(PNG) を取得し保存（iOSは新タブ長押し保存）。
export function PortfolioShareButton({
    url,
    title,
    text,
    accent,
    storiesUrl,
}: {
    url: string;
    title: string;
    text: string;
    accent: string;
    storiesUrl: string;
}) {
    const [copied, setCopied] = useState(false);
    const [shared, setShared] = useState(false);
    const [storyStatus, setStoryStatus] = useState<StoryStatus>("idle");
    const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

    async function copyToClipboard(payload: string) {
        try {
            await navigator.clipboard.writeText(payload);
        } catch {
            const el = document.createElement("textarea");
            el.value = payload;
            el.style.position = "fixed";
            el.style.opacity = "0";
            document.body.appendChild(el);
            el.select();
            try {
                document.execCommand("copy");
            } catch {
                /* noop */
            }
            document.body.removeChild(el);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleShare() {
        const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
        if (canShare) {
            try {
                await navigator.share({ title, text, url });
                setShared(true);
                setTimeout(() => setShared(false), 2000);
            } catch {
                /* ユーザーキャンセルは無視 */
            }
            return;
        }
        // 非対応環境はコピーにフォールバック
        await copyToClipboard(`${text}\n${url}`);
    }

    async function handleSaveStory() {
        if (storyStatus === "loading") return;
        setStoryStatus("loading");
        setFallbackUrl(null);
        try {
            const res = await fetch(storiesUrl);
            if (!res.ok) throw new Error("fetch failed");
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);

            if (isIOS) {
                // iOS は download 属性が効かないため、新タブで表示し長押し保存を案内
                const w = window.open("about:blank", "_blank");
                if (!w) {
                    // ポップアップブロック時は画像URL表示フォールバック
                    setFallbackUrl(storiesUrl);
                    setStoryStatus("error");
                    URL.revokeObjectURL(objectUrl);
                    return;
                }
                w.document.write(`<!DOCTYPE html><html><head>
                    <meta name="viewport" content="width=device-width,initial-scale=1">
                    <title>Vizion Portfolio Story</title>
                    <style>
                      body{margin:0;background:#07070e;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:18px;padding:24px;}
                      img{max-width:100%;border-radius:14px;box-shadow:0 8px 40px rgba(0,0,0,.6);}
                      p{color:rgba(255,255,255,.55);font-size:14px;font-family:sans-serif;text-align:center;line-height:1.8;margin:0;}
                    </style></head><body>
                      <img src="${objectUrl}" alt="Vizion Portfolio Story"/>
                      <p>画像を長押しして保存し、ストーリーに追加してください</p>
                    </body></html>`);
                w.document.close();
                setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
            } else {
                const a = Object.assign(document.createElement("a"), {
                    href: objectUrl,
                    download: "vizion-portfolio-story.png",
                });
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            }

            setStoryStatus("done");
            setTimeout(() => setStoryStatus("idle"), 2200);
        } catch {
            // 取得失敗時は画像URL表示フォールバック
            setFallbackUrl(storiesUrl);
            setStoryStatus("error");
        }
    }

    const storyLabel =
        storyStatus === "loading" ? "生成中…" : storyStatus === "done" ? "保存しました ✓" : storyStatus === "error" ? "もう一度試す" : "ストーリー画像を保存";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
                type="button"
                onClick={() => void handleShare()}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "10px 18px",
                    borderRadius: 12,
                    border: "none",
                    background: accent,
                    color: "#0B0B0F",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                }}
            >
                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {shared ? "共有しました ✓" : "歩みをシェア"}
            </button>

            <button
                type="button"
                onClick={() => void copyToClipboard(url)}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: `1px solid ${copied ? "rgba(50,210,120,0.4)" : "rgba(255,255,255,0.12)"}`,
                    background: copied ? "rgba(50,210,120,0.1)" : "rgba(255,255,255,0.04)",
                    color: copied ? "#32D278" : "rgba(255,255,255,0.7)",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                }}
            >
                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    {copied ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    )}
                </svg>
                {copied ? "コピーしました ✓" : "URLをコピー"}
            </button>

            <button
                type="button"
                onClick={() => void handleSaveStory()}
                disabled={storyStatus === "loading"}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: `1px solid ${storyStatus === "done" ? "rgba(50,210,120,0.4)" : `${accent}40`}`,
                    background: storyStatus === "done" ? "rgba(50,210,120,0.1)" : `${accent}12`,
                    color: storyStatus === "done" ? "#32D278" : accent,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: storyStatus === "loading" ? "wait" : "pointer",
                    opacity: storyStatus === "loading" ? 0.7 : 1,
                    transition: "all 0.15s ease",
                }}
            >
                {storyStatus === "loading" ? (
                    <span style={{ width: 13, height: 13, borderRadius: "50%", border: `2px solid ${accent}55`, borderTopColor: accent, display: "inline-block", animation: "pf-spin 0.7s linear infinite" }} />
                ) : (
                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                )}
                {storyLabel}
            </button>
          </div>

          {fallbackUrl ? (
            <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, fontWeight: 700, color: accent, textDecoration: "underline", textUnderlineOffset: 3 }}
            >
                画像を開く（長押しで保存）→
            </a>
          ) : null}

          <style>{`@keyframes pf-spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
