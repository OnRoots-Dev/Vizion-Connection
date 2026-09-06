"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { ThemeColors } from "../DashboardClient";
import type { CareerProfileRow } from "@/lib/supabase/career-profiles";
import { FoundingMemberBadge, EarlyPartnerBadge } from "@/components/ui/FoundingMemberBadge";
import { ViewHeader } from "@/app/(app)/dashboard/components/ui";
import CareerWizardModal from "@/components/career-wizard/CareerWizardModal";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import Image from "next/image";
import { CareerShowcase } from "@/components/career/CareerShowcase";
import { User, Briefcase, ExternalLink } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  Athlete: "ATHLETE", Trainer: "TRAINER", Crew: "CREW", Business: "BUSINESS", Admin: "ADMIN",
};

const ROLE_GRADIENT: Record<string, string> = {
  Athlete: "#2D0000", Trainer: "#082a06", Crew: "#1A0F00", Business: "#000A24",
};

const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const IG_PATH = "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z";
const TK_PATH = "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z";

type TabId = "profile" | "career";

function hasProfileSignal(profile: ProfileData) {
  return Boolean(profile.bio?.trim() || profile.region || profile.prefecture || profile.sport || profile.sportsCategory || profile.stance || profile.avatarUrl || profile.profileImageUrl || profile.claim?.trim());
}

function hasCareerSignal(careerProfile?: CareerProfileRow | null) {
  return Boolean(careerProfile?.tagline || careerProfile?.bio_career || careerProfile?.stats?.length || careerProfile?.episodes?.length || careerProfile?.skills?.length);
}

