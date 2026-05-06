"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { ThemeColors, DashboardView } from "../DashboardClient";
import type { CareerProfileRow } from "@/lib/supabase/career-profiles";
import { FoundingMemberBadge, EarlyPartnerBadge } from "@/components/ui/FoundingMemberBadge";
import { ViewHeader } from "@/app/(app)/dashboard/components/ui";
import ScheduleClient from "@/app/schedule/ScheduleClient";
import { CATEGORY_CONFIG } from "@/types/schedule";
import type { Schedule } from "@/types/schedule";
import CareerWizardModal from "@/components/career-wizard/CareerWizardModal";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import ShareButtonClient from "@/components/profile/ShareButtonClient";
import Image from "next/image";

const ROLE_LABEL: Record<string, string> = {
  Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS", Admin: "ADMIN",
};

const ROLE_GRADIENT: Record<string, string> = {
  Athlete: "#2D0000", Trainer: "#001A0A", Members: "#1A0F00", Business: "#000A24",
};

const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const IG_PATH = "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z";
const TK_PATH = "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z";
const MOBILE_SECTION_OPTIONS = [
  { id: "overview", label: "Profile" },
  { id: "career", label: "Career" },
  { id: "schedule", label: "Schedule" },
  { id: "portfolio", label: "Portfolio" },
] as const;

