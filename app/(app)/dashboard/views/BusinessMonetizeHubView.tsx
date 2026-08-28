"use client";

// Business Monetize Hub — P0
// 事業者向け広告運用センター。
// ・Plan概要（契約Plan / 状態 / 料金 / 特典）
// ・Location（多店舗）管理
// ・Campaign（Activity / Moment広告）管理
// 全ての書き込みは API 経由（service role）。Plan→Scope等はServer側で強制。

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader, PrimaryButton, SecondaryButton, DangerButton } from "@/app/(app)/dashboard/components/ui";
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
} from "@/features/business-monetize/constants";
import { ALL_PREFECTURES, geocodeByAddress, type GeocodeSuggestion } from "@/features/place/geocode";

const ACCENT = "#00BFA5";

/** 新モネタイズPlan → 既存Square checkuotのlegacy PlanId（価格一致: LOCAL=roots ¥30k / FEATURED=signal ¥100k / PREMIUM=presence ¥300k） */
const MONETIZE_TO_LEGACY_PLAN_ID: Partial<Record<BusinessMonetizePlan, string>> = {
  LOCAL: "roots",
  FEATURED: "signal",
  PREMIUM: "presence",
};

type Tab = "overview" | "plans" | "locations" | "campaigns";

const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "下書き",
  active: "配信中",
  paused: "一時停止",
  ended: "終了",
};

const CAMPAIGN_STATUS_COLOR: Record<CampaignStatus, string> = {
  draft: "rgba(255,255,255,0.45)",
  active: "#3ddc97",
  paused: "#f2c14e",
  ended: "rgba(255,255,255,0.35)",
};

function fmtDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#f0f0f5",
  padding: "11px 12px",
  fontSize: 12,
  outline: "none",
};

/** 全インタラクティブ要素にfocus-visibleリング（キーボード操作の可視化） */
const focusRing = `:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; border-radius: 10px; }`;

/** Business店舗登録用の住所検索（Mapbox Geocodingを再利用）。緯度経度は自動設定される。 */
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
        .then((s) => { setSuggestions(s); setLoading(false); })
        .catch((cause: unknown) => {
          if (cause instanceof DOMException && cause.name === "AbortError") return;
          setSuggestions([]);
          setLoading(false);
        });
    }, 450);
    return () => { window.clearTimeout(t); controller.abort(); };
  }, [address]);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input
        value={address}
        onChange={(e) => onAddress(e.target.value)}
        style={inputStyle}
        placeholder="住所を入力して検索（例: 東京都渋谷区…）"
        autoComplete="off"
        aria-label="店舗の住所を検索"
      />
      {loading ? (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>住所を検索中...</div>
      ) : null}
      {suggestions.length > 0 ? (
        <div style={{ display: "grid", gap: 6 }}>
          {suggestions.map((s) => (
            <button
              key={`${s.latitude},${s.longitude},${s.name}`}
              type="button"
              onClick={() => { onPick(s.latitude, s.longitude, s.prefecture); setSuggestions([]); }}
              style={{
                textAlign: "left", padding: "10px 12px", borderRadius: 10,
                border: `1px solid ${ACCENT}35`, background: `${ACCENT}0f`,
                color: "#f0f0f5", fontSize: 12, cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 700 }}>{s.name}</div>
              <div style={{ marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{s.address}</div>
            </button>
          ))}
        </div>
      ) : null}
      {!loading && suggestions.length === 0 && address.trim().length >= 3 ? (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>候補が見つかりません。別の住所をお試しください。</div>
      ) : null}
    </div>
  );
}

