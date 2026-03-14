"use client";

/**
 * ShareButton — 統一シェアボタン
 *
 * 使い方（全箇所共通）:
 *   <ShareButton slug="kenji" displayName="Kenji" roleColor="#FF5050" />
 *
 * ボタン構成:
 *   ① 共有する        → Web Share API（OG画像つき）/ URLコピー fallback
 *   ② Xに投稿        → OG横長画像（1200×630）保存 → X投稿画面を開く
 *   ③ カード画像を保存 → Stories縦長（1080×1920）保存
 *                       Meta App ID + iOS なら Instagram Stories へ直接渡す
 */

import { useState, useCallback, useRef } from "react";

interface Props {
    slug: string;
    displayName: string;
    roleColor: string;
    profileUrl?: string;
}

type Status = "idle" | "loading" | "done" | "error";

// ── 画像取得 ──────────────────────────────────────────────────────────────────
async function fetchImage(slug: string, format: "og" | "stories"): Promise<Blob | null> {
    for (const path of [
        `/api/share-image?slug=${slug}&format=${format}`,
        `/api/og/${slug}?format=${format}`,
    ]) {
        try {
            const res = await fetch(path);
            if (res.ok && res.headers.get("content-type")?.startsWith("image/")) {
                return await res.blob();
            }
        } catch { /* 次へ */ }
    }
    return null;
}

// ── ダウンロード（iOS対応）───────────────────────────────────────────────────
async function save(blob: Blob, filename: string) {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // iOS: 新タブに画像を表示して長押し保存を案内
        const reader = new FileReader();
        await new Promise<void>(res => {
            reader.onload = () => {
                const w = window.open("about:blank", "_blank");
                if (w) {
                    w.document.write(`<!DOCTYPE html><html><head>
                      <meta name="viewport" content="width=device-width,initial-scale=1">
                      <style>body{margin:0;background:#0d0d1a;display:flex;flex-direction:column;
                        align-items:center;justify-content:center;min-height:100vh;gap:20px;padding:24px;}
                        img{max-width:100%;border-radius:14px;box-shadow:0 8px 40px rgba(0,0,0,.6);}
                        p{color:rgba(255,255,255,.4);font-size:14px;font-family:sans-serif;text-align:center;line-height:1.8;margin:0;}
                        small{display:block;color:rgba(255,255,255,.18);font-size:11px;font-family:monospace;margin-top:6px;}</style>
                    </head><body>
                      <img src="${reader.result}" alt="Vizion Card"/>
                      <p>画像を長押し →「写真に追加」で保存<small>保存後 Instagram Stories などに投稿できます</small></p>
                    </body></html>`);
                    w.document.close();
                }
                res();
            };
            reader.readAsDataURL(blob);
        });
    } else {
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement("a"), { href: url, download: filename });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

