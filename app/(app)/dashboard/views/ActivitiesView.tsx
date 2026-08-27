"use client";

// dashboard/views/ActivitiesView.tsx
// Core Loop 起点: Activity の作成・一覧・詳細。
// 「自分だけのスポーツフィード（MY ACTIVITY）」として、自分の活動履歴を時系列で振り返るUI。
// Activity は継続して行う活動の Core Data。Moment のような他人への SNS Feed ではない。

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ViewHeader, SLabel, PrimaryButton, SecondaryButton, DangerButton } from "../components/ui";
import { BottomSheet } from "../components/core/BottomSheet";
import { PlacePicker } from "../components/core/PlacePicker";
import { LoadingSkeleton, FeedEmptyState, FeedErrorState, ImageDisplay } from "../components/feed";
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

const STATUS_COLOR: Record<string, string> = {
    planned: "#FFB454",
    completed: "#32D278",
    cancelled: "#FF5C7A",
};

function toLocalInput(iso?: string): string {
    const d = iso ? new Date(iso) : new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric" });
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
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

    // 時系列（新しい順）。既に starts_at で降順ソート済み。
    const latest = items[0] ?? null;
    const past = items.slice(1);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader
                title={mode === "create" ? "New Activity" : "MY ACTIVITY"}
                sub="自分だけのスポーツフィード — 活動履歴を振り返る"
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

                    {error ? (
                        <FeedErrorState message={error} onRetry={() => void load()} />
                    ) : null}

                    {loading ? (
                        <LoadingSkeleton media={false} />
                    ) : items.length === 0 ? (
                        <FeedEmptyState
                            title="まだActivityがありません"
                            description="最初の活動を記録して、自分のスポーツフィードを始めましょう。"
                            action={
                                <PrimaryButton onClick={() => setMode("create")} disabled={loading}>
                                    + Activity を記録
                                </PrimaryButton>
                            }
                        />
                    ) : (
                        <>
                            {/* Latest Activity */}
                            <SLabel text="LATEST" color={`${roleColor}aa`} />
                            <ActivityFeedCard
                                activity={latest!}
                                roleColor={roleColor}
                                onOpen={() => {
                                    setDetailId(latest!.id);
                                    setMode("detail");
                                }}
                                reduce={reduce}
                            />

                            {/* Past Activity */}
                            {past.length > 0 ? (
                                <>
                                    <SLabel text="PAST ACTIVITY" color={`${roleColor}aa`} />
                                    {past.map((a) => (
                                        <ActivityFeedCard
                                            key={a.id}
                                            activity={a}
                                            roleColor={roleColor}
                                            onOpen={() => {
                                                setDetailId(a.id);
                                                setMode("detail");
                                            }}
                                            reduce={reduce}
                                        />
                                    ))}
                                </>
                            ) : null}
                        </>
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
                                <TypeBadge type={a.type} color={roleColor} />
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

function TypeBadge({ type, color }: { type: ActivityType; color: string }) {
    return (
        <span
            style={{
                padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                fontFamily: "'Space Mono', monospace", letterSpacing: "0.06em",
                background: `${color}16`, color,
                border: `1px solid ${color}30`,
                whiteSpace: "nowrap",
            }}
        >
            {TYPE_LABELS[type]}
        </span>
    );
}

/** Activity フィードカード（自分だけのスポーツフィードの1件）。 */
function ActivityFeedCard({
    activity: a,
    roleColor,
    onOpen,
    reduce,
}: {
    activity: ActivityWithPlace;
    roleColor: string;
    onOpen: () => void;
    reduce: boolean | null;
}) {
    const statusColor = STATUS_COLOR[a.status] ?? "rgba(255,255,255,0.5)";
    return (
        <motion.button
            type="button"
            whileTap={reduce ? undefined : { scale: 0.985 }}
            onClick={onOpen}
            style={{
                textAlign: "left", cursor: "pointer",
                background: "#111118", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "13px 15px",
                display: "flex", flexDirection: "column", gap: 7,
            }}
        >
            {/* ヘッダー: 日付 + ステータス/公開範囲 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: "0.04em", color: "rgba(255,255,255,0.45)" }}>
                    {formatDate(a.starts_at)}
                </span>
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 10, color: statusColor, fontWeight: 700 }}>{STATUS_LABELS[a.status]}</span>
                    <span
                        style={{
                            padding: "2px 7px", borderRadius: 999, fontSize: 9,
                            fontWeight: 700, fontFamily: "'Space Mono', monospace", letterSpacing: "0.04em",
                            background: "rgba(255,255,255,0.06)",
                            color: a.visibility === "public" ? "#7FB2FF" : a.visibility === "connections" ? "#FFC81E" : "rgba(255,255,255,0.5)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        {VISIBILITY_LABELS[a.visibility]}
                    </span>
                </span>
            </div>

            {/* タイプ + タイトル */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TypeBadge type={a.type} color={roleColor} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#f0f0f5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {a.title}
                </span>
            </div>

            {/* 内容 */}
            {a.description ? (
                <div
                    style={{
                        fontSize: 12.5, lineHeight: 1.55, color: "rgba(255,255,255,0.6)",
                        whiteSpace: "pre-wrap", wordBreak: "break-word",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {a.description}
                </div>
            ) : null}

            {/* 時間・場所 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                <span>🕐 {formatTime(a.starts_at)}{a.ends_at ? ` – ${formatTime(a.ends_at)}` : ""}</span>
                {a.place ? (
                    <>
                        <span aria-hidden style={{ opacity: 0.5 }}>•</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {a.place.name}</span>
                    </>
                ) : null}
            </div>
        </motion.button>
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
    const [uploading, setUploading] = useState(false);

    async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setUploading(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/moments/upload", {
                method: "POST",
                body: formData,
                credentials: "same-origin",
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || typeof json?.url !== "string") {
                throw new Error(typeof json?.error === "string" ? json.error : "画像アップロードに失敗しました");
            }
            setImageUrl(json.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "画像アップロードに失敗しました");
        } finally {
            setUploading(false);
        }
    }

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
                ★ Momentとして公開
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

                        {/* 画像アップロード（URL直接入力の代替） */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <label
                                    style={{
                                        flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        minHeight: 40, borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer",
                                        background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.25)",
                                        color: uploading ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.7)",
                                    }}
                                >
                                    {uploading ? "アップロード中..." : (imageUrl ? "画像を変更" : "+ 画像を添付")}
                                    <input type="file" accept="image/*" onChange={(e) => void handleImageFile(e)} disabled={uploading} style={{ display: "none" }} aria-label="画像を添付" />
                                </label>
                            </div>
                            {imageUrl ? (
                                <ImageDisplay src={imageUrl} alt="添付予定の画像" maxHeight={200} />
                            ) : null}
                        </div>

                        <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="動画URL（任意）" style={inputStyle} aria-label="動画URL" />
                        <select value={visibility} onChange={(e) => setVisibility(e.target.value as typeof visibility)} style={inputStyle} aria-label="公開範囲">
                            <option value="public" style={{ color: "#000" }}>公開</option>
                            <option value="connections" style={{ color: "#000" }}>Connectionのみ</option>
                            <option value="private" style={{ color: "#000" }}>非公開（保存のみ）</option>
                        </select>
                        {error ? <p role="alert" style={{ margin: 0, fontSize: 11, color: "rgba(255,120,120,0.9)" }}>{error}</p> : null}
                        <PrimaryButton onClick={publish} disabled={busy || uploading || !body.trim()}>
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
