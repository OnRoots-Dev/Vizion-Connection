"use client";

// dashboard/components/core/ConnectionButton.tsx
// Connection（承認制の双方向関係）専用ボタン。Bond/Followとは別UI。
// 状態: none → Connect | outgoing pending → Requested(+Cancel) |
//       incoming pending → Accept(+Ignore) | accepted → Connected(+Remove)

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { apiSend, ApiError } from "@/lib/api/core-client";
import { MOTION, TAP_SCALE } from "@/lib/design/tokens";

export type ConnectionState = "none" | "outgoing" | "incoming" | "accepted";

interface Props {
    targetSlug: string;
    state: ConnectionState;
    connectionId: string | null;
    /** 親リストに状態変化を通知（再取得など） */
    onChanged?: () => void;
    compact?: boolean;
}

export function ConnectionButton({ targetSlug, state, connectionId, onChanged, compact }: Props) {
    const reduce = useReducedMotion();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [flash, setFlash] = useState(0);

    async function act(fn: () => Promise<unknown>) {
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            await fn();
            setFlash((n) => n + 1);
            onChanged?.();
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "操作に失敗しました");
        } finally {
            setBusy(false);
        }
    }

    const baseStyle: React.CSSProperties = {
        minHeight: compact ? 32 : 40,
        padding: compact ? "0 12px" : "0 16px",
        borderRadius: 999,
        fontSize: compact ? 11 : 12,
        fontWeight: 800,
        letterSpacing: "0.03em",
        cursor: busy ? "wait" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        userSelect: "none",
    };

    return (
        <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "inline-flex", gap: 6 }}>
                {state === "none" ? (
                    <motion.button
                        type="button"
                        whileTap={reduce || busy ? undefined : { scale: TAP_SCALE }}
                        animate={flash && !reduce ? { scale: [1, 1.08, 1] } : undefined}
                        transition={MOTION.pop}
                        disabled={busy}
                        onClick={() => act(() => apiSend("/api/connections", "POST", { target_slug: targetSlug }))}
                        style={{
                            ...baseStyle,
                            background: "#C8E800", color: "#000", border: "none",
                            opacity: busy ? 0.5 : 1,
                        }}
                    >
                        Connect
                    </motion.button>
                ) : null}

                {state === "outgoing" ? (
                    <>
                        <span
                            style={{
                                ...baseStyle, cursor: "default",
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.16)",
                                color: "rgba(255,255,255,0.65)",
                            }}
                        >
                            Requested
                        </span>
                        <motion.button
                            type="button"
                            whileTap={reduce || busy ? undefined : { scale: TAP_SCALE }}
                            disabled={busy}
                            onClick={() =>
                                connectionId &&
                                act(() => apiSend(`/api/connections/${connectionId}`, "DELETE"))
                            }
                            style={{
                                ...baseStyle, background: "transparent",
                                border: "1px solid rgba(255,255,255,0.18)",
                                color: "rgba(255,255,255,0.55)", opacity: busy ? 0.5 : 1,
                            }}
                        >
                            Cancel
                        </motion.button>
                    </>
                ) : null}

                {state === "incoming" ? (
                    <>
                        <motion.button
                            type="button"
                            whileTap={reduce || busy ? undefined : { scale: TAP_SCALE }}
                            animate={flash && !reduce ? { scale: [1, 1.1, 1] } : undefined}
                            transition={MOTION.pop}
                            disabled={busy}
                            onClick={() =>
                                connectionId && act(() => apiSend(`/api/connections/${connectionId}`, "POST"))
                            }
                            style={{
                                ...baseStyle, background: "#C8E800", color: "#000",
                                border: "none", opacity: busy ? 0.5 : 1,
                            }}
                        >
                            Accept
                        </motion.button>
                        <motion.button
                            type="button"
                            whileTap={reduce || busy ? undefined : { scale: TAP_SCALE }}
                            disabled={busy}
                            onClick={() =>
                                connectionId && act(() => apiSend(`/api/connections/${connectionId}`, "DELETE"))
                            }
                            style={{
                                ...baseStyle, background: "transparent",
                                border: "1px solid rgba(255,255,255,0.18)",
                                color: "rgba(255,255,255,0.55)", opacity: busy ? 0.5 : 1,
                            }}
                        >
                            破棄
                        </motion.button>
                    </>
                ) : null}

                {state === "accepted" ? (
                    <AnimatePresence>
                        <motion.span
                            key={`connected-${flash}`}
                            style={{
                                ...baseStyle, cursor: "default",
                                background: "rgba(200,232,0,0.1)",
                                border: "1px solid rgba(200,232,0,0.35)",
                                color: "#C8E800",
                            }}
                        >
                            Connected
                        </motion.span>
                    </AnimatePresence>
                ) : null}
            </div>

            {state === "accepted" && connectionId ? (
                <button
                    type="button"
                    onClick={() => !busy && act(() => apiSend(`/api/connections/${connectionId}`, "DELETE"))}
                    style={{
                        alignSelf: "flex-start", padding: 0, fontSize: 10,
                        color: "rgba(255,255,255,0.35)", background: "none",
                        border: "none", cursor: busy ? "wait" : "pointer", textDecoration: "underline",
                    }}
                >
                    Remove
                </button>
            ) : null}

            {error ? (
                <p role="alert" style={{ margin: 0, fontSize: 10, color: "rgba(255,120,120,0.9)" }}>{error}</p>
            ) : null}
        </div>
    );
}
