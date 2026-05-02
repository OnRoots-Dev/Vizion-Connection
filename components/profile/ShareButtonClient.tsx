"use client";

import { useState } from "react";

interface Props {
    profileUrl: string;
    referralUrl: string;
    displayName: string;
    roleColor: string;
    slug: string;
}

type CopiedKey = "profile" | "referral" | null;

type IgStatus = "idle" | "loading" | "done" | "error";

export default function ShareButtonClient({ profileUrl, referralUrl, displayName, roleColor, slug }: Props) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState<CopiedKey>(null);
    const [igStatus, setIgStatus] = useState<IgStatus>("idle");

    async function handleCopy(key: CopiedKey, text: string) {
        try { await navigator.clipboard.writeText(text); }
        catch {
            const el = document.createElement("textarea");
            el.value = text;
            document.body.appendChild(el); el.select();
            document.execCommand("copy"); document.body.removeChild(el);
        }
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    }

    async function handleNativeShare() {
        if (typeof navigator.share !== "undefined") {
            try {
                await navigator.share({
                    title: `${displayName} | Vizion Connection`,
                    text: `${displayName} さんがVizion Connectionに参加中！\nスポーツの新しいつながりを、ここから。`,
                    url: profileUrl,
                });
                await fetch("/api/share/complete", { method: "POST" });
                setOpen(false);
            } catch { /* キャンセル無視 */ }
        } else {
            handleCopy("profile", profileUrl);
            await fetch("/api/share/complete", { method: "POST" });
            setOpen(false);
        }
    }

    async function handleX() {
        try {
            window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${displayName} のVizion Connectionプロフィール\n${profileUrl}`)}`,
                "_blank"
            );
            await fetch("/api/share/complete", { method: "POST" });
            setOpen(false);
        } catch {
            // ignore
        }
    }

    async function handleInstagramStories() {
        if (igStatus === "loading") return;
        setIgStatus("loading");
        try {
            const res = await fetch(`/api/share-image?slug=${encodeURIComponent(slug)}&format=stories`);
            if (!res.ok) throw new Error("fetch failed");
            const blob = await res.blob();

            const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);

            if (isIOS) {
                const objectUrl = URL.createObjectURL(blob);
                const w = window.open("about:blank", "_blank");
                if (w) {
                    w.document.write(`<!DOCTYPE html><html><head>
                      <meta name="viewport" content="width=device-width,initial-scale=1">
                      <title>Vizion Story</title>
                      <style>
                        body{margin:0;background:#0d0d1a;display:flex;flex-direction:column;
                          align-items:center;justify-content:center;min-height:100vh;gap:18px;padding:24px;}
                        img{max-width:100%;border-radius:14px;box-shadow:0 8px 40px rgba(0,0,0,.6);}
                        p{color:rgba(255,255,255,.5);font-size:14px;font-family:sans-serif;text-align:center;line-height:1.8;margin:0;}
                      </style>
                    </head><body>
                      <img src="${objectUrl}" alt="Vizion Story"/>
                      <p>画像を長押しして保存し、インスタグラムのストーリーに追加してください</p>
                    </body></html>`);
                    w.document.close();
                }
                // best-effort cleanup
                setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
            } else {
                const objectUrl = URL.createObjectURL(blob);
                const a = Object.assign(document.createElement("a"), {
                    href: objectUrl,
                    download: "vizion-story.png",
                });
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            }

            await fetch("/api/share/complete", { method: "POST" });
            setIgStatus("done");
            setTimeout(() => setIgStatus("idle"), 2000);
            setOpen(false);
        } catch {
            setIgStatus("error");
            setTimeout(() => setIgStatus("idle"), 2000);
            setOpen(false);
        }
    }

    return (
        <div className="relative" style={{ ["--role-color" as any]: roleColor }}>
            <div className="flex items-center justify-end">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="flex cursor-pointer items-center gap-[6px] rounded-[10px] px-[12px] py-[8px] text-[12px] font-bold transition-all duration-200"
                    style={{
                        background: open ? `${roleColor}18` : "rgba(255,255,255,0.06)",
                        border: `1px solid ${open ? `${roleColor}40` : "rgba(255,255,255,0.1)"}`,
                        color: open ? roleColor : "rgba(255,255,255,0.6)",
                    }}
                >
                    <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    シェア
                    <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
            </div>

            {open ? (
                <>
                    <button type="button" className="fixed inset-0 z-[200] border-none bg-transparent" aria-label="close" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 z-[210] mt-2 w-[280px] overflow-hidden rounded-[14px]" style={{ background: "#0f0f1c", border: `1px solid ${roleColor}30`, boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px ${roleColor}15` }}>
                        <div className="border-b px-[14px] pb-[9px] pt-[11px]" style={{ borderBottomColor: `${roleColor}18` }}>
                            <p className="m-0 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.25)" }}>Share</p>
                        </div>

                        <div className="p-[6px]">
                            <button
                                type="button"
                                onClick={() => void handleNativeShare()}
                                className="mb-1 flex w-full items-center gap-[10px] rounded-[9px] px-3 py-[10px] text-left transition-[filter] duration-150"
                                style={{ background: `${roleColor}14`, border: `1px solid ${roleColor}35`, color: roleColor }}
                            >
                                <span className="flex w-5 shrink-0 justify-center">
                                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-[12px] font-bold leading-[1.3]">共有する</span>
                                    <span className="mt-px block text-[10px] opacity-45">Web Share / 共有シート（非対応ならコピー）</span>
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => void handleX()}
                                className="mb-1 flex w-full items-center gap-[10px] rounded-[9px] px-3 py-[10px] text-left transition-[filter] duration-150"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }}
                            >
                                <span className="flex w-5 shrink-0 justify-center">
                                    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M18.901 2H22l-6.769 7.734L23.2 22h-6.48l-5.074-6.62L5.8 22H2.7l7.33-8.373L1 2h6.646l4.59 5.996L18.901 2Zm-1.134 18h1.717L6.714 3.91H4.873L17.767 20Z" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-[12px] font-bold leading-[1.3]">Xに投稿</span>
                                    <span className="mt-px block text-[10px] opacity-45">投稿画面を開きます</span>
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => void handleInstagramStories()}
                                disabled={igStatus === "loading"}
                                className="mb-1 flex w-full items-center gap-[10px] rounded-[9px] px-3 py-[10px] text-left transition-[filter] duration-150 disabled:cursor-wait disabled:opacity-70"
                                style={{ background: "linear-gradient(135deg,rgba(240,148,51,.1),rgba(188,24,136,.1))", border: "1px solid rgba(225,48,108,0.2)", color: "#e1306c" }}
                            >
                                <span className="flex w-5 shrink-0 justify-center">
                                    {igStatus === "loading" ? (
                                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[rgba(225,48,108,0.35)] border-t-[rgba(225,48,108,1)]" />
                                    ) : (
                                        <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
                                            <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z" />
                                        </svg>
                                    )}
                                </span>
                                <span className="flex-1">
                                    <span className="block text-[12px] font-bold leading-[1.3]">Instagram Stories</span>
                                    <span className="mt-px block text-[10px] opacity-45">ストーリーズ用画像を保存</span>
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleCopy("referral", `${displayName} さんの紹介でVizion Connectionに先行登録できます！\n${referralUrl}`)}
                                className="mb-1 flex w-full items-center gap-[10px] rounded-[9px] px-3 py-[10px] text-left transition-[filter] duration-150"
                                style={{
                                    background: copied === "referral" ? "rgba(50,210,120,0.08)" : `${roleColor}10`,
                                    border: `1px solid ${copied === "referral" ? "rgba(50,210,120,0.25)" : `${roleColor}25`}`,
                                    color: copied === "referral" ? "#32D278" : `${roleColor}cc`,
                                }}
                            >
                                <span className="flex w-5 shrink-0 justify-center">
                                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-[12px] font-bold leading-[1.3]">{copied === "referral" ? "コピーしました ✓" : "紹介リンクをコピー"}</span>
                                    <span className="mt-px block text-[10px] opacity-45">友だちに送る用の文章つき</span>
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleCopy("profile", profileUrl)}
                                className="mb-0 flex w-full items-center gap-[10px] rounded-[9px] px-3 py-[10px] text-left transition-[filter] duration-150"
                                style={{
                                    background: copied === "profile" ? "rgba(50,210,120,0.08)" : "rgba(255,255,255,0.04)",
                                    border: `1px solid ${copied === "profile" ? "rgba(50,210,120,0.25)" : "rgba(255,255,255,0.08)"}`,
                                    color: copied === "profile" ? "#32D278" : "rgba(255,255,255,0.55)",
                                }}
                            >
                                <span className="flex w-5 shrink-0 justify-center">
                                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-[12px] font-bold leading-[1.3]">{copied === "profile" ? "コピーしました ✓" : "プロフィールURLをコピー"}</span>
                                    <span className="mt-px block text-[10px] opacity-45">URLのみをコピー</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}