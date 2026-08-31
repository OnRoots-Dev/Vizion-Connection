"use client";

// dashboard/components/core/ActivityTogetherPanel.tsx
// Together Activity（一緒に活動した人）パネル。
// Connection とは独立。pending -> accepted / declined。
//   - Activity オーナー: 参加申請の Accept / Decline を実行できる。
//   - 参加希望者: 参加申請を出し、自分の申請状態を確認できる。

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { apiSend, ApiError } from "@/lib/api/core-client";
import type { ActivityParticipantRecord, ActivityParticipantStatus } from "@/features/activity/types";

const STATUS_LABELS: Record<ActivityParticipantStatus, string> = {
    pending: "申請中",
    accepted: "Together確定",
    declined: "辞退済み",
};

const STATUS_COLOR: Record<ActivityParticipantStatus, string> = {
    pending: "#FFB454",
    accepted: "#32D278",
    declined: "rgba(255,255,255,0.45)",
};

type ParticipantRow = ActivityParticipantRecord & {
    user_slug: string | null;
    user_display_name: string | null;
};

export function ActivityTogetherPanel({
    activityId,
    isOwner,
    accentColor = "#C8E800",
}: {
    activityId: string;
    isOwner: boolean;
    accentColor?: string;
}) {
    const reduce = useReducedMotion();
    const [participants, setParticipants] = useState<ParticipantRow[]>([]);
    const [myStatus, setMyStatus] = useState<ActivityParticipantStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionBusy, setActionBusy] = useState(false);
    const [error, setError] = useState("");
    const [flash, setFlash] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/activities/${activityId}/participants`, { credentials: "same-origin", cache: "no-store" });
            if (!res.ok) {
                setParticipants([]);
                return;
            }
            const data = (await res.json()) as {
                participants?: ParticipantRow[];
                state?: { status: ActivityParticipantStatus | null };
            };
            setParticipants(data.participants ?? []);
            setMyStatus(data.state?.status ?? null);
        } catch {
            /* 取得成功時のみ反映 */
        } finally {
            setLoading(false);
        }
    }, [activityId]);

    useEffect(() => {
        void load();
    }, [load]);

    async function apply() {
        if (actionBusy) return;
        setActionBusy(true);
        setError("");
        try {
            const data = await apiSend<{ success: boolean; participant?: ActivityParticipantRecord }>(
                `/api/activities/${activityId}/participants`,
                "POST",
                {},
            );
            setMyStatus(data.participant?.status ?? "pending");
            await load();
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "申請できませんでした");
        } finally {
            setActionBusy(false);
        }
    }

    async function respond(userId: number, status: "accepted" | "declined") {
        if (actionBusy) return;
        setActionBusy(true);
        setError("");
        try {
            await apiSend(`/api/activities/${activityId}/participants/${userId}`, "PATCH", { status });
            setFlash(status === "accepted" ? "受け入れました 🎉" : "辞退にしました");
            window.setTimeout(() => setFlash(""), 2000);
            await load();
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "応答できませんでした");
        } finally {
            setActionBusy(false);
        }
    }

    const accepted = participants.filter((p) => p.status === "accepted");
    const pending = participants.filter((p) => p.status === "pending");
    const declined = participants.filter((p) => p.status === "declined");

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#f0f0f5", letterSpacing: "0.02em" }}>
                    TOGETHER <span style={{ color: accentColor }}>一緒に活動した人</span>
                    {accepted.length > 0 ? <span style={{ marginLeft: 6, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>({accepted.length})</span> : null}
                </span>
                {!isOwner && myStatus == null ? (
                    <motion.button
                        type="button"
                        whileTap={reduce ? undefined : { scale: 0.94 }}
                        onClick={apply}
                        disabled={actionBusy}
                        style={{
                            minHeight: 32, padding: "0 14px", borderRadius: 999,
                            fontSize: 11, fontWeight: 800, cursor: actionBusy ? "wait" : "pointer",
                            background: `${accentColor}1f`, color: accentColor,
                            border: `1px solid ${accentColor}55`,
                        }}
                    >
                        {actionBusy ? "申請中..." : "一緒に参加する"}
                    </motion.button>
                ) : null}
            </div>

            {!isOwner && myStatus != null ? (
                <p
                    style={{
                        margin: 0, fontSize: 12, fontWeight: 700, padding: "10px 12px", borderRadius: 10,
                        background: `${STATUS_COLOR[myStatus]}1a`, border: `1px solid ${STATUS_COLOR[myStatus]}44`,
                        color: STATUS_COLOR[myStatus],
                    }}
                >
                    {myStatus === "accepted" ? "Together確定！ 一緒に活動しています 🎉" : `あなたの申請状態: ${STATUS_LABELS[myStatus]}`}
                </p>
            ) : null}

            {error ? <p role="alert" style={{ margin: 0, fontSize: 11, color: "rgba(255,120,120,0.9)" }}>{error}</p> : null}

            {loading ? (
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>読み込み中...</p>
            ) : participants.length === 0 ? (
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                    {isOwner ? "参加申請はまだありません。" : "このActivityにはまだ参加者がいません。"}
                </p>
            ) : (
                <>
                    {accepted.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {accepted.map((p) => (
                                <span
                                    key={p.id}
                                    style={{
                                        display: "inline-flex", alignItems: "center", gap: 5,
                                        padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                                        background: "rgba(50,210,120,0.14)", border: "1px solid rgba(50,210,120,0.4)",
                                        color: "#5FE39A",
                                    }}
                                >
                                    {p.user_display_name ?? p.user_slug ?? "ユーザー"}
                                    {p.role ? <span style={{ fontSize: 9, opacity: 0.7 }}>· {p.role}</span> : null}
                                </span>
                            ))}
                        </div>
                    ) : null}

                    {isOwner && pending.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em" }}>
                                参加希望
                            </span>
                            {pending.map((p) => (
                                <div
                                    key={p.id}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                                        padding: "8px 10px", borderRadius: 10,
                                        background: "rgba(255,180,84,0.08)", border: "1px solid rgba(255,180,84,0.3)",
                                    }}
                                >
                                    <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 700, color: "#f0f0f5" }}>
                                        {p.user_display_name ?? p.user_slug ?? "ユーザー"}
                                    </span>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <motion.button
                                            type="button"
                                            whileTap={reduce ? undefined : { scale: 0.94 }}
                                            onClick={() => void respond(p.user_id, "accepted")}
                                            disabled={actionBusy}
                                            style={{
                                                padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800,
                                                border: "none", cursor: actionBusy ? "wait" : "pointer",
                                                background: "#32D278", color: "#04140A",
                                            }}
                                        >
                                            Accept
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            whileTap={reduce ? undefined : { scale: 0.94 }}
                                            onClick={() => void respond(p.user_id, "declined")}
                                            disabled={actionBusy}
                                            style={{
                                                padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800,
                                                border: "1px solid rgba(255,255,255,0.25)", cursor: actionBusy ? "wait" : "pointer",
                                                background: "transparent", color: "rgba(255,255,255,0.7)",
                                            }}
                                        >
                                            Decline
                                        </motion.button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {isOwner && declined.length > 0 ? (
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.38)" }}>
                            辞退: {declined.map((p) => p.user_display_name ?? p.user_slug).join(", ")}
                        </span>
                    ) : null}
                </>
            )}

            <AnimatePresence>
                {flash ? (
                    <motion.div
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="status"
                        style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                            background: "rgba(200,232,0,0.12)", border: "1px solid rgba(200,232,0,0.4)", color: "#C8E800",
                        }}
                    >
                        {flash}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
