"use client";

// Business Monetize Hub — Businessオーナー向け広告運用センター。
// ・Overview：Businessホーム（Identity / Get Started / Stats / Presence / Community）
// ・Plans：契約Planと配信範囲の視覚化、Square決済での契約
// ・Locations：多店舗管理（郵便番号→都道府県→住所検索→Map確認）
// ・Campaigns：Activity / Moment広告の作成（5ステップウィザード）と運用
//
// UIポリシー
//  - Information ≠ Interaction：情報カードはhoverさせず、操作可能な要素だけが反応する。
//  - 内部コード（local / region / half / activity 等）はUIに出さない。既存 Label / Meta を使う。
//  - 実在しない数字（インプレッション数・ユーザー数等）は捏造しない。データが無ければ「— / No data yet」。
//  - アクションは デフォルト→hover→active→disabled を統一し、focus-visible リングを持つ。
//  - reduced-motion を尊重。Motion は「操作へのフィードバック」と「情報の優先順位の提示」にのみ使う。
//
// 収益コアロジック（Plan→Scope強制・決済・配信）は変更しない。書き込みは全てAPI経由（service role）。

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import {
  SectionCard,
  SLabel,
  ViewHeader,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
} from "@/app/(app)/dashboard/components/ui";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { springSnap, fadeReduced } from "@/lib/motion/apple-springs";
import type { AdItem } from "@/lib/ads-shared";
import type {
  BusinessAccountRecord,
  BusinessLocationRecord,
  BusinessMonetizePlan,
  CampaignStatus,
  CampaignType,
  CampaignRecord,
  AdScope,
} from "@/features/business-monetize/types";
import {
  MONETIZE_PLANS,
  getMonetizePlan,
  getAllowedScopes,
  getAllowedCampaignTypes,
  REGION_BLOCKS,
  HALF_REGIONS,
  AD_SCOPE_LABEL,
  CAMPAIGN_TYPES,
  SCOPE_META,
  PLAN_LABEL,
  planHasSpotlight,
  planIsPremiumOrAbove,
  MONETIZE_TO_AD_SLOT_TIER,
  regionBlockForPrefecture,
  halfRegionForBlock,
} from "@/features/business-monetize/constants";
import { ALL_PREFECTURES, geocodeByAddress, type GeocodeSuggestion } from "@/features/place/geocode";
import { SponsoredAdCard, type PublicAd } from "./SponsoredFeed";

const ACCENT = "#00BFA5";
const TOUCH_MIN = 44;
const FONT_DISPLAY = "'Bebas Neue', 'Space Mono', sans-serif";

type Tab = "overview" | "plans" | "locations" | "campaigns";

const CAMPAIGN_STATUS_META: Record<CampaignStatus, { label: string; color: string }> = {
  draft: { label: "下書き", color: "rgba(255,255,255,0.5)" },
  active: { label: "配信中", color: "#3ddc97" },
  paused: { label: "一時停止", color: "#f2c14e" },
  ended: { label: "終了", color: "rgba(255,255,255,0.38)" },
};

const ACCOUNT_STATUS_META: Record<string, { label: string; color: string; live?: boolean }> = {
  free: { label: "未契約", color: "rgba(255,255,255,0.5)" },
  active: { label: "ACTIVE", color: "#3ddc97", live: true },
  inactive: { label: "利用不可", color: "#ff7a7a" },
};

/** Scopeの人間向け到達度ラベル（内部コードは出さない） */
const REACH_STEPS: { scope: AdScope; label: string; short: string }[] = [
  { scope: "local", label: "都道府県", short: "1都道府県" },
  { scope: "region", label: "地方ブロック", short: "関東など" },
  { scope: "half", label: "東日本 / 西日本", short: "広域" },
  { scope: "national", label: "全国", short: "制限なし" },
];

function fmtDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "numeric", day: "numeric" }).format(d);
}

function fmtDateShort(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
}

function getRegionLabel(block: string | null | undefined) {
  return REGION_BLOCKS.find((b) => b.id === block)?.label ?? "-";
}

function getHalfLabel(half: string | null | undefined) {
  return HALF_REGIONS.find((h) => h.id === half)?.label ?? "-";
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#f0f0f5",
  padding: "11px 12px",
  fontSize: 13,
  outline: "none",
  minHeight: TOUCH_MIN,
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "auto" };

/**
 * 全インタラクティブ要素のfocus-visibleリング（キーボード可視化）。
 * 情報カードそのもの（vc-info）はhover/activeを持たない。
 * .vc-interactive … 選択可能カード・操作可能アイテム（hoverは枠色の変化のみ、浮かせない）。
 */
const viewStyles = `
:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; border-radius: 10px; }
.vc-interactive { cursor: pointer; touch-action: manipulation; }
.vc-interactive:not(:disabled):hover { border-color: ${ACCENT}55 !important; }
.vc-interactive:not(:disabled):active { transform: translateY(1px); }
.vc-interactive:disabled { opacity: 0.45; cursor: not-allowed !important; }
.vc-scroll-x { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.vc-scroll-x::-webkit-scrollbar { display: none; }
@keyframes vc-spin { to { transform: rotate(360deg); } }
.vc-spinner { border-radius: 50%; animation: vc-spin 0.8s linear infinite; }
@keyframes vc-slide { from { transform: translateX(-100%); } to { transform: translateX(0); } }
.vc-progress-bar { animation: vc-slide 1.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .vc-interactive:not(:disabled):active { transform: none; }
  .vc-spinner { animation: none; }
  .vc-progress-bar { animation: none; }
}
`;

// ─────────────────────────────────────────────────────────────
// 小さなUI部品（このHub専用。ダッシュボード共通のButton/Card/Avatar等を再利用）
// ─────────────────────────────────────────────────────────────

/** テキスト＋ドットで識別するStatus表現（色だけに依存しない） */
function StatusPill({ label, color, live }: { label: string; color: string; live?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span
      role="status"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        minHeight: 24,
        padding: "3px 11px",
        borderRadius: 999,
        border: `1px solid ${color}44`,
        background: `${color}14`,
        color,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden style={{ position: "relative", display: "inline-flex", width: 7, height: 7 }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }} />
        {live ? (
          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, opacity: 0.55 }}>
            {!reduce ? (
              <motion.span
                style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }}
                animate={{ opacity: [0.7, 0.05], scale: [1, 2.2] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            ) : null}
          </span>
        ) : null}
      </span>
      {label}
    </span>
  );
}

/** 音声・写真に依存しない小さな章ラベル（Bebas） */
function Kick({ text, color = ACCENT }: { text: string; color?: string }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: FONT_DISPLAY,
        fontSize: 13,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color,
      }}
    >
      {text}
    </p>
  );
}

const numberSpring = { stiffness: 120, damping: 22, mass: 1.1 };

/** 数値のカウントアップ（reduced-motion無効時のみアニメーション） */
function CountUp({ value, color = "#f0f0f5", fontSize = 26 }: { value: number; color?: string; fontSize?: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const spring = useSpring(mv, numberSpring);
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString("en-US"));
  const first = useRef(true);

  useEffect(() => {
    if (reduce || first.current) {
      mv.jump(value);
      first.current = false;
      return;
    }
    mv.set(value);
  }, [value, reduce, mv]);

  return (
    <motion.span
      style={{
        fontSize,
        fontWeight: 800,
        color,
        lineHeight: 1,
        letterSpacing: "-0.01em",
        fontFamily: "'Space Mono', monospace",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {reduce ? value.toLocaleString("en-US") : display}
    </motion.span>
  );
}

/** Stats / Overview 用の数値タイル（情報表示のみ・hoverしない） */
function StatTile({ label, value, hint }: { label: string; value: number | null; hint?: string }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.025)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
        {label}
      </span>
      {value === null ? (
        <span style={{ fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,0.3)", lineHeight: 1 }}>—</span>
      ) : (
        <CountUp value={value} />
      )}
      {hint ? <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{hint}</span> : null}
    </div>
  );
}

/** 配信範囲の「広さ」を到達度バーで可視化（情報表示のみ） */
function ScopeReachBar({ scope, color = ACCENT }: { scope: AdScope; color?: string }) {
  const idx = REACH_STEPS.findIndex((s) => s.scope === scope);
  const active = idx >= 0 ? idx : 0;
  return (
    <div>
      <div aria-hidden style={{ display: "flex", gap: 4 }}>
        {REACH_STEPS.map((s, i) => (
          <span
            key={s.scope}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 999,
              background: i <= active ? color : "rgba(255,255,255,0.12)",
            }}
          />
        ))}
      </div>
      <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", gap: 6 }}>
        {REACH_STEPS.map((s) => (
          <span
            key={s.scope}
            style={{
              fontSize: 9,
              whiteSpace: "nowrap",
              color: s.scope === scope ? color : "rgba(255,255,255,0.4)",
              fontWeight: s.scope === scope ? 800 : 500,
            }}
          >
            {s.short}
          </span>
        ))}
      </div>
    </div>
  );
}

