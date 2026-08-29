"use client";

// Sponsored Ad — P0
// Momentフィードに「一定間隔で1件ずつ」挿入する広告カード。
// ・データは /api/business-monetize/public?mode=ads で取得（service role書き込みはしない）。
// ・画像 / 動画を表示する。どちらも無い場合はテキストのみ。
// ・「Sponsored / Business」であることを明示する。
// ・単一カードを返す自己完結コンポーネント（連続表示・フィード自体の操作はしない）。

import Link from "next/link";
import type { ThemeColors } from "@/app/(app)/dashboard/types";
import { AD_SCOPE_LABEL } from "@/features/business-monetize/constants";

export type PublicAd = {
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
    videoUrl?: string | null;
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

export function SponsoredAdCard({ ad }: { ad: PublicAd }) {
  return (
    <article
      aria-label="Sponsored / Business"
      style={{
        padding: 14,
        borderRadius: 16,
        border: `1px solid ${ACCENT}33`,
        background: `linear-gradient(145deg, ${ACCENT}10, rgba(255,255,255,0.02))`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span style={{ padding: "3px 9px", borderRadius: 999, background: `${ACCENT}22`, border: `1px solid ${ACCENT}40`, color: ACCENT, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>
          SPONSORED
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
          {ad.type === "activity" ? "ACTIVITY広告" : "MOMENT広告"} · {AD_SCOPE_LABEL[ad.scope]}
          {ad.scope === "local" && ad.prefecture ? ` / ${ad.prefecture}` : ""}
        </span>
      </div>

      {ad.creative.imageUrl ? (
        <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#000" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.creative.imageUrl} alt={ad.creative.title || ad.name} style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} />
        </div>
      ) : ad.creative.videoUrl ? (
        <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#000" }}>
          <video src={ad.creative.videoUrl} muted playsInline controls style={{ width: "100%", maxHeight: 240, display: "block" }} />
        </div>
      ) : null}

      <p style={{ margin: "10px 0 4px", fontSize: 15, fontWeight: 900, color: "#f0f0f5" }}>{ad.creative.title || ad.name}</p>
      {ad.creative.description ? (
        <p style={{ margin: "0 0 8px", fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>{ad.creative.description}</p>
      ) : null}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
        <Link href={`/u/${ad.business.slug}`} style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
          {ad.business.displayName || ad.business.slug} · <span style={{ color: ACCENT }}>{ad.business.plan}</span>
        </Link>
        {ad.creative.ctaUrl && ad.creative.ctaText ? (
          <Link
            href={ad.creative.ctaUrl}
            target={ad.creative.ctaUrl.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            style={{ padding: "8px 14px", borderRadius: 10, background: ACCENT, color: "#06201b", fontWeight: 800, fontSize: 11 }}
          >
            {ad.creative.ctaText}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function SponsoredFeed({ t, ads }: { t?: ThemeColors; ads: PublicAd[] }) {
  void t;
  if (ads.length === 0) return null;
  return (
    <section aria-label="Sponsored" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {ads.map((ad) => <SponsoredAdCard key={ad.id} ad={ad} />)}
    </section>
  );
}
