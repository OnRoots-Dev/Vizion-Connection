"use client";

// dashboard/views/ActivitiesView.tsx
// Core Loop 起点: Activity の作成・一覧・詳細。
// 既存 Journey（日誌）とは別物。Activity = 継続して行う活動のCore Data。

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ViewHeader, SLabel, PrimaryButton, SecondaryButton, DangerButton, ViewLoader } from "../components/ui";
import { BottomSheet } from "../components/core/BottomSheet";
import { PlacePicker } from "../components/core/PlacePicker";
import { apiGet, apiSend, ApiError } from "@/lib/api/core-client";
import type { ActivityRecord, ActivityType } from "@/features/activity/types";
import { ACTIVITY_TYPES_BY_ROLE as TYPES_BY_ROLE, ACTIVITY_VISIBILITIES } from "@/features/activity/types";
import type { PlaceRecord } from "@/features/place/place";
import type { ThemeColors } from "../types";

type ActivityWithPlace = ActivityRecord & {
    place?: Pick<PlaceRecord, "id" | "name" | "prefecture"> | null;
};

const TYPE_LABELS: Record<ActivityType, string> = {
    practice: "練習", training: "トレーニング", match: "試合", competition: "大会",
    event: "イベント", coaching: "コーチング", session: "セッション", workshop: "ワークショップ",
    watching: "観戦", supporting: "サポート", participation: "参加", other: "その他",
};

const VISIBILITY_LABELS: Record<string, string> = {
    public: "公開", connections: "Connection", private: "非公開",
};

const STATUS_LABELS: Record<string, string> = {
    planned: "予定", completed: "完了", cancelled: "中止",
};