/** 配信範囲バッジ（scopeメタ ＋ 詳細の自然言語） */
function ScopeBadge({ scope, detail }: { scope: AdScope; detail?: string | null }) {
  const meta = SCOPE_META[scope];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: 999,
        border: `1px solid ${ACCENT}30`,
        background: `${ACCENT}0f`,
        color: "rgba(255,255,255,0.78)",
        fontSize: 9,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden>{meta.icon}</span>
      {meta.label}
      {detail ? ` / ${detail}` : ""}
    </span>
  );
}

function TypeBadge({ type }: { type: CampaignType }) {
  return (
    <span
      style={{
        padding: "3px 8px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.65)",
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
      }}
    >
      {type === "activity" ? "ACTIVITY" : "MOMENT"}
    </span>
  );
}

/** 実データ（オーナー + 店舗プレースホルダ）のみで構成するアバター群。+Nは実数。 */
function AvatarGroup({
  items,
  overflow,
}: {
  items: { id: string; name: string; src?: string | null; ring?: string }[];
  overflow?: number;
}) {
  if (items.length === 0) return null;
  const total = overflow !== undefined ? Math.max(items.length, overflow) : items.length;
  const rest = total - items.length;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex" }}>
        {items.map((it, i) => (
          <span key={it.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
            <Avatar name={it.name} src={it.src} size="sm" ring={it.ring ?? "Business"} />
          </span>
        ))}
      </div>
      {rest > 0 ? (
        <span
          aria-label={`他${rest}件`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 24,
            height: 24,
            padding: "0 7px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          +{rest}
        </span>
      ) : null}
    </div>
  );
}

/** Planから自然言語で「届く範囲」を組み立てる（内部コード不使用） */
function presenceScopeText(
  account: BusinessAccountRecord | null,
  planDef: ReturnType<typeof getMonetizePlan>,
): string {
  if (!account || !planDef) return "";
  const pref = account.primaryPrefecture;
  switch (planDef.scope) {
    case "local":
      return pref ? `${pref}のユーザーに届きます。` : "都道府県を設定すると配信範囲が決まります。";
    case "region": {
      const block = pref ? regionBlockForPrefecture(pref) : null;
      return `${block ? getRegionLabel(block) : "お近くの地域"}エリアのユーザーに届きます。`;
    }
    case "half": {
      const block = pref ? regionBlockForPrefecture(pref) : null;
      const half = block ? halfRegionForBlock(block) : null;
      return `${half ? getHalfLabel(half) : "東日本 または 西日本"}のユーザーに届きます。`;
    }
    case "national":
      return "全国のユーザーに届きます。";
  }
}

/** Campaignの配信範囲の詳細（自然言語） */
function campaignScopeDetail(c: CampaignRecord): string {
  if (c.scope === "local") return c.prefecture ?? "都道府県";
  if (c.scope === "region") return getRegionLabel(c.regionBlock);
  if (c.scope === "half") return getHalfLabel(c.half);
  return "全国";
}

type PreviewCreativeFields = {
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  ctaText: string;
  ctaUrl: string;
};

/** ウィザード入力 → 実配信カード（SponsoredAdCard）で使う PublicAd を組み立てる */
function buildPreviewAd({
  id,
  name,
  type,
  scope,
  prefecture,
  regionBlock,
  half,
  creative,
  account,
}: {
  id: string;
  name: string;
  type: CampaignType;
  scope: AdScope;
  prefecture: string;
  regionBlock: string;
  half: string;
  creative: PreviewCreativeFields;
  account: BusinessAccountRecord | null;
}): PublicAd {
  return {
    id,
    name,
    type,
    scope,
    prefecture: scope === "local" ? prefecture || null : null,
    regionBlock: scope === "region" ? (regionBlock || null) : null,
    half: scope === "half" ? (half || null) : null,
    creative: {
      title: creative.title || name,
      description: creative.description || null,
      imageUrl: creative.imageUrl || null,
      videoUrl: creative.videoUrl || null,
      ctaText: creative.ctaText || null,
      ctaUrl: creative.ctaUrl || null,
    },
    business: {
      slug: account?.slug ?? "business",
      displayName: account?.displayName ?? "あなたのBusiness",
      plan: PLAN_LABEL[account?.plan ?? "FREE"] ?? account?.plan ?? "FREE",
    },
  };
}

/** BusinessAdBanner の単一広告レイアウトを静的に再現するプレビュー（MAP配信時） */
function AdBannerPreview({ ad }: { ad: PublicAd }) {
  const href = ad.creative.ctaUrl && ad.creative.ctaText ? ad.creative.ctaUrl : `/u/${ad.business.slug}`;
  return (
    <div
      aria-label="Sponsored / Business（プレビュー）"
      style={{
        width: "100%",
        borderRadius: 14,
        border: `1px solid ${ACCENT}40`,
        background: `linear-gradient(145deg, ${ACCENT}14, rgba(255,255,255,0.03))`,
        overflow: "hidden",
      }}
    >
      <Link
        href={href}
        target={ad.creative.ctaUrl?.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "11px 13px",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              background: `${ACCENT}22`,
              border: `1px solid ${ACCENT}40`,
              color: ACCENT,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            SPONSORED
          </span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            BUSINESS
          </span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
            {ad.type === "activity" ? "ACTIVITY広告" : "MOMENT広告"} · {AD_SCOPE_LABEL[ad.scope]}
          </span>
        </div>
        {ad.creative.imageUrl ? (
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#000" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ad.creative.imageUrl} alt={ad.creative.title || ad.name} style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
          </div>
        ) : ad.creative.videoUrl ? (
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#000" }}>
            <video src={ad.creative.videoUrl} muted playsInline controls style={{ width: "100%", maxHeight: 200, display: "block" }} />
          </div>
        ) : null}
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
    </div>
  );
}

/** 住所→Geocoding候補（入力デバウンス・中断対応）。店舗登録（③住所）で共用。 */
function LocationGeocoder({
  address,
  onAddress,
  onPick,
}: {
  address: string;
  onAddress: (v: string) => void;
  onPick: (lat: number, lng: number, prefecture: string | null) => void;
}) {
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const trimmed = address.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    const t = window.setTimeout(() => {
      geocodeByAddress(trimmed, controller.signal)
        .then((s) => {
          setSuggestions(s);
          setLoading(false);
        })
        .catch((cause: unknown) => {
          if (cause instanceof DOMException && cause.name === "AbortError") return;
          setSuggestions([]);
          setLoading(false);
        });
    }, 450);
    return () => {
      window.clearTimeout(t);
      controller.abort();
    };
  }, [address]);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input
        value={address}
        onChange={(e) => onAddress(e.target.value)}
        style={inputStyle}
        placeholder="住所を入れて検索（例：東京都渋谷区…）"
        autoComplete="off"
        aria-label="店舗の住所を検索"
        aria-busy={loading}
      />
      {loading ? <Hint>住所を検索中...</Hint> : null}
      {suggestions.length > 0 ? (
        <div role="listbox" style={{ display: "grid", gap: 6 }}>
          {suggestions.map((s) => (
            <button
              key={`${s.latitude},${s.longitude},${s.name}`}
              type="button"
              role="option"
              aria-selected={false}
              className="vc-interactive"
              onClick={() => {
                onPick(s.latitude, s.longitude, s.prefecture);
                setSuggestions([]);
              }}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${ACCENT}35`,
                background: `${ACCENT}0f`,
                color: "#f0f0f5",
                fontSize: 12,
                minHeight: TOUCH_MIN,
              }}
            >
              <div style={{ fontWeight: 700 }}>{s.name}</div>
              <div style={{ marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{s.address}</div>
            </button>
          ))}
        </div>
      ) : null}
      {!loading && suggestions.length === 0 && address.trim().length >= 3 ? (
        <Hint>候補が見つかりません。別の住所で試してください。</Hint>
      ) : null}
    </div>
  );
}

/** 静的なMap / StreetViewプレビュー（Mapbox Static Vector）。緯度経度はUIに出さない。 */
function StaticMapPreview({ lat, lng, height = 120 }: { lat: number; lng: number; height?: number }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const src = token
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+00BFA5(${lng},${lat})/${lng},${lat},15.5/640x${Math.round(height * 2)}@2x?access_token=${encodeURIComponent(token)}`
    : null;
  if (!src) return null;
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#000" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="店舗の位置の地図プレビュー" style={{ width: "100%", height, objectFit: "cover", display: "block" }} />
    </div>
  );
}

/** 画像・動画アップロード（前 / 中 / 完了 / エラー の状態を持つ） */
function MediaUploader({
  kind,
  value,
  onChange,
}: {
  kind: "image" | "video";
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const isImage = kind === "image";
  const accept = isImage ? "image/*" : "video/*";
  const limitText = isImage ? "JPEG / PNG / WebP / GIF / AVIF ・ 5MBまで" : "MP4 / WebM / MOV ・ 20MBまで";

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("kind", kind);
      fd.append("file", file);
      const res = await fetch("/api/business-monetize/campaigns/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success || typeof json.url !== "string") {
        throw new Error(typeof json.error === "string" ? json.error : "アップロードに失敗しました");
      }
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    void upload(file);
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div
        role="button"
        tabIndex={0}
        aria-label={isImage ? "画像をアップロード" : "動画をアップロード"}
        aria-busy={uploading}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFile(e.dataTransfer.files?.[0]);
        }}
        style={{
          border: `1.5px dashed ${dragging ? ACCENT : "rgba(255,255,255,0.25)"}`,
          borderRadius: 16,
          padding: 18,
          textAlign: "center",
          background: dragging ? `${ACCENT}10` : "rgba(255,255,255,0.02)",
          color: "rgba(255,255,255,0.6)",
          fontSize: 12,
          cursor: "pointer",
          minHeight: 112,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {uploading ? (
          <>
            <span aria-hidden style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: ACCENT }} className="vc-spinner" />
            <span style={{ color: ACCENT, fontWeight: 700 }}>{isImage ? "画像をアップロード中..." : "動画をアップロード中..."}</span>
          </>
        ) : value ? (
          <span style={{ color: "#3ddc97", fontWeight: 700 }}>✓ {isImage ? "画像" : "動画"}アップロード済み（クリックで変更）</span>
        ) : (
          <>
            <div style={{ fontWeight: 700, color: "#f0f0f5" }}>{isImage ? "画像を選択" : "動画を選択"}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{limitText}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>クリックまたはドラッグ＆ドロップ</div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          disabled={uploading}
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {value ? (
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#000" }}>
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="クリエイティブ画像プレビュー" style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
            ) : (
              <video src={value} controls muted playsInline style={{ width: "100%", maxHeight: 200, display: "block" }} />
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onChange("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            style={{
              fontSize: 11,
              color: "#ff9a9a",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              padding: "4px 0",
              minHeight: 28,
            }}
          >
            削除
          </button>
        </div>
      ) : null}

      {error ? <Hint color="#ff9a9a">エラー: {error}</Hint> : null}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        padding: "12px 14px",
        minHeight: TOUCH_MIN,
        borderRadius: 14,
        border: `1px solid ${active ? `${ACCENT}50` : "rgba(255,255,255,0.1)"}`,
        background: active ? `${ACCENT}16` : "rgba(255,255,255,0.025)",
        color: active ? ACCENT : "rgba(255,255,255,0.6)",
        fontWeight: active ? 800 : 600,
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
      <span>{label}</span>
      {children}
      {hint ? <Hint>{hint}</Hint> : null}
    </label>
  );
}

function Hint({ children, color = "rgba(255,255,255,0.4)" }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ display: "block", fontSize: 10, lineHeight: 1.7, color, minHeight: 14 }}>{children}</span>
  );
}

