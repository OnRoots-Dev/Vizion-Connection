"use client";

import type { ProfileData } from "@/features/profile/types";
import type { ThemeColors } from "../DashboardClient";
import type { DashboardView } from "../DashboardClient";
import { useEffect, useMemo, useState } from "react";
import { FoundingMemberBadge, EarlyPartnerBadge } from "@/components/ui/FoundingMemberBadge";
import type { CareerProfileRow } from "@/lib/supabase/career-profiles";
import ScheduleClient from "@/app/schedule/ScheduleClient";
import { CATEGORY_CONFIG } from "@/types/schedule";
import type { Schedule } from "@/types/schedule";

const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE", Trainer: "TRAINER", Members: "MEMBERS", Business: "BUSINESS",
};
const ROLE_GRADIENT: Record<string, string> = {
    Athlete: "#2D0000", Trainer: "#001A0A", Members: "#1A0F00", Business: "#000A24",
};
const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const IG_PATH = "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z";
const TK_PATH = "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z";

export function DashboardProfileView({
    profile, t, roleColor, onBack, setView, careerProfile,
}: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
    onBack: () => void;
    setView?: (view: DashboardView) => void;
    careerProfile?: CareerProfileRow | null;
}) {
    const joinedAt = new Date(profile.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
    const bg1 = ROLE_GRADIENT[profile.role] ?? "#1a1a2e";
    const initials = profile.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const serialDisplay = profile.serialId ? `#${String(profile.serialId).padStart(4, "0")}` : null;
    const snsLinks = [
        { label: "X", href: profile.xUrl, path: X_PATH },
        { label: "Instagram", href: profile.instagram, path: IG_PATH },
        { label: "TikTok", href: profile.tiktok, path: TK_PATH },
    ].filter((s) => s.href);

    const [showCalendar, setShowCalendar] = useState(false);
    const [monthSchedules, setMonthSchedules] = useState<Schedule[]>([]);
    const [monthSchedulesLoading, setMonthSchedulesLoading] = useState(true);

    const monthRange = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
        return { start, end };
    }, []);

    const refreshMonthSchedules = () => {
        setMonthSchedulesLoading(true);
        const qs = new URLSearchParams({
            start: monthRange.start.toISOString(),
            end: monthRange.end.toISOString(),
        });
        fetch(`/api/schedules/mine?${qs.toString()}`, { cache: "no-store" })
            .then(async (r) => {
                const data = await r.json().catch(() => ({}));
                if (!r.ok || data?.success === false) {
                    console.error("[DashboardProfileView] fetch month schedules failed", { status: r.status, data });
                    setMonthSchedules([]);
                    return;
                }
                setMonthSchedules(Array.isArray(data?.schedules) ? data.schedules : []);
            })
            .catch((err) => {
                console.error("[DashboardProfileView] fetch month schedules error", err);
                setMonthSchedules([]);
            })
            .finally(() => setMonthSchedulesLoading(false));
    };

    useEffect(() => {
        refreshMonthSchedules();
    }, [monthRange.end, monthRange.start]);

    useEffect(() => {
        if (!showCalendar) refreshMonthSchedules();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCalendar]);

    const monthSchedulesOverlapping = useMemo(() => {
        const start = monthRange.start.getTime();
        const end = monthRange.end.getTime();
        return monthSchedules.filter((s) => {
            const st = new Date(s.start_at).getTime();
            const ed = s.end_at ? new Date(s.end_at).getTime() : st;
            // overlap [st, ed] with [start, end)
            return st < end && ed >= start;
        });
    }, [monthRange.end, monthRange.start, monthSchedules]);

    const careerStats = careerProfile?.stats?.filter((stat) => stat?.label || stat?.value).slice(0, 4) ?? [];
    const careerEpisodes = careerProfile?.episodes?.slice(0, 4) ?? [];
    const careerSkills = careerProfile?.skills?.slice(0, 4) ?? [];
    const profileFacts: Array<{ label: string; value: string; color?: string } | null> = [
        { label: "Role", value: ROLE_LABEL[profile.role] ?? profile.role, color: roleColor },
        { label: "Cheer", value: (profile.cheerCount ?? 0).toLocaleString(), color: "#FFD600" },
        { label: "Vizion ID", value: profile.serialId ?? "" },
        { label: "参加日", value: joinedAt },
        { label: "Sport / Job", value: profile.sport ?? "—" },
        profile.sportsCategory ? { label: "Category", value: profile.sportsCategory } : null,
        profile.stance ? { label: "Stance", value: profile.stance } : null,
        { label: "Area", value: profile.region ?? "—" },
        { label: "Prefecture", value: profile.prefecture ?? "—" },
    ];

    return (
        <div className="flex flex-col gap-0 overflow-hidden rounded-[18px]" style={{ border: `1px solid ${t.border}`, background: t.surface }}>
            <div className="relative min-h-[228px] overflow-hidden">
                {profile.profileImageUrl ? (
                    <img src={profile.profileImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover object-top opacity-45" />
                ) : (
                    <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${bg1} 0%, #050505 100%)` }}>
                        <div className="absolute right-[-10%] top-[-30%] h-[300px] w-[300px]" style={{ background: `radial-gradient(circle, ${roleColor}28, transparent 65%)` }} />
                    </div>
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #07070e 0%, rgba(7,7,14,0.5) 45%, rgba(7,7,14,0.1) 100%)" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(7,7,14,0.7) 0%, transparent 55%)" }} />
                <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${bg1}50 0%, transparent 60%)` }} />

                <div className="relative z-10 flex items-center justify-between px-[14px] pb-0 pt-3">
                    <button onClick={onBack} className="inline-flex cursor-pointer items-center gap-[5px] rounded-[9px] px-[10px] py-[6px] text-[10px] font-bold backdrop-blur-[8px]" style={{ background: "rgba(0,0,0,0.22)", border: `1px solid ${t.border}`, color: t.text }}>
                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        戻る
                    </button>
                    <a href={`/u/${profile.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-[6px] rounded-[9px] px-[10px] py-[6px] text-[10px] font-extrabold no-underline backdrop-blur-[8px]" style={{ background: `${roleColor}16`, border: `1px solid ${roleColor}35`, color: roleColor }}>
                        公開ページを開く
                        <svg width={11} height={11} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </a>
                </div>

                <div className="relative z-[2] px-[18px] pb-[18px] pt-[14px]">
                    <div className="mb-3 inline-flex">
                        {profile.isFoundingMember ? <FoundingMemberBadge /> : <EarlyPartnerBadge />}
                    </div>
                    {serialDisplay && <span className="ml-2 font-mono text-[10px] tracking-[0.1em]" style={{ color: t.sub }}>{serialDisplay}</span>}

                    <div className="mb-1 flex items-center gap-2">
                        <span className="block h-[3px] w-5 shrink-0 rounded-[2px]" style={{ background: roleColor }} />
                        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.3em]" style={{ color: `${roleColor}cc` }}>
                            {ROLE_LABEL[profile.role] ?? profile.role}
                            {profile.sportsCategory ? ` · ${profile.sportsCategory}` : ""}
                            {profile.sport ? ` · ${profile.sport}` : ""}
                            {profile.stance ? ` · ${profile.stance}` : ""}
                        </span>
                    </div>

                    <h2 className="mb-[2px] mt-0 text-[clamp(28px,5.2vw,38px)] font-black leading-none tracking-[-0.03em] text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>
                        {profile.displayName}
                    </h2>
                    <p className="mb-[14px] mt-0 font-mono text-[10px]" style={{ color: t.sub }}>
                        @{profile.slug}{profile.region ? ` · ${profile.region}` : ""}
                    </p>

                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2" style={{ borderColor: `${roleColor}90`, background: `linear-gradient(145deg, ${bg1}, #111)`, boxShadow: `0 0 16px ${roleColor}40` }}>
                            {profile.avatarUrl
                                ? <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                                : <span className="font-mono text-[16px] font-black" style={{ color: `${roleColor}cc` }}>{initials}</span>}
                        </div>
                        <div>
                            <span className="mb-px block font-mono text-[8px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,210,0,0.5)" }}>CHEER</span>
                            <span className="font-mono text-[26px] font-black leading-none tracking-[-0.02em] text-[#FFD600]">
                                {(profile.cheerCount ?? 0).toLocaleString()}
                            </span>
                        </div>
                        {snsLinks.length > 0 && (
                            <div className="ml-auto flex gap-[6px]">
                                {snsLinks.map((s) => (
                                    <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full no-underline" style={{ background: `${roleColor}15`, border: `1px solid ${roleColor}30`, color: roleColor }}>
                                        <svg viewBox="0 0 24 24" width={11} height={11} fill="currentColor"><path d={s.path} /></svg>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-[14px] p-4">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: t.sub }}>Profile</p>
                                <h3 className="mb-0 mt-[6px] text-[20px] font-black" style={{ color: t.text }}>基本プロフィール</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setView?.("edit")}
                                className="inline-flex items-center gap-[6px] rounded-[8px] px-[10px] py-[6px] text-[10px] font-extrabold"
                                style={{ border: `1px solid ${roleColor}28`, background: `${roleColor}10`, color: roleColor, cursor: setView ? "pointer" : "default", opacity: setView ? 1 : 0.7 }}
                            >
                                プロフィールを編集
                            </button>
                        </div>

                        {profile.claim?.trim() ? (
                            <div className="relative overflow-hidden rounded-[12px] px-4 py-[14px]" style={{ background: `${roleColor}10`, border: `1px solid ${roleColor}25` }}>
                                <div className="absolute right-3 top-[6px] select-none font-mono text-[22px] font-black" style={{ color: `${roleColor}22` }}>&quot;</div>
                                <p className="m-0 text-[13px] font-black leading-[1.8]" style={{ color: t.text }}>
                                    &quot;{profile.claim.trim()}&quot;
                                </p>
                            </div>
                        ) : null}

                        {profile.bio && (
                            <div className="relative overflow-hidden rounded-[12px] px-4 py-[14px]" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                                <div className="absolute bottom-[20%] left-0 top-[20%] w-[3px] rounded-r-[2px]" style={{ background: `linear-gradient(to bottom, transparent, ${roleColor}, transparent)` }} />
                                <p className="m-0 pl-1 text-[13px] leading-[1.8] opacity-[0.82]" style={{ color: t.text }}>{profile.bio}</p>
                            </div>
                        )}

                        <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                            {profileFacts.filter((v): v is { label: string; value: string; color?: string } => Boolean(v?.value)).map(({ label, value, color }) => (
                                <div key={label} className="rounded-[12px] p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                                    <p className="mb-[5px] mt-0 font-mono text-[8px] uppercase tracking-[0.18em]" style={{ color: t.sub }}>{label}</p>
                                    <p className="m-0 break-words text-[13px] font-black" style={{ color: color ?? t.text }}>{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-[12px] px-3 py-[10px]" style={{ background: profile.isPublic ? `${roleColor}08` : "rgba(255,80,80,0.06)", border: `1px solid ${profile.isPublic ? `${roleColor}20` : "rgba(255,80,80,0.2)"}` }}>
                            <p className="mb-[2px] mt-0 text-[11px] font-bold" style={{ color: profile.isPublic ? roleColor : "#ff5050" }}>
                                {profile.isPublic ? "✓ 公開中" : "非公開"}
                            </p>
                            <p className="m-0 text-[9px]" style={{ color: t.sub }}>プロフィールの公開設定</p>
                            <button
                                type="button"
                                onClick={() => setView?.("settings")}
                                className="mt-2 inline-flex items-center gap-[5px] rounded-[8px] px-[10px] py-[5px] text-[10px] font-bold"
                                style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.sub, cursor: setView ? "pointer" : "default" }}
                            >
                                設定を変更
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: 14, padding: "14px 14px", borderRadius: 14, background: t.surface, border: `1px solid ${t.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                            <div>
                                <p style={{ margin: 0, fontSize: 9, color: t.sub, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "monospace", opacity: 0.7 }}>Schedule</p>
                                <p style={{ margin: "6px 0 0", fontSize: 14, fontWeight: 900, color: t.text }}>当月の予定</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    onClick={() => setView?.("schedule")}
                                    style={{ padding: "8px 12px", borderRadius: 12, border: `1px solid ${roleColor}24`, background: `${roleColor}10`, color: roleColor, fontWeight: 900, cursor: setView ? "pointer" : "default", fontSize: 11, opacity: setView ? 1 : 0.7 }}
                                >
                                    スケジュール管理へ
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCalendar((v) => !v)}
                                    style={{ padding: "8px 12px", borderRadius: 12, border: `1px solid ${t.border}`, background: showCalendar ? `${roleColor}12` : "rgba(255,255,255,0.04)", color: showCalendar ? roleColor : t.sub, fontWeight: 900, cursor: "pointer", fontSize: 11 }}
                                >
                                    {showCalendar ? "一覧に戻る" : "カレンダーで見る"}
                                </button>
                            </div>
                        </div>

                        {showCalendar ? (
                            <ScheduleClient profile={profile} embedded />
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {monthSchedulesLoading ? (
                                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>読み込み中...</p>
                                ) : monthSchedules.length === 0 ? (
                                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>今月の予定はまだありません。</p>
                                ) : (
                                    monthSchedulesOverlapping
                                        .slice()
                                        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
                                        .map((s) => (
                                            <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 10px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                                        <span style={{ fontSize: 10, fontFamily: "monospace", color: CATEGORY_CONFIG[s.category]?.color ?? roleColor, fontWeight: 900 }}>
                                                            {CATEGORY_CONFIG[s.category]?.label ?? s.category}
                                                        </span>
                                                        {!s.is_public ? (
                                                            <span style={{ fontSize: 9, fontWeight: 900, color: t.sub, border: `1px solid ${t.border}`, borderRadius: 999, padding: "2px 8px" }}>非公開</span>
                                                        ) : null}
                                                    </div>
                                                    <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 900, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</p>
                                                    <p style={{ margin: "4px 0 0", fontSize: 11, color: t.sub }}>{new Date(s.start_at).toLocaleString("ja-JP")}{s.end_at ? ` - ${new Date(s.end_at).toLocaleString("ja-JP")}` : ""}</p>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {snsLinks.length > 0 && (
                            <div style={{ padding: "12px 14px", borderRadius: 12, background: t.surface, border: `1px solid ${t.border}` }}>
                                <p style={{ margin: "0 0 10px", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.18em", textTransform: "uppercase", color: t.sub }}>SNS</p>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {snsLinks.map((s) => (
                                        <a key={s.label} href={s.href!} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 10, background: `${roleColor}10`, border: `1px solid ${roleColor}25`, color: roleColor, fontWeight: 800, fontSize: 12, textDecoration: "none" }}>
                                            <svg viewBox="0 0 24 24" width={11} height={11} fill="currentColor"><path d={s.path} /></svg>
                                            {s.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 4 }}>
                    <div>
                        <p style={{ margin: 0, fontSize: 10, color: t.sub, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>Career Public Content</p>
                        <h3 style={{ margin: "6px 0 0", fontSize: 20, color: t.text, fontWeight: 900 }}>キャリア公開内容</h3>
                        <p style={{ margin: "6px 0 0", fontSize: 11, color: t.sub }}>公開プロフィールで見せるキャリア情報をここから管理します。</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setView?.("career")}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, border: `1px solid ${roleColor}28`, background: `${roleColor}10`, color: roleColor, fontSize: 10, fontWeight: 800, cursor: setView ? "pointer" : "default", opacity: setView ? 1 : 0.7 }}
                    >
                        キャリア内容を編集
                    </button>
                </div>

                {careerProfile?.tagline && (
                    <div style={{ padding: "12px 14px", borderRadius: 10, background: `${roleColor}10`, border: `1px solid ${roleColor}30`, fontSize: 13, fontWeight: 700, color: roleColor }}>
                        &quot;{careerProfile.tagline}&quot;
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {careerProfile?.bio_career ? (
                            <div style={{ padding: "14px 16px", borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, fontSize: 12, color: t.text, lineHeight: 1.8, opacity: 0.82 }}>
                                {careerProfile.bio_career}
                            </div>
                        ) : (
                            <div style={{ padding: "14px 16px", borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, fontSize: 12, color: t.sub }}>
                                キャリア紹介文はまだ設定されていません。
                            </div>
                        )}

                        {careerEpisodes.length > 0 ? (
                            <div style={{ display: "grid", gap: 8 }}>
                                {careerEpisodes.map((ep, i) => (
                                    <div key={ep.id ?? i} style={{ borderRadius: 12, border: `1px solid ${t.border}`, background: t.surface, padding: "12px 14px" }}>
                                        <p style={{ margin: 0, fontSize: 13, color: t.text, fontWeight: 800 }}>{ep.role}</p>
                                        <p style={{ margin: "3px 0 4px", fontSize: 11, color: t.sub }}>{ep.org}</p>
                                        <p style={{ margin: 0, fontSize: 10, color: t.sub, fontFamily: "monospace" }}>{ep.period}</p>
                                        {ep.milestone ? <p style={{ margin: "7px 0 0", fontSize: 10, color: roleColor, fontWeight: 700 }}>⭐ {ep.milestone}</p> : null}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {careerStats.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                                {careerStats.map((stat, index) => {
                                    const statColor = stat.color === "gold" ? "#FFD600" : stat.color === "role" ? roleColor : t.text;
                                    return (
                                        <div key={`${stat.label}-${index}`} style={{ padding: "12px", borderRadius: 12, background: t.surface, border: `1px solid ${t.border}` }}>
                                            <p style={{ margin: "0 0 6px", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.18em", textTransform: "uppercase", color: t.sub }}>{stat.label}</p>
                                            <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: statColor }}>{stat.value || "-"}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {careerSkills.length > 0 ? (
                            <div style={{ padding: "12px 14px", borderRadius: 12, background: t.surface, border: `1px solid ${t.border}` }}>
                                <p style={{ margin: "0 0 10px", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.18em", textTransform: "uppercase", color: t.sub }}>Skills</p>
                                <div style={{ display: "grid", gap: 8 }}>
                                    {careerSkills.map((skill) => (
                                        <div key={skill.name}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontSize: 12, color: skill.isHighlight ? roleColor : t.text, fontWeight: skill.isHighlight ? 800 : 600 }}>{skill.name}</span>
                                                <span style={{ fontSize: 11, color: t.sub, fontFamily: "monospace" }}>{skill.level}</span>
                                            </div>
                                            <div style={{ height: 4, borderRadius: 999, background: t.border, overflow: "hidden" }}>
                                                <div style={{ width: `${skill.level}%`, height: "100%", borderRadius: 999, background: skill.isHighlight ? "linear-gradient(90deg,#FFD600,#FFD60088)" : `linear-gradient(90deg, ${roleColor}, ${roleColor}66)` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: "14px 16px", borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, fontSize: 12, color: t.sub }}>
                                キャリアの公開内容はまだ設定されていません。まずは肩書き、実績、スキルから入れるのがおすすめです。
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
