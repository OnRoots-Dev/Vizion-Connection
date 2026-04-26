"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProfileData } from "@/features/profile/types";
import type { ThemeColors, DashboardView } from "../DashboardClient";
import type { CareerProfileRow } from "@/lib/supabase/career-profiles";
import { FoundingMemberBadge, EarlyPartnerBadge } from "@/components/ui/FoundingMemberBadge";
import { ViewHeader } from "@/app/(app)/dashboard/components/ui";
import ScheduleClient from "@/app/schedule/ScheduleClient";
import { CATEGORY_CONFIG } from "@/types/schedule";
import type { Schedule } from "@/types/schedule";
import UnifiedProfileModal from "@/components/unified-profile/UnifiedProfileModal";

const ROLE_LABEL: Record<string, string> = {
  Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
};

const ROLE_GRADIENT: Record<string, string> = {
  Athlete: "#2D0000", Trainer: "#001A0A", Members: "#1A0F00", Business: "#000A24",
};

const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const IG_PATH = "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z";
const TK_PATH = "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z";

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

  const careerStats = careerProfile?.stats?.filter((stat) => stat?.label || stat?.value).slice(0, 4) ?? [];
  const careerEpisodes = careerProfile?.episodes?.slice(0, 3) ?? [];
  const careerSkills = careerProfile?.skills?.slice(0, 5) ?? [];
  const profileFacts = [
    { label: "Role", value: ROLE_LABEL[profile.role] ?? profile.role, color: roleColor },
    { label: "Cheer", value: String(profile.cheerCount ?? 0), color: "#FFD600" },
    serialDisplay ? { label: "Vizion ID", value: serialDisplay } : null,
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ViewHeader title="Profile" sub="プロフィール" onBack={onBack} t={t} roleColor={roleColor} />

      <UnifiedProfileModal
        isOpen={registrationOpen}
        onClose={() => setRegistrationOpen(false)}
        user={{
          slug: profile.slug,
          displayName: profile.displayName,
          profileImageUrl: profile.profileImageUrl,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
          region: profile.region,
          prefecture: profile.prefecture,
          sportsCategory: profile.sportsCategory,
          sport: profile.sport,
          stance: profile.stance,
          instagram: profile.instagram,
          xUrl: profile.xUrl,
          tiktok: profile.tiktok,
          isPublic: profile.isPublic,
        }}
        onCompleted={() => { void handleCompleted(); }}
      />

      <section style={{ overflow: "hidden", borderRadius: 24, border: `1px solid ${t.border}`, background: t.surface }}>
        <div style={{ position: "relative", minHeight: 248 }}>
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover object-top opacity-45" />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${bg1} 0%, ${t.bg} 100%)` }} />
          )}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${t.bg} 0%, rgba(0,0,0,0.16) 52%, rgba(0,0,0,0.04) 100%)` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${bg1}66 0%, transparent 58%)` }} />

          <div style={{ position: "relative", zIndex: 2, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {profile.isFoundingMember ? <FoundingMemberBadge /> : <EarlyPartnerBadge />}
                {serialDisplay ? <span style={{ fontSize: 10, fontFamily: "monospace", color: t.sub }}>{serialDisplay}</span> : null}
              </div>
              <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${roleColor}30`, background: `${roleColor}12`, color: roleColor, textDecoration: "none", fontSize: 11, fontWeight: 900 }}>
                公開プロフィールを見る
              </a>
            </div>

            <p style={{ margin: 0, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.28em", textTransform: "uppercase", color: `${roleColor}dd` }}>
              {ROLE_LABEL[profile.role] ?? profile.role}{profile.sport ? ` · ${profile.sport}` : ""}
            </p>
            <h2 style={{ margin: "8px 0 0", fontSize: "clamp(30px,5vw,44px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.03em", color: "#fff" }}>
              {profile.displayName}
            </h2>
            <p style={{ margin: "8px 0 0", fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.7)" }}>
              @{profile.slug}{profile.region ? ` · ${profile.region}` : ""}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18, flexWrap: "wrap" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", border: `2px solid ${roleColor}`, background: `linear-gradient(145deg, ${bg1}, #111)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" /> : <span style={{ color: roleColor, fontFamily: "monospace", fontSize: 22, fontWeight: 900 }}>{initials}</span>}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 9, fontFamily: "monospace", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,210,0,0.52)" }}>Cheer</p>
                <p style={{ margin: "4px 0 0", fontSize: 32, fontWeight: 900, lineHeight: 1, fontFamily: "monospace", color: "#FFD600" }}>{(profile.cheerCount ?? 0).toLocaleString()}</p>
              </div>
              {snsLinks.length > 0 ? (
                <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
                  {snsLinks.map((s) => (
                    <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `${roleColor}18`, border: `1px solid ${roleColor}28`, color: roleColor }}>
                      <svg viewBox="0 0 24 24" width={13} height={13} fill="currentColor"><path d={s.path} /></svg>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            {profile.claim?.trim() ? (
              <div style={{ marginTop: 16, maxWidth: 620, borderRadius: 18, border: `1px solid ${roleColor}28`, background: `${roleColor}12`, padding: "14px 16px" }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, fontWeight: 800, color: "#fff" }}>&quot;{profile.claim.trim()}&quot;</p>
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", padding: 18, borderTop: `1px solid ${t.border}`, background: t.text === "#111111" ? "rgba(17,17,17,0.02)" : "rgba(255,255,255,0.02)" }}>
          <MetricCard label="公開状態" value={profile.isPublic ? "PUBLIC" : "PRIVATE"} sub={profile.isPublic ? "公開プロフィールで閲覧可能" : "外部には表示されません"} tone={profile.isPublic ? roleColor : "#FF5050"} t={t} />
          <MetricCard label="キャリア登録" value={hasCareerSignal(careerProfile) ? "READY" : "DRAFT"} sub={hasCareerSignal(careerProfile) ? `${careerEpisodes.length}エピソード / ${careerSkills.length}スキル` : "初回登録で土台をつくる"} tone={hasCareerSignal(careerProfile) ? "#FFD600" : t.sub} t={t} />
          <MetricCard label="公開導線" value={`/u/${profile.slug}`} sub="SNS・紹介導線で利用" tone={t.text} t={t} />
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

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.9fr)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionFrame title="基本プロフィール" eyebrow="Profile Signals" t={t} action={needsInitialRegistration ? "初回登録を開く" : "プロフィールを編集"} onAction={() => needsInitialRegistration ? setRegistrationOpen(true) : setView?.("edit")} roleColor={roleColor}>
            {profile.bio?.trim() ? <TextPanel text={profile.bio} t={t} /> : <EmptyPanel text="プロフィール紹介文はまだ設定されていません。" t={t} />}
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
              {profileFacts.map((fact) => <FactCard key={fact.label} {...fact} t={t} />)}
            </div>
          </SectionFrame>

          <SectionFrame title="プロフィール・キャリア登録内容" eyebrow="Career Profile" t={t} action={needsInitialRegistration ? "登録モーダルを開く" : "キャリア内容を編集"} onAction={() => needsInitialRegistration ? setRegistrationOpen(true) : setView?.("career")} roleColor={roleColor}>
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
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

          <SectionFrame title="公開導線" eyebrow="Share Design" t={t} roleColor={roleColor}>
            <div style={{ borderRadius: 18, border: `1px solid ${roleColor}22`, background: `linear-gradient(145deg, ${roleColor}12, ${t.surface})`, padding: "16px 18px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: t.sub, lineHeight: 1.8 }}>公開プロフィールとモーダルプレビューは、現在の登録内容がそのまま反映されます。公開ページを広げる前に、プロフィールとキャリアの見え方をここで整えます。</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${roleColor}30`, background: `${roleColor}12`, color: roleColor, textDecoration: "none", fontSize: 11, fontWeight: 900 }}>公開ページを確認</a>
                <button type="button" onClick={() => setView?.("cheer")} style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${t.border}`, background: t.surface, color: t.sub, fontSize: 11, fontWeight: 900, cursor: setView ? "pointer" : "default" }}>拡散導線を見る</button>
              </div>
            </div>
          </SectionFrame>
        </div>
      </div>
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

function MetricCard({ label, value, sub, tone, t }: { label: string; value: string; sub: string; tone: string; t: ThemeColors }) {
  return (
    <div style={{ borderRadius: 18, border: `1px solid ${t.border}`, background: t.surface, padding: "14px 16px" }}>
      <p style={{ margin: "0 0 8px", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase", color: t.sub }}>{label}</p>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: tone, wordBreak: "break-word" }}>{value}</p>
      <p style={{ margin: "6px 0 0", fontSize: 11, color: t.sub, lineHeight: 1.6 }}>{sub}</p>
    </div>
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