function toLocalInput(iso?: string): string {
    const d = iso ? new Date(iso) : new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ActivitiesView({
    profile,
    t,
    roleColor,
    onBack,
}: {
    profile: { id: string | number; slug: string; role: string };
    t: ThemeColors;
    roleColor: string;
    onBack: () => void;
}) {
    const reduce = useReducedMotion();
    const allowedTypes = (TYPES_BY_ROLE[profile.role as keyof typeof TYPES_BY_ROLE] ?? TYPES_BY_ROLE.Athlete) as readonly ActivityType[];

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [items, setItems] = useState<ActivityWithPlace[]>([]);
    const [mode, setMode] = useState<"list" | "create" | "detail">("list");
    const [detailId, setDetailId] = useState<string | null>(null);

    // form state
    const [fType, setFType] = useState<ActivityType>(allowedTypes[0]);
    const [fTitle, setFTitle] = useState("");
    const [fDesc, setFDesc] = useState("");
    const [fStart, setFStart] = useState(toLocalInput());
    const [fEnd, setFEnd] = useState("");
    const [fPlace, setFPlace] = useState<PlaceRecord | null>(null);
    const [fVisibility, setFVisibility] = useState<(typeof ACTIVITY_VISIBILITIES)[number]>("private");
    const [fTags, setFTags] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [successFlash, setSuccessFlash] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await apiGet<{ success: boolean; activities: ActivityWithPlace[] }>("/api/activities");
            setItems(data.activities ?? []);
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "読み込みに失敗しました");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    async function submit() {
        if (!fTitle.trim()) {
            setError("タイトルを入力してください");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await apiSend("/api/activities", "POST", {
                type: fType,
                title: fTitle.trim(),
                description: fDesc.trim() || null,
                starts_at: new Date(fStart).toISOString(),
                ends_at: fEnd ? new Date(fEnd).toISOString() : null,
                place_id: fPlace?.id ?? null,
                visibility: fVisibility,
                tags: fTags.split(/[,，、\s]+/).map((s) => s.trim()).filter(Boolean).slice(0, 5),
            });
            setSuccessFlash(true);
            window.setTimeout(() => setSuccessFlash(false), 1800);
            // reset minimal
            setFTitle(""); setFDesc(""); setFEnd(""); setFPlace(null); setFTags("");
            setMode("list");
            await load();
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "保存に失敗しました");
        } finally {
            setSubmitting(false);
        }
    }

    async function changeStatus(id: string, status: "completed" | "cancelled") {
        try {
            await apiSend(`/api/activities/${id}`, "PATCH", { status });
            await load();
        } catch {
            setError("ステータスを変更できませんでした");
        }
    }

    async function remove(id: string) {
        if (!window.confirm("このActivityを削除しますか？")) return;
        try {
            await apiSend(`/api/activities/${id}`, "DELETE");
            setMode("list");
            await load();
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "削除できませんでした");
        }
    }

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 12px", borderRadius: 10,
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
        color: "#f0f0f5", fontSize: 13, outline: "none",
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader
                title={mode === "create" ? "New Activity" : "Activities"}
                sub="継続する活動を記録し、MomentとMapにつなげる"
                onBack={onBack}
                t={t}
                roleColor={roleColor}
            />

            <AnimatePresence>
                {successFlash ? (
                    <motion.div
                        initial={reduce ? false : { opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="status"
                        style={{
                            padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                            background: "rgba(200,232,0,0.12)", border: "1px solid rgba(200,232,0,0.4)",
                            color: "#C8E800",
                        }}
                    >
                        ✓ Activityを記録しました
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {mode === "list" ? (
                <>
                    <PrimaryButton onClick={() => setMode("create")} disabled={loading}>+ Activity を作成</PrimaryButton>

                    {loading ? (
                        <ViewLoader t={t} />
                    ) : items.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "36px 16px", color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                            まだActivityがありません。
                            <br />
                            最初の活動を記録してみましょう。
                        </div>
                    ) : (
                        items.map((a) => (
                            <motion.button
                                key={a.id}
                                type="button"
                                whileTap={reduce ? undefined : { scale: 0.985 }}
                                onClick={() => {
                                    setDetailId(a.id);
                                    setMode("detail");
                                }}
                                style={{
                                    textAlign: "left", cursor: "pointer",
                                    background: "#111118", border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: 14, padding: "13px 15px",
                                    display: "flex", flexDirection: "column", gap: 6,
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span
                                        style={{
                                            padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                                            fontFamily: "'Space Mono', monospace", letterSpacing: "0.06em",
                                            background: `${roleColor}16`, color: roleColor,
                                            border: `1px solid ${roleColor}30`,
                                        }}
                                    >
                                        {TYPE_LABELS[a.type]}
                                    </span>
                                    <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                                        {VISIBILITY_LABELS[a.visibility]} · {STATUS_LABELS[a.status]}
                                    </span>
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f0f5" }}>{a.title}</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                                    🗓 {new Date(a.starts_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    {a.place ? ` · 📍 ${a.place.name}` : ""}
                                </div>
                            </motion.button>
                        ))
                    )}
                </>
            ) : mode === "create" ? (
                <section
                    aria-label="Activity作成フォーム"
                    style={{
                        background: "#111118", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 12,
                    }}
                >
                    <SLabel text="TYPE" color={`${roleColor}aa`} />
                    <div role="radiogroup" aria-label="Activity Type" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {allowedTypes.map((tp) => (
                            <motion.button
                                key={tp}
                                type="button"
                                role="radio"
                                aria-checked={fType === tp}
                                whileTap={reduce ? undefined : { scale: 0.94 }}
                                onClick={() => setFType(tp)}
                                style={{
                                    padding: "7px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800,
                                    cursor: "pointer",
                                    ...(fType === tp
                                        ? { background: "#C8E800", color: "#000", border: "none" }
                                        : {
                                              background: "rgba(255,255,255,0.05)",
                                              color: "rgba(255,255,255,0.65)",
                                              border: "1px solid rgba(255,255,255,0.14)",
                                          }),
                                }}
                            >
                                {TYPE_LABELS[tp]}
                            </motion.button>
                        ))}
                    </div>

                    <SLabel text="TITLE" color={`${roleColor}aa`} />
                    <input value={fTitle} onChange={(e) => setFTitle(e.target.value.slice(0, 60))} placeholder="例: 大会前の最終調整" style={inputStyle} />

                    <SLabel text="DESCRIPTION（任意）" color={`${roleColor}aa`} />
                    <textarea value={fDesc} onChange={(e) => setFDesc(e.target.value.slice(0, 500))} placeholder="内容メモ（500字まで）" rows={2} style={{ ...inputStyle, resize: "vertical" }} />

                    <SLabel text="DATE / TIME" color={`${roleColor}aa`} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "flex", flexDirection: "column", gap: 4 }}>
                            開始
                            <input type="datetime-local" value={fStart} onChange={(e) => setFStart(e.target.value)} style={inputStyle} required />
                        </label>
                        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "flex", flexDirection: "column", gap: 4 }}>
                            終了（任意）
                            <input type="datetime-local" value={fEnd} onChange={(e) => setFEnd(e.target.value)} style={inputStyle} />
                        </label>
                    </div>

                    <SLabel text="PLACE" color={`${roleColor}aa`} />
                    <PlacePicker value={fPlace} onChange={setFPlace} />

                    <SLabel text="VISIBILITY" color={`${roleColor}aa`} />
                    <div role="radiogroup" aria-label="公開範囲" style={{ display: "flex", gap: 6 }}>
                        {ACTIVITY_VISIBILITIES.map((v) => (
                            <motion.button
                                key={v}
                                type="button"
                                role="radio"
                                aria-checked={fVisibility === v}
                                whileTap={reduce ? undefined : { scale: 0.94 }}
                                onClick={() => setFVisibility(v)}
                                style={{
                                    flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 12, fontWeight: 800,
                                    cursor: "pointer",
                                    ...(fVisibility === v
                                        ? { background: "#C8E800", color: "#000", border: "none" }
                                        : {
                                              background: "rgba(255,255,255,0.05)",
                                              color: "rgba(255,255,255,0.65)",
                                              border: "1px solid rgba(255,255,255,0.14)",
                                          }),
                                }}
                            >
                                {VISIBILITY_LABELS[v]}
                            </motion.button>
                        ))}
                    </div>

                    <SLabel text="TAGS（最大5）" color={`${roleColor}aa`} />
                    <input value={fTags} onChange={(e) => setFTags(e.target.value)} placeholder="陸上, 走り幅跳び" style={inputStyle} />

                    {error ? <p role="alert" style={{ margin: 0, fontSize: 12, color: "rgba(255,120,120,0.9)" }}>{error}</p> : null}

                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <PrimaryButton onClick={submit} disabled={submitting}>{submitting ? "保存中..." : "Activityを作成"}</PrimaryButton>
                        <SecondaryButton onClick={() => { setMode("list"); setError(""); }}>キャンセル</SecondaryButton>
                    </div>
                </section>
            ) : null}

            {/* 詳細（ボトムシート） */}
            <BottomSheet open={mode === "detail"} onClose={() => setMode("list")} title="ACTIVITY DETAIL" t={t}>
                {(() => {
                    const a = items.find((x) => x.id === detailId);
                    if (!a) return null;
                    return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span
                                    style={{
                                        padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                                        fontFamily: "'Space Mono', monospace",
                                        background: `${roleColor}16`, color: roleColor,
                                        border: `1px solid ${roleColor}30`,
                                    }}
                                >
                                    {TYPE_LABELS[a.type]}
                                </span>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginLeft: "auto" }}>
                                    {VISIBILITY_LABELS[a.visibility]} · {STATUS_LABELS[a.status]}
                                </span>
                            </div>

                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#f0f0f5" }}>{a.title}</h3>
                            {a.description ? (
                                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.75)" }}>{a.description}</p>
                            ) : null}

                            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                                <span>🗓 {new Date(a.starts_at).toLocaleString("ja-JP")}{a.ends_at ? ` 〜 ${new Date(a.ends_at).toLocaleString("ja-JP")}` : ""}</span>
                                {a.place ? <span>📍 {a.place.name}（{a.place.prefecture}）</span> : <span style={{ color: "rgba(255,255,255,0.4)" }}>📍 場所なし</span>}
                                {a.tags.length > 0 ? (
                                    <span style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                        {a.tags.map((tag) => (
                                            <span key={tag} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}>#{tag}</span>
                                        ))}
                                    </span>
                                ) : null}
                            </div>

                            <MomentComposerInline activityId={a.id} activityTitle={a.title ?? ""} roleColor={roleColor} onPublished={load} />

                            <div style={{ display: "flex", gap: 8, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
                                {a.status !== "completed" ? (
                                    <SecondaryButton onClick={() => changeStatus(a.id, "completed")}>完了にする</SecondaryButton>
                                ) : null}
                                {a.status !== "cancelled" ? (
                                    <DangerButton onClick={() => changeStatus(a.id, "cancelled")}>中止</DangerButton>
                                ) : null}
                                <DangerButton onClick={() => remove(a.id)}>削除</DangerButton>
                            </div>
                        </div>
                    );
                })()}
            </BottomSheet>
        </div>
    );
}