function InfoChip({ children, color = ACCENT }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${color}30`,
        background: `${color}0d`,
        color,
        fontSize: 10,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden>●</span>
      {children}
    </span>
  );
}

/** ウィザード完了ステップ間の「カンジン」区切り */
function WizardStepper({
  current,
  onJump,
}: {
  current: WizardStep;
  onJump: (s: WizardStep) => void;
}) {
  const currentIdx = WIZARD_STEPS.findIndex((s) => s.id === current);
  return (
    <div className="vc-scroll-x" style={{ display: "flex", gap: 6 }} aria-label="作成ステップ">
      {WIZARD_STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={!done}
            onClick={() => done && onJump(s.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 11px",
              minHeight: 40,
              borderRadius: 999,
              border: `1px solid ${active ? `${ACCENT}55` : done ? `${ACCENT}30` : "rgba(255,255,255,0.1)"}`,
              background: active ? `${ACCENT}16` : done ? `${ACCENT}08` : "rgba(255,255,255,0.02)",
              color: active ? ACCENT : done ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)",
              fontSize: 10,
              fontWeight: active || done ? 800 : 500,
              whiteSpace: "nowrap",
              cursor: done ? "pointer" : "not-allowed",
            }}
          >
            <span style={{ opacity: 0.7 }}>{s.num}</span>
            <span>{s.title}</span>
            {done ? <span aria-hidden style={{ color: ACCENT }}>✓</span> : null}
          </button>
        );
      })}
    </div>
  );
}

type WizardStep = "type" | "creative" | "location" | "scope" | "preview";

const WIZARD_STEPS: { id: WizardStep; num: string; title: string; desc: string }[] = [
  { id: "type", num: "01", title: "TYPE", desc: "Activity / Moment から広告の形式を選びます。" },
  { id: "creative", num: "02", title: "CREATIVE", desc: "広告の画像・動画とメッセージを設定します。" },
  { id: "location", num: "03", title: "LOCATION", desc: "どの店舗向けに配信するか選びます。" },
  { id: "scope", num: "04", title: "AREA", desc: "届けたい地域の範囲を選びます。" },
  { id: "preview", num: "05", title: "REVIEW", desc: "実際の表示を確認して下書き作成します。" },
];

/** 情報カードの入場シーケンス用ラッパー（reduced-motion時はフェードなし即表示） */
function Stag({ index, children }: { index: number; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? fadeReduced : { ...springSnap, delay: index * 0.06 }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// メイン：Tab + データ取得
// ─────────────────────────────────────────────────────────────

export function BusinessMonetizeHubView({
  profile,
  t,
  roleColor,
  setView,
  ads,
}: {
  profile: ProfileData;
  t: ThemeColors;
  roleColor: string;
  setView: (v: DashboardView) => void;
  ads: AdItem[];
}) {
  void roleColor;
  void ads;
  const [tab, setTab] = useState<Tab>("overview");

  const [account, setAccount] = useState<BusinessAccountRecord | null>(null);
  const [locations, setLocations] = useState<BusinessLocationRecord[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [adSlot, setAdSlot] = useState<{ seats: number; soldCount: number; remaining: number; soldOut: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [accRes, locRes, campRes] = await Promise.all([
        fetch("/api/business-monetize/account", { cache: "no-store" }),
        fetch("/api/business-monetize/locations", { cache: "no-store" }),
        fetch("/api/business-monetize/campaigns", { cache: "no-store" }),
      ]);
      const acc = await accRes.json().catch(() => ({}));
      const loc = await locRes.json().catch(() => ({}));
      const camp = await campRes.json().catch(() => ({}));
      if (!accRes.ok || !acc.success) throw new Error(acc.error ?? "アカウントの取得に失敗しました");
      if (!locRes.ok || !loc.success) throw new Error(loc.error ?? "店舗の取得に失敗しました");
      if (!campRes.ok || !camp.success) throw new Error(camp.error ?? "Campaignの取得に失敗しました");
      setAccount(acc.account ?? null);
      setAdSlot(acc.adSlot ?? null);
      setLocations(loc.locations ?? []);
      setCampaigns(camp.campaigns ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const planDef = useMemo(() => (account ? getMonetizePlan(account.plan) : null), [account]);
  const allowedScopes = useMemo(() => (account ? getAllowedScopes(account.plan) : []), [account]);
  const allowedTypes = useMemo(() => (account ? Array.from(getAllowedCampaignTypes(account.plan)) : []), [account]);
  const activeCampaigns = useMemo(() => campaigns.filter((c) => c.status === "active").length, [campaigns]);
  const [selectedPlan, setSelectedPlan] = useState<BusinessMonetizePlan | null>(null);

  const submitError = (message: string) => setError(message);

  const reduce = useReducedMotion();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{viewStyles}</style>
      <ViewHeader title="Business Monetize" sub="広告キャンペーン・店舗・プランの運用管理" onBack={() => setView("home")} t={t} roleColor={ACCENT} />

      {error ? (
        <div
          role="alert"
          style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(255,80,80,0.35)", background: "rgba(255,80,80,0.10)", color: "#ffb6b6", fontSize: 12, lineHeight: 1.7 }}
        >
          {error}
        </div>
      ) : null}

      <SectionCard t={t} accentColor={ACCENT}>
        <div role="tablist" aria-label="Business Hub" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>概要</TabButton>
          <TabButton active={tab === "plans"} onClick={() => setTab("plans")}>プラン</TabButton>
          <TabButton active={tab === "locations"} onClick={() => setTab("locations")}>店舗</TabButton>
          <TabButton active={tab === "campaigns"} onClick={() => setTab("campaigns")}>キャンペーン</TabButton>
        </div>
      </SectionCard>

      {loading && !account ? (
        <SectionCard t={t} accentColor={ACCENT}>
          <div role="status" style={{ padding: 28, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            読み込み中...
          </div>
        </SectionCard>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={reduce ? fadeReduced : springSnap}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {tab === "overview" ? (
              <OverviewSection
                profile={profile}
                account={account}
                planDef={planDef}
                adSlot={adSlot}
                activeCampaigns={activeCampaigns}
                locations={locations}
                campaigns={campaigns}
                t={t}
                onUpgrade={() => setTab("plans")}
                onGoLocations={() => setTab("locations")}
                onGoCampaigns={() => setTab("campaigns")}
                onSubmitError={submitError}
              />
            ) : null}
            {tab === "plans" ? (
              <PlansSection account={account} adSlot={adSlot} selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} t={t} onSubmitError={submitError} />
            ) : null}
            {tab === "locations" ? (
              <LocationsSection locations={locations} t={t} onChanged={() => void refresh()} onSubmitError={submitError} />
            ) : null}
            {tab === "campaigns" ? (
              <CampaignsSection
                account={account}
                campaigns={campaigns}
                locations={locations}
                allowedScopes={allowedScopes}
                allowedTypes={allowedTypes}
                t={t}
                onGoPlans={() => setTab("plans")}
                onChanged={() => void refresh()}
                onSubmitError={submitError}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Overview：Business ホーム
// ─────────────────────────────────────────────────────────────

function OverviewSection({
  profile,
  account,
  planDef,
  adSlot,
  activeCampaigns,
  locations,
  campaigns,
  t,
  onUpgrade,
  onGoLocations,
  onGoCampaigns,
  onSubmitError,
}: {
  profile: ProfileData;
  account: BusinessAccountRecord | null;
  planDef: ReturnType<typeof getMonetizePlan>;
  adSlot: { seats: number; soldCount: number; remaining: number; soldOut: boolean } | null;
  activeCampaigns: number;
  locations: BusinessLocationRecord[];
  campaigns: CampaignRecord[];
  t: ThemeColors;
  onUpgrade: () => void;
  onGoLocations: () => void;
  onGoCampaigns: () => void;
  onSubmitError: (m: string) => void;
}) {
  void onSubmitError;
  const isFree = account?.plan === "FREE";
  const planLabel = account ? PLAN_LABEL[account.plan] ?? account.plan : "未契約";
  const status = account?.status ?? "free";
  const statusMeta = ACCOUNT_STATUS_META[status] ?? ACCOUNT_STATUS_META.free;
  const presence = presenceScopeText(account, planDef);
  const ownerName = account?.displayName ?? profile.displayName;
  const ownerSrc = profile.avatarUrl ?? profile.profileImageUrl;
  const paid = account !== null && !isFree;

  const steps = [
    { n: "01", title: "店舗を登録", desc: "Map Pin と広告配信の基準になる実在店舗を追加します。", done: locations.length > 0, action: onGoLocations, cta: "店舗を追加" },
    { n: "02", title: "プランを契約", desc: "配信範囲と広告機能が解放されます。", done: paid, action: onUpgrade, cta: "プランを見る" },
    { n: "03", title: "キャンペーンを作成", desc: "Activity / Moment 広告を作成・公開します。", done: campaigns.length > 0, action: onGoCampaigns, cta: "キャンペーン作成" },
  ];
  const allDone = steps.every((s) => s.done);

  const groupItems = [
    { id: "owner", name: ownerName, src: ownerSrc, ring: "Business" },
    ...locations.slice(0, 3).map((l) => ({ id: l.id, name: l.name, src: null as string | null, ring: "#8a8a9a" })),
  ];

  return (
    <>
      <Stag index={0}>
        <SectionCard t={t} accentColor={ACCENT}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                <Avatar name={ownerName} src={ownerSrc} size="xl" ring="Business" />
                <div style={{ minWidth: 0 }}>
                  <Kick text="Business Home" />
                  <h2 style={{ margin: "6px 0 4px", fontSize: 26, fontWeight: 900, color: "#f0f0f5", letterSpacing: "-0.01em" }}>{ownerName}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <StatusPill label={statusMeta.label} color={statusMeta.color} live={statusMeta.live} />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>
                      {planLabel} ・ {planDef?.priceLabel ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                {isFree ? (
                  <PrimaryButton onClick={onUpgrade}>プランを見る</PrimaryButton>
                ) : (
                  <PrimaryButton onClick={onGoCampaigns}>キャンペーン作成</PrimaryButton>
                )}
              </div>
            </div>

            {planDef ? (
              <div style={{ marginTop: 4, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                {planDef.benefits.map((b) => (
                  <div key={b} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ color: ACCENT, fontWeight: 900 }}>✓</span>
                    {b}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </SectionCard>
      </Stag>

      <Stag index={1}>
        <SectionCard t={t} accentColor={ACCENT}>
          <Kick text={allDone ? "All Set" : "Get Started"} />
          <p style={{ margin: "6px 0 14px", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
            {allDone
              ? "すべての設定が完了しています。あとはキャンペーンの効果を確認するだけです。"
              : "最初にやる3ステップです。完了した項目からチェックが付きます。"}
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {steps.map((s) => (
              <div
                key={s.n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: `1px solid ${s.done ? "#3ddc9744" : "rgba(255,255,255,0.1)"}`,
                  background: s.done ? "rgba(61,220,151,0.05)" : "rgba(255,255,255,0.02)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    border: `1px solid ${s.done ? "#3ddc9755" : "rgba(255,255,255,0.16)"}`,
                    background: s.done ? "rgba(61,220,151,0.15)" : "rgba(255,255,255,0.04)",
                    color: s.done ? "#3ddc97" : "rgba(255,255,255,0.6)",
                    fontWeight: 900,
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {s.done ? "✓" : s.n}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f0f0f5" }}>{s.title}</div>
                  <div style={{ marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
                {!s.done ? (
                  <SecondaryButton style={{ whiteSpace: "nowrap", minHeight: 40 }} onClick={s.action}>
                    {s.cta}
                  </SecondaryButton>
                ) : null}
              </div>
            ))}
          </div>
        </SectionCard>
      </Stag>

      <Stag index={2}>
        <SectionCard t={t} accentColor={ACCENT}>
          <Kick text="Stats" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginTop: 12 }}>
            <StatTile label="店舗" value={locations.length} />
            <StatTile label="キャンペーン" value={campaigns.length} />
            <StatTile label="配信中" value={activeCampaigns} />
            <StatTile
              label="配信枠"
              value={adSlot && !isFree && account?.plan !== "ENTERPRISE" ? adSlot.remaining : null}
              hint={
                adSlot && !isFree && account?.plan !== "ENTERPRISE"
                  ? `あなたのプランの広告枠（全体在庫: 残り${adSlot.remaining}/${adSlot.seats}枠）`
                  : isFree || account?.plan === "ENTERPRISE"
                    ? "—"
                    : "枠情報の取得に失敗しました"
              }
            />
          </div>
        </SectionCard>
      </Stag>

      <Stag index={3}>
        <SectionCard t={t} accentColor={ACCENT}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <Kick text="Your Presence" />
            <InfoChip>配信範囲</InfoChip>
          </div>
          <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
            <ScopeReachBar scope={planDef?.scope ?? "local"} />
            <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>
              {presence || "プランを契約すると配信範囲が決まります。"}
            </p>
            {planHasSpotlight(account?.plan ?? null) ? (
              <InfoChip>優先表示の対象です</InfoChip>
            ) : null}
            {isFree ? (
              <Hint>有料プランで広告配信と優先表示が有効になります。</Hint>
            ) : null}
          </div>
        </SectionCard>
      </Stag>

      <Stag index={4}>
        <SectionCard t={t} accentColor={ACCENT}>
          <Kick text="Community & Reach" />
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <AvatarGroup items={groupItems} overflow={locations.length + 1} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#f0f0f5" }}>
                  あなたの組織（オーナー{locations.length > 0 ? ` + 登録店舗 ${locations.length}件` : ""}）
                </div>
                <div style={{ marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>実在組織のメンバーと店舗</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,0.3)", lineHeight: 1 }}>—</div>
              <div style={{ marginTop: 4, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>リーチ（集計機能の提供後）</div>
            </div>
          </div>
        </SectionCard>
      </Stag>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Plans
// ─────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  current,
  selected,
  onSelect,
}: {
  plan: (typeof MONETIZE_PLANS)[number];
  current: boolean;
  selected: boolean;
  onSelect: (p: BusinessMonetizePlan) => void;
}) {
  const meta = SCOPE_META[plan.scope];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className="vc-interactive"
      onClick={() => onSelect(plan.id)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 18,
        borderRadius: 18,
        border: `1px solid ${selected ? `${ACCENT}66` : current ? `${ACCENT}44` : "rgba(255,255,255,0.1)"}`,
        background: selected || current ? `linear-gradient(145deg, ${ACCENT}1c, rgba(255,255,255,0.02))` : "rgba(255,255,255,0.025)",
        color: "#f0f0f5",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 900, color: plan.id === "ENTERPRISE" ? "#fff" : ACCENT }}>
          {PLAN_LABEL[plan.id] ?? plan.id}
        </span>
        {current ? (
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 999,
              background: `${ACCENT}22`,
              border: `1px solid ${ACCENT}40`,
              color: ACCENT,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            契約中
          </span>
        ) : null}
      </div>
      <div style={{ fontSize: 18, fontWeight: 900 }}>{plan.priceLabel}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
        配信範囲: {plan.selectionUnit}
      </div>
      <div style={{ marginTop: 2 }}>
        <ScopeReachBar scope={plan.scope} color={selected || current ? ACCENT : "rgba(255,255,255,0.55)"} />
        <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
          <span aria-hidden>{meta.icon}</span> {meta.description}
        </div>
      </div>
      <ul style={{ margin: 0, padding: "0 0 0 16px", display: "grid", gap: 4 }}>
        {plan.benefits.map((b) => (
          <li key={b} style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
            {b}
          </li>
        ))}
      </ul>
    </button>
  );
}

function PlansSection({
  account,
  adSlot,
  selectedPlan,
  onSelectPlan,
  t,
  onSubmitError,
}: {
  account: BusinessAccountRecord | null;
  adSlot: { seats: number; soldCount: number; remaining: number; soldOut: boolean } | null;
  selectedPlan: BusinessMonetizePlan | null;
  onSelectPlan: (p: BusinessMonetizePlan) => void;
  t: ThemeColors;
  onSubmitError: (m: string) => void;
}) {
  const currentPlan = account?.plan ?? "FREE";
  const [busy, setBusy] = useState(false);

  const handlePick = (plan: BusinessMonetizePlan) => {
    onSelectPlan(plan);
    if (plan === currentPlan || plan === "FREE") return;
    onSubmitError("");
    if (plan === "ENTERPRISE") {
      onSubmitError("ENTERPRISEは個別契約です。営業担当者までお問い合わせください。");
    }
  };

  const startCheckout = async () => {
    if (!selectedPlan || busy) return;
    if (selectedPlan === "FREE") return;
    if (selectedPlan === currentPlan) return;
    if (selectedPlan === "ENTERPRISE") {
      onSubmitError("ENTERPRISEは個別契約です。営業担当者までお問い合わせください。");
      return;
    }
    const legacyPlanId = MONETIZE_TO_AD_SLOT_TIER[selectedPlan];
    if (!legacyPlanId) {
      onSubmitError("このプランは現在オンライン契約に対応していません。営業担当者までお問い合わせください。");
      return;
    }
    setBusy(true);
    onSubmitError("");
    try {
      const res = await fetch("/api/business-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: legacyPlanId,
          ...(selectedPlan === "LOCAL" && account?.primaryPrefecture
            ? { prefecture: account.primaryPrefecture }
            : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        squareUrl?: string;
        error?: string;
      };
      if (res.status === 401) {
        onSubmitError("セッションが切れています。ログインし直してください。");
        return;
      }
      if (!res.ok || !data.success) {
        onSubmitError(data.error ?? "決済の開始に失敗しました。");
        return;
      }
      if (!data.squareUrl) {
        onSubmitError("決済リンクの取得に失敗しました。しばらくしてから再試行してください。");
        return;
      }
      window.location.href = data.squareUrl;
    } catch {
      onSubmitError("通信エラーが発生しました。通信環境を確認して再試行してください。");
    } finally {
      setBusy(false);
    }
  };

  const selectedDef = selectedPlan ? getMonetizePlan(selectedPlan) : null;
  const selectedIsCurrent = selectedPlan === currentPlan;

  return (
    <>
      <Stag index={0}>
        <SectionCard t={t} accentColor={ACCENT}>
          <Kick text="Plans" />
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
            プランで配信範囲と広告機能が解放されます。契約はSquare決済で行います。プランを選んで内容を確認してください。
          </p>
        </SectionCard>
      </Stag>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }} role="radiogroup" aria-label="プラン選択">
        {MONETIZE_PLANS.map((p) => (
          <PlanCard key={p.id} plan={p} current={p.id === currentPlan} selected={p.id === selectedPlan} onSelect={handlePick} />
        ))}
      </div>

      {selectedPlan ? (
        <Stag index={1}>
          <SectionCard t={t} accentColor={ACCENT}>
            <Kick text="Selected Plan" />
            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#f0f0f5" }}>{PLAN_LABEL[selectedPlan] ?? selectedPlan}</div>
                <div style={{ marginTop: 2, fontSize: 13, fontWeight: 700, color: ACCENT }}>{selectedDef?.priceLabel}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", display: "grid", gap: 12 }}>
                <ScopeReachBar scope={selectedDef?.scope ?? "local"} />
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.9 }}>
                  配信範囲は <b style={{ color: ACCENT }}>{AD_SCOPE_LABEL[selectedDef?.scope ?? "local"]}</b>
                  {selectedDef && selectedDef.scope === "local" && selectedPlan === "LOCAL" ? (
                    account?.primaryPrefecture ? `（${account.primaryPrefecture}）` : "（都道府県は契約後に設定）"
                  ) : null}
                  です。
                  {planHasSpotlight(selectedPlan) ? " Spotlight / 優先表示の対象です。" : ""}
                  {planIsPremiumOrAbove(selectedPlan) ? " 大型メディア・全広告機能が使えます。" : ""}
                </div>
                {selectedIsCurrent && selectedPlan !== "FREE" ? (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
                    現在のプランの配信枠（全体在庫）:{" "}
                    {adSlot ? (
                      <b style={{ color: ACCENT }}>残り {adSlot.remaining} / {adSlot.seats} 枠{adSlot.soldOut ? "（本日完売）" : ""}</b>
                    ) : (
                      "取得できませんでした"
                    )}
                  </div>
                ) : null}
              </div>
              {selectedPlan !== "FREE" && !selectedIsCurrent ? (
                <div>
                  {selectedPlan === "ENTERPRISE" ? (
                    <DangerButton onClick={() => onSubmitError("ENTERPRISEは個別契約です。営業担当者までお問い合わせください。")}>
                      ENTERPRISEへのお問い合わせ
                    </DangerButton>
                  ) : (
                    <PrimaryButton onClick={() => void startCheckout()} disabled={busy}>
                      {busy ? "決済準備中..." : `Square決済で契約する（${selectedDef?.priceLabel ?? ""}）`}
                    </PrimaryButton>
                  )}
                </div>
              ) : null}
              {selectedIsCurrent ? (
                <Hint color="#3ddc97">現在のプランです。変更は上記の契約フローで行えます。</Hint>
              ) : null}
              {selectedPlan === "FREE" ? (
                <Hint>無料プランでは広告配信ができません。有料プランへの契約で解放されます。</Hint>
              ) : null}
            </div>
          </SectionCard>
        </Stag>
      ) : null}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Locations
// ─────────────────────────────────────────────────────────────

const emptyLocationForm = {
  name: "",
  prefecture: "",
  address: "",
  hours: "",
  phone: "",
  website: "",
};

function LocationsSection({
  locations,
  t,
  onChanged,
  onSubmitError,
}: {
  locations: BusinessLocationRecord[];
  t: ThemeColors;
  onChanged: () => void;
  onSubmitError: (m: string) => void;
}) {
  const { show } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyLocationForm);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [postcode, setPostcode] = useState("");
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  const startEdit = (loc: BusinessLocationRecord) => {
    setEditingId(loc.id);
    setForm({
      name: loc.name,
      prefecture: loc.prefecture,
      address: loc.address ?? "",
      hours: loc.hours ?? "",
      phone: loc.phone ?? "",
      website: loc.website ?? "",
    });
    setSearchAddress(loc.address ?? "");
    setCoords({ lat: loc.latitude, lng: loc.longitude });
    setPostcode("");
    setZipError(null);
    setShowForm(true);
  };

  const reset = () => {
    setForm(emptyLocationForm);
    setEditingId(null);
    setSearchAddress("");
    setCoords(null);
    setPostcode("");
    setZipError(null);
    setShowForm(false);
  };

  const pick = (lat: number, lng: number, prefecture: string | null) => {
    setCoords({ lat, lng });
    if (prefecture) setForm((f) => ({ ...f, prefecture }));
  };

  const searchZipcode = async () => {
    const digits = postcode.replace(/\D/g, "");
    if (digits.length !== 7) {
      setZipError("郵便番号は7桁（例: 2200000）で入力してください");
      return;
    }
    setZipLoading(true);
    setZipError(null);
    try {
      const res = await fetch(`/api/business-monetize/zipcode?zipcode=${digits}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(typeof json.error === "string" ? json.error : "住所の検索に失敗しました");
      }
      const m = (json as { match?: { prefecture: string | null; city: string | null; town: string | null } }).match;
      if (m && (m.prefecture || m.city)) {
        const cityPart = [m.city, m.town].filter(Boolean).join("");
        setForm((f) => ({
          ...f,
          prefecture: m.prefecture || f.prefecture,
          address: cityPart ? (f.address && !f.address.includes(cityPart) ? `${cityPart}${f.address.slice(0, 40)}` : cityPart) : f.address,
        }));
      }
    } catch (e) {
      setZipError(e instanceof Error ? e.message : "住所の検索に失敗しました");
    } finally {
      setZipLoading(false);
    }
  };

  const submit = async () => {
    if (!coords) return;
    setSaving(true);
    onSubmitError("");
    try {
      const payload = {
        name: form.name,
        prefecture: form.prefecture,
        address: form.address || null,
        latitude: coords.lat,
        longitude: coords.lng,
        hours: form.hours || null,
        phone: form.phone || null,
        website: form.website || null,
      };
      const endpoint = editingId ? `/api/business-monetize/locations/${editingId}` : "/api/business-monetize/locations";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error ?? "店舗の保存に失敗しました");
      reset();
      onChanged();
      show({ title: editingId ? "店舗を更新しました" : "店舗を登録しました", tone: "success" });
    } catch (err) {
      onSubmitError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("この店舗を削除しますか？")) return;
    onSubmitError("");
    try {
      const res = await fetch(`/api/business-monetize/locations/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error ?? "店舗の削除に失敗しました");
      onChanged();
      show({ title: "店舗を削除しました", tone: "success" });
    } catch (err) {
      onSubmitError(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  return (
    <>
      <Stag index={0}>
        <SectionCard t={t} accentColor={ACCENT}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <Kick text="Locations" />
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
                実在店舗を登録するとMap Pinと広告の基準になります。住所検索で正確な位置を確認できます。
              </p>
            </div>
            <SecondaryButton
              onClick={() => {
                if (showForm) reset();
                else {
                  setForm(emptyLocationForm);
                  setEditingId(null);
                  setCoords(null);
                  setSearchAddress("");
                  setPostcode("");
                  setZipError(null);
                  setShowForm(true);
                }
              }}
            >
              {showForm ? "閉じる" : "店舗を追加"}
            </SecondaryButton>
          </div>
        </SectionCard>
      </Stag>

      {showForm ? (
        <Stag index={1}>
          <SectionCard t={t} accentColor={ACCENT}>
            <Kick text={editingId ? "Edit Location" : "New Location"} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 12 }}>
              <Field label="ステップ1 郵便番号">
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={postcode}
                    onChange={(e) => {
                      setPostcode(e.target.value);
                      setZipError(null);
                    }}
                    style={inputStyle}
                    placeholder="例: 2200000（7桁）"
                    inputMode="numeric"
                    aria-label="郵便番号"
                  />
                  <SecondaryButton onClick={() => void searchZipcode()} disabled={zipLoading} style={{ whiteSpace: "nowrap" }}>
                    {zipLoading ? "検索中..." : "住所を検索"}
                  </SecondaryButton>
                </div>
                {zipError ? <Hint color="#ff9a9a">{zipError}</Hint> : null}
                <Hint>郵便番号から都道府県・市区町村を自動入力します。住所の詳細は下の検索で補正します。</Hint>
              </Field>

              <Field label="ステップ2 都道府県">
                <select
                  value={form.prefecture}
                  onChange={(e) => setForm({ ...form, prefecture: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">選択してください</option>
                  {ALL_PREFECTURES.map((p) => (
                    <option key={p} value={p} style={{ color: "#111" }}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="ステップ3 住所（住所検索で位置を確定）">
                <LocationGeocoder
                  address={searchAddress}
                  onAddress={(v) => {
                    setSearchAddress(v);
                    setForm((f) => ({ ...f, address: v }));
                  }}
                  onPick={pick}
                />
                {coords ? (
                  <Hint color="#3ddc97">✓ 位置を確定しました（地図プレビューで確認できます）</Hint>
                ) : (
                  <Hint>住所を入力して候補を選ぶと、正確な位置が確定します。</Hint>
                )}
              </Field>

              <Field label="ステップ4 建物名・店舗名">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  placeholder="例: Vizion 神奈川店 1F"
                />
              </Field>

              {coords ? (
                <Field label="ステップ5 地図で確認">
                  <StaticMapPreview lat={coords.lat} lng={coords.lng} />
                  <Hint>登録後、実在店舗が地図上のPinとして表示されます。</Hint>
                </Field>
              ) : null}

              <div>
                <button
                  type="button"
                  onClick={() => setShowDetail((v) => !v)}
                  aria-expanded={showDetail}
                  style={{
                    textAlign: "left",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.5)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 0",
                    minHeight: TOUCH_MIN,
                  }}
                >
                  {showDetail ? "△ 閉じる" : "▽ 詳細情報（営業時間・電話・Web）を追加"}
                </button>
              </div>

              {showDetail ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <Field label="営業時間">
                    <input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} style={inputStyle} placeholder="例: 平日 10:00–19:00" />
                  </Field>
                  <Field label="電話番号">
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="例: 045-000-0000" inputMode="tel" />
                  </Field>
                  <Field label="Webサイト">
                    <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} style={inputStyle} placeholder="https://..." inputMode="url" />
                  </Field>
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                <PrimaryButton onClick={() => void submit()} disabled={saving || !form.name.trim() || !form.prefecture.trim() || !coords}>
                  {saving ? "保存中..." : editingId ? "更新" : "登録"}
                </PrimaryButton>
                <SecondaryButton onClick={reset}>キャンセル</SecondaryButton>
              </div>
            </div>
          </SectionCard>
        </Stag>
      ) : null}

      <Stag index={2}>
        <SectionCard t={t} accentColor={ACCENT}>
          <div style={{ display: "grid", gap: 10 }}>
            {locations.length === 0 ? (
              <EmptyState
                icon="🏬"
                title="まだ店舗がありません"
                description="実在店舗を登録すると、Map Pinと広告配信の基準になります。「店舗を追加」から始めましょう。"
                action={<PrimaryButton onClick={() => { setForm(emptyLocationForm); setEditingId(null); setCoords(null); setSearchAddress(""); setPostcode(""); setZipError(null); setShowForm(true); }}>店舗を追加</PrimaryButton>}
              />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.025)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {loc.latitude && loc.longitude ? (
                      <StaticMapPreview lat={loc.latitude} lng={loc.longitude} height={88} />
                    ) : null}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#f0f0f5" }}>{loc.name}</div>
                      <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                        {loc.prefecture} ・ {loc.address || "住所未設定"}
                      </div>
                      {(loc.hours || loc.phone || loc.website) ? (
                        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {loc.hours ? <InfoChip color="rgba(255,255,255,0.55)">🕐 {loc.hours}</InfoChip> : null}
                          {loc.phone ? <InfoChip color="rgba(255,255,255,0.55)">☎ {loc.phone}</InfoChip> : null}
                          {loc.website ? <InfoChip color="rgba(255,255,255,0.55)">🌐 {loc.website.replace(/^https?:\/\//, "").slice(0, 24)}</InfoChip> : null}
                        </div>
                      ) : null}
                      <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>登録日: {fmtDate(loc.createdAt)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                      <SecondaryButton style={{ flex: 1, minHeight: 40 }} onClick={() => startEdit(loc)}>編集</SecondaryButton>
                      <DangerButton style={{ flex: 1, minHeight: 40 }} onClick={() => void remove(loc.id)}>削除</DangerButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </Stag>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Campaigns
// ─────────────────────────────────────────────────────────────

function CampaignsSection({
  account,
  campaigns,
  locations,
  allowedScopes,
  allowedTypes,
  t,
  onGoPlans,
  onChanged,
  onSubmitError,
}: {
  account: BusinessAccountRecord | null;
  campaigns: CampaignRecord[];
  locations: BusinessLocationRecord[];
  allowedScopes: AdScope[];
  allowedTypes: CampaignType[];
  t: ThemeColors;
  onGoPlans: () => void;
  onChanged: () => void;
  onSubmitError: (m: string) => void;
}) {
  const [showWizard, setShowWizard] = useState(false);
  const isFree = account?.plan === "FREE";

  return (
    <>
      <Stag index={0}>
        <SectionCard t={t} accentColor={ACCENT}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <Kick text="Campaigns" />
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
                Activity / Moment 広告の作成と運用ができます。配信範囲はプランの範囲に従います。
              </p>
            </div>
            {!isFree ? (
              <PrimaryButton onClick={() => setShowWizard((v) => !v)}>
                {showWizard ? "閉じる" : "キャンペーン作成"}
              </PrimaryButton>
            ) : null}
          </div>
        </SectionCard>
      </Stag>

      {isFree ? (
        <Stag index={1}>
          <SectionCard t={t} accentColor={ACCENT}>
            <EmptyState
              icon="🔒"
              title="無料プランでは広告が使えません"
              description="有料プラン（LOCAL など）にアップグレードすると Activity / Moment 広告を作成できます。"
              action={<PrimaryButton onClick={onGoPlans}>プランを見る</PrimaryButton>}
            />
          </SectionCard>
        </Stag>
      ) : showWizard ? (
        <Stag index={1}>
          <CampaignWizard
            account={account}
            locations={locations}
            allowedScopes={allowedScopes}
            allowedTypes={allowedTypes}
            t={t}
            onDone={() => {
              setShowWizard(false);
              onChanged();
            }}
            onSubmitError={onSubmitError}
          />
        </Stag>
      ) : null}

      <Stag index={2}>
        <SectionCard t={t} accentColor={ACCENT}>
          <div style={{ display: "grid", gap: 10 }}>
            {campaigns.length === 0 ? (
              <EmptyState
                icon="📣"
                title="まだキャンペーンがありません"
                description={isFree ? "有料プランへの契約でキャンペーンを作成できます。" : "「キャンペーン作成」から最初の広告を作りましょう。"}
              />
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {campaigns.map((c) => (
                  <CampaignCard key={c.id} campaign={c} locations={locations} onChanged={onChanged} onSubmitError={onSubmitError} />
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </Stag>
    </>
  );
}

function CampaignCard({
  campaign,
  locations,
  onChanged,
  onSubmitError,
}: {
  campaign: CampaignRecord;
  locations: BusinessLocationRecord[];
  onChanged: () => void;
  onSubmitError: (m: string) => void;
}) {
  const { show } = useToast();
  const [busy, setBusy] = useState(false);
  const statusMeta = CAMPAIGN_STATUS_META[campaign.status];
  const scopeDetail = campaignScopeDetail(campaign);
  const targetName =
    campaign.locationTarget === "specific"
      ? locations.find((l) => l.id === campaign.locationId)?.name ?? "指定店舗"
      : "全店舗";

  const act = async (action: "publish" | "pause" | "end", confirmMsg?: string) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setBusy(true);
    onSubmitError("");
    try {
      const res = await fetch(`/api/business-monetize/campaigns/${campaign.id}/${action}`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error ?? "操作に失敗しました");
      onChanged();
      show({
        title:
          action === "publish"
            ? campaign.status === "paused"
              ? "キャンペーンを再開しました"
              : "キャンペーンを公開しました"
            : action === "pause"
              ? "キャンペーンを一時停止しました"
              : "キャンペーンを終了しました",
        tone: "success",
      });
    } catch (err) {
      onSubmitError(err instanceof Error ? err.message : "操作に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const media = campaign.creative.imageUrl || campaign.creative.videoUrl;

  return (
    <div
      style={{
        padding: 15,
        borderRadius: 16,
        border: `1px solid ${campaign.status === "active" ? `${ACCENT}40` : "rgba(255,255,255,0.1)"}`,
        background: campaign.status === "active" ? `linear-gradient(145deg, ${ACCENT}10, rgba(255,255,255,0.02))` : "rgba(255,255,255,0.025)",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#f0f0f5" }}>{campaign.name}</span>
            <TypeBadge type={campaign.type} />
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
            {campaign.creative.title || "（タイトル未設定）"}
          </div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <StatusPill label={statusMeta.label} color={statusMeta.color} live={campaign.status === "active"} />
            <ScopeBadge scope={campaign.scope} detail={scopeDetail} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>対象: {targetName}</span>
          </div>
        </div>
      </div>

      {media ? (
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#000" }}>
          {campaign.creative.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={campaign.creative.imageUrl} alt={campaign.creative.title || campaign.name} style={{ width: "100%", maxHeight: 150, objectFit: "cover", display: "block" }} />
          ) : (
            <video src={campaign.creative.videoUrl ?? undefined} muted playsInline controls style={{ width: "100%", maxHeight: 160, display: "block" }} />
          )}
        </div>
      ) : (
        <div style={{ padding: "18px 14px", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.015)", fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
          {campaign.type === "activity" ? "テキスト広告（画像・動画なし）" : "テキスト広告（画像・動画なし）"}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          作成: {fmtDateShort(campaign.createdAt)}
          {campaign.startedAt ? ` ・ 開始: ${fmtDateShort(campaign.startedAt)}` : ""}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {campaign.status === "draft" || campaign.status === "paused" ? (
            <PrimaryButton
              style={{ minHeight: 38, fontSize: 11, padding: "8px 14px" }}
              disabled={busy}
              onClick={() => void act("publish")}
            >
              {campaign.status === "paused" ? "再開" : "公開"}
            </PrimaryButton>
          ) : null}
          {campaign.status === "active" ? (
            <SecondaryButton style={{ minHeight: 38, fontSize: 11, padding: "8px 14px" }} disabled={busy} onClick={() => void act("pause")}>
              一時停止
            </SecondaryButton>
          ) : null}
          {campaign.status !== "ended" ? (
            <DangerButton style={{ minHeight: 38, fontSize: 11, padding: "8px 14px" }} disabled={busy} onClick={() => void act("end", "このキャンペーンを終了しますか？")}>
              終了
            </DangerButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Campaign Wizard（5ステップ）
// ─────────────────────────────────────────────────────────────

function CampaignWizard({
  account,
  locations,
  allowedScopes,
  allowedTypes,
  t,
  onDone,
  onSubmitError,
}: {
  account: BusinessAccountRecord | null;
  locations: BusinessLocationRecord[];
  allowedScopes: AdScope[];
  allowedTypes: CampaignType[];
  t: ThemeColors;
  onDone: () => void;
  onSubmitError: (m: string) => void;
}) {
  const { show } = useToast();
  const [step, setStep] = useState<WizardStep>("type");
  const [type, setType] = useState<CampaignType>("activity");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [locationTarget, setLocationTarget] = useState<"all" | "specific">("all");
  const [locationId, setLocationId] = useState("");
  const [scope, setScope] = useState<AdScope>(allowedScopes[0] ?? "local");
  const [regionBlock, setRegionBlock] = useState("");
  const [half, setHalf] = useState("");
  const [prefecture, setPrefecture] = useState(account?.primaryPrefecture ?? "");
  const [previewKind, setPreviewKind] = useState<"moment" | "map">("moment");
  const [submitting, setSubmitting] = useState(false);

  const currentStep = WIZARD_STEPS.find((s) => s.id === step) ?? WIZARD_STEPS[0];
  const canProceedCreative = name.trim() !== "" && title.trim() !== "";
  const scopeReady =
    scope === "local" ? prefecture.trim() !== "" : scope === "region" ? regionBlock !== "" : scope === "half" ? half !== "" : true;

  const regionOptions = REGION_BLOCKS.map((b) => b.label);
  const halfOptions = HALF_REGIONS.map((h) => h.label);

  const previewAd = useMemo<PublicAd>(() => {
    return buildPreviewAd({
      id: "preview",
      name: name || "新しいキャンペーン",
      type,
      scope,
      prefecture,
      regionBlock,
      half,
      creative: { title, description, imageUrl, videoUrl, ctaText, ctaUrl },
      account,
    });
  }, [name, type, scope, prefecture, regionBlock, half, title, description, imageUrl, videoUrl, ctaText, ctaUrl, account]);

  const submit = async () => {
    setSubmitting(true);
    onSubmitError("");
    try {
      const payload = {
        name,
        type,
        scope,
        regionBlock: scope === "region" ? (REGION_BLOCKS.find((b) => b.label === regionBlock)?.id ?? null) : null,
        half: scope === "half" ? (HALF_REGIONS.find((h) => h.label === half)?.id ?? null) : null,
        prefecture: scope === "local" ? prefecture || null : null,
        locationTarget,
        locationId: locationTarget === "specific" ? locationId : null,
        creative: {
          title,
          description: description || null,
          imageUrl: imageUrl || null,
          videoUrl: videoUrl || null,
          ctaText: ctaText || null,
          ctaUrl: ctaUrl || null,
        },
      };
      const res = await fetch("/api/business-monetize/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error ?? "キャンペーン作成に失敗しました");
      show({ title: "キャンペーンを保存しました", description: "下書きとして作成されました。公開はキャンペーン一覧から行えます。", tone: "success" });
      onDone();
    } catch (err) {
      onSubmitError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const stepHeader = (
    <div style={{ display: "grid", gap: 4, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: `${ACCENT}18`, border: `1px solid ${ACCENT}44`, color: ACCENT, fontSize: 11, fontWeight: 900 }}>
          {currentStep.num}
        </span>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, letterSpacing: "0.08em", color: "#f0f0f5" }}>{currentStep.title}</span>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{currentStep.desc}</p>
    </div>
  );

  return (
    <SectionCard t={t} accentColor={ACCENT}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <SLabel text="Create Campaign" color={ACCENT} />
        <WizardStepper current={step} onJump={setStep} />
      </div>

      {stepHeader}

      {step === "type" ? (
        <div style={{ display: "grid", gap: 10 }}>
          {CAMPAIGN_TYPES.map((ct) => {
            const allowed = allowedTypes.includes(ct.id);
            return (
              <button
                key={ct.id}
                type="button"
                className="vc-interactive"
                onClick={() => {
                  setType(ct.id);
                  setStep("creative");
                }}
                disabled={!allowed}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  padding: 14,
                  minHeight: 64,
                  borderRadius: 14,
                  border: `1px solid ${type === ct.id && allowed ? `${ACCENT}50` : "rgba(255,255,255,0.1)"}`,
                  background: type === ct.id && allowed ? `${ACCENT}12` : "rgba(255,255,255,0.025)",
                  color: "#f0f0f5",
                  cursor: allowed ? "pointer" : "not-allowed",
                  opacity: allowed ? 1 : 0.45,
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{ct.label}</div>
                  <div style={{ marginTop: 3, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                    {ct.id === "activity"
                      ? "スポーツ関連イベント・活動の告知に使う広告"
                      : "一瞬の注目を集めるソーシャルメディア風広告"}
                  </div>
                </div>
                <span style={{ fontSize: 10, color: allowed ? ACCENT : "rgba(255,255,255,0.4)", fontWeight: 800, whiteSpace: "nowrap" }}>
                  {allowed ? "選択 →" : "プランで利用不可"}
                </span>
              </button>
            );
          })}
        </div>
      ) : step === "creative" ? (
        <div style={{ display: "grid", gap: 12 }}>
          <Field label="キャンペーン名">
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="例: 夏のフィットネスキャンペーン" maxLength={60} />
          </Field>
          <Field label="広告タイトル">
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="クリエイティブのメイン文言" maxLength={40} />
            <Hint>{title.length}/40</Hint>
          </Field>
          <Field label="説明文">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              placeholder="広告の説明文"
              maxLength={200}
            />
            <Hint>{description.length}/200</Hint>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <Field label="広告画像">
              <MediaUploader kind="image" value={imageUrl} onChange={setImageUrl} />
            </Field>
            <Field label="広告動画（任意・画像と併用可）">
              <MediaUploader kind="video" value={videoUrl} onChange={setVideoUrl} />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="CTAボタン">
              <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} style={inputStyle} placeholder="予約する" maxLength={20} />
            </Field>
            <Field label="CTAリンク">
              <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} style={inputStyle} placeholder="https://..." maxLength={120} />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 6, flexWrap: "wrap" }}>
            <SecondaryButton onClick={() => setStep("type")}>戻る</SecondaryButton>
            <PrimaryButton onClick={() => setStep("location")} disabled={!canProceedCreative}>
              {canProceedCreative ? "次へ" : "キャンペーン名とタイトルを入力"}
            </PrimaryButton>
          </div>
        </div>
      ) : step === "location" ? (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>配信対象の店舗</div>
            <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12, color: "#f0f0f5", padding: 12, borderRadius: 12, border: `1px solid ${locationTarget === "all" ? `${ACCENT}50` : "rgba(255,255,255,0.1)"}`, background: locationTarget === "all" ? `${ACCENT}0f` : "transparent", cursor: "pointer" }}>
              <input
                type="radio"
                checked={locationTarget === "all"}
                onChange={() => {
                  setLocationTarget("all");
                  setLocationId("");
                }}
              />
              全店舗
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12, color: "#f0f0f5", padding: 12, borderRadius: 12, border: `1px solid ${locationTarget === "specific" ? `${ACCENT}50` : "rgba(255,255,255,0.1)"}`, background: locationTarget === "specific" ? `${ACCENT}0f` : "transparent", cursor: "pointer" }}>
              <input
                type="radio"
                checked={locationTarget === "specific"}
                onChange={() => setLocationTarget("specific")}
              />
              特定の店舗
            </label>
          </div>
          {locationTarget === "specific" ? (
            <Field label="店舗">
              <select value={locationId} onChange={(e) => setLocationId(e.target.value)} style={selectStyle}>
                <option value="">選択してください</option>
                {locations.length === 0 ? <option value="" disabled>店舗が登録されていません</option> : null}
                {locations.map((l) => (
                  <option key={l.id} value={l.id} style={{ color: "#111" }}>
                    {l.name} ・ {l.prefecture}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 6, flexWrap: "wrap" }}>
            <SecondaryButton onClick={() => setStep("creative")}>戻る</SecondaryButton>
            <PrimaryButton onClick={() => setStep("scope")} disabled={locationTarget === "specific" && !locationId}>
              次へ
            </PrimaryButton>
          </div>
        </div>
      ) : step === "scope" ? (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
            配信範囲はプラン: <b style={{ color: ACCENT }}>{PLAN_LABEL[account?.plan ?? "FREE"] ?? account?.plan}</b> で許可された範囲のみ選択できます。
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {allowedScopes.map((s) => {
              const meta = SCOPE_META[s];
              return (
                <label
                  key={s}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    fontSize: 12,
                    color: "#f0f0f5",
                    padding: 12,
                    borderRadius: 12,
                    border: `1px solid ${scope === s ? `${ACCENT}50` : "rgba(255,255,255,0.1)"}`,
                    background: scope === s ? `${ACCENT}10` : "transparent",
                    cursor: "pointer",
                    minHeight: TOUCH_MIN,
                  }}
                >
                  <input
                    type="radio"
                    checked={scope === s}
                    onChange={() => {
                      setScope(s);
                      setRegionBlock("");
                      setHalf("");
                    }}
                  />
                  <span style={{ fontWeight: 800 }}>{AD_SCOPE_LABEL[s]}</span>
                  {meta ? <span style={{ marginLeft: 4, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{meta.icon} {meta.description}</span> : null}
                </label>
              );
            })}
          </div>
          {scope === "region" ? (
            <Field label="地域（地方ブロック）">
              <select value={regionBlock} onChange={(e) => setRegionBlock(e.target.value)} style={selectStyle}>
                <option value="">選択してください</option>
                {regionOptions.map((o) => (
                  <option key={o} value={o} style={{ color: "#111" }}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          {scope === "half" ? (
            <Field label="東日本 / 西日本">
              <select value={half} onChange={(e) => setHalf(e.target.value)} style={selectStyle}>
                <option value="">選択してください</option>
                {halfOptions.map((o) => (
                  <option key={o} value={o} style={{ color: "#111" }}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          {scope === "local" ? (
            <Field label="都道府県">
              <select value={prefecture} onChange={(e) => setPrefecture(e.target.value)} style={selectStyle}>
                <option value="">選択してください</option>
                {ALL_PREFECTURES.map((p) => (
                  <option key={p} value={p} style={{ color: "#111" }}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
            <ScopeReachBar scope={scope} />
            <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
              {SCOPE_META[scope].description}
              {scope === "region" && regionBlock ? `（${regionBlock}エリア）` : ""}
              {scope === "half" && half ? `（${half}全体）` : ""}
              {scope === "local" && prefecture ? `（${prefecture}）` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 6, flexWrap: "wrap" }}>
            <SecondaryButton onClick={() => setStep("location")}>戻る</SecondaryButton>
            <PrimaryButton onClick={() => setStep("preview")} disabled={!scopeReady}>
              次へ
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setPreviewKind("moment")}
              aria-pressed={previewKind === "moment"}
              style={{
                padding: "8px 14px",
                minHeight: 40,
                borderRadius: 10,
                border: `1px solid ${previewKind === "moment" ? `${ACCENT}55` : "rgba(255,255,255,0.12)"}`,
                background: previewKind === "moment" ? `${ACCENT}14` : "rgba(255,255,255,0.025)",
                color: previewKind === "moment" ? ACCENT : "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              MOMENT（フィード表示）
            </button>
            <button
              type="button"
              onClick={() => setPreviewKind("map")}
              aria-pressed={previewKind === "map"}
              style={{
                padding: "8px 14px",
                minHeight: 40,
                borderRadius: 10,
                border: `1px solid ${previewKind === "map" ? `${ACCENT}55` : "rgba(255,255,255,0.12)"}`,
                background: previewKind === "map" ? `${ACCENT}14` : "rgba(255,255,255,0.025)",
                color: previewKind === "map" ? ACCENT : "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              MAP（横長バナー表示）
            </button>
          </div>

          <div aria-live="polite">
            {previewKind === "moment" ? (
              <SponsoredAdCard ad={previewAd} />
            ) : (
              <AdBannerPreview ad={previewAd} />
            )}
          </div>

          <div style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", display: "grid", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>
            <div>
              種別: <b style={{ color: "#f0f0f5" }}>{type === "activity" ? "Activity広告" : "Moment広告"}</b>
            </div>
            <div>
              配信範囲: <b style={{ color: ACCENT }}>{AD_SCOPE_LABEL[scope]}</b>
              {scope === "region" && regionBlock ? ` / ${regionBlock}` : ""}
              {scope === "half" && half ? ` / ${half}` : ""}
              {scope === "local" && prefecture ? ` / ${prefecture}` : ""}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              対象店舗: <b style={{ color: "#f0f0f5" }}>
                {locationTarget === "specific" ? (locations.find((l) => l.id === locationId)?.name ?? "指定店舗") : "全店舗"}
              </b>
            </div>
            <div>
              ステータス: 作成後は<b style={{ color: "#f2c14e" }}>下書き</b>です。公開はキャンペーン一覧から行えます。
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 6, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <SecondaryButton onClick={() => setStep("creative")}>画像・メディアを編集</SecondaryButton>
              <SecondaryButton onClick={() => setStep("scope")}>範囲を編集</SecondaryButton>
            </div>
            <PrimaryButton onClick={() => void submit()} disabled={submitting || !name.trim() || !title.trim()}>
              {submitting ? "作成中..." : "下書きとして作成"}
            </PrimaryButton>
          </div>
        </div>
      )}
    </SectionCard>
  );
}