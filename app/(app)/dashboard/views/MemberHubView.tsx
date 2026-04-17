"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import { HubAdPanel } from "@/app/(app)/dashboard/components/HubAdPanel";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { MemberHubSummary } from "@/lib/supabase/member-hub";
import type { AdItem } from "@/lib/ads-shared";
import type { CollectionCardItem } from "@/components/collections/CollectionCarousel";

const numberFormatter = new Intl.NumberFormat("ja-JP");

const emptySummary: MemberHubSummary = {
  activity: { items: [] },
  support: { totalCheersSent: 0, users: [] },
  rewards: { earned: [], pending: [] },
  referral: { invitedCount: 0, successCount: 0, nextGoal: 1, progressPercent: 0 },
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function loadMemberHub() {
  const response = await fetch("/api/member-hub/summary", { cache: "no-store" });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof json?.error === "string" ? json.error : "Member Hub の読み込みに失敗しました");
  }
  return (json.summary ?? emptySummary) as MemberHubSummary;
}

export function MembersHubView({
  profile,
  referralUrl,
  t,
  roleColor,
  setView,
  ads,
}: {
  profile: ProfileData;
  referralUrl: string;
  t: ThemeColors;
  roleColor: string;
  setView: (v: DashboardView) => void;
  ads: AdItem[];
}) {
  const [summary, setSummary] = useState<MemberHubSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [myHubCards, setMyHubCards] = useState<CollectionCardItem[]>([]);
  const [activeMyHubSlug, setActiveMyHubSlug] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const next = await loadMemberHub();
        if (active) setSummary(next);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Member Hub の読み込みに失敗しました");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    const refresh = () => {
      void load();
    };

    const channel = supabaseBrowser
      .channel(`member_hub_${profile.slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "discovery_events", filter: `viewer_slug=eq.${profile.slug}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "cheers", filter: `from_slug=eq.${profile.slug}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "member_hub_events", filter: `member_slug=eq.${profile.slug}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "member_reward_unlocks", filter: `member_slug=eq.${profile.slug}` }, refresh)
      .subscribe();

    return () => {
      active = false;
      supabaseBrowser.removeChannel(channel);
    };
  }, [profile.slug]);

  useEffect(() => {
    let active = true;
    fetch("/api/collect/list", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        const cards = (Array.isArray(json?.cards) ? json.cards : []) as CollectionCardItem[];
        const favorites = cards
          .filter((card) => card.role === "Athlete" || card.role === "Trainer")
          .slice(0, 5);
        setMyHubCards(favorites);
        setActiveMyHubSlug((prev) => {
          if (prev && favorites.some((card) => card.targetSlug === prev)) return prev;
          return favorites[0]?.targetSlug ?? null;
        });
      })
      .catch(() => {
        if (!active) return;
        setMyHubCards([]);
        setActiveMyHubSlug(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeMyHubCard = useMemo(
    () => myHubCards.find((card) => card.targetSlug === activeMyHubSlug) ?? myHubCards[0] ?? null,
    [activeMyHubSlug, myHubCards],
  );

  const progressLabel = useMemo(() => {
    return `${summary.referral.successCount}/${summary.referral.nextGoal}`;
  }, [summary.referral.nextGoal, summary.referral.successCount]);

  async function trackReferralAction(eventType: "referral_link_copied" | "referral_link_shared", label: string) {
    try {
      await fetch("/api/member-hub/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, label }),
      });
    } catch {
      // noop
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      await trackReferralAction("referral_link_copied", "紹介リンクをコピー");
    } catch {
      // noop
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader title="Members Hub" sub="活動・応援・紹介を可視化する" onBack={() => setView("home")} t={t} roleColor={roleColor} />

      <SectionCard t={t} accentColor={roleColor}>
        <SLabel text="My Hub" color={roleColor} />
        {myHubCards.length === 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            <p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.8 }}>
              推しの Athlete / Trainer を最大5人まで登録して、ここで切り替えてプロフィールを確認できます。
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setView("discovery")}
                style={{ padding: "9px 14px", borderRadius: 12, border: "none", background: roleColor, color: "#061018", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
              >
                Discoveryで探す
              </button>
              <button
                type="button"
                onClick={() => setView("collections")}
                style={{ padding: "9px 14px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
              >
                コレクションを見る
              </button>
            </div>
            <div style={{ padding: 16, borderRadius: 14, border: `1px dashed ${t.border}`, color: t.sub, fontSize: 12 }}>
              まだ推しが登録されていません。気になるプロフィールを「コレクト」すると、My Hub に表示されます。
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {myHubCards.map((card) => {
                const active = card.targetSlug === activeMyHubSlug;
                return (
                  <button
                    key={card.targetSlug}
                    type="button"
                    onClick={() => setActiveMyHubSlug(card.targetSlug)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: `1px solid ${active ? `${roleColor}55` : t.border}`,
                      background: active ? `${roleColor}14` : "rgba(255,255,255,0.04)",
                      color: active ? roleColor : t.sub,
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,0.08)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {card.avatarUrl ? <img src={card.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 11, fontWeight: 900 }}>{card.displayName.slice(0, 1)}</span>}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 900, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.displayName}</span>
                  </button>
                );
              })}
            </div>

            {activeMyHubCard ? (
              <div style={{ padding: 16, borderRadius: 18, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.025)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 54, height: 54, borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,0.08)", flexShrink: 0 }}>
                      {activeMyHubCard.avatarUrl ? <img src={activeMyHubCard.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeMyHubCard.displayName}</div>
                      <div style={{ marginTop: 2, fontSize: 11, color: t.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{activeMyHubCard.targetSlug} · {activeMyHubCard.role}</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: t.sub, lineHeight: 1.7 }}>{activeMyHubCard.bio ?? "プロフィール未設定"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <a
                      href={`/u/${activeMyHubCard.targetSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "9px 14px", borderRadius: 12, border: `1px solid ${roleColor}30`, background: `${roleColor}12`, color: roleColor, fontSize: 12, fontWeight: 800, textDecoration: "none" }}
                    >
                      公開プロフィールを開く
                    </a>
                    <button
                      type="button"
                      onClick={() => setView("collections")}
                      style={{ padding: "9px 14px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                    >
                      推しを編集
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </SectionCard>

      <SectionCard t={t} accentColor={roleColor}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <SLabel text="Members Focus" color={roleColor} />
            <h3 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: t.text }}>参加・応援・拡散を次の行動につなげる</h3>
            <p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.8 }}>
              閲覧、Cheer、紹介の履歴をまとめて見える化し、次にどの行動を伸ばすか判断しやすくします。
            </p>
          </div>
          <div style={{ minWidth: 220, padding: 16, borderRadius: 16, border: `1px solid ${roleColor}28`, background: `${roleColor}12` }}>
            <div style={{ fontSize: 10, color: t.sub, marginBottom: 6 }}>応援した総Cheer</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: t.text }}>{numberFormatter.format(summary.support.totalCheersSent)}</div>
          </div>
        </div>
      </SectionCard>

      <HubAdPanel ads={ads} t={t} />

      {loading ? (
        <SectionCard t={t}>
          <p style={{ margin: 0, fontSize: 12, color: t.sub }}>Member Hub を読み込み中...</p>
        </SectionCard>
      ) : error ? (
        <SectionCard t={t}>
          <p style={{ margin: 0, fontSize: 12, color: "#ff9b9b" }}>{error}</p>
        </SectionCard>
      ) : (
        <>
          <SectionCard t={t} accentColor={roleColor}>
            <SLabel text="Activity" color={roleColor} />
            <div style={{ display: "grid", gap: 10 }}>
              {summary.activity.items.length === 0 ? (
                <div style={{ padding: 18, borderRadius: 14, border: `1px dashed ${t.border}`, color: t.sub, fontSize: 12 }}>
                  まだ活動履歴がありません。Discovery でプロフィールを見たり、Cheer や紹介を行うと時系列で蓄積されます。
                </div>
              ) : summary.activity.items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: 14, borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.025)" }}
                >
                  <div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ padding: "4px 8px", borderRadius: 999, background: item.type === "cheer" ? "rgba(255,214,0,0.12)" : item.type === "event" ? `${roleColor}16` : "rgba(255,255,255,0.05)", color: item.type === "cheer" ? "#FFD600" : item.type === "event" ? roleColor : t.sub, fontSize: 10, fontWeight: 800 }}>
                        {item.type === "cheer" ? "CHEER" : item.type === "event" ? "EVENT" : "VIEW"}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>{item.title}</div>
                    <div style={{ marginTop: 4, fontSize: 11, color: t.sub }}>{item.subtitle}</div>
                  </div>
                  <div style={{ fontSize: 10, color: t.sub, whiteSpace: "nowrap" }}>{formatDateTime(item.createdAt)}</div>
                </motion.div>
              ))}
            </div>
          </SectionCard>

          <SectionCard t={t}>
            <SLabel text="Support" color="#FFD600" />
            <div style={{ display: "grid", gap: 10 }}>
              {summary.support.users.length === 0 ? (
                <div style={{ padding: 18, borderRadius: 14, border: `1px dashed ${t.border}`, color: t.sub, fontSize: 12 }}>
                  まだ応援したユーザーがいません。Cheer を送るとここに一覧化されます。
                </div>
              ) : summary.support.users.map((user) => (
                <div key={user.slug} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.025)" }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", background: "rgba(255,214,0,0.12)", border: "1px solid rgba(255,214,0,0.28)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFD600", fontWeight: 900, flexShrink: 0 }}>
                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.displayName.slice(0, 1)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>{user.displayName}</div>
                    <div style={{ marginTop: 3, fontSize: 11, color: t.sub }}>{user.role} · 最終応援 {formatDateTime(user.lastCheeredAt)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: t.sub }}>Cheer数</div>
                    <div style={{ marginTop: 4, fontSize: 18, fontWeight: 900, color: "#FFD600" }}>{numberFormatter.format(user.cheerCount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard t={t}>
            <SLabel text="Rewards" color={roleColor} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {[...summary.rewards.earned, ...summary.rewards.pending].map((reward) => {
                const percent = Math.min((reward.progress / Math.max(reward.requiredCount, 1)) * 100, 100);
                return (
                  <div key={reward.id} style={{ padding: 16, borderRadius: 16, border: `1px solid ${reward.unlocked ? `${reward.accentColor}45` : t.border}`, background: reward.unlocked ? `linear-gradient(145deg, ${reward.accentColor}14, rgba(255,255,255,0.03))` : "rgba(255,255,255,0.025)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: t.text }}>{reward.title}</div>
                      <span style={{ padding: "4px 8px", borderRadius: 999, background: reward.unlocked ? `${reward.accentColor}16` : "rgba(255,255,255,0.05)", color: reward.unlocked ? reward.accentColor : t.sub, fontSize: 10, fontWeight: 800 }}>
                        {reward.unlocked ? "UNLOCKED" : "LOCKED"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: t.sub, lineHeight: 1.7 }}>{reward.description}</div>
                    <div style={{ marginTop: 12, fontSize: 10, color: reward.accentColor }}>{reward.conditionLabel}</div>
                    <div style={{ marginTop: 10, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ width: `${percent}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${reward.accentColor}, ${reward.accentColor}88)` }} />
                    </div>
                    <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 10, color: t.sub }}>
                      <span>{reward.progress}/{reward.requiredCount}</span>
                      <span>{reward.unlocked && reward.unlockedAt ? `解放 ${formatDateTime(reward.unlockedAt)}` : "条件未達成"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard t={t} accentColor="#FFD600">
            <SLabel text="Referral" color="#FFD600" />
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ fontSize: 10, color: t.sub }}>招待アクション数</div>
                  <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900, color: t.text }}>{numberFormatter.format(summary.referral.invitedCount)}</div>
                </div>
                <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ fontSize: 10, color: t.sub }}>紹介成功数</div>
                  <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900, color: "#FFD600" }}>{numberFormatter.format(summary.referral.successCount)}</div>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, fontSize: 11, color: t.sub }}>
                  <span>次の紹介目標</span>
                  <span style={{ color: "#FFD600", fontFamily: "monospace" }}>{progressLabel}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ width: `${summary.referral.progressPercent}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#FFD600,#FFD60088)" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <span style={{ flex: 1, fontSize: 11, fontFamily: "monospace", color: t.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{referralUrl}</span>
                <button type="button" onClick={() => void handleCopy()} style={{ padding: "8px 12px", borderRadius: 10, border: "none", background: "rgba(255,214,0,0.12)", color: "#FFD600", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void trackReferralAction("referral_link_shared", "Member Hub から紹介リンクを共有");
                    setView("referral");
                  }}
                  style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                >
                  Share
                </button>
              </div>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}

export const MemberHubView = MembersHubView;
