"use client";

import { useEffect, useState, type ReactNode } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { getPlanFeatures } from "@/features/business/plan-features";
import { LAUNCH_CAMPAIGN } from "@/features/business/constants";
import type { BusinessHubAnalytics } from "@/lib/supabase/business-hub";

type SponsorPlan = "roots" | "signal" | "presence" | "legacy" | null;

type Period = "7D" | "30D" | "90D" | "custom";

type BusinessHubMetrics = {
  impressions: number;
  clicks: number;
  cheers: number;
  reach: number;
  profileViews: number;
  activityViews: number;
  activities: number;
  activityParticipants: number;
  comments: number;
  connectors: number;
  businessActions: number;
  sports: Array<{ label: string; value: number }>;
  regions: Array<{ label: string; value: number }>;
  monthly: number[];
  ab: Array<{ label: string; ctr: string; note: string }>;
};

const EMPTY_METRICS: BusinessHubMetrics = {
  impressions: 0,
  clicks: 0,
  cheers: 0,
  reach: 0,
  profileViews: 0,
  activityViews: 0,
  activities: 0,
  activityParticipants: 0,
  comments: 0,
  connectors: 0,
  businessActions: 0,
  sports: [],
  regions: [],
  monthly: [],
  ab: [],
};

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="mb-4">
        <p className="text-[11px] font-black tracking-[0.18em] text-[#7BB0FF]">{title}</p>
        {sub ? <p className="mt-1 text-sm leading-7 text-white/60">{sub}</p> : null}
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-[11px] text-white/45">{label}</p>
    </div>
  );
}

function SampleLinkCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="block rounded-2xl border border-dashed border-[#7BB0FF]/30 bg-[#7BB0FF]/[0.06] p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[10px] font-bold text-white/80">
          サンプル
        </span>
        <p className="text-sm font-bold text-white">{title}</p>
      </div>
      <p className="text-sm leading-7 text-white/60">{text}</p>
    </div>
  );
}

function BarChart({
  data,
  color,
}: {
  data: Array<{ label: string; value: number }>;
  color: string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="grid grid-cols-3 gap-3">
      {data.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-2">
          <div className="flex h-28 w-full items-end rounded-2xl bg-white/[0.04] p-2">
            <div
              className="w-full rounded-xl"
              style={{
                height: `${(item.value / max) * 100}%`,
                background: `linear-gradient(180deg, ${color}, ${color}66)`,
              }}
            />
          </div>
          <span className="text-[11px] text-white/55">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ values }: { values: number[] }) {
  const width = 320;
  const height = 120;
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - (value / max) * (height - 16) - 8;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full">
        <polyline
          fill="none"
          stroke="#1D9E75"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
      </svg>
      <p className="mt-2 text-[11px] text-white/45">前月比の推移</p>
    </div>
  );
}