export default function ShareButton({ slug, displayName, roleColor, profileUrl }: Props) {
    const [s1, setS1] = useState<Status>("idle"); // 共有する
    const [s2, setS2] = useState<Status>("idle"); // Xに投稿
    const [s3, setS3] = useState<Status>("idle"); // 画像を保存

    const ogRef = useRef<Blob | null>(null);
    const storiesRef = useRef<Blob | null>(null);

    const url = profileUrl ?? (typeof location !== "undefined" ? `${location.origin}/u/${slug}` : "");
    const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID;
    const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

    // ① 共有する
    const handleShare = useCallback(async () => {
        if (s1 === "loading") return;
        setS1("loading");
        try {
            if (!navigator.share) {
                // Desktop fallback → URLコピー
                try { await navigator.clipboard.writeText(url); } catch {
                    const el = document.createElement("textarea");
                    el.value = url; document.body.appendChild(el);
                    el.select(); document.execCommand("copy"); document.body.removeChild(el);
                }
                setS1("done"); setTimeout(() => setS1("idle"), 2000);
                return;
            }
            if (!ogRef.current) ogRef.current = await fetchImage(slug, "og");
            const sd: ShareData = {
                title: `${displayName} | Vizion Connection`,
                text: `${displayName} のVizion Connectionプロフィール`,
                url,
            };
            if (ogRef.current) {
                const f = new File([ogRef.current], `vizion-card-${slug}.png`, { type: "image/png" });
                try { if (navigator.canShare?.({ files: [f] })) sd.files = [f]; } catch { /* 無視 */ }
            }
            await navigator.share(sd);
            setS1("done"); setTimeout(() => setS1("idle"), 2000);
        } catch (e) {
            (e as Error).name === "AbortError" ? setS1("idle") : (setS1("error"), setTimeout(() => setS1("idle"), 2000));
        }
    }, [slug, displayName, url, s1]);

    // ② Xに投稿
    const handleX = useCallback(async () => {
        if (s2 === "loading") return;
        setS2("loading");
        try {
            if (!ogRef.current) ogRef.current = await fetchImage(slug, "og");
            if (ogRef.current) await save(ogRef.current, `vizion-card-${slug}.png`);
            await new Promise(r => setTimeout(r, 800));
            window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${displayName} のVizion Connectionプロフィール\n${url}`)}`,
                "_blank", "width=600,height=500,noopener"
            );
            setS2("done"); setTimeout(() => setS2("idle"), 2500);
        } catch {
            setS2("error"); setTimeout(() => setS2("idle"), 2000);
        }
    }, [slug, displayName, url, s2]);

    // ③ 画像を保存（Stories縦長）
    const handleSave = useCallback(async () => {
        if (s3 === "loading") return;
        setS3("loading");
        try {
            if (!storiesRef.current) storiesRef.current = await fetchImage(slug, "stories");
            if (!storiesRef.current) throw new Error("no image");

            // Meta App ID あり + モバイル → Instagram Storiesへ直接
            if (metaAppId && (isIOS || isAndroid)) {
                const igUrl = isIOS
                    ? `instagram-stories://share?source_application=${metaAppId}`
                    : `intent://stories.instagram.com/#Intent;scheme=https;package=com.instagram.android;end`;
                window.location.href = igUrl;
                // フォールバック: 2.5秒後に画像保存
                setTimeout(async () => {
                    await save(storiesRef.current!, `vizion-stories-${slug}.png`);
                }, 2500);
            } else {
                await save(storiesRef.current, `vizion-stories-${slug}.png`);
            }
            setS3("done"); setTimeout(() => setS3("idle"), 3000);
        } catch {
            setS3("error"); setTimeout(() => setS3("idle"), 2000);
        }
    }, [slug, s3, metaAppId, isIOS, isAndroid]);

    const hasShare = typeof navigator !== "undefined" && !!navigator.share;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

            {/* ① 共有する */}
            <Btn status={s1} onClick={handleShare}
                bg={s1 === "done" ? "rgba(50,210,120,0.08)" : `${roleColor}14`}
                border={s1 === "done" ? "rgba(50,210,120,0.35)" : `${roleColor}35`}
                color={s1 === "done" ? "#32D278" : roleColor}
                icon={<ShareIcon />}
                label={hasShare ? "共有する" : "URLをコピー"}
                labelDone={hasShare ? "シェアしました" : "コピーしました"}
            />

            {/* ② Xに投稿 */}
            <Btn status={s2} onClick={handleX}
                bg={s2 === "done" ? "rgba(50,210,120,0.08)" : "rgba(0,0,0,0.5)"}
                border={s2 === "done" ? "rgba(50,210,120,0.35)" : "rgba(255,255,255,0.14)"}
                color={s2 === "done" ? "#32D278" : "#ffffff"}
                icon={<XIcon />}
                label="Xに投稿"
                labelDone={isIOS ? "画像を開きました" : "画像を保存しました"}
                sub="画像を保存 → X投稿画面へ"
            />

            {/* ③ 画像を保存 */}
            <Btn status={s3} onClick={handleSave}
                bg={s3 === "done" ? "rgba(50,210,120,0.08)" : "rgba(255,255,255,0.04)"}
                border={s3 === "done" ? "rgba(50,210,120,0.35)" : "rgba(255,255,255,0.1)"}
                color={s3 === "done" ? "#32D278" : "rgba(255,255,255,0.6)"}
                icon={<DownloadIcon />}
                label={metaAppId && isIOS ? "Instagramに投稿" : "カード画像を保存"}
                labelDone={isIOS ? "タブで開きました（長押し保存）" : "保存しました"}
                sub={metaAppId && isIOS ? "Stories用縦長画像" : "Stories用 1080×1920"}
            />

            <style>{`@keyframes vc-spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

// ── 汎用ボタン ────────────────────────────────────────────────────────────────
function Btn({ status, onClick, bg, border, color, icon, label, labelDone, sub }: {
    status: Status; onClick: () => void;
    bg: string; border: string; color: string;
    icon: React.ReactNode;
    label: string; labelDone: string; sub?: string;
}) {
    return (
        <button onClick={onClick} disabled={status === "loading"}
            style={{
                width: "100%", padding: sub ? "10px 14px" : "12px 14px",
                borderRadius: "12px", cursor: status === "loading" ? "wait" : "pointer",
                display: "flex", alignItems: "center", gap: "10px",
                background: bg, border: `1px solid ${border}`, color,
                transition: "all 0.2s", textAlign: "left",
            }}
        >
            <span style={{ flexShrink: 0, width: "18px", display: "flex", justifyContent: "center" }}>
                {status === "loading" ? <SpinIcon color={color} />
                    : status === "done" ? <CheckIcon />
                        : status === "error" ? <ErrIcon />
                            : icon}
            </span>
            <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: "13px", fontWeight: 700, lineHeight: 1.3 }}>
                    {status === "error" ? "失敗しました" : status === "done" ? labelDone : label}
                </span>
                {sub && status === "idle" && (
                    <span style={{ display: "block", fontSize: "10px", opacity: 0.4, marginTop: "2px" }}>{sub}</span>
                )}
            </span>
        </button>
    );
}

const SpinIcon = ({ color }: { color: string }) =>
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}
        style={{ animation: "vc-spin .8s linear infinite" }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>;
const CheckIcon = () =>
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>;
const ErrIcon = () =>
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>;
const ShareIcon = () =>
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>;
const XIcon = () =>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>;
const DownloadIcon = () =>
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>;