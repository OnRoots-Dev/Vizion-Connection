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
            } catch { /* キャンセル無視 */ }
        } else {
            handleCopy("profile", profileUrl);
            await fetch("/api/share/complete", { method: "POST" });
        }
    }

    async function handleX() {
        try {
            window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${displayName} のVizion Connectionプロフィール\n${profileUrl}`)}`,
                "_blank"
            );
            await fetch("/api/share/complete", { method: "POST" });
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
        } catch {
            setIgStatus("error");
            setTimeout(() => setIgStatus("idle"), 2000);
        }
    }

    return (
        <div className="space-y-2" style={{ ["--role-color" as any]: roleColor }}>
            {/* Profile URL */}
            <div className="flex items-center gap-2">
                <div className="flex-1 overflow-hidden rounded-[9px] border border-white/10 bg-white/[0.03] px-3 py-[9px]">
                    <p className="m-0 truncate whitespace-nowrap font-mono text-[11px] text-white/35">
                        {profileUrl}
                    </p>
                </div>
                <button
                    onClick={() => handleCopy("profile", profileUrl)}
                    className={
                        "shrink-0 rounded-[9px] px-[14px] py-[9px] text-[11px] font-bold transition-all " +
                        (copied === "profile"
                            ? "bg-emerald-400/10 text-emerald-400 outline outline-1 outline-emerald-400/25"
                            : "bg-white/10 text-white/60")
                    }
                >
                    {copied === "profile" ? "✓" : "コピー"}
                </button>
            </div>

            {/* Referral URL */}
            <div className="flex items-center gap-2">
                <div className="flex-1 overflow-hidden rounded-[9px] border bg-[color:var(--role-color)]/[0.06] px-3 py-[9px]" style={{ borderColor: "color-mix(in srgb, var(--role-color) 20%, transparent)" }}>
                    <p className="m-0 truncate whitespace-nowrap font-mono text-[11px] text-[color:var(--role-color)]/80">
                        {referralUrl}
                    </p>
                </div>
                <button
                    onClick={() => handleCopy("referral", `${displayName} さんの紹介でVizion Connectionに先行登録できます！\n${referralUrl}`)}
                    className={
                        "shrink-0 rounded-[9px] px-[14px] py-[9px] text-[11px] font-bold transition-all " +
                        (copied === "referral"
                            ? "bg-emerald-400/10 text-emerald-400 outline outline-1 outline-emerald-400/25"
                            : "bg-[color:var(--role-color)]/15 text-[color:var(--role-color)]")
                    }
                >
                    {copied === "referral" ? "✓" : "紹介リンク"}
                </button>
            </div>

            {/* Native share */}
            <button
                onClick={handleNativeShare}
                className="flex w-full items-center justify-center gap-[7px] rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-[10px] text-[12px] font-semibold text-white/40 transition-all"
            >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                シェアする
            </button>

            <button
                onClick={handleX}
                className="flex w-full items-center justify-center gap-[7px] rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-[10px] text-[12px] font-semibold text-white/40 transition-all"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.901 2H22l-6.769 7.734L23.2 22h-6.48l-5.074-6.62L5.8 22H2.7l7.33-8.373L1 2h6.646l4.59 5.996L18.901 2Zm-1.134 18h1.717L6.714 3.91H4.873L17.767 20Z" />
                </svg>
                Xでシェア
            </button>

            <button
                onClick={handleInstagramStories}
                disabled={igStatus === "loading"}
                className="flex w-full items-center justify-center gap-[7px] rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-[10px] text-[12px] font-semibold text-white/40 transition-all disabled:cursor-wait disabled:opacity-60"
            >
                {igStatus === "loading" ? (
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white/70" />
                ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10a3 3 0 013 3v7a3 3 0 01-3 3H7a3 3 0 01-3-3v-7a3 3 0 013-3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                )}
                {igStatus === "loading" ? "読み込み中..." : "ストーリーズ用画像を保存"}
            </button>
        </div>
    );
}