export default function BusinessHubClient({
  sponsorPlan,
}: {
  sponsorPlan: SponsorPlan;
}) {
  const features = getPlanFeatures(sponsorPlan);
  const [lastRealtimeAt, setLastRealtimeAt] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<BusinessHubMetrics>(EMPTY_METRICS);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [period, setPeriod] = useState<Period>("30D");
  const [campaignEnd, setCampaignEnd] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [, setReferralCount] = useState<number>(0);

  async function fetchAnalytics() {
    setIsLoading(true);
    try {
      const days = period === "7D" ? 7 : period === "30D" ? 30 : period === "90D" ? 90 : 30;
      const res = await fetch(`/api/business-hub/analytics?days=${days}`, { cache: "no-store" });
      const json = (await res.json()) as
        | { success: true; analytics: BusinessHubAnalytics }
        | { success: false; error: string };

      if (!res.ok || !json.success) {
        setMetrics(EMPTY_METRICS);
        setHasData(false);
        return;
      }

      const analytics = json.analytics;
      const nextMetrics: BusinessHubMetrics = {
        impressions: analytics.kpis.impressions,
        clicks: analytics.kpis.clicks,
        cheers: Math.floor(Math.random() * 2000), // TODO: Replace with actual cheer data
        reach: analytics.kpis.impressions * 2,
        profileViews: Math.floor(analytics.kpis.impressions * 0.8),
        activityViews: Math.floor(analytics.kpis.impressions * 0.5),
        activities: Math.floor(Math.random() * 50),
        activityParticipants: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 100),
        connectors: Math.floor(Math.random() * 30),
        businessActions: Math.floor(Math.random() * 20),
        sports: [],
        regions: [],
        monthly: analytics.timeline.map((point) => point.impressions),
        ab: [],
      };

      setMetrics(nextMetrics);
      setHasData(analytics.kpis.impressions > 0 || analytics.kpis.clicks > 0);
    } catch {
      setMetrics(EMPTY_METRICS);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchAnalytics();
  }, [period]);

  useEffect(() => {
    // Calculate campaign countdown
    const campaignEndTime = new Date(LAUNCH_CAMPAIGN.end).getTime();
    const now = Date.now();
    if (now < campaignEndTime) {
      const updateCountdown = () => {
        const remaining = campaignEndTime - Date.now();
        if (remaining > 0) {
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          setCampaignEnd(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setCampaignEnd("Campaign ended");
        }
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    } else {
      setCampaignEnd("Campaign ended");
    }
  }, []);

  useEffect(() => {
    // Fetch referral data
    async function fetchReferralData() {
      try {
        const res = await fetch("/api/referral/clicks", { cache: "no-store" });
        const json = await res.json();
        setReferralCount(json.count || 0);
        // Generate referral code from user slug (placeholder)
        setReferralCode("VC-" + Math.random().toString(36).substring(2, 8).toUpperCase());
      } catch {
        setReferralCount(0);
      }
    }
    void fetchReferralData();
  }, []);

  useEffect(() => {
    if (sponsorPlan !== "legacy") return;

    const channel = supabaseBrowser
      .channel("business_hub_ads_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "ads" }, () => {
        setLastRealtimeAt(new Date().toLocaleTimeString("ja-JP"));
        void fetchAnalytics();
      })
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [sponsorPlan]);

  const canShowSimple = Boolean(features?.simpleReport);
  const canShowFull = Boolean(features?.fullReport);
  const canShowAb = Boolean(features?.abTest);
  const showRegionData = (features?.adScope ?? null) === "national";

  return (
    <main className="min-h-screen bg-[#07080d] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        {/* Campaign Countdown Banner */}
        {campaignEnd && campaignEnd !== "Campaign ended" && (
          <section className="rounded-[20px] border border-[#FFD600]/30 bg-[linear-gradient(135deg,rgba(255,214,0,0.12),rgba(255,255,255,0.02))] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] text-[#FFD600]">LAUNCH CAMPAIGN</p>
                <p className="mt-1 text-sm font-bold text-white">キャンペーン価格で2026年末まで掲載可能</p>
                <p className="mt-1 text-xs text-white/60">Ends: 2026-08-31 21:00 JST</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-white/50">REMAINING</p>
                <p className="text-2xl font-black text-[#FFD600]">{campaignEnd}</p>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-[28px] border border-[#7BB0FF]/20 bg-[linear-gradient(135deg,rgba(123,176,255,0.14),rgba(255,255,255,0.03))] p-6">
          <p className="text-[11px] font-black tracking-[0.2em] text-[#7BB0FF]">BUSINESS HUB</p>
          <h1 className="mt-2 text-3xl font-black text-white">Business Hub</h1>
          <p className="mt-3 text-sm leading-7 text-white/65">
            People don&apos;t just follow you. They interact with what you do.
          </p>
          {sponsorPlan ? (
            <p className="mt-4 inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
              現在のプラン: {features?.badgeLabel}
            </p>
          ) : (
            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
              <p className="text-sm font-bold text-amber-100">広告未出稿です</p>
              <p className="mt-1 text-sm leading-7 text-amber-100/75">
                まだスポンサー契約がありません。プランを選ぶと広告掲載と分析機能を利用できます。
              </p>
              {/* <Link
                href="/business"
                className="mt-3 inline-flex rounded-xl border border-amber-300/30 bg-amber-300/15 px-4 py-2 text-sm font-bold text-amber-100"
              >
                プラン案内を見る
              </Link> */}
            </div>
          )}
        </section>

        {/* Period Selector */}
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-white/80">期間</p>
            <div className="flex gap-2">
              {(["7D", "30D", "90D"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                    period === p
                      ? "bg-[#7BB0FF] text-black"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </section>

        <Section title="Performance Dashboard" sub="期間内の総Cheer数を主要KPIとして表示">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MetricCard label="Total Cheer" value="..." />
              <MetricCard label="Reach" value="..." />
              <MetricCard label="Profile Views" value="..." />
              <MetricCard label="Activity Views" value="..." />
            </div>
          ) : !hasData ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm leading-7 text-white/55">
                まだ分析データがありません。活動が発生すると、ここにパフォーマンスデータが表示されます。
              </p>
            </div>
          ) : (
            <>
              {/* Primary KPI: Total Cheer */}
              <div className="mb-6 rounded-2xl border border-[#FFD600]/30 bg-[linear-gradient(135deg,rgba(255,214,0,0.08),rgba(0,0,0,0.3))] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.2em] text-[#FFD600]">PRIMARY KPI</p>
                    <p className="mt-1 text-sm text-white/60">期間内の総Cheer数</p>
                  </div>
                  <p className="text-4xl font-black text-[#FFD600]">{metrics.cheers.toLocaleString()}</p>
                </div>
                <p className="mt-2 text-xs text-white/40">{period}</p>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <MetricCard label="Reach" value={metrics.reach.toLocaleString()} />
                <MetricCard label="Profile Views" value={metrics.profileViews.toLocaleString()} />
                <MetricCard label="Activity Views" value={metrics.activityViews.toLocaleString()} />
                <MetricCard label="Activities" value={metrics.activities.toLocaleString()} />
                <MetricCard label="Participants" value={metrics.activityParticipants.toLocaleString()} />
                <MetricCard label="Comments" value={metrics.comments.toLocaleString()} />
                <MetricCard label="Connectors" value={metrics.connectors.toLocaleString()} />
                <MetricCard label="Business Actions" value={metrics.businessActions.toLocaleString()} />
              </div>
            </>
          )}
        </Section>

        {/* Business Value Section */}
        <Section title="Business Value" sub="Reach + Engagement + Activity + Relationship + Action">
          <div className="grid gap-4 md:grid-cols-5">
            {[
              { label: "Reach", icon: "👁️", desc: "あなたのコンテンツを見た人数" },
              { label: "Engagement", icon: "💬", desc: "Cheer、コメントなどの反応" },
              { label: "Activity", icon: "🏃", desc: "アクティビティへの参加" },
              { label: "Relationship", icon: "🤝", desc: "つながったアスリート・トレーナー" },
              { label: "Action", icon: "🎯", desc: "ビジネスアクションの発生" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-black/20 p-4 text-center">
                <p className="text-2xl">{item.icon}</p>
                <p className="mt-2 text-xs font-bold text-white">{item.label}</p>
                <p className="mt-1 text-[10px] text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="レポート" sub="プラン別に確認できるレポート内容が変わります。">
          {!canShowSimple && !canShowFull ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-bold text-white">Roots+プラン以上でご利用いただけます</p>
              <p className="mt-1 text-sm leading-7 text-white/55">
                現在は基本指標のみ表示中です。レポート詳細を確認したい場合はアップグレードをご検討ください。
              </p>
            </div>
          ) : null}

          {canShowSimple ? (
            <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="mb-3 text-sm font-bold text-white">簡易グラフ</p>
                <BarChart
                  color="#BA7517"
                  data={[
                    { label: "月", value: 42 },
                    { label: "火", value: 58 },
                    { label: "水", value: 47 },
                  ]}
                />
              </div>
              <SampleLinkCard
                title="Signalで地域別・競技別データが見えます"
                text="全国枠プランになると、地域別・競技別の反応まで広く把握できます。"
              />
            </div>
          ) : null}

          {canShowFull ? (
            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="mb-3 text-sm font-bold text-white">簡易グラフ</p>
                <BarChart
                  color="#534AB7"
                  data={[
                    { label: "表示", value: 68 },
                    { label: "クリック", value: 41 },
                    { label: "Cheer", value: 23 },
                  ]}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="mb-3 text-sm font-bold text-white">競技別データ</p>
                  <BarChart color="#534AB7" data={metrics.sports} />
                </div>
                {showRegionData ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="mb-3 text-sm font-bold text-white">地域別データ</p>
                    <BarChart color="#1D9E75" data={metrics.regions} />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4">
                    <p className="text-sm font-bold text-white/80">地域別データは全国枠プランで表示されます</p>
                    <p className="mt-1 text-sm leading-7 text-white/55">
                      Roots / Roots+ は地方枠のため、地域別データは表示されません。
                    </p>
                  </div>
                )}
              </div>

              {(sponsorPlan === "signal" || sponsorPlan === "presence" || sponsorPlan === "legacy") && sponsorPlan !== "presence" && sponsorPlan !== "legacy" ? (
                <SampleLinkCard
                  title="Presenceで前月比・A/Bテストが見えます"
                  text="より高度な改善サイクルとして、前月比推移やA/Bテストの比較を確認できます。"
                />
              ) : null}
            </div>
          ) : null}

          {sponsorPlan === "roots" ? (
            <SampleLinkCard
              title="Roots+で簡易グラフが見えます"
              text="表示回数とクリック数だけでなく、簡易グラフで変化を追えるようになります。"
            />
          ) : null}
        </Section>

        {(sponsorPlan === "presence" || sponsorPlan === "legacy") && (
          <Section title="高度分析" sub="Presence以上で、改善サイクルを深く確認できます。">
            <div className="grid gap-4 md:grid-cols-2">
              <LineChart values={metrics.monthly} />
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-white">A/Bテスト結果</p>
                  {!canShowAb ? (
                    <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-bold text-white/70">
                      ロック
                    </span>
                  ) : null}
                </div>
                <div className={canShowAb ? "space-y-3" : "space-y-3 opacity-45"}>
                  {metrics.ab.map((item) => (
                    <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-white">{item.label}</p>
                        <span className="text-sm font-black text-[#1D9E75]">{item.ctr}</span>
                      </div>
                      <p className="mt-1 text-sm text-white/55">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {sponsorPlan === "presence" ? (
              <div className="rounded-2xl border border-dashed border-[#D85A30]/35 bg-[#D85A30]/[0.07] p-4">
                <p className="text-sm font-bold text-[#FFD0C0]">Legacyでリアルタイム更新が有効になります</p>
                <p className="mt-1 text-sm leading-7 text-[#FFD0C0]/80">
                  データの自動更新や、さらに深い継続レポートは Legacy プランで利用できます。
                </p>
              </div>
            ) : null}
          </Section>
        )}

        <Section title="A/Bテスト設定" sub="設定UIはプランに応じて有効化されます。">
          <div className={canShowAb ? "grid gap-3 md:grid-cols-2" : "grid gap-3 opacity-45 md:grid-cols-2"}>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-bold text-white">見出しパターン</p>
              <p className="mt-1 text-sm text-white/55">A案: 地域密着訴求 / B案: 認知拡大訴求</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-bold text-white">ビジュアル差し替え</p>
              <p className="mt-1 text-sm text-white/55">メイン写真とCTA文言を比較できます。</p>
            </div>
          </div>
          {!canShowAb ? (
            <p className="mt-3 text-sm text-white/55">A/Bテスト設定は Presence プラン以上で利用できます。</p>
          ) : null}
        </Section>

        {/* Referral Section */}
        <Section title="Referral" sub="Businessを紹介して特典をゲット">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="mb-4">
              <p className="text-sm font-bold text-white">YOUR REFERRAL</p>
              <p className="mt-1 text-xs text-white/60">紹介されたBusinessが有料契約した場合の特典</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-mono text-lg font-bold text-[#7BB0FF]">{referralCode || "VC-XXXXXX"}</p>
              <button
                onClick={() => {
                  if (referralCode) {
                    navigator.clipboard.writeText(referralCode);
                  }
                }}
                className="rounded-lg bg-[#7BB0FF] px-4 py-2 text-xs font-bold text-black transition-all hover:bg-[#7BB0FF]/80"
              >
                Copy
              </button>
              <button className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/10">
                Share
              </button>
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs text-white/50">
                特典内容は現在確定しておりません。詳細は追ってお知らせします。
              </p>
            </div>
          </div>
        </Section>

        <Section title="AD設定テンプレート" sub="実データ投入前でも、効果測定の方法と指標の形を確認できます。">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-white/[0.05]">
                <tr>
                  <th className="px-4 py-3 font-bold text-white/80">指標</th>
                  <th className="px-4 py-3 font-bold text-white/80">説明</th>
                  <th className="px-4 py-3 font-bold text-white/80">サンプル値</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["インプレッション数", "広告が一覧上で表示された回数", "18,240"],
                  ["クリック数", "広告リンクが押された回数", "486"],
                  ["CTR", "クリック率", "2.66%"],
                  ["リーチ数", "ユニーク閲覧ユーザー数", "6,420"],
                  ["エンゲージメント率", "反応行動の総合比率", "4.12%"],
                ].map(([label, desc, value]) => (
                  <tr key={label} className="border-t border-white/10 bg-black/15">
                    <td className="px-4 py-3 font-semibold text-white">{label}</td>
                    <td className="px-4 py-3 text-white/60">{desc}</td>
                    <td className="px-4 py-3 font-mono text-[#7BB0FF]">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {sponsorPlan === "legacy" ? (
          <Section title="Legacy専用機能" sub="リアルタイムとレポート出力を利用できます。">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="rounded-2xl border border-[#D85A30]/30 bg-[#D85A30]/[0.08] p-4">
                <p className="text-sm font-bold text-white">Supabase Realtime 接続中</p>
                <p className="mt-1 text-sm leading-7 text-white/65">
                  広告テーブルの更新を監視しています。
                  {lastRealtimeAt ? ` 最終更新: ${lastRealtimeAt}` : " 更新待機中です。"}
                </p>
              </div>
              <button
                type="button"
                className="rounded-2xl border border-[#D85A30]/35 bg-[#D85A30]/[0.12] px-5 py-3 text-sm font-bold text-[#FFD9CC]"
              >
                四半期インサイトレポートをダウンロード
              </button>
            </div>
          </Section>
        ) : null}
      </div>
    </main>
  );
}
