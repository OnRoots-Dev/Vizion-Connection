"use client";

// Sponsored Feed — P0
// 事業者のアクティブな広告キャンペーン（Activity / Moment広告）を
// 「Sponsored」ラベル付きでフィードに表示する自己完結コンポーネント。
// 既存フィードのロジックには一切触れず、追加表示のみ行う。
// データは読み取り専用の /api/business-monetize/public から取得（service role書き込みはしない）。

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ThemeColors } from "@/app/(app)/dashboard/types";
import { SLabel } from "@/app/(app)/dashboard/components/ui";
import { AD_SCOPE_LABEL } from "@/features/business-monetize/constants";

type PublicCampaign = {
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

export function SponsoredFeed({ limit = 3 }: { t?: ThemeColors; limit?: number }) {
  const [items, setItems] = useState<PublicCampaign[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/business-monetize/public?mode=campaigns&limit=${limit}`, { cache: "no-store" })
      .then((res) => res.json().catch(() => ({})))
      .then((json) => { if (!cancelled && json?.success) setItems((json.campaigns as PublicCampaign[]) ?? []); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, [limit]);

  if (items.length === 0) return null;

  return (
    <section aria-label="Sponsored" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <SLabel text="Sponsored" color={ACCENT} />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: ACCENT, fontFamily: "monospace" }}>AD</span>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
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
              {item.type === "activity" ? "ACTIVITY広告" : "MOMENT広告"} · {AD_SCOPE_LABEL[item.scope]}
              {item.scope === "local" && item.prefecture ? ` / ${item.prefecture}` : ""}
            </span>
          </div>
          <p style={{ margin: "10px 0 4px", fontSize: 15, fontWeight: 900, color: "#f0f0f5" }}>{item.creative.title || item.name}</p>
          {item.creative.description ? (
            <p style={{ margin: "0 0 8px", fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>{item.creative.description}</p>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            <Link href={`/u/${item.business.slug}`} style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
              {item.business.displayName || item.business.slug} · <span style={{ color: ACCENT }}>{item.business.plan}</span>
            </Link>
            {item.creative.ctaUrl && item.creative.ctaText ? (
              <Link
                href={item.creative.ctaUrl}
                target={item.creative.ctaUrl.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                style={{ padding: "8px 14px", borderRadius: 10, background: ACCENT, color: "#06201b", fontWeight: 800, fontSize: 11 }}
              >
                {item.creative.ctaText}
              </Link>
            ) : null}
          </div>
        </div>
      ))}
    </section>
  );
}
