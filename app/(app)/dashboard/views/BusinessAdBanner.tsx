"use client";

// dashboard/views/BusinessAdBanner.tsx
// Map / Activity一覧に出す横長Business広告バナー。
// ・配信対象は server の /api/business-monetize/public?mode=ads が判定する
//   （active有料Business × scopeターゲティング × 優先順位 × ローテーション）。
// ・複数あれば数秒ごとにスライド（短いtransition、点滅なし）。1件なら固定。
// ・0件なら全体を描画しない。
// ・「Sponsored / Business」であることを明示し、表示可否の迂回はできない。

import Link from "next/link";
import { useEffect, useState } from "react";

type PublicAd = {
  id: string;
  name: string;
  type: "activity" | "moment";
  scope: "local" | "region" | "half" | "national";
  prefecture: string | null;
  regionBlock: string | null;
  half: string | null;
  creative: {
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    ctaText?: string | null;
    ctaUrl?: string | null;
  };
  business: {
    slug: string;
    displayName: string;
    plan: string;
  };
};

const ACCENT = "#00BFA5";
const SLIDE_MS = 4200;
const SCOPE_LABEL: Record<PublicAd["scope"], string> = {
  local: "都道府県",
  region: "地方",
  half: "東日本/西日本",
  national: "全国",
};

export function BusinessAdBanner({
  t,
  compact,
}: {
  t?: unknown;
  compact?: boolean;
}) {
  void t;
  const [ads, setAds] = useState<PublicAd[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/business-monetize/public?mode=ads", { cache: "no-store" })
      .then((res) => res.json().catch(() => ({})))
      .then((json) => {
        if (cancelled || !json?.success) return;
        setAds((json.ads as PublicAd[]) ?? []);
        setIndex(0);
      })
      .catch(() => { if (!cancelled) setAds([]); });
    return () => { cancelled = true; };
  }, []);

  // 複数広告 → 数秒ごとに自動スライド（点滅ではなく短いtransition）。
  useEffect(() => {
    if (ads.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ads.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [ads.length]);

  if (ads.length === 0) return null;

  return (
    <div
      aria-label="Sponsored / Business"
      style={{
        width: "100%",
        maxWidth: compact ? 300 : 480,
        position: "relative",
        overflow: "hidden",
        borderRadius: 14,
        border: `1px solid ${ACCENT}40`,
        background: `linear-gradient(145deg, ${ACCENT}14, rgba(255,255,255,0.03))`,
      }}
    >
      <div
        aria-live="polite"
        style={{
          display: "flex",
          transition: "transform 420ms cubic-bezier(0.22,1,0.36,1)",
          transform: `translateX(-${index * 100}%)`,
        }}
      >
        {ads.map((ad) => {
          const href = ad.creative.ctaUrl && ad.creative.ctaText
            ? ad.creative.ctaUrl
            : `/u/${ad.business.slug}`;
          return (
            <Link
              key={ad.id}
              href={href}
              target={ad.creative.ctaUrl?.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              style={{
                flex: "0 0 100%",
                minWidth: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "11px 13px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ padding: "2px 8px", borderRadius: 999, background: `${ACCENT}22`, border: `1px solid ${ACCENT}40`, color: ACCENT, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>
                  SPONSORED
                </span>
                <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>
                  BUSINESS
                </span>
                <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                  {ad.type === "activity" ? "ACTIVITY広告" : "MOMENT広告"} · {SCOPE_LABEL[ad.scope]}
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#f0f0f5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ad.creative.title || ad.name}
              </span>
              {ad.creative.description ? (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ad.creative.description}
                </span>
              ) : null}
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>
                {ad.business.displayName || ad.business.slug} · <span style={{ color: ACCENT }}>{ad.business.plan}</span>
              </span>
            </Link>
          );
        })}
      </div>
      {ads.length > 1 ? (
        <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
          {ads.map((ad, i) => (
            <span
              key={ad.id}
              aria-hidden
              style={{
                width: i === index ? 12 : 5,
                height: 4,
                borderRadius: 999,
                background: i === index ? ACCENT : "rgba(255,255,255,0.25)",
                transition: "width 200ms",
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