/** 「このActivityから生まれたMoment」であることを明示する公開コンポーザー */
function MomentComposerInline({
    activityId,
    activityTitle,
    roleColor,
    onPublished,
}: {
    activityId: string;
    activityTitle: string;
    roleColor: string;
    onPublished: () => Promise<void>;
}) {
    const reduce = useReducedMotion();
    const [open, setOpen] = useState(false);
    const [body, setBody] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [visibility, setVisibility] = useState<"public" | "connections" | "private">("public");
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    async function publish() {
        setBusy(true);
        setError("");
        try {
            await apiSend("/api/moments", "POST", {
                body: body.trim(),
                image_url: imageUrl.trim() || null,
                video_url: videoUrl.trim() || null,
                visibility,
                activity_id: activityId,
            });
            setDone(true);
            setBody(""); setImageUrl(""); setVideoUrl("");
            setOpen(false);
            window.setTimeout(() => setDone(false), 2200);
            await onPublished();
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "公開に失敗しました");
        } finally {
            setBusy(false);
        }
    }

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "9px 11px", borderRadius: 10,
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
        color: "#f0f0f5", fontSize: 13, outline: "none",
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <motion.button
                type="button"
                whileTap={reduce ? undefined : { scale: 0.97 }}
                onClick={() => setOpen((o) => !o)}
                style={{
                    minHeight: 44, borderRadius: 12, fontSize: 13, fontWeight: 900,
                    letterSpacing: "0.02em", cursor: "pointer",
                    background: `linear-gradient(135deg, ${roleColor}, #ffffffcc)`,
                    color: "#050508", border: "none",
                    boxShadow: `0 10px 26px ${roleColor}33`,
                }}
            >
                ⚡ Momentとして公開
            </motion.button>

            <AnimatePresence>
                {open ? (
                    <motion.section
                        initial={reduce ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 8 }}
                        aria-label="Moment作成"
                    >
                        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)", background: "rgba(200,232,0,0.06)", border: "1px dashed rgba(200,232,0,0.3)", borderRadius: 8, padding: "6px 10px" }}>
                            このMomentは「{activityTitle}」から生まれます
                        </p>
                        <textarea value={body} onChange={(e) => setBody(e.target.value.slice(0, 500))} placeholder="この活動から何を見つけた？" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="画像URL（任意）" style={inputStyle} aria-label="画像URL" />
                        <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="動画URL（任意）" style={inputStyle} aria-label="動画URL" />
                        <select value={visibility} onChange={(e) => setVisibility(e.target.value as typeof visibility)} style={inputStyle} aria-label="公開範囲">
                            <option value="public" style={{ color: "#000" }}>公開</option>
                            <option value="connections" style={{ color: "#000" }}>Connectionのみ</option>
                            <option value="private" style={{ color: "#000" }}>非公開（保存のみ）</option>
                        </select>
                        {error ? <p role="alert" style={{ margin: 0, fontSize: 11, color: "rgba(255,120,120,0.9)" }}>{error}</p> : null}
                        <PrimaryButton onClick={publish} disabled={busy || !body.trim()}>
                            {busy ? "公開中..." : "Momentを公開"}
                        </PrimaryButton>
                    </motion.section>
                ) : null}
            </AnimatePresence>

            <AnimatePresence>
                {done ? (
                    <motion.div
                        initial={reduce ? false : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="status"
                        style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                            background: "rgba(200,232,0,0.12)", border: "1px solid rgba(200,232,0,0.4)", color: "#C8E800",
                        }}
                    >
                        ✓ Momentを公開しました
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