function PlanCard({
  plan,
  current,
  onSelect,
}: {
  plan: (typeof MONETIZE_PLANS)[number];
  current: boolean;
  onSelect: (p: BusinessMonetizePlan) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(plan.id)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 18,
        borderRadius: 18,
        border: `1px solid ${current ? `${ACCENT}55` : "rgba(255,255,255,0.1)"}`,
        background: current ? `linear-gradient(145deg, ${ACCENT}1c, rgba(255,255,255,0.02))` : "rgba(255,255,255,0.025)",
        color: "#f0f0f5",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {current && (
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
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
      )}
      <div style={{ fontSize: 14, fontWeight: 900, color: plan.id === "ENTERPRISE" ? "#fff" : ACCENT }}>
        {PLAN_LABEL[plan.id] ?? plan.id}
      </div>
      <div style={{ fontSize: 18, fontWeight: 900 }}>{plan.priceLabel}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>配信単位: {plan.selectionUnit}</div>
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

export function BusinessMonetizeHubView({
  t,
  setView,
}: {
  profile: ProfileData;
  t: ThemeColors;
  roleColor: string;
  setView: (v: DashboardView) => void;
  ads: AdItem[];
}) {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{focusRing}</style>
      <ViewHeader title="Business Monetize" sub="広告プラン・店舗・キャンペーンを一元管理" onBack={() => setView("home")} t={t} roleColor={ACCENT} />

      {error ? (
        <div style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(255,80,80,0.35)", background: "rgba(255,80,80,0.10)", color: "#ffb6b6", fontSize: 12 }}>{error}</div>
      ) : null}

      <SectionCard t={t} accentColor={ACCENT}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>概要</TabButton>
          <TabButton active={tab === "plans"} onClick={() => setTab("plans")}>プラン</TabButton>
          <TabButton active={tab === "locations"} onClick={() => setTab("locations")}>店舗</TabButton>
          <TabButton active={tab === "campaigns"} onClick={() => setTab("campaigns")}>キャンペーン</TabButton>
        </div>
      </SectionCard>

      {loading && !account ? (
        <SectionCard t={t} accentColor={ACCENT}>
          <div style={{ padding: 28, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>読み込み中...</div>
        </SectionCard>
      ) : tab === "overview" ? (
        <OverviewSection
          account={account}
          planDef={planDef}
          adSlot={adSlot}
          activeCampaigns={activeCampaigns}
          locations={locations}
          campaigns={campaigns}
          t={t}
          onUpgrade={() => setTab("plans")}
          onSubmitError={submitError}
        />
      ) : tab === "plans" ? (
        <PlansSection account={account} selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} t={t} onSubmitError={submitError} />
      ) : tab === "locations" ? (
        <LocationsSection locations={locations} t={t} onChanged={() => void refresh()} onSubmitError={submitError} />
      ) : (
        <CampaignsSection
          account={account}
          campaigns={campaigns}
          locations={locations}
          allowedScopes={allowedScopes}
          allowedTypes={allowedTypes}
          t={t}
          onChanged={() => void refresh()}
          onSubmitError={submitError}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "12px 14px",
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

function OverviewSection({
  account,
  planDef,
  adSlot,
  activeCampaigns,
  locations,
  campaigns,
  t,
  onUpgrade,
  onSubmitError,
}: {
  account: BusinessAccountRecord | null;
  planDef: ReturnType<typeof getMonetizePlan>;
  adSlot: { seats: number; soldCount: number; remaining: number; soldOut: boolean } | null;
  activeCampaigns: number;
  locations: BusinessLocationRecord[];
  campaigns: CampaignRecord[];
  t: ThemeColors;
  onUpgrade: () => void;
  onSubmitError: (m: string) => void;
}) {
  void onSubmitError;
  const isFree = account?.plan === "FREE";
  const planLabel = account ? PLAN_LABEL[account.plan] ?? account.plan : "未契約";
  const scopeMeta = planDef ? SCOPE_META[planDef.scope] : null;
  return (
    <>
      <SectionCard t={t} accentColor={ACCENT}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT, fontFamily: "monospace" }}>Current Plan</p>
            <h2 style={{ margin: "6px 0 4px", fontSize: 24, fontWeight: 900, color: "#f0f0f5" }}>{planLabel}</h2>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>{planDef?.priceLabel}</p>
            {scopeMeta ? (
              <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                <span style={{ marginRight: 6 }}>{scopeMeta.icon}</span>{scopeMeta.label}
                <div style={{ marginTop: 2 }}>{scopeMeta.description}</div>
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <StatusBadge status={account?.status ?? "free"} />
            {isFree ? (
              <PrimaryButton
                onClick={onUpgrade}
              >
                プランを見る
              </PrimaryButton>
            ) : null}
          </div>
        </div>
        {planDef ? (
          <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
            {planDef.benefits.map((b) => (
              <div key={b} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                <span style={{ color: ACCENT, fontWeight: 900 }}>✓</span>
                {b}
              </div>
            ))}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard t={t} accentColor={ACCENT}>
        <SLabel text="Overview" color={ACCENT} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginTop: 10 }}>
          <StatTile label="登録店舗" value={String(locations.length)} />
          <StatTile label="キャンペーン" value={String(campaigns.length)} />
          <StatTile label="配信中" value={String(activeCampaigns)} accent />
        </div>
        {!isFree && account?.plan !== "ENTERPRISE" ? (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.025)", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
            <div style={{ fontWeight: 800, color: "#f0f0f5", marginBottom: 6 }}>配信枠（在庫）</div>
            {adSlot ? (
              <div>現在のプランの配信枠: 使用中 {adSlot.soldCount} / {adSlot.seats}座{adSlot.soldOut ? "（満席）" : `（残り ${adSlot.remaining}）`}</div>
            ) : (
              <div>在庫情報を取得できませんでした</div>
            )}
            <div style={{ marginTop: 6, opacity: 0.7 }}>配信枠が満席の場合は、他プランや地域の枠をご検討ください。</div>
          </div>
        ) : null}
      </SectionCard>
    </>
  );
}

function StatusBadge({ status }: { status: BusinessAccountRecord["status"] }) {
  const map = { free: { label: "未契約", color: "rgba(255,255,255,0.45)" }, active: { label: "有効", color: "#3ddc97" }, inactive: { label: "利用不可", color: "#ff7a7a" } } as const;
  const s = map[status] ?? map.free;
  return (
    <span style={{ padding: "5px 11px", borderRadius: 999, border: `1px solid ${s.color}44`, background: `${s.color}14`, color: s.color, fontSize: 10, fontWeight: 800 }}>
      {s.label}
    </span>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.025)" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: accent ? ACCENT : "#f0f0f5" }}>{value}</div>
    </div>
  );
}

function PlansSection({
  account,
  selectedPlan,
  onSelectPlan,
  t,
  onSubmitError,
}: {
  account: BusinessAccountRecord | null;
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
      onSubmitError("ENTERPRISEは個別契約です。運営営業チームへお問い合わせください。");
    }
  };
  const startCheckout = async () => {
    if (!selectedPlan || busy) return;
    if (selectedPlan === "FREE") return;
    if (selectedPlan === currentPlan) return;
    if (selectedPlan === "ENTERPRISE") {
      onSubmitError("ENTERPRISEは個別契約です。運営営業チームへお問い合わせください。");
      return;
    }
    const legacyPlanId = MONETIZE_TO_LEGACY_PLAN_ID[selectedPlan];
    if (!legacyPlanId) {
      onSubmitError("このプランは現在購入できません。運営へお問い合わせください。");
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
        onSubmitError("チェックアウトにはログインが必要です。");
        return;
      }
      if (!res.ok || !data.success) {
        onSubmitError(data.error ?? "チェックアウトの開始に失敗しました。");
        return;
      }
      if (!data.squareUrl) {
        onSubmitError("支払いリンクの生成に失敗しました。管理者にお問い合わせください。");
        return;
      }
      window.location.href = data.squareUrl;
    } catch {
      onSubmitError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setBusy(false);
    }
  };
  const selectedDef = selectedPlan ? getMonetizePlan(selectedPlan) : null;
  return (
    <>
      <SectionCard t={t} accentColor={ACCENT}>
        <SLabel text="Plans" color={ACCENT} />
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
          契約プランごとに、広告の配信範囲と利用可能なキャンペーン種別が決まります。購入はSquare決済で完結し、決済完了後にプラン・配信範囲へ反映されます。
        </p>
      </SectionCard>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {MONETIZE_PLANS.map((p) => (
          <PlanCard key={p.id} plan={p} current={p.id === currentPlan} onSelect={handlePick} />
        ))}
      </div>
      {selectedPlan ? (
        <SectionCard t={t} accentColor={ACCENT}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.9 }}>
            <b style={{ color: "#f0f0f5" }}>{PLAN_LABEL[selectedPlan] ?? selectedPlan}</b> の配信範囲は <b style={{ color: ACCENT }}>{AD_SCOPE_LABEL[selectedDef?.scope ?? "local"]}</b>。{" "}
            {planHasSpotlight(selectedPlan) ? "Spotlight / 優先表示つき。" : ""}
            {planIsPremiumOrAbove(selectedPlan) ? "東日本 / 西日本・全国規模の大型配信対応。" : ""}
          </div>
          {selectedPlan !== "FREE" && selectedPlan !== currentPlan ? (
            <div style={{ marginTop: 14 }}>
              {selectedPlan === "ENTERPRISE" ? (
                <DangerButton onClick={() => onSubmitError("ENTERPRISEは個別契約です。運営営業チームへお問い合わせください。")}>
                  ENTERPRISEへ問い合わせ
                </DangerButton>
              ) : (
                <PrimaryButton onClick={() => void startCheckout()} disabled={busy}>
                  {busy ? "チェックアウト生成中..." : `Square決済で購入（${selectedDef?.priceLabel ?? ""}）`}
                </PrimaryButton>
              )}
            </div>
          ) : null}
        </SectionCard>
      ) : null}
    </>
  );
}

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
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyLocationForm);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [hosting, setHosting] = useState(false);

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
    setShowForm(true);
  };

  const reset = () => {
    setForm(emptyLocationForm);
    setEditingId(null);
    setSearchAddress("");
    setCoords(null);
    setShowForm(false);
  };

  const pick = (lat: number, lng: number, prefecture: string | null) => {
    setCoords({ lat, lng });
    if (prefecture) setForm((f) => ({ ...f, prefecture }));
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
    } catch (err) {
      onSubmitError(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  return (
    <>
      <SectionCard t={t} accentColor={ACCENT}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <SLabel text="Locations" color={ACCENT} />
            <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
              多店舗（親子）構造で店舗を登録します。住所検索で自動的にMap Pinの座標が設定されます。
            </p>
          </div>
          <SecondaryButton onClick={() => { if (showForm) reset(); else { setForm(emptyLocationForm); setEditingId(null); setCoords(null); setSearchAddress(""); setShowForm(true); } }}>
            {showForm ? "閉じる" : "店舗を追加"}
          </SecondaryButton>
        </div>
      </SectionCard>

      {showForm ? (
        <SectionCard t={t} accentColor={ACCENT}>
          <SLabel text={editingId ? "Edit Location" : "New Location"} color={ACCENT} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 12 }}>
            <Field label="店舗名">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="例）Vizion 渋谷店" />
            </Field>
            <Field label="住所（検索して位置を自動設定）">
              <LocationGeocoder address={searchAddress} onAddress={(v) => { setSearchAddress(v); setForm((f) => ({ ...f, address: v })); }} onPick={pick} />
              {coords ? (
                <div style={{ fontSize: 11, color: "#3ddc97", marginTop: 4 }}>✓ 位置を設定しました（{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}）</div>
              ) : (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>住所を入力し、候補から選択してください。</div>
              )}
            </Field>
            <Field label="都道府県">
              <select
                value={form.prefecture}
                onChange={(e) => setForm({ ...form, prefecture: e.target.value })}
                style={{ ...inputStyle, appearance: "auto" }}
              >
                <option value="">選択してください</option>
                {ALL_PREFECTURES.map((p) => (
                  <option key={p} value={p} style={{ color: "#111" }}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="営業時間">
              <input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="電話">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Webサイト">
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} style={inputStyle} />
            </Field>
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {hosting ? (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>保存中...</div>
            ) : null}
            <button type="button" onClick={() => setHosting(!hosting)} style={{ textAlign: "left", fontSize: 10, color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              {hosting ? "▲" : "▼"} 位置情報について
            </button>
            {hosting ? (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
                店舗のMap Pinは、住所検索で自動取得した座標を使用します。手入力は不要です。住所を変更する場合は再度検索して位置を更新してください。
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <PrimaryButton onClick={() => void submit()} disabled={saving || !form.name.trim() || !form.prefecture.trim() || !coords}>
              {saving ? "保存中..." : editingId ? "更新" : "登録"}
            </PrimaryButton>
            <SecondaryButton onClick={reset}>キャンセル</SecondaryButton>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard t={t} accentColor={ACCENT}>
        <div style={{ display: "grid", gap: 10 }}>
          {locations.length === 0 ? (
            <div style={{ padding: 20, borderRadius: 16, border: "1px dashed rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              まだ店舗がありません。上の「店舗を追加」から登録してください。
            </div>
          ) : locations.map((loc) => (
            <div key={loc.id} style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.025)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f0f0f5" }}>{loc.name}</div>
                  <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                    {loc.prefecture} · {loc.address || "住所未設定"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <SecondaryButton onClick={() => startEdit(loc)}>編集</SecondaryButton>
                  <DangerButton onClick={() => void remove(loc.id)}>削除</DangerButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function CampaignsSection({
  account,
  campaigns,
  locations,
  allowedScopes,
  allowedTypes,
  t,
  onChanged,
  onSubmitError,
}: {
  account: BusinessAccountRecord | null;
  campaigns: CampaignRecord[];
  locations: BusinessLocationRecord[];
  allowedScopes: AdScope[];
  allowedTypes: CampaignType[];
  t: ThemeColors;
  onChanged: () => void;
  onSubmitError: (m: string) => void;
}) {
  const [showWizard, setShowWizard] = useState(false);
  const isFree = account?.plan === "FREE";

  return (
    <>
      <SectionCard t={t} accentColor={ACCENT}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <SLabel text="Campaigns" color={ACCENT} />
            <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
              Activity / Moment 広告キャンペーンを作成・配信管理します。配信範囲は契約Planの範囲内に限定されます。
            </p>
          </div>
          {!isFree ? (
            <PrimaryButton onClick={() => setShowWizard((v) => !v)}>
              {showWizard ? "閉じる" : "キャンペーン作成"}
            </PrimaryButton>
          ) : null}
        </div>
      </SectionCard>

      {isFree ? (
        <SectionCard t={t} accentColor={ACCENT}>
          <div style={{ padding: 16, borderRadius: 16, border: "1px dashed rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.8 }}>
            FREEプランでは広告キャンペーンを作成できません。有料プラン（LOCAL以上）で Activity / Moment 広告を利用できます。
          </div>
        </SectionCard>
      ) : showWizard ? (
        <CampaignWizard
          account={account}
          locations={locations}
          allowedScopes={allowedScopes}
          allowedTypes={allowedTypes}
          t={t}
          onDone={() => { setShowWizard(false); onChanged(); }}
          onSubmitError={onSubmitError}
        />
      ) : null}

      <SectionCard t={t} accentColor={ACCENT}>
        <div style={{ display: "grid", gap: 10 }}>
          {campaigns.length === 0 ? (
            <div style={{ padding: 20, borderRadius: 16, border: "1px dashed rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              まだキャンペーンがありません。{isFree ? "有料プランへの契約後に" : "「キャンペーン作成」から"}作成してください。
            </div>
          ) : campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} onChanged={onChanged} onSubmitError={onSubmitError} />
          ))}
        </div>
      </SectionCard>
    </>
  );
}

function CampaignCard({
  campaign,
  onChanged,
  onSubmitError,
}: {
  campaign: CampaignRecord;
  onChanged: () => void;
  onSubmitError: (m: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const locationDetail =
    campaign.scope === "local" ? ` / ${campaign.prefecture ?? "-"}` :
    campaign.scope === "region" ? ` / ${getRegionLabel(campaign.regionBlock)}` :
    campaign.scope === "half" ? ` / ${getHalfLabel(campaign.half)}` : "";

  const act = async (action: string, confirmMsg?: string) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setBusy(true);
    onSubmitError("");
    try {
      const res = await fetch(`/api/business-monetize/campaigns/${campaign.id}/${action}`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error ?? "操作に失敗しました");
      onChanged();
    } catch (err) {
      onSubmitError(err instanceof Error ? err.message : "操作に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 15, borderRadius: 16, border: `1px solid ${campaign.status === "active" ? `${ACCENT}40` : "rgba(255,255,255,0.1)"}`, background: campaign.status === "active" ? `linear-gradient(145deg, ${ACCENT}10, rgba(255,255,255,0.02))` : "rgba(255,255,255,0.025)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#f0f0f5" }}>{campaign.name}</span>
            <TypeBadge type={campaign.type} />
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
            {campaign.creative.title || "（タイトル未設定）"}
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
            {AD_SCOPE_LABEL[campaign.scope]}{locationDetail} · 開始 {fmtDate(campaign.startedAt)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span style={{ padding: "4px 10px", borderRadius: 999, border: `1px solid ${CAMPAIGN_STATUS_COLOR[campaign.status]}44`, background: `${CAMPAIGN_STATUS_COLOR[campaign.status]}14`, color: CAMPAIGN_STATUS_COLOR[campaign.status], fontSize: 10, fontWeight: 800 }}>
            {CAMPAIGN_STATUS_LABEL[campaign.status]}
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {campaign.status === "draft" || campaign.status === "paused" ? (
              <button type="button" disabled={busy} onClick={() => void act("publish")} style={{ padding: "8px 12px", borderRadius: 10, border: "none", background: ACCENT, color: "#06201b", fontSize: 11, fontWeight: 800, cursor: busy ? "progress" : "pointer" }}>
                公開
              </button>
            ) : null}
            {campaign.status === "active" ? (
              <button type="button" disabled={busy} onClick={() => void act("pause")} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#f0f0f5", fontSize: 11, fontWeight: 700, cursor: busy ? "progress" : "pointer" }}>
                一時停止
              </button>
            ) : null}
            {campaign.status !== "ended" ? (
              <button type="button" disabled={busy} onClick={() => void act("end", "このキャンペーンを終了しますか？")} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,122,122,0.3)", background: "rgba(255,122,122,0.08)", color: "#ff8f8f", fontSize: 11, fontWeight: 700, cursor: busy ? "progress" : "pointer" }}>
                終了
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: CampaignType }) {
  return (
    <span style={{ padding: "3px 8px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 800 }}>
      {type === "activity" ? "ACTIVITY" : "MOMENT"}
    </span>
  );
}

function getRegionLabel(block: string | null) {
  return REGION_BLOCKS.find((b) => b.id === block)?.label ?? "-";
}

function getHalfLabel(half: string | null) {
  return HALF_REGIONS.find((h) => h.id === half)?.label ?? "-";
}

type WizardStep = "type" | "creative" | "location" | "scope" | "preview";

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
  const [submitting, setSubmitting] = useState(false);

  const canProceedCreative = name.trim() !== "" && title.trim() !== "";

  const regionOptions = REGION_BLOCKS.map((b) => b.label);
  const halfOptions = HALF_REGIONS.map((h) => h.label);

  const submit = async () => {
    setSubmitting(true);
    onSubmitError("");
    try {
      const payload = {
        name,
        type,
        scope,
        regionBlock: scope === "region" ? regionOptions.indexOf(regionBlock) >= 0 ? REGION_BLOCKS[regionOptions.indexOf(regionBlock)].id : null : null,
        half: scope === "half" ? halfOptions.indexOf(half) >= 0 ? HALF_REGIONS[halfOptions.indexOf(half)].id : null : null,
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
      onDone();
    } catch (err) {
      onSubmitError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard t={t} accentColor={ACCENT}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <SLabel text="Create Campaign" color={ACCENT} />
        <StepIndicator step={step} />
      </div>

      {step === "type" ? (
        <div style={{ display: "grid", gap: 10 }}>
          {CAMPAIGN_TYPES.map((ct) => {
            const allowed = allowedTypes.includes(ct.id);
            return (
              <button key={ct.id} type="button" onClick={() => { setType(ct.id); setStep("creative"); }} disabled={!allowed}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, border: `1px solid ${type === ct.id ? `${ACCENT}50` : "rgba(255,255,255,0.1)"}`, background: type === ct.id ? `${ACCENT}12` : "rgba(255,255,255,0.025)", color: "#f0f0f5", cursor: allowed ? "pointer" : "not-allowed", opacity: allowed ? 1 : 0.4 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{ct.label}</div>
                  <div style={{ marginTop: 3, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{ct.id === "activity" ? "活動・大会・体験への訴求広告" : "瞬間・ストーリー型の大型広告"}</div>
                </div>
                <span style={{ fontSize: 10, color: ACCENT }}>選択 →</span>
              </button>
            );
          })}
        </div>
      ) : step === "creative" ? (
        <div style={{ display: "grid", gap: 10 }}>
          <Field label="キャンペーン名">
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="例）夏の体験キャンペーン" />
          </Field>
          <Field label="広告タイトル">
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="クリエイティブの見出し" />
          </Field>
          <Field label="説明">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} placeholder="広告本文" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="画像URL"><input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={inputStyle} placeholder="https://..." /></Field>
            <Field label="動画URL"><input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} style={inputStyle} placeholder="https://..." /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="CTA文言"><input value={ctaText} onChange={(e) => setCtaText(e.target.value)} style={inputStyle} placeholder="詳しく見る" /></Field>
            <Field label="CTAリンク"><input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} style={inputStyle} placeholder="https://..." /></Field>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 6 }}>
            <SecondaryButton onClick={() => setStep("type")}>戻る</SecondaryButton>
            <PrimaryButton onClick={() => setStep("location")} disabled={!canProceedCreative}>次へ</PrimaryButton>
          </div>
        </div>
      ) : step === "location" ? (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>配信対象店舗</div>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "#f0f0f5" }}>
              <input type="radio" checked={locationTarget === "all"} onChange={() => { setLocationTarget("all"); setLocationId(""); }} /> 全店舗
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "#f0f0f5" }}>
              <input type="radio" checked={locationTarget === "specific"} onChange={() => setLocationTarget("specific")} /> 特定店舗
            </label>
          </div>
          {locationTarget === "specific" ? (
            <Field label="店舗">
              <select value={locationId} onChange={(e) => setLocationId(e.target.value)} style={inputStyle}>
                <option value="">選択してください</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}（{l.prefecture}）</option>)}
              </select>
            </Field>
          ) : null}
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 6 }}>
            <SecondaryButton onClick={() => setStep("creative")}>戻る</SecondaryButton>
            <PrimaryButton onClick={() => setStep("scope")} disabled={locationTarget === "specific" && !locationId}>次へ</PrimaryButton>
          </div>
        </div>
      ) : step === "scope" ? (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
            配信範囲（契約Plan: <b style={{ color: ACCENT }}>{PLAN_LABEL[account?.plan ?? "FREE"] ?? account?.plan}</b> で利用可能な範囲のみ）
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {allowedScopes.map((s) => {
              const meta = SCOPE_META[s];
              return (
                <label key={s} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "#f0f0f5", padding: 12, borderRadius: 12, border: `1px solid ${scope === s ? `${ACCENT}50` : "rgba(255,255,255,0.1)"}`, background: scope === s ? `${ACCENT}10` : "transparent", cursor: "pointer" }}>
                  <input type="radio" checked={scope === s} onChange={() => { setScope(s); setRegionBlock(""); setHalf(""); }} /> {AD_SCOPE_LABEL[s]}
                  {meta ? <span style={{ marginLeft: 4, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{meta.icon} {meta.description}</span> : null}
                </label>
              );
            })}
          </div>
          {scope === "region" ? (
            <Field label="地方ブロック"><select value={regionBlock} onChange={(e) => setRegionBlock(e.target.value)} style={inputStyle}><option value="">選択</option>{regionOptions.map((o) => <option key={o} value={o}>{o}</option>)}</select></Field>
          ) : null}
          {scope === "half" ? (
            <Field label="東日本 / 西日本"><select value={half} onChange={(e) => setHalf(e.target.value)} style={inputStyle}><option value="">選択</option>{halfOptions.map((o) => <option key={o} value={o}>{o}</option>)}</select></Field>
          ) : null}
          {scope === "local" ? (
            <Field label="都道府県"><select value={prefecture} onChange={(e) => setPrefecture(e.target.value)} style={{ ...inputStyle, appearance: "auto" }}><option value="">選択してください</option>{ALL_PREFECTURES.map((p) => <option key={p} value={p} style={{ color: "#111" }}>{p}</option>)}</select></Field>
          ) : null}
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 6 }}>
            <SecondaryButton onClick={() => setStep("location")}>戻る</SecondaryButton>
            <PrimaryButton onClick={() => setStep("preview")} disabled={scope === "region" && !regionBlock || scope === "half" && !half || scope === "local" && !prefecture}>次へ</PrimaryButton>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${ACCENT}35`, background: `linear-gradient(145deg, ${ACCENT}12, rgba(255,255,255,0.02))` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: "#f0f0f5" }}>{title}</span>
              <TypeBadge type={type} />
            </div>
            {description ? <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>{description}</p> : null}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
              <span>配信範囲: <b style={{ color: ACCENT }}>{AD_SCOPE_LABEL[scope]}</b>
                {scope === "region" ? ` / ${regionBlock}` : scope === "half" ? ` / ${half}` : scope === "local" ? ` / ${prefecture}` : ""}
              </span>
              <span>対象店舗: {locationTarget === "specific" ? locations.find((l) => l.id === locationId)?.name ?? "選択店舗" : "全店舗"}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 6 }}>
            <SecondaryButton onClick={() => setStep("scope")}>戻る</SecondaryButton>
            <PrimaryButton onClick={() => void submit()} disabled={submitting}>{submitting ? "作成中..." : "下書きとして作成"}</PrimaryButton>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function StepIndicator({ step }: { step: WizardStep }) {
  const order: WizardStep[] = ["type", "creative", "location", "scope", "preview"];
  const labels: Record<WizardStep, string> = { type: "種別", creative: "内容", location: "店舗", scope: "範囲", preview: "確認" };
  const idx = order.indexOf(step);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
      {order.map((s, i) => (
        <span key={s} style={{ color: i <= idx ? ACCENT : "rgba(255,255,255,0.3)", fontWeight: i === idx ? 800 : 500 }}>
          {labels[s]}{i < order.length - 1 ? " ›" : ""}
        </span>
      ))}
    </div>
  );
}