export function DashboardProfileView({
  profile,
  t,
  roleColor,
  onBack,
  careerProfile,
  onProfileRefresh,
  onCareerRefresh,
}: {
  profile: ProfileData;
  t: ThemeColors;
  roleColor: string;
  onBack: () => void;
  careerProfile?: CareerProfileRow | null;
  onProfileRefresh?: () => Promise<unknown>;
  onCareerRefresh?: () => Promise<unknown>;
}) {
  const joinedAt = new Date(profile.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
  const bg1 = ROLE_GRADIENT[profile.role] ?? "#1a1a2e";
  const initials = profile.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const serialDisplay = profile.serialId ? String(profile.serialId).padStart(4, "0") : null;
  const needsInitialRegistration = !hasProfileSignal(profile) && !hasCareerSignal(careerProfile);
  const canPublish = profile.role !== "Admin";
  const snsLinks = [
    { label: "X", href: profile.xUrl, path: X_PATH },
    { label: "Instagram", href: profile.instagram, path: IG_PATH },
    { label: "TikTok", href: profile.tiktok, path: TK_PATH },
  ].filter((s) => s.href);

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationRefreshing, setRegistrationRefreshing] = useState(false);
  const [isPublic, setIsPublic] = useState(canPublish ? profile.isPublic !== false : false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [visibilityMessage, setVisibilityMessage] = useState<string | null>(null);
  const [togetherCount, setTogetherCount] = useState(0);

  // Profile の TOGETHER カウント（activity_participants accepted の動的集計・読み取り専用）
  useEffect(() => {
    let cancelled = false;
    fetch("/api/activities/together-count", { method: "GET" })
      .then((res) => res.json().catch(() => ({})))
      .then((json) => {
        if (!cancelled && typeof json?.count === "number") setTogetherCount(json.count);
      })
      .catch(() => {
        if (!cancelled) setTogetherCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);


  useCareerWizard();

  const profileFacts = [
    { label: "Role", value: ROLE_LABEL[profile.role] ?? profile.role, color: roleColor },
    { label: "Cheer", value: String(profile.cheerCount ?? 0), color: "#FFD600" },
    { label: "Together", value: String(togetherCount), color: roleColor },
    profile.sport ? { label: "Sport / Job", value: profile.sport } : null,
    profile.region ? { label: "Area", value: profile.region } : null,
    profile.prefecture ? { label: "Prefecture", value: profile.prefecture } : null,
    { label: "Joined", value: joinedAt },
  ].filter(Boolean) as Array<{ label: string; value: string; color?: string }>;

  async function handleCompleted() {
    setRegistrationRefreshing(true);
    await Promise.allSettled([
      onProfileRefresh ? onProfileRefresh() : Promise.resolve(),
      onCareerRefresh ? onCareerRefresh() : Promise.resolve(),
    ]);
    setRegistrationRefreshing(false);
    setRegistrationOpen(false);
  }


  async function handleVisibilityToggle() {
    const nextValue = !isPublic;
    setSavingVisibility(true);
    setVisibilityMessage(null);
    try {
      const response = await fetch("/api/profile/visibility", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: nextValue }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof json?.error === "string" ? json.error : "公開設定の更新に失敗しました");
      }
      setIsPublic(nextValue);
      if (onProfileRefresh) {
        await onProfileRefresh();
      }
      setVisibilityMessage(nextValue ? "プロフィールを公開しました" : "プロフィールを非公開にしました");
    } catch (error) {
      setVisibilityMessage(error instanceof Error ? error.message : "公開設定の更新に失敗しました");
    } finally {
      setSavingVisibility(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader title="Profile" sub="プロフィール" onBack={onBack} t={t} roleColor={roleColor} />

      <AnimatePresence>
        {registrationOpen ? (
          <CareerWizardModal
            onClose={() => setRegistrationOpen(false)}
            onCompleted={() => { void handleCompleted(); }}
          />
        ) : null}
      </AnimatePresence>

      {/* Hero Section */}
      <section style={{ 
        overflow: "visible", 
        borderRadius: 24, 
        border: `1px solid ${t.border}`, 
        background: t.surface, 
        position: "relative",
        boxShadow: `0 0 40px ${roleColor}15`
      }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 24 }}>
          <div style={{ position: "relative", minHeight: "clamp(220px, 28vw, 320px)" }}>
            {profile.profileImageUrl ? (
              <Image
                src={profile.profileImageUrl}
                alt=""
                fill
                sizes="(min-width: 1120px) 900px, 100vw"
                className="absolute inset-0 object-cover object-center opacity-45"
              />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${bg1} 0%, ${t.bg} 100%)` }} />
            )}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${t.bg} 0%, rgba(0,0,0,0.16) 52%, rgba(0,0,0,0.04) 100%)` }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${bg1}66 0%, transparent 58%)` }} />
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 2, minHeight: "clamp(220px, 28vw, 320px)", padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {profile.isFoundingMember ? <FoundingMemberBadge /> : <EarlyPartnerBadge />}
            </div>
            <a 
              href={`/u/${profile.slug}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 14px", 
                borderRadius: 12, 
                border: `1px solid ${roleColor}30`, 
                background: `${roleColor}12`, 
                color: roleColor, 
                textDecoration: "none", 
                fontSize: 11, 
                fontWeight: 900,
                transition: "all 0.2s ease"
              }}
            >
              <ExternalLink size={14} />
              公開プロフィールを見る
            </a>
          </div>

          <p style={{ margin: 0, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.28em", textTransform: "uppercase", color: `${roleColor}dd` }}>
            {ROLE_LABEL[profile.role] ?? profile.role}{profile.sport ? ` · ${profile.sport}` : ""}
          </p>
          <h2 style={{ margin: "8px 0 0", fontSize: "clamp(26px,4.6vw,40px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.03em", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {profile.displayName}
          </h2>
          <p style={{ margin: "8px 0 0", fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.7)" }}>
            @{profile.slug}{profile.region ? ` · ${profile.region}` : ""}
          </p>
          {serialDisplay ? (
            <p style={{ margin: "10px 0 0", fontFamily: "monospace", fontWeight: 900, letterSpacing: "0.22em", fontSize: 18, lineHeight: 1, color: "rgba(180, 180, 190, 0.9)", textShadow: `0 0 12px rgba(255,255,255,0.08), 0 0 28px rgba(0,0,0,0.4)` }}>
              {serialDisplay}
            </p>
          ) : null}

          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginTop: 18, flexWrap: "wrap" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", border: `2px solid ${roleColor}`, background: `linear-gradient(145deg, ${bg1}, #111)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  width={60}
                  height={60}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span style={{ color: roleColor, fontFamily: "monospace", fontSize: 22, fontWeight: 900 }}>{initials}</span>
              )}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,210,0,0.52)" }}>Cheer</p>
              <p style={{ margin: "4px 0 0", fontSize: 32, fontWeight: 900, lineHeight: 1, fontFamily: "monospace", color: "#FFD600" }}>{(profile.cheerCount ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)" }}>Points</p>
              <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 900, lineHeight: 1, fontFamily: "monospace", color: "rgba(255,255,255,0.85)" }}>{(profile.points ?? 0).toLocaleString()}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginLeft: "auto", alignItems: "flex-end", minWidth: 280 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
                {snsLinks.length > 0 ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {snsLinks.map((s) => (
                      <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `${roleColor}18`, border: `1px solid ${roleColor}28`, color: roleColor }}>
                        <svg viewBox="0 0 24 24" width={13} height={13} fill="currentColor"><path d={s.path} /></svg>
                      </a>
                    ))}
                  </div>
                ) : null}

                {canPublish ? (
                  <button
                    type="button"
                    onClick={() => void handleVisibilityToggle()}
                    disabled={savingVisibility}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 12px",
                      borderRadius: 999,
                      border: `1px solid ${isPublic ? `${roleColor}32` : "rgba(255,80,80,0.24)"}`,
                      background: isPublic ? `${roleColor}12` : "rgba(255,80,80,0.1)",
                      color: isPublic ? roleColor : "#ff9b9b",
                      fontSize: 11,
                      fontWeight: 900,
                      cursor: savingVisibility ? "wait" : "pointer",
                      opacity: savingVisibility ? 0.7 : 1,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        width: 26,
                        height: 14,
                        borderRadius: 999,
                        background: isPublic ? roleColor : "rgba(255,255,255,0.18)",
                        transition: "background 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: 2,
                          left: isPublic ? 14 : 2,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#fff",
                          transition: "left 0.2s",
                        }}
                      />
                    </span>
                    {savingVisibility ? "更新中..." : isPublic ? "公開中" : "非公開"}
                  </button>
                ) : null}
              </div>

              {visibilityMessage ? (
                <p style={{ margin: 0, fontSize: 10, color: visibilityMessage.includes("失敗") || visibilityMessage.includes("できません") ? "#ff9b9b" : "rgba(255,255,255,0.62)", textAlign: "right" }}>
                  {visibilityMessage}
                </p>
              ) : null}
            </div>
          </div>

          {profile.claim?.trim() ? (
            <div style={{ marginTop: 16, maxWidth: 620, borderRadius: 18, border: `1px solid ${roleColor}28`, background: `${roleColor}12`, padding: "14px 16px" }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, fontWeight: 800, color: "#fff" }}>&quot;{profile.claim.trim()}&quot;</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Tabs */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 0,
        padding: 6,
        borderRadius: 16,
        border: `1px solid ${t.border}`,
        background: t.surface
      }}>
        {[
          { id: "profile" as TabId, label: "Profile", icon: User },
          { id: "career" as TabId, label: "Career", icon: Briefcase },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                minHeight: 48,
                padding: "0 16px",
                borderRadius: 12,
                border: "none",
                background: active ? `${roleColor}16` : "transparent",
                color: active ? roleColor : "rgba(255,255,255,0.42)",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all 0.18s ease",
                boxShadow: active ? `inset 0 0 0 1px ${roleColor}24` : "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "profile" ? (
        <ProfileTabContent
          profile={profile}
          t={t}
          roleColor={roleColor}
          profileFacts={profileFacts}
          needsInitialRegistration={needsInitialRegistration}
          onOpenRegistration={() => setRegistrationOpen(true)}
        />
      ) : (
        <CareerTabContent
          careerProfile={careerProfile}
          t={t}
          roleColor={roleColor}
          needsInitialRegistration={needsInitialRegistration}
          onOpenRegistration={() => setRegistrationOpen(true)}
        />
      )}

      {needsInitialRegistration ? (
        <section style={{ borderRadius: 24, border: `1px solid ${roleColor}28`, background: `linear-gradient(145deg, ${roleColor}12, ${t.surface})`, padding: 22 }}>
          <p style={{ margin: 0, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase", color: roleColor }}>First Profile Setup</p>
          <h3 style={{ margin: "10px 0 8px", fontSize: 28, fontWeight: 900, color: t.text, lineHeight: 1.1 }}>まずはプロフィールとキャリアを登録する</h3>
          <p style={{ margin: 0, maxWidth: 720, fontSize: 13, color: t.sub, lineHeight: 1.9 }}>初回登録では、公開プロフィールに必要な基本情報とキャリア内容をまとめて登録します。完了後はこのページに項目ごとの内容が並びます。</p>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", marginTop: 16 }}>
            {["プロフィール情報", "画像・公開導線", "キャッチコピー", "実績・スキル"].map((label, index) => (
              <div key={label} style={{ padding: "14px 16px", borderRadius: 16, border: `1px solid ${t.border}`, background: t.surface }}>
                <p style={{ margin: "0 0 6px", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub }}>Step 0{index + 1}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: t.text }}>{label}</p>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setRegistrationOpen(true)} disabled={registrationRefreshing} style={{ marginTop: 18, padding: "14px 18px", borderRadius: 16, border: "none", background: roleColor, color: "#050508", fontSize: 13, fontWeight: 900, cursor: registrationRefreshing ? "wait" : "pointer" }}>
            {registrationRefreshing ? "更新中..." : "プロフィール・キャリアを登録"}
          </button>
        </section>
      ) : null}
    </div>
  );
}

