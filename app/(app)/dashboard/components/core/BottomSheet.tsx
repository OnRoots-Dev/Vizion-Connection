"use client";

// dashboard/components/core/BottomSheet.tsx
// モバイルファーストのボトムシート。drag-to-dismiss（reduced-motion尊重）。
// Mapbox導入後も再利用できる汎用シェル。

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ThemeColors } from "../../types";

export function BottomSheet({
    open,
    onClose,
    title,
    t,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title?: string;
    t: ThemeColors;
    children: React.ReactNode;
}) {
    const reduce = useReducedMotion();
    void t;

    return (
        <AnimatePresence>
            {open ? (
                <>
                    <motion.button
                        type="button"
                        aria-label="閉じる"
                        onClick={onClose}
                        initial={reduce ? { opacity: 0 } : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{
                            position: "fixed", inset: 0, zIndex: 90,
                            background: "rgba(5,5,10,0.55)", backdropFilter: "blur(2px)",
                            border: "none", cursor: "default",
                        }}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        drag={reduce ? false : "y"}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.6 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 90) onClose();
                        }}
                        initial={reduce ? { opacity: 0 } : { y: "100%" }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { y: "100%" }}
                        transition={{ type: "spring", stiffness: 380, damping: 38 }}
                        style={{
                            position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 91,
                            maxHeight: "78dvh",
                            background: "#111118",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderBottom: "none",
                            borderRadius: "20px 20px 0 0",
                            boxShadow: "0 -18px 48px rgba(0,0,0,0.45)",
                            display: "flex", flexDirection: "column",
                        }}
                    >
                        <div style={{ padding: "10px 16px 0", display: "flex", justifyContent: "center" }}>
                            <div aria-hidden style={{ width: 40, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.18)" }} />
                        </div>
                        {title ? (
                            <div style={{ padding: "8px 20px 4px", fontSize: 13, fontWeight: 800, color: "#f0f0f5", letterSpacing: "0.02em" }}>
                                {title}
                            </div>
                        ) : null}
                        <div style={{ overflowY: "auto", padding: "8px 20px calc(20px + env(safe-area-inset-bottom))" }}>
                            {children}
                        </div>
                    </motion.div>
                </>
            ) : null}
        </AnimatePresence>
    );
}
