"use client";

// components/ui/toast.tsx — toast（Design System v2）
// provider を root layout で一度マウントし、useToast() で発火する。
// mobile: 下部中央 / desktop: 右上。4s auto dismiss。reduced-motion はフェードのみ。

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type ToastTone = "neutral" | "success" | "warning" | "danger";

interface ToastItem {
    id: number;
    title: string;
    description?: string;
    tone: ToastTone;
}

interface ToastContextValue {
    show: (toast: { title: string; description?: string; tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

const TONE_COLOR: Record<ToastTone, string> = {
    neutral: "var(--vc-accent)",
    success: "var(--vc-success)",
    warning: "var(--vc-warning)",
    danger: "var(--vc-danger)",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<ToastItem[]>([]);
    const seq = useRef(0);
    const reduce = useReducedMotion();

    const dismiss = useCallback((id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const show = useCallback((toast: { title: string; description?: string; tone?: ToastTone }) => {
        seq.current += 1;
        const id = seq.current;
        setItems((prev) => [...prev.slice(-2), { id, title: toast.title, description: toast.description, tone: toast.tone ?? "neutral" }]);
        window.setTimeout(() => dismiss(id), 4000);
    }, [dismiss]);

    const value = useMemo(() => ({ show }), [show]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                aria-live="polite"
                style={{
                    position: "fixed",
                    zIndex: "var(--vc-z-toast)" as unknown as number,
                    left: 16,
                    right: 16,
                    bottom: "calc(76px + env(safe-area-inset-bottom))",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    pointerEvents: "none",
                }}
                className="sm:left-auto sm:right-6 sm:bottom-6 sm:items-end"
            >
                <AnimatePresence>
                    {items.map((item) => {
                        const color = TONE_COLOR[item.tone];
                        return (
                            <motion.button
                                key={item.id}
                                type="button"
                                onClick={() => dismiss(item.id)}
                                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
                                transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 34 }}
                                role="status"
                                style={{
                                    pointerEvents: "auto",
                                    width: "min(100%, 380px)",
                                    textAlign: "left",
                                    display: "flex",
                                    gap: 10,
                                    padding: "12px 14px",
                                    borderRadius: 14,
                                    background: "var(--vc-bg-elevated)",
                                    border: `1px solid ${color}44`,
                                    boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
                                    cursor: "pointer",
                                }}
                            >
                                <span aria-hidden style={{ flexShrink: 0, marginTop: 4, width: 8, height: 8, borderRadius: "50%", background: color }} />
                                <span style={{ minWidth: 0 }}>
                                    <span style={{ display: "block", fontSize: 13, fontWeight: 800, color: "var(--vc-text-primary)" }}>{item.title}</span>
                                    {item.description ? (
                                        <span style={{ display: "block", marginTop: 2, fontSize: 12, lineHeight: 1.6, color: "var(--vc-text-secondary)" }}>{item.description}</span>
                                    ) : null}
                                </span>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
