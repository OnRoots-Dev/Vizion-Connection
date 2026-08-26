// components/ui/states.tsx — Empty / Error states（Design System v2）
// loading は components/ui/skeleton/* を使用する（人工delayは禁止）。

import { motion } from "framer-motion";

export function EmptyState({
    icon,
    title,
    description,
    action,
}: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "36px 20px",
                textAlign: "center",
                borderRadius: 16,
                border: "1px dashed var(--vc-border-active)",
                background: "rgba(255,255,255,0.015)",
            }}
        >
            {icon ? <span aria-hidden style={{ color: "var(--vc-text-muted)", fontSize: 22, lineHeight: 1 }}>{icon}</span> : null}
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--vc-text-primary)" }}>{title}</p>
            {description ? (
                <p style={{ margin: 0, maxWidth: "38ch", fontSize: 12.5, lineHeight: 1.75, color: "var(--vc-text-secondary)" }}>{description}</p>
            ) : null}
            {action ? <div style={{ marginTop: 6 }}>{action}</div> : null}
        </div>
    );
}

export function ErrorState({
    message,
    onRetry,
    retryLabel = "再試行",
}: {
    message: string;
    onRetry?: () => void;
    retryLabel?: string;
}) {
    return (
        <div
            role="alert"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "24px 20px",
                textAlign: "center",
                borderRadius: 16,
                border: "1px solid rgba(255,92,122,0.32)",
                background: "rgba(255,92,122,0.07)",
            }}
        >
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#ffaab8" }}>{message}</p>
            {onRetry ? (
                <button
                    type="button"
                    onClick={onRetry}
                    style={{
                        padding: "8px 18px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,92,122,0.4)",
                        background: "transparent",
                        color: "#ffaab8",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                    }}
                    onFocus={(e) => { e.currentTarget.style.boxShadow = "var(--vc-focus-ring)"; }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                >
                    {retryLabel}
                </button>
            ) : null}
        </div>
    );
}

/** カード entrance 用の共通モーション（reduced-motion対応は親のAnimatePresence設定に従う） */
export const CARD_ENTER = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
} as const;

export function CardEnter({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div {...CARD_ENTER} transition={{ duration: 0.35, delay, ease: [0.25, 1, 0.5, 1] }}>
            {children}
        </motion.div>
    );
}