// Profile Tab Content Component
function ProfileTabContent({
  profile,
  t,
  roleColor,
  profileFacts,
  needsInitialRegistration,
  onOpenRegistration,
}: {
  profile: ProfileData;
  t: ThemeColors;
  roleColor: string;
  profileFacts: Array<{ label: string; value: string; color?: string }>;
  needsInitialRegistration: boolean;
  onOpenRegistration: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <section style={{ padding: 18, borderRadius: 24, border: `1px solid ${t.border}`, background: t.surface }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Profile Signals</p>
            <h3 style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 900, color: t.text }}>基本プロフィール</h3>
          </div>
          <button
            type="button"
            onClick={onOpenRegistration}
            style={{ padding: "9px 12px", borderRadius: 12, border: `1px solid ${roleColor}28`, background: `${roleColor}10`, color: roleColor, fontSize: 11, fontWeight: 900, cursor: "pointer" }}
          >
            {needsInitialRegistration ? "初回登録を開く" : "プロフィール・キャリアを編集"}
          </button>
        </div>
        {profile.bio?.trim() ? (
          <div style={{ padding: "16px 18px", borderRadius: 18, border: `1px solid ${t.border}`, background: t.surface, marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 13, color: t.text, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{profile.bio}</p>
          </div>
        ) : (
          <div style={{ padding: "15px 16px", borderRadius: 16, border: `1px solid ${t.border}`, background: t.text === "#111111" ? "rgba(17,17,17,0.02)" : "rgba(255,255,255,0.02)", fontSize: 12, color: t.sub, lineHeight: 1.8, marginBottom: 14 }}>
            プロフィール紹介文はまだ設定されていません。
          </div>
        )}
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
          {profileFacts.map((fact) => (
            <div key={fact.label} style={{ borderRadius: 18, border: `1px solid ${t.border}`, background: t.surface, padding: "14px 16px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub }}>{fact.label}</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: fact.color ?? t.text, wordBreak: "break-word" }}>{fact.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Career Tab Content Component
function CareerTabContent({
  careerProfile,
  t,
  roleColor,
  needsInitialRegistration,
  onOpenRegistration,
}: {
  careerProfile?: CareerProfileRow | null;
  t: ThemeColors;
  roleColor: string;
  needsInitialRegistration: boolean;
  onOpenRegistration: () => void;
}) {
  const hasCareerSignal = Boolean(careerProfile?.tagline || careerProfile?.bio_career || careerProfile?.stats?.length || careerProfile?.episodes?.length || careerProfile?.skills?.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <section style={{ padding: 18, borderRadius: 24, border: `1px solid ${t.border}`, background: t.surface }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Career Profile</p>
            <h3 style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 900, color: t.text }}>プロフィール・キャリア登録内容</h3>
          </div>
          <button
            type="button"
            onClick={onOpenRegistration}
            style={{ padding: "9px 12px", borderRadius: 12, border: `1px solid ${roleColor}28`, background: `${roleColor}10`, color: roleColor, fontSize: 11, fontWeight: 900, cursor: "pointer" }}
          >
            {needsInitialRegistration ? "登録モーダルを開く" : "プロフィール・キャリアを編集"}
          </button>
        </div>
        {hasCareerSignal ? (
          <>
            {careerProfile?.tagline ? (
              <div style={{ borderRadius: 18, border: `1px solid ${roleColor}28`, background: `${roleColor}10`, padding: "14px 16px", fontSize: 14, fontWeight: 800, color: roleColor, marginBottom: 14 }}>
                {careerProfile.tagline}
              </div>
            ) : null}
            {careerProfile?.bio_career ? (
              <div style={{ padding: "16px 18px", borderRadius: 18, border: `1px solid ${t.border}`, background: t.surface, marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 13, color: t.text, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{careerProfile.bio_career}</p>
              </div>
            ) : null}
            <CareerShowcase
              roleColor={roleColor}
              palette={{ surface: t.surface, border: t.border, text: t.text, sub: t.sub, roleColor }}
              stats={careerProfile?.stats}
              episodes={careerProfile?.episodes}
              skills={careerProfile?.skills}
            />
          </>
        ) : (
          <div style={{ padding: "15px 16px", borderRadius: 16, border: `1px solid ${t.border}`, background: t.text === "#111111" ? "rgba(17,17,17,0.02)" : "rgba(255,255,255,0.02)", fontSize: 12, color: t.sub, lineHeight: 1.8 }}>
            キャリアの公開内容はまだ未登録です。キャッチコピー、実績、スキルから先に入力しておくと公開プロフィールが締まります。
          </div>
        )}
      </section>
    </div>
  );
}

