"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { getPlanFeatures } from "@/features/business/plan-features";

type SponsorPlan = "roots" | "roots_plus" | "signal" | "presence" | "legacy" | null;

const baseMetrics = {
  impressions: 18240,
  clicks: 486,
  cheers: 39,
  sports: [
    { label: "サッカー", value: 42 },
    { label: "バスケ", value: 28 },
    { label: "陸上", value: 18 },
  ],
  regions: [
    { label: "関東", value: 52 },
    { label: "関西", value: 27 },
    { label: "九州", value: 21 },
  ],
  monthly: [72, 84, 96, 88, 104, 118],
  ab: [
    { label: "A案", ctr: "2.8%", note: "説明重視" },
    { label: "B案", ctr: "3.4%", note: "写真重視" },
  ],
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
    <Link
      href="/business"
      className="block rounded-2xl border border-dashed border-[#7BB0FF]/30 bg-[#7BB0FF]/[0.06] p-4 transition hover:border-[#7BB0FF]/50 hover:bg-[#7BB0FF]/[0.09]"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[10px] font-bold text-white/80">
          サンプル
        </span>
        <p className="text-sm font-bold text-white">{title}</p>
      </div>
      <p className="text-sm leading-7 text-white/60">{text}</p>
    </Link>
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
  const [metrics, setMetrics] = useState(baseMetrics);

  useEffect(() => {
    if (sponsorPlan !== "legacy") return;

    const channel = supabaseBrowser
      .channel("business_hub_ads_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "ads" }, () => {
        setLastRealtimeAt(new Date().toLocaleTimeString("ja-JP"));
        setMetrics((prev) => ({
          ...prev,
          impressions: prev.impressions + 12,
          clicks: prev.clicks + 1,
          cheers: prev.cheers + 1,
        }));
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
        <section className="rounded-[28px] border border-[#7BB0FF]/20 bg-[linear-gradient(135deg,rgba(123,176,255,0.14),rgba(255,255,255,0.03))] p-6">
          <p className="text-[11px] font-black tracking-[0.2em] text-[#7BB0FF]">BUSINESS HUB</p>
          <h1 className="mt-2 text-3xl font-black text-white">スポンサー運用ダッシュボード</h1>
          <p className="mt-3 text-sm leading-7 text-white/65">
            すべてのビジネスアカウントが利用できます。契約プランに応じて、見える分析の深さと操作可能な機能が変わります。
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
              <Link
                href="/business"
                className="mt-3 inline-flex rounded-xl border border-amber-300/30 bg-amber-300/15 px-4 py-2 text-sm font-bold text-amber-100"
              >
                プラン案内を見る
              </Link>
            </div>
          )}
        </section>

        <Section title="基本指標" sub="現在の広告運用サマリーです。">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <MetricCard label="表示回数" value={metrics.impressions.toLocaleString()} />
            <MetricCard label="クリック数" value={metrics.clicks.toLocaleString()} />
            {sponsorPlan === "signal" || sponsorPlan === "presence" || sponsorPlan === "legacy" ? (
              <MetricCard label="Cheer連動数" value={metrics.cheers.toLocaleString()} />
            ) : null}
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
