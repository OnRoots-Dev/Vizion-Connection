"use client";

// dashboard/views/MissionsView.tsx
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import type { DailyMissionWithProgress, OnetimeMission } from "@/features/missions/types";

function buildFallbackOnetimeMissions(params: {
    verified: boolean;
    hasShared: boolean;
    referralCount: number;
    hasProfileDetails: boolean;
}): OnetimeMission[] {
    return [
        { label: "先行登録完了", done: true, reward: "+1000pt", desc: "Vizion Connectionへの登録" },
        { label: "メール認証完了", done: params.verified, reward: "+200pt", desc: "メールアドレスを認証する" },
        { label: "SNSで共有", done: params.hasShared, reward: "+300pt", desc: "プロフィールをSNSでシェア" },
        { label: "3人招待する", done: params.referralCount >= 3, reward: "+1500pt", desc: "招待リンクから3人を招待" },
        { label: "プロフィール編集", done: params.hasProfileDetails, reward: "+200pt", desc: "Bio・スポーツ・地域を入力" },
    ];
}

export function MissionsView({ profile, referralCount, t, roleColor, setView, onProfilePatch }: {
    profile: ProfileData;
    referralCount: number;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    onProfilePatch: (patch: Partial<ProfileData>) => void;
}) {
    const [claiming, setClaiming] = useState(false);
    const [message, setMessage] = useState("");
    const [tab, setTab] = useState<"onetime" | "daily">("onetime");
    const [dailyMissions, setDailyMissions] = useState<DailyMissionWithProgress[]>([]);
    const [onetimeMissions, setOnetimeMissions] = useState<OnetimeMission[]>([]);
    const [loadingDaily, setLoadingDaily] = useState(true);
    const canClaim = !profile.missionBonusGiven;
    const fallbackOnetime = useMemo(() => buildFallbackOnetimeMissions({
        verified: profile.verified,
        hasShared: profile.hasShared ?? false,
        referralCount,
        hasProfileDetails: !!(profile.bio || profile.sport || profile.region),
    }), [profile.verified, profile.hasShared, profile.bio, profile.sport, profile.region, referralCount]);
    const MISSIONS = onetimeMissions.length > 0 ? onetimeMissions : fallbackOnetime;
    const completedCount = MISSIONS.filter((m) => m.done).length;
    const allDone = completedCount === MISSIONS.length;

    useEffect(() => {
        let cancelled = false;
        setLoadingDaily(true);
        fetch("/api/missions", { cache: "no-store" })
            .then((res) => res.json())
            .then((json) => {
                if (cancelled) return;
                setOnetimeMissions(Array.isArray(json.onetime) ? json.onetime : fallbackOnetime);
                setDailyMissions(Array.isArray(json.daily) ? json.daily : []);
            })
            .catch(() => {
                if (cancelled) return;
                setOnetimeMissions(fallbackOnetime);
                setDailyMissions([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingDaily(false);
            });

        return () => { cancelled = true; };
    }, [fallbackOnetime]);

    async function handleClaimBonus() {
        if (claiming || !allDone || !canClaim) return;
        setClaiming(true);
        setMessage("");
        try {
            const res = await fetch("/api/missions", { method: "POST" });
            const json = await res.json();
            if (!res.ok || !json.ok) {
                setMessage("達成条件を満たしていないか、受け取り済みです。");
                return;
            }
            const added = Number(json.pointsAdded ?? 0);
            onProfilePatch({
                points: (profile.points ?? 0) + added,
                missionBonusGiven: true,
            });
            setMessage(`+${added.toLocaleString()}pt を受け取りました。`);
        } catch {
            setMessage("受け取りに失敗しました。");
        } finally {
            setClaiming(false);
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Missions" sub="特典を獲得しよう" onBack={() => setView("home")} t={t} roleColor={roleColor} />

            <SectionCard t={t} accentColor={roleColor}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <SLabel text="ポイント残高" color={roleColor} />
                    <span style={{ fontSize: 10, color: t.sub, opacity: 0.6, fontFamily: "monospace" }}>CURRENT BALANCE</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span className="font-display" style={{ fontSize: 36, color: roleColor, lineHeight: 1 }}>
                        {profile.points.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 12, color: t.sub, opacity: 0.7 }}>pt</span>
                </div>
            </SectionCard>

            <div style={{ display: "flex", gap: 8 }}>
                {[
                    { id: "onetime" as const, label: "初期ミッション" },
                    { id: "daily" as const, label: "デイリーミッション" },
                ].map((item) => {
                    const active = tab === item.id;
                    return (
                        <motion.button
                            key={item.id}
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setTab(item.id)}
                            style={{
                                flex: 1,
                                borderRadius: 12,
                                padding: "12px 14px",
                                border: `1px solid ${active ? `${roleColor}40` : t.border}`,
                                background: active ? `${roleColor}18` : t.surface,
                                color: active ? roleColor : t.sub,
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: "pointer",
                            }}
                        >
                            {item.label}
                        </motion.button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {tab === "onetime" ? (
                    <motion.div
                        key="onetime"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                        style={{ display: "flex", flexDirection: "column", gap: 16 }}
                    >
                        <SectionCard accentColor={allDone ? "#FFD600" : roleColor} t={t}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <SLabel text="Progress" color={allDone ? "#FFD600" : roleColor} />
                                <span className="font-display" style={{ fontSize: 24, color: allDone ? "#FFD600" : roleColor }}>
                                    {completedCount} <span style={{ fontSize: 14, opacity: 0.5 }}>/ {MISSIONS.length}</span>
                                </span>
                            </div>
                            <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(completedCount / MISSIONS.length) * 100}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                    style={{ height: "100%", borderRadius: 99, background: allDone ? "linear-gradient(90deg,#FFD600,#FFD60066)" : `linear-gradient(90deg,${roleColor},${roleColor}66)`, boxShadow: allDone ? "0 0 10px rgba(255,214,0,0.4)" : `0 0 10px ${roleColor}40` }} />
                            </div>
                            {allDone && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(255,214,0,0.07)", border: "1px solid rgba(255,214,0,0.22)", display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 20 }}>🏆</span>
                                    <p style={{ fontSize: 12, fontWeight: 800, color: "#FFD600", margin: 0 }}>全ミッション達成！ボーナス +1000pt</p>
                                </motion.div>
                            )}
                            {allDone && (
                                <button
                                    type="button"
                                    onClick={handleClaimBonus}
                                    disabled={!canClaim || claiming}
                                    style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,214,0,0.3)", background: canClaim ? "rgba(255,214,0,0.16)" : "rgba(255,255,255,0.06)", color: canClaim ? "#FFD600" : t.sub, fontSize: 12, fontWeight: 800, cursor: canClaim ? "pointer" : "not-allowed" }}
                                >
                                    {profile.missionBonusGiven ? "受け取り済み" : claiming ? "処理中..." : "ボーナスポイントを受け取る"}
                                </button>
                            )}
                            {message && <p style={{ margin: "8px 0 0", fontSize: 11, color: "#FFD600" }}>{message}</p>}
                        </SectionCard>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {MISSIONS.map(({ label, done, reward, desc }, i) => (
                                <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 14, background: done ? "rgba(255,255,255,0.025)" : t.surface, border: `1px solid ${done ? roleColor + "25" : t.border}` }}>
                                    <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: done ? `${roleColor}20` : "rgba(255,255,255,0.04)", border: `2px solid ${done ? roleColor : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: done ? `0 0 8px ${roleColor}40` : "none", transition: "all 0.3s" }}>
                                        {done
                                            ? <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke={roleColor} strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                                        }
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: done ? t.sub : t.text, margin: "0 0 3px", opacity: done ? 0.6 : 1, textDecoration: done ? "line-through" : "none" }}>{label}</p>
                                        <p style={{ fontSize: 10, color: t.sub, margin: 0, opacity: 0.5 }}>{desc}</p>
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 900, fontFamily: "monospace", color: done ? roleColor : t.sub, opacity: done ? 1 : 0.4, flexShrink: 0 }}>{reward}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="daily"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                        style={{ display: "flex", flexDirection: "column", gap: 12 }}
                    >
                        {loadingDaily ? (
                            <SectionCard t={t}>
                                <p style={{ margin: 0, fontSize: 12, color: t.sub }}>デイリーミッションを読み込み中...</p>
                            </SectionCard>
                        ) : dailyMissions.length === 0 ? (
                            <SectionCard t={t}>
                                <p style={{ margin: 0, fontSize: 12, color: t.sub }}>現在有効なデイリーミッションはありません。</p>
                            </SectionCard>
                        ) : (
                            dailyMissions.map((mission, i) => {
                                const progress = Math.min((mission.current_count / mission.required_count) * 100, 100);
                                return (
                                    <motion.div
                                        key={mission.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        style={{
                                            padding: 16,
                                            borderRadius: 14,
                                            background: mission.is_completed ? "rgba(255,255,255,0.025)" : t.surface,
                                            border: `1px solid ${mission.is_completed ? `${roleColor}25` : t.border}`,
                                            opacity: mission.is_completed ? 0.8 : 1,
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                            <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: mission.is_completed ? `${roleColor}20` : "rgba(255,255,255,0.04)", border: `1px solid ${mission.is_completed ? `${roleColor}35` : t.border}`, color: mission.is_completed ? roleColor : t.sub }}>
                                                {mission.is_completed ? <CheckCircle2 size={18} /> : <span style={{ fontSize: 12, fontWeight: 900 }}>{mission.required_count}</span>}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: t.text }}>{mission.title}</p>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        {mission.is_completed ? (
                                                            <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 8px", borderRadius: 999, background: `${roleColor}18`, border: `1px solid ${roleColor}30`, color: roleColor }}>
                                                                達成済み
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 8px", borderRadius: 999, background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.sub }}>
                                                                進行中
                                                            </span>
                                                        )}
                                                        <span style={{ fontSize: 11, fontWeight: 900, fontFamily: "monospace", color: roleColor }}>
                                                            +{mission.point_reward}pt
                                                        </span>
                                                    </div>
                                                </div>
                                                <p style={{ margin: "0 0 12px", fontSize: 11, color: t.sub, lineHeight: 1.6 }}>
                                                    {mission.description || "毎日コツコツ進めてポイントを獲得しよう"}
                                                </p>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                                    <span style={{ fontSize: 10, color: t.sub }}>進捗</span>
                                                    <span style={{ fontSize: 11, fontWeight: 800, color: mission.is_completed ? roleColor : t.text }}>
                                                        {Math.min(mission.current_count, mission.required_count)}/{mission.required_count}
                                                    </span>
                                                </div>
                                                <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                                        style={{
                                                            height: "100%",
                                                            borderRadius: 99,
                                                            background: mission.is_completed ? "linear-gradient(90deg,#FFD600,#FFD60066)" : `linear-gradient(90deg,${roleColor},${roleColor}66)`,
                                                        }}
                                                    />
                                                </div>
                                                <p style={{ margin: "10px 0 0", fontSize: 10, color: mission.is_completed ? roleColor : t.sub }}>
                                                    {mission.is_completed ? "本日の達成報酬を受け取り済みです" : "対象アクションを行うと自動で進捗が更新されます"}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                        <p style={{ margin: 0, fontSize: 10, color: t.sub, opacity: 0.7 }}>
                            デイリーミッションは毎日0時にリセットされます
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
