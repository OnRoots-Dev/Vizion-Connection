"use client";
// components/career-wizard/LinkButtonPreview.tsx
// リンクボタン設定のリアルタイムプレビュー。
// wizard内(step contact)と公開プロフィールページ(`/u/[slug]`)の両方で再利用。

import { useMemo } from "react";
import { ExternalLink, Share2 } from "lucide-react";

type Props = {
  ctaTitle: string;
  ctaSub: string;
  ctaBtn: string;
  snsX?: string;
  snsInstagram?: string;
  snsTiktok?: string;
  roleColor?: string;
  /** 公開プロフィールページではslugを渡してリンク先に使う */
  slug?: string;
  /** true のときプレビューヘッダーを表示しない（公開ページ用） */
  compact?: boolean;
};

function buildSnsLinks(snsX?: string, snsInstagram?: string, snsTiktok?: string) {
  const links: { label: string; href: string }[] = [];
  if (snsX) {
    const handle = snsX.replace(/^@/, "");
    links.push({ label: "X", href: `https://x.com/${handle}` });
  }
  if (snsInstagram) {
    const handle = snsInstagram.replace(/^@/, "");
    links.push({ label: "Instagram", href: `https://instagram.com/${handle}` });
  }
  if (snsTiktok) {
    const handle = snsTiktok.replace(/^@/, "");
    links.push({ label: "TikTok", href: `https://tiktok.com/@${handle}` });
  }
  return links;
}

export default function LinkButtonPreview({
  ctaTitle,
  ctaSub,
  ctaBtn,
  snsX,
  snsInstagram,
  snsTiktok,
  roleColor = "#C8E800",
  slug,
  compact = false,
}: Props) {
  const snsLinks = useMemo(() => buildSnsLinks(snsX, snsInstagram, snsTiktok), [snsX, snsInstagram, snsTiktok]);
  const hasContent = Boolean(ctaTitle || ctaBtn || snsLinks.length > 0);

  if (!hasContent) {
    return (
      <div
        className="rounded-2xl border border-dashed p-5 text-center"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)" }}
      >
        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.25)" }}>
          タイトル・ボタン・SNSを設定すると、ここにプレビューが表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: roleColor }}
          />
          <span
            className="font-mono text-[9px] tracking-[0.2em] uppercase"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            プレビュー
          </span>
        </div>
      )}

      {/* CTA Card */}
      <div
        className="rounded-2xl border p-5"
        style={{
          borderColor: `${roleColor}25`,
          background: `linear-gradient(145deg, ${roleColor}0a, rgba(255,255,255,0.02))`,
        }}
      >
        <div className="space-y-3">
          {ctaTitle && (
            <p className="text-[15px] font-bold leading-snug" style={{ color: "rgba(255,255,255,0.9)" }}>
              {ctaTitle}
            </p>
          )}
          {ctaSub && (
            <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              {ctaSub}
            </p>
          )}
          {ctaBtn && (
            <div className="flex items-center gap-2 pt-1">
              <span
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-bold"
                style={{ background: roleColor, color: "#050508" }}
              >
                {ctaBtn}
                <ExternalLink size={11} />
              </span>
              {slug && (
                <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                  /u/{slug}
                </span>
              )}
            </div>
          )}
        </div>

        {snsLinks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {snsLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                <Share2 size={10} />
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