type MobileSectionId = (typeof MOBILE_SECTION_OPTIONS)[number]["id"];

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
  setView,
  careerProfile,
  onProfileRefresh,
  onCareerRefresh,
}: {
  profile: ProfileData;
  t: ThemeColors;
  roleColor: string;
  onBack: () => void;
  setView?: (view: DashboardView) => void;
  careerProfile?: CareerProfileRow | null;
  onProfileRefresh?: () => Promise<unknown>;
  onCareerRefresh?: () => Promise<unknown>;
}) {
  const joinedAt = new Date(profile.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
  const bg1 = ROLE_GRADIENT[profile.role] ?? "#1a1a2e";
  const initials = profile.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const serialDisplay = profile.serialId ? `#${String(profile.serialId).padStart(4, "0")}` : null;
  const needsInitialRegistration = !hasProfileSignal(profile) && !hasCareerSignal(careerProfile);
  const canPublish = profile.role !== "Admin";
  const snsLinks = [
    { label: "X", href: profile.xUrl, path: X_PATH },
    { label: "Instagram", href: profile.instagram, path: IG_PATH },
    { label: "TikTok", href: profile.tiktok, path: TK_PATH },
  ].filter((s) => s.href);

  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationRefreshing, setRegistrationRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [monthSchedules, setMonthSchedules] = useState<Schedule[]>([]);
  const [monthSchedulesLoading, setMonthSchedulesLoading] = useState(true);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [mobileSection, setMobileSection] = useState<MobileSectionId>("overview");
  const publicProfileUrl = `https://vizion-connection.jp/u/${profile.slug}`;
  const referralUrl = `https://vizion-connection.jp/r/${profile.slug}`;
  const { initFromUser, initFromCareerProfile } = useCareerWizard();
  const [isPublic, setIsPublic] = useState(canPublish ? profile.isPublic !== false : false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [visibilityMessage, setVisibilityMessage] = useState<string | null>(null);

  const monthRange = useMemo(() => {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0),
    };
  }, []);

  useEffect(() => {
    const qs = new URLSearchParams({ start: monthRange.start.toISOString(), end: monthRange.end.toISOString() });
    setMonthSchedulesLoading(true);
    fetch(`/api/schedules/mine?${qs.toString()}`, { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        setMonthSchedules(r.ok && Array.isArray(data?.schedules) ? data.schedules : []);
      })
      .catch(() => setMonthSchedules([]))
      .finally(() => setMonthSchedulesLoading(false));
  }, [monthRange.end, monthRange.start, showCalendar]);

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  useEffect(() => {
    setIsPublic(canPublish ? profile.isPublic !== false : false);
  }, [profile.isPublic]);

  const careerStats = careerProfile?.stats?.filter((stat) => stat?.label || stat?.value).slice(0, 4) ?? [];
  const careerEpisodes = careerProfile?.episodes?.slice(0, 3) ?? [];
  const careerSkills = careerProfile?.skills?.slice(0, 5) ?? [];
  const isSingleColumn = viewportWidth !== null ? viewportWidth < 1120 : false;
  const useSectionSwitcher = viewportWidth !== null ? viewportWidth < 820 : false;
  const profileFacts = [
    { label: "Role", value: ROLE_LABEL[profile.role] ?? profile.role, color: roleColor },
    { label: "Cheer", value: String(profile.cheerCount ?? 0), color: "#FFD600" },
    profile.sport ? { label: "Sport / Job", value: profile.sport } : null,
    profile.region ? { label: "Area", value: profile.region } : null,
    profile.prefecture ? { label: "Prefecture", value: profile.prefecture } : null,
    { label: "Joined", value: joinedAt },
  ].filter(Boolean) as Array<{ label: string; value: string; color?: string }>;

  const monthSchedulesOverlapping = monthSchedules
    .filter((s) => {
      const st = new Date(s.start_at).getTime();
      const ed = s.end_at ? new Date(s.end_at).getTime() : st;
      return st < monthRange.end.getTime() && ed >= monthRange.start.getTime();
    })
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  async function handleCompleted() {
    setRegistrationRefreshing(true);
    await Promise.allSettled([
      onProfileRefresh ? onProfileRefresh() : Promise.resolve(),
      onCareerRefresh ? onCareerRefresh() : Promise.resolve(),
    ]);
    setRegistrationRefreshing(false);
    setRegistrationOpen(false);
  }

  useEffect(() => {
    if (!registrationOpen) return;
    initFromUser({
      role: profile.role as any,
      name: profile.displayName,
      slug: profile.slug,
      sport: profile.sport,
      region: profile.region,
      prefecture: profile.prefecture,
      sportsCategory: profile.sportsCategory,
      stance: profile.stance,
      bio: profile.bio,
      displayName: profile.displayName,
      profileImageUrl: profile.profileImageUrl,
      avatarUrl: profile.avatarUrl,
      isPublic: canPublish ? profile.isPublic !== false : false,
      instagram: profile.instagram,
      xUrl: profile.xUrl,
      tiktok: profile.tiktok,
    });
    if (careerProfile) initFromCareerProfile(careerProfile);
  }, [canPublish, careerProfile, initFromCareerProfile, initFromUser, profile, registrationOpen]);

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

  const overviewSection = (
    <SectionFrame title="基本プロフィール" eyebrow="Profile Signals" t={t} action={needsInitialRegistration ? "初回登録を開く" : "プロフィール・キャリアを編集"} onAction={() => setRegistrationOpen(true)} roleColor={roleColor}>
      {profile.bio?.trim() ? <TextPanel text={profile.bio} t={t} /> : <EmptyPanel text="プロフィール紹介文はまだ設定されていません。" t={t} />}
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        {profileFacts.map((fact) => <FactCard key={fact.label} {...fact} t={t} />)}
      </div>
    </SectionFrame>
  );

  const careerSection = (
    <SectionFrame title="プロフィール・キャリア登録内容" eyebrow="Career Profile" t={t} action={needsInitialRegistration ? "登録モーダルを開く" : "プロフィール・キャリアを編集"} onAction={() => setRegistrationOpen(true)} roleColor={roleColor}>
      {hasCareerSignal(careerProfile) ? (
        <>
          {careerProfile?.tagline ? <div style={{ borderRadius: 18, border: `1px solid ${roleColor}28`, background: `${roleColor}10`, padding: "14px 16px", fontSize: 14, fontWeight: 800, color: roleColor }}>{careerProfile.tagline}</div> : null}
          {careerProfile?.bio_career ? <TextPanel text={careerProfile.bio_career} t={t} /> : null}
          {careerStats.length > 0 ? <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>{careerStats.map((stat, i) => <FactCard key={`${stat.label}-${i}`} label={stat.label} value={stat.value || "-"} color={stat.color === "gold" ? "#FFD600" : stat.color === "role" ? roleColor : t.text} t={t} />)}</div> : null}
          {careerEpisodes.length > 0 ? <div style={{ display: "grid", gap: 10 }}>{careerEpisodes.map((ep, i) => <EpisodeCard key={ep.id ?? i} episode={ep} roleColor={roleColor} t={t} />)}</div> : null}
          {careerSkills.length > 0 ? <SkillPanel skills={careerSkills} roleColor={roleColor} t={t} /> : null}
        </>
      ) : (
        <EmptyPanel text="キャリアの公開内容はまだ未登録です。キャッチコピー、実績、スキルから先に入力しておくと公開プロフィールが締まります。" t={t} />
      )}
    </SectionFrame>
  );

  const scheduleSection = (
    <SectionFrame title="当月の予定" eyebrow="Schedule" t={t} action={showCalendar ? "一覧に戻る" : "カレンダーで見る"} onAction={() => setShowCalendar((v) => !v)} roleColor={roleColor} secondaryAction="スケジュール管理へ" onSecondaryAction={() => setView?.("schedule")}>
      {showCalendar ? (
        <ScheduleClient profile={profile} embedded />
      ) : monthSchedulesLoading ? (
        <p style={{ margin: 0, fontSize: 12, color: t.sub }}>読み込み中...</p>
      ) : monthSchedulesOverlapping.length === 0 ? (
        <EmptyPanel text="今月の予定はまだありません。" t={t} />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {monthSchedulesOverlapping.map((s) => (
            <div key={s.id} style={{ borderRadius: 16, border: `1px solid ${t.border}`, background: t.surface, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: CATEGORY_CONFIG[s.category]?.color ?? roleColor, fontWeight: 900 }}>{CATEGORY_CONFIG[s.category]?.label ?? s.category}</span>
                {!s.is_public ? <span style={{ fontSize: 9, fontWeight: 900, color: t.sub, border: `1px solid ${t.border}`, borderRadius: 999, padding: "2px 8px" }}>非公開</span> : null}
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 900, color: t.text }}>{s.title}</p>
              <p style={{ margin: "5px 0 0", fontSize: 11, color: t.sub, lineHeight: 1.7 }}>{new Date(s.start_at).toLocaleString("ja-JP")}{s.end_at ? ` - ${new Date(s.end_at).toLocaleString("ja-JP")}` : ""}</p>
            </div>
          ))}
        </div>
      )}
    </SectionFrame>
  );

  const portfolioSection = (
    <SectionFrame title="Portfolio" eyebrow="Sample Portfolio" t={t} roleColor={roleColor} action="公開ページを確認" onAction={() => window.open(`/u/${profile.slug}`, "_blank", "noopener,noreferrer")}>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ borderRadius: 20, border: `1px solid ${roleColor}28`, background: `linear-gradient(145deg, ${roleColor}12, ${t.surface})`, padding: "18px 18px 16px" }}>
          <p style={{ margin: "0 0 8px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase", color: roleColor }}>
            {ROLE_LABEL[profile.role] ?? profile.role}
          </p>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: t.text, lineHeight: 1.15 }}>
            {careerProfile?.tagline || profile.claim?.trim() || `${profile.displayName} Portfolio`}
          </h3>
          <p style={{ margin: "10px 0 0", fontSize: 12, lineHeight: 1.8, color: t.sub }}>
            {careerProfile?.bio_career || profile.bio || `${profile.displayName} のプロフィールとキャリア情報をもとにしたポートフォリオサンプルです。公開ページ用の見せ方をここで確認できます。`}
          </p>
        </div>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <div style={{ borderRadius: 18, border: `1px solid ${t.border}`, background: t.surface, padding: "15px 16px" }}>
            <p style={{ margin: "0 0 10px", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub }}>Profile Summary</p>
            <div style={{ display: "grid", gap: 8 }}>
              <PortfolioLine label="Name" value={profile.displayName} t={t} />
              <PortfolioLine label="Role" value={ROLE_LABEL[profile.role] ?? profile.role} t={t} />
              <PortfolioLine label="Area" value={profile.region || profile.prefecture || "Japan"} t={t} />
              <PortfolioLine label="Field" value={profile.sport || profile.sportsCategory || "General"} t={t} />
            </div>
          </div>

          <div style={{ borderRadius: 18, border: `1px solid ${t.border}`, background: t.surface, padding: "15px 16px" }}>
            <p style={{ margin: "0 0 10px", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub }}>Highlights</p>
            <div style={{ display: "grid", gap: 8 }}>
              {(careerStats.length > 0 ? careerStats.slice(0, 3).map((stat, index) => (
                <PortfolioLine key={`${stat.label}-${index}`} label={stat.label} value={stat.value || "-"} t={t} />
              )) : [
                <PortfolioLine key="cheer" label="Cheer" value={String(profile.cheerCount ?? 0)} t={t} />,
                <PortfolioLine key="joined" label="Joined" value={joinedAt} t={t} />,
                <PortfolioLine key="public" label="Visibility" value={profile.isPublic ? "Public" : "Private"} t={t} />,
              ])}
            </div>
          </div>
        </div>

        {careerEpisodes.length > 0 ? (
          <div style={{ borderRadius: 18, border: `1px solid ${t.border}`, background: t.surface, padding: "16px 18px" }}>
            <p style={{ margin: "0 0 12px", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub }}>Selected Experience</p>
            <div style={{ display: "grid", gap: 10 }}>
              {careerEpisodes.slice(0, 2).map((episode, index) => (
                <div key={episode.id ?? index} style={{ paddingBottom: index === careerEpisodes.slice(0, 2).length - 1 ? 0 : 10, borderBottom: index === careerEpisodes.slice(0, 2).length - 1 ? "none" : `1px solid ${t.border}` }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: t.text }}>{episode.role}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: roleColor }}>{episode.org} {episode.period ? `· ${episode.period}` : ""}</p>
                  {episode.desc ? <p style={{ margin: "6px 0 0", fontSize: 12, color: t.sub, lineHeight: 1.8 }}>{episode.desc}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {careerSkills.length > 0 ? (
          <div style={{ borderRadius: 18, border: `1px solid ${t.border}`, background: t.surface, padding: "16px 18px" }}>
            <p style={{ margin: "0 0 12px", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub }}>Core Skills</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {careerSkills.map((skill) => (
                <span key={skill.name} style={{ padding: "7px 10px", borderRadius: 999, border: `1px solid ${skill.isHighlight ? `${roleColor}35` : t.border}`, background: skill.isHighlight ? `${roleColor}12` : t.surface, color: skill.isHighlight ? roleColor : t.text, fontSize: 11, fontWeight: 800 }}>
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </SectionFrame>
  );

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

      <section style={{ overflow: "visible", borderRadius: 24, border: `1px solid ${t.border}`, background: t.surface, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 24 }}>
          <div style={{ position: "relative", minHeight: 248 }}>
            {profile.profileImageUrl ? (
              <Image
                src={profile.profileImageUrl}
                alt=""
                fill
                sizes="(min-width: 1120px) 900px, 100vw"
                className="absolute inset-0 object-cover object-top opacity-45"
              />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${bg1} 0%, ${t.bg} 100%)` }} />
            )}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${t.bg} 0%, rgba(0,0,0,0.16) 52%, rgba(0,0,0,0.04) 100%)` }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${bg1}66 0%, transparent 58%)` }} />
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 2, minHeight: 248, padding: isSingleColumn ? 18 : 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {profile.isFoundingMember ? <FoundingMemberBadge /> : <EarlyPartnerBadge />}
              </div>
              <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${roleColor}30`, background: `${roleColor}12`, color: roleColor, textDecoration: "none", fontSize: 11, fontWeight: 900 }}>
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
              <p style={{ margin: "6px 0 0", fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.7)" }}>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: isSingleColumn ? 0 : "auto", alignItems: isSingleColumn ? "flex-start" : "flex-end" }}>
                {snsLinks.length > 0 ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {snsLinks.map((s) => (
                      <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `${roleColor}18`, border: `1px solid ${roleColor}28`, color: roleColor }}>
                        <svg viewBox="0 0 24 24" width={13} height={13} fill="currentColor"><path d={s.path} /></svg>
                      </a>
                    ))}
                  </div>
                ) : null}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: isSingleColumn ? "flex-start" : "flex-end" }}>
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
                  <p style={{ margin: 0, fontSize: 10, color: visibilityMessage.includes("失敗") || visibilityMessage.includes("できません") ? "#ff9b9b" : "rgba(255,255,255,0.62)" }}>
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

            <div
              style={
                isSingleColumn
                  ? { marginTop: 14, display: "flex", justifyContent: "flex-end" }
                  : { position: "absolute", right: 18, bottom: 18, zIndex: 20 }
              }
            >
              <ShareButtonClient
                profileUrl={publicProfileUrl}
                referralUrl={referralUrl}
                displayName={profile.displayName}
                roleColor={roleColor}
                slug={profile.slug}
              />
            </div>
          </div>
      </section>

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

      {useSectionSwitcher ? (
        <div style={{ display: "grid", gap: 14 }}>
          <section style={{ position: "sticky", top: 10, zIndex: 5, padding: 6, borderRadius: 18, border: `1px solid ${t.border}`, background: t.text === "#111111" ? "rgba(255,255,255,0.86)" : "rgba(8,10,16,0.82)", backdropFilter: "blur(18px)" }}>
            <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
              {MOBILE_SECTION_OPTIONS.map((option) => {
                const active = mobileSection === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setMobileSection(option.id)}
                    style={{
                      padding: "11px 8px",
                      borderRadius: 14,
                      border: `1px solid ${active ? `${roleColor}30` : "transparent"}`,
                      background: active ? `linear-gradient(145deg, ${roleColor}18, ${roleColor}08)` : "transparent",
                      color: active ? roleColor : t.sub,
                      fontSize: 11,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          {mobileSection === "overview" ? overviewSection : null}
          {mobileSection === "career" ? careerSection : null}
          {mobileSection === "schedule" ? scheduleSection : null}
          {mobileSection === "portfolio" ? portfolioSection : null}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: isSingleColumn ? "1fr" : "minmax(0, 1.2fr) minmax(0, 0.9fr)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {overviewSection}
            {careerSection}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {scheduleSection}
            {portfolioSection}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionFrame({ title, eyebrow, t, roleColor, action, onAction, secondaryAction, onSecondaryAction, children }: { title: string; eyebrow: string; t: ThemeColors; roleColor: string; action?: string; onAction?: () => void; secondaryAction?: string; onSecondaryAction?: () => void; children: React.ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 14, padding: 18, borderRadius: 24, border: `1px solid ${t.border}`, background: t.surface }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub }}>{eyebrow}</p>
          <h3 style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 900, color: t.text }}>{title}</h3>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {secondaryAction ? <button type="button" onClick={onSecondaryAction} style={{ padding: "9px 12px", borderRadius: 12, border: `1px solid ${roleColor}24`, background: `${roleColor}10`, color: roleColor, fontSize: 11, fontWeight: 900, cursor: onSecondaryAction ? "pointer" : "default" }}>{secondaryAction}</button> : null}
          {action ? <button type="button" onClick={onAction} style={{ padding: "9px 12px", borderRadius: 12, border: `1px solid ${roleColor}28`, background: `${roleColor}10`, color: roleColor, fontSize: 11, fontWeight: 900, cursor: onAction ? "pointer" : "default" }}>{action}</button> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function TextPanel({ text, t }: { text: string; t: ThemeColors }) {
  return <div style={{ padding: "16px 18px", borderRadius: 18, border: `1px solid ${t.border}`, background: t.surface }}><p style={{ margin: 0, fontSize: 13, color: t.text, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{text}</p></div>;
}

function EmptyPanel({ text, t }: { text: string; t: ThemeColors }) {
  return <div style={{ padding: "15px 16px", borderRadius: 16, border: `1px solid ${t.border}`, background: t.text === "#111111" ? "rgba(17,17,17,0.02)" : "rgba(255,255,255,0.02)", fontSize: 12, color: t.sub, lineHeight: 1.8 }}>{text}</div>;
}

function FactCard({ label, value, color, t }: { label: string; value: string; color?: string; t: ThemeColors }) {
  return (
    <div style={{ borderRadius: 18, border: `1px solid ${t.border}`, background: t.surface, padding: "14px 16px" }}>
      <p style={{ margin: "0 0 8px", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub }}>{label}</p>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: color ?? t.text, wordBreak: "break-word" }}>{value}</p>
    </div>
  );
}

function PortfolioLine({ label, value, t }: { label: string; value: string; t: ThemeColors }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 10, fontFamily: "monospace", color: t.sub, letterSpacing: "0.16em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 800, color: t.text, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function EpisodeCard({ episode, roleColor, t }: { episode: NonNullable<CareerProfileRow["episodes"]>[number]; roleColor: string; t: ThemeColors }) {
  return (
    <div style={{ borderRadius: 18, border: `1px solid ${t.border}`, background: t.surface, padding: "15px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: t.text }}>{episode.role}</p>
          <p style={{ margin: "5px 0 0", fontSize: 11, color: t.sub }}>{episode.org}</p>
        </div>
        <span style={{ padding: "4px 8px", borderRadius: 999, border: `1px solid ${t.border}`, background: `${roleColor}10`, color: roleColor, fontSize: 10, fontWeight: 800, fontFamily: "monospace" }}>{episode.period}</span>
      </div>
      {episode.desc ? <p style={{ margin: "10px 0 0", fontSize: 12, color: t.sub, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{episode.desc}</p> : null}
      {episode.tags?.length ? <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>{episode.tags.map((tag) => <span key={tag} style={{ padding: "5px 9px", borderRadius: 999, border: `1px solid ${t.border}`, background: t.text === "#111111" ? "rgba(17,17,17,0.02)" : "rgba(255,255,255,0.02)", color: t.sub, fontSize: 10 }}>{tag}</span>)}</div> : null}
      {episode.milestone ? <p style={{ margin: "10px 0 0", fontSize: 11, fontWeight: 800, color: roleColor }}>★ {episode.milestone}</p> : null}
    </div>
  );
}

function SkillPanel({ skills, roleColor, t }: { skills: NonNullable<CareerProfileRow["skills"]>; roleColor: string; t: ThemeColors }) {
  return (
    <div style={{ borderRadius: 18, border: `1px solid ${t.border}`, background: t.surface, padding: "16px 18px" }}>
      <p style={{ margin: "0 0 12px", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub }}>Skills</p>
      <div style={{ display: "grid", gap: 10 }}>
        {skills.map((skill) => (
          <div key={skill.name}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: skill.isHighlight ? roleColor : t.text }}>{skill.name}</span>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: t.sub }}>{skill.level}</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: t.border, overflow: "hidden" }}>
              <div style={{ width: `${skill.level}%`, height: "100%", borderRadius: 999, background: skill.isHighlight ? "linear-gradient(90deg,#FFD600,#FFD60088)" : `linear-gradient(90deg, ${roleColor}, ${roleColor}88)` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